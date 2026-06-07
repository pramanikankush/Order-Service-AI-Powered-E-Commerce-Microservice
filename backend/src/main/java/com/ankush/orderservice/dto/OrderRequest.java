package com.ankush.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderRequest(
        @NotBlank String shippingAddress,
        String notes
) {}
