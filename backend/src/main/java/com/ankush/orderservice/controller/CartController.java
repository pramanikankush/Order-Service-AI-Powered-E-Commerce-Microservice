package com.ankush.orderservice.controller;

import com.ankush.orderservice.dto.CartItemRequest;
import com.ankush.orderservice.dto.CartResponse;
import com.ankush.orderservice.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Simple identity: X-Owner-Key header, or default "anonymous" for the demo.
    private String ownerKey(String header) { return (header == null || header.isBlank()) ? "anonymous" : header; }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse addItem(@RequestHeader(value = "X-Owner-Key", required = false) String owner,
                                @Valid @RequestBody CartItemRequest req) {
        return cartService.addItem(ownerKey(owner), req);
    }

    @GetMapping
    public CartResponse get(@RequestHeader(value = "X-Owner-Key", required = false) String owner) {
        return cartService.get(ownerKey(owner));
    }

    @PutMapping("/items/{id}")
    public CartResponse update(@RequestHeader(value = "X-Owner-Key", required = false) String owner,
                               @PathVariable UUID id,
                               @RequestParam int quantity) {
        return cartService.updateQuantity(ownerKey(owner), id, quantity);
    }

    @DeleteMapping("/items/{id}")
    public CartResponse remove(@RequestHeader(value = "X-Owner-Key", required = false) String owner,
                               @PathVariable UUID id) {
        return cartService.removeItem(ownerKey(owner), id);
    }
}
