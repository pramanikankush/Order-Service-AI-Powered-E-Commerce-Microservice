package com.ankush.orderservice.mapper;

import com.ankush.orderservice.dto.CartItemResponse;
import com.ankush.orderservice.dto.CartResponse;
import com.ankush.orderservice.entity.Cart;
import com.ankush.orderservice.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.sku", target = "sku")
    @Mapping(source = "product.title", target = "title")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(target = "lineTotal", expression = "java(lineTotal(i))")
    CartItemResponse toItem(CartItem i);

    @Mapping(target = "subtotal", expression = "java(subtotal(c))")
    @Mapping(target = "itemCount", expression = "java(c.getItems() == null ? 0 : c.getItems().stream().mapToInt(CartItem::getQuantity).sum())")
    CartResponse toResponse(Cart c);

    default BigDecimal lineTotal(CartItem i) {
        if (i == null || i.getUnitPrice() == null || i.getQuantity() == null) return BigDecimal.ZERO;
        return i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())).setScale(2, RoundingMode.HALF_UP);
    }

    default BigDecimal subtotal(Cart c) {
        if (c == null || c.getItems() == null) return BigDecimal.ZERO;
        return c.getItems().stream()
                .map(this::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
