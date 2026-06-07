package com.ankush.orderservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Product — a catalog item with a pgvector embedding for semantic search.
 * Embedding is stored as a comma-separated string so we stay dialect-agnostic.
 */
@Entity
@Table(name = "products",
        indexes = {
                @Index(name = "idx_products_sku", columnList = "sku", unique = true),
                @Index(name = "idx_products_category", columnList = "category")
        })
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 64, unique = true)
    private String sku;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 128)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 1024)
    private String imageUrl;

    /** 768-dim nomic-embed-text, comma-separated floats. */
    @Column(name = "embedding", columnDefinition = "text")
    private String embedding;

    @Column(nullable = false, updatable = false)
    @ColumnDefault("now()")
    private Instant createdAt;

    @Column(nullable = false)
    @ColumnDefault("now()")
    private Instant updatedAt;

    @Version
    private Integer version;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Inventory inventory;

    @PrePersist
    void prePersist() {
        var now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }
}
