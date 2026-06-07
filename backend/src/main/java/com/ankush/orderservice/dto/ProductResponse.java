package com.ankush.orderservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String sku,
        String title,
        String description,
        String category,
        BigDecimal price,
        String imageUrl,
        Integer stock,
        boolean hasEmbedding,
        Instant createdAt,
        Instant updatedAt
) {}
