package com.ankush.orderservice.mapper;

import com.ankush.orderservice.dto.OrderItemResponse;
import com.ankush.orderservice.dto.OrderResponse;
import com.ankush.orderservice.entity.Order;
import com.ankush.orderservice.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "product.id", target = "productId")
    OrderItemResponse toItem(OrderItem oi);

    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    OrderResponse toResponse(Order o);

    @org.mapstruct.Named("statusToString")
    default String statusToString(Order.Status s) { return s == null ? null : s.name(); }
}
