package com.ankush.orderservice.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * pgvector similarity search using native SQL.
 * Uses the cosine distance operator `<=>` and an HNSW index for ANN.
 */
@Repository
public class VectorRepository {

    private final JdbcTemplate jdbc;

    public VectorRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record SimilarRow(UUID id, String sku, String title, String category,
                              java.math.BigDecimal price, String imageUrl, double similarity) {}

    public List<SimilarRow> findSimilar(UUID excludeId, String embeddingCsv, int topK) {
        String sql = """
                SELECT id, sku, title, category, price, image_url,
                       1 - (embedding <=> (?::vector)) AS similarity
                FROM products
                WHERE embedding IS NOT NULL AND id <> ?
                ORDER BY embedding <=> (?::vector) ASC
                LIMIT ?
                """;
        return jdbc.query(sql, (rs, rowNum) -> new SimilarRow(
                rs.getObject("id", UUID.class),
                rs.getString("sku"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getBigDecimal("price"),
                rs.getString("image_url"),
                rs.getDouble("similarity")
        ), embeddingCsv, excludeId, embeddingCsv, topK);
    }

    public void updateEmbedding(UUID productId, String embeddingCsv) {
        jdbc.update("UPDATE products SET embedding = ?::vector WHERE id = ?", embeddingCsv, productId);
    }
}
