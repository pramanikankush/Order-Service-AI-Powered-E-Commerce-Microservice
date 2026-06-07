package com.ankush.orderservice.service;

import com.ankush.orderservice.dto.OrderCreatedEvent;
import com.ankush.orderservice.dto.OrderRequest;
import com.ankush.orderservice.dto.OrderResponse;
import com.ankush.orderservice.entity.*;
import com.ankush.orderservice.exception.EmptyCartException;
import com.ankush.orderservice.exception.InsufficientStockException;
import com.ankush.orderservice.exception.NotFoundException;
import com.ankush.orderservice.kafka.Topics;
import com.ankush.orderservice.mapper.OrderMapper;
import com.ankush.orderservice.repository.*;
import com.ankush.orderservice.util.Ids;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final InventoryRepository inventoryRepo;
    private final OrderRepository orderRepo;
    private final OutboxRepository outboxRepo;
    private final OrderMapper orderMapper;
    private final ObjectMapper objectMapper;

    /**
     * Place order — the hot path.
     *
     * Steps:
     *  1. Load cart
     *  2. For each cart item, load inventory with PESSIMISTIC_WRITE (SELECT FOR UPDATE)
     *     → this is the critical lock that prevents two concurrent orders from overselling
     *       the same stock. Postgres serializes them: the second tx waits, then rechecks.
     *  3. Decrement inventory, create Order + OrderItems in ONE transaction
     *  4. Write an OutboxEvent in the SAME transaction → at-least-once Kafka publish
     *     after commit, without 2PC
     *  5. Clear cart
     */
    @Transactional
    public OrderResponse place(String ownerKey, OrderRequest req) {
        Cart cart = cartRepo.findByOwnerKey(ownerKey)
                .orElseThrow(() -> new EmptyCartException("Cart not found for " + ownerKey));
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new EmptyCartException("Cart is empty");
        }

        Order order = Order.builder()
                .orderNumber(Ids.orderNumber())
                .ownerKey(ownerKey)
                .status(Order.Status.CREATED)
                .shippingAddress(req.shippingAddress())
                .notes(req.notes())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderCreatedEvent.LineItem> eventLines = new ArrayList<>();

        // Lock inventory deterministically by productId to avoid deadlocks
        List<CartItem> sorted = cart.getItems().stream()
                .sorted((a, b) -> a.getProduct().getId().compareTo(b.getProduct().getId()))
                .toList();

        for (CartItem ci : sorted) {
            UUID pid = ci.getProduct().getId();
            Inventory inv = inventoryRepo.findByProductIdForUpdate(pid)
                    .orElseThrow(() -> new NotFoundException("Inventory missing for " + pid));
            if (inv.available() < ci.getQuantity()) {
                throw new InsufficientStockException(
                        "Not enough stock for " + ci.getProduct().getTitle() + " (available=" + inv.available() + ")");
            }
            inv.setQuantity(inv.getQuantity() - ci.getQuantity());
            inventoryRepo.save(inv);

            BigDecimal line = ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            total = total.add(line);

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(ci.getProduct())
                    .sku(ci.getProduct().getSku())
                    .title(ci.getProduct().getTitle())
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .lineTotal(line)
                    .build();
            order.getItems().add(oi);

            eventLines.add(new OrderCreatedEvent.LineItem(
                    oi.getSku(), oi.getTitle(), oi.getQuantity(), oi.getUnitPrice(), oi.getLineTotal()));
        }

        order.setTotalAmount(total);
        Order saved = orderRepo.save(order);

        // Outbox write — same tx, so either BOTH commit or both rollback
        writeOrderCreatedOutbox(saved, eventLines);

        // Empty the cart
        itemRepo.deleteByCartId(cart.getId());

        log.info("Order placed id={} number={} total={}", saved.getId(), saved.getOrderNumber(), total);
        return orderMapper.toResponse(saved);
    }

    @SneakyThrows
    private void writeOrderCreatedOutbox(Order o, List<OrderCreatedEvent.LineItem> lines) {
        OrderCreatedEvent evt = new OrderCreatedEvent(
                o.getId(), o.getOrderNumber(), o.getOwnerKey(),
                o.getTotalAmount(), lines, o.getCreatedAt());
        OutboxEvent out = OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(o.getId().toString())
                .eventType("OrderCreated")
                .topic(Topics.ORDER_CREATED)
                .payload(objectMapper.writeValueAsString(evt))
                .build();
        outboxRepo.save(out);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> list(String ownerKey) {
        return orderRepo.findAllByOwnerKeyOrderByCreatedAtDesc(ownerKey, PageRequest.of(0, 50))
                .stream().map(orderMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse get(UUID id) {
        return orderMapper.toResponse(orderRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id)));
    }
}
