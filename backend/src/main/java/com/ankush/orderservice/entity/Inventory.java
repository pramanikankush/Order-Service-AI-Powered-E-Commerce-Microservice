package com.ankush.orderservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Inventory — quantity on hand. We use pessimistic (SELECT ... FOR UPDATE) locking
 * at checkout to prevent overselling under concurrent requests.
 */
@Entity
@Table(name = "inventory")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer reserved;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Integer version;

    @PrePersist @PreUpdate
    void touch() { updatedAt = Instant.now(); }

    public int available() { return Math.max(0, (quantity == null ? 0 : quantity) - (reserved == null ? 0 : reserved)); }
}
