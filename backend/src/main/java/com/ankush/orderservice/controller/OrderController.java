package com.ankush.orderservice.controller;

import com.ankush.orderservice.dto.OrderRequest;
import com.ankush.orderservice.dto.OrderResponse;
import com.ankush.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    private String ownerKey(String header) { return (header == null || header.isBlank()) ? "anonymous" : header; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@RequestHeader(value = "X-Owner-Key", required = false) String owner,
                               @Valid @RequestBody OrderRequest req) {
        return service.place(ownerKey(owner), req);
    }

    @GetMapping
    public List<OrderResponse> list(@RequestHeader(value = "X-Owner-Key", required = false) String owner) {
        return service.list(ownerKey(owner));
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable UUID id) { return service.get(id); }
}
