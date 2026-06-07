package com.ankush.orderservice.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID id,
        String ownerKey,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        Integer itemCount
) {}
