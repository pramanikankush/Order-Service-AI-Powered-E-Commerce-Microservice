package com.ankush.orderservice.mapper;

import com.ankush.orderservice.dto.*;
import com.ankush.orderservice.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "embedding", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    Product toEntity(ProductRequest req);

    @Mapping(source = "inventory.quantity", target = "stock")
    @Mapping(target = "hasEmbedding", expression = "java(p.getEmbedding() != null && !p.getEmbedding().isBlank())")
    ProductResponse toResponse(Product p);

    List<ProductResponse> toResponseList(List<Product> products);
}
