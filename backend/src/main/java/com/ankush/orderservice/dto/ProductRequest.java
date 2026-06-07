package com.ankush.orderservice.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String sku,
        @NotBlank @Size(max = 255) String title,
        String description,
        String category,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        String imageUrl,
        Integer stock
) {}
