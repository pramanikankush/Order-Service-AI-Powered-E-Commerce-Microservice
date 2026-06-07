package com.ankush.orderservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Kafka message shape for the `order-created` topic. */
public record OrderCreatedEvent(
        UUID orderId,
        String orderNumber,
        String ownerKey,
        BigDecimal totalAmount,
        List<LineItem> items,
        Instant createdAt
) {
    public record LineItem(String sku, String title, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
}
