package com.ankush.orderservice.dto;

import java.util.UUID;

public record SimilarProductResponse(
        UUID id,
        String sku,
        String title,
        String category,
        java.math.BigDecimal price,
        String imageUrl,
        double similarity
) {}
