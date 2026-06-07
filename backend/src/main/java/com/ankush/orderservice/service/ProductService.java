package com.ankush.orderservice.service;

import com.ankush.orderservice.ai.EmbeddingService;
import com.ankush.orderservice.dto.*;
import com.ankush.orderservice.entity.Inventory;
import com.ankush.orderservice.entity.Product;
import com.ankush.orderservice.exception.DuplicateSkuException;
import com.ankush.orderservice.exception.NotFoundException;
import com.ankush.orderservice.mapper.ProductMapper;
import com.ankush.orderservice.repository.InventoryRepository;
import com.ankush.orderservice.repository.ProductRepository;
import com.ankush.orderservice.repository.VectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository products;
    private final InventoryRepository inventoryRepo;
    private final VectorRepository vectorRepo;
    private final EmbeddingService embeddingService;
    private final ProductMapper mapper;

    @Transactional
    public ProductResponse create(ProductRequest req) {
        if (products.existsBySku(req.sku())) {
            throw new DuplicateSkuException("SKU already exists: " + req.sku());
        }
        Product p = mapper.toEntity(req);
        // Generate semantic embedding from title + description + category.
        String csv = embeddingService.embeddingCsv(textFor(p));
        p.setEmbedding(csv);
        Product saved = products.save(p);

        // Create inventory row
        Inventory inv = Inventory.builder()
                .product(saved)
                .quantity(req.stock() == null ? 0 : req.stock())
                .reserved(0)
                .build();
        inventoryRepo.save(inv);
        saved.setInventory(inv);

        log.info("Product created id={} sku={}", saved.getId(), saved.getSku());
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {
        return mapper.toResponseList(products.findAll());
    }

    @Transactional(readOnly = true)
    public ProductResponse get(UUID id) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
        if (p.getInventory() == null) {
            p.setInventory(inventoryRepo.findByProductId(id).orElse(null));
        }
        return mapper.toResponse(p);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest req) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
        // SKU change allowed only if not colliding
        if (!p.getSku().equals(req.sku()) && products.existsBySku(req.sku())) {
            throw new DuplicateSkuException("SKU already exists: " + req.sku());
        }
        p.setSku(req.sku());
        p.setTitle(req.title());
        p.setDescription(req.description());
        p.setCategory(req.category());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());

        String csv = embeddingService.embeddingCsv(textFor(p));
        p.setEmbedding(csv);

        Product saved = products.save(p);

        Inventory inv = inventoryRepo.findByProductId(id)
                .orElseGet(() -> Inventory.builder().product(saved).build());
        if (req.stock() != null) inv.setQuantity(req.stock());
        inventoryRepo.save(inv);
        saved.setInventory(inv);

        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!products.existsById(id)) throw new NotFoundException("Product not found: " + id);
        products.deleteById(id);
    }

    /**
     * Similar products via pgvector cosine similarity.
     * Returns top-5 most similar by semantic embedding (excluding the reference product).
     */
    @Transactional(readOnly = true)
    public List<SimilarProductResponse> similar(UUID id, int topK) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found: " + id));
        if (p.getEmbedding() == null || p.getEmbedding().isBlank()) return List.of();
        int limit = Math.min(20, Math.max(1, topK));
        return vectorRepo.findSimilar(id, p.getEmbedding(), limit).stream()
                .map(r -> new SimilarProductResponse(r.id(), r.sku(), r.title(), r.category(),
                        r.price(), r.imageUrl(), r.similarity()))
                .toList();
    }

    private String textFor(Product p) {
        return (p.getCategory() == null ? "" : p.getCategory() + " — ")
                + (p.getTitle() == null ? "" : p.getTitle()) + " "
                + (p.getDescription() == null ? "" : p.getDescription());
    }
}
