package com.ankush.orderservice.service;

import com.ankush.orderservice.dto.CartItemRequest;
import com.ankush.orderservice.dto.CartResponse;
import com.ankush.orderservice.entity.Cart;
import com.ankush.orderservice.entity.CartItem;
import com.ankush.orderservice.entity.Product;
import com.ankush.orderservice.exception.NotFoundException;
import com.ankush.orderservice.mapper.CartMapper;
import com.ankush.orderservice.repository.CartItemRepository;
import com.ankush.orderservice.repository.CartRepository;
import com.ankush.orderservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final CartMapper cartMapper;

    @Transactional
    public CartResponse addItem(String ownerKey, CartItemRequest req) {
        Cart cart = cartRepo.findByOwnerKey(ownerKey)
                .orElseGet(() -> cartRepo.save(Cart.builder().ownerKey(ownerKey).build()));

        Product p = productRepo.findById(req.productId())
                .orElseThrow(() -> new NotFoundException("Product not found: " + req.productId()));

        CartItem item = itemRepo.findByCartIdAndProductId(cart.getId(), p.getId())
                .orElseGet(() -> CartItem.builder().cart(cart).product(p).build());
        item.setQuantity(req.quantity());
        item.setUnitPrice(p.getPrice());
        itemRepo.save(item);

        return cartMapper.toResponse(cartRepo.findByOwnerKey(ownerKey).orElseThrow());
    }

    @Transactional(readOnly = true)
    public CartResponse get(String ownerKey) {
        Cart cart = cartRepo.findByOwnerKey(ownerKey)
                .orElseGet(() -> Cart.builder().ownerKey(ownerKey).build());
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse updateQuantity(String ownerKey, UUID itemId, int qty) {
        Cart cart = cartRepo.findByOwnerKey(ownerKey)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
        CartItem item = itemRepo.findById(itemId)
                .filter(ci -> ci.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new NotFoundException("Cart item not found"));
        if (qty <= 0) itemRepo.delete(item);
        else { item.setQuantity(qty); itemRepo.save(item); }
        return cartMapper.toResponse(cartRepo.findByOwnerKey(ownerKey).orElseThrow());
    }

    @Transactional
    public CartResponse removeItem(String ownerKey, UUID itemId) {
        Cart cart = cartRepo.findByOwnerKey(ownerKey)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
        CartItem item = itemRepo.findById(itemId)
                .filter(ci -> ci.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new NotFoundException("Cart item not found"));
        itemRepo.delete(item);
        return cartMapper.toResponse(cartRepo.findByOwnerKey(ownerKey).orElseThrow());
    }

    @Transactional
    public void clear(String ownerKey) {
        cartRepo.findByOwnerKey(ownerKey).ifPresent(c -> itemRepo.deleteByCartId(c.getId()));
    }
}
