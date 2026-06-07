package com.ankush.orderservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        String status,
        String ownerKey,
        BigDecimal totalAmount,
        String shippingAddress,
        String notes,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
