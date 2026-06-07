package com.ankush.orderservice.controller;

import com.ankush.orderservice.dto.*;
import com.ankush.orderservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest req) { return service.create(req); }

    @GetMapping
    public List<ProductResponse> list() { return service.list(); }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable UUID id) { return service.get(id); }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody ProductRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { service.delete(id); }

    @GetMapping("/{id}/similar")
    public List<SimilarProductResponse> similar(@PathVariable UUID id,
                                                @RequestParam(defaultValue = "5") int topK) {
        return service.similar(id, topK);
    }
}
