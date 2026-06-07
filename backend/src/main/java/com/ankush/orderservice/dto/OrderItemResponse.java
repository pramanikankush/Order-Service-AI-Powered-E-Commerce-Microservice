package com.ankush.orderservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String sku,
        String title,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {}
