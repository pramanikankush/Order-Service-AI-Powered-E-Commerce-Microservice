package com.ankush.orderservice.ai;

import com.ankush.orderservice.util.Vectors;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

/**
 * Generates embeddings via local Ollama (nomic-embed-text).
 * Protected by Resilience4j: retry + circuit breaker + time limiter.
 *
 * Why:
 *  - Ollama is local & free, but it can be slow, cold-start, or crash.
 *  - We never want an AI failure to fail the product write.
 *  - On failure we fall back to a zero vector — similarity search still works for others.
 */
@Service
@Slf4j
public class EmbeddingService {

    private static final String CB = "ollamaEmbedding";
    private final EmbeddingModel embeddingModel;

    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    @CircuitBreaker(name = CB, fallbackMethod = "fallbackEmbedding")
    @Retry(name = CB, fallbackMethod = "fallbackEmbedding")
    @TimeLimiter(name = CB)
    public String embeddingCsv(String text) {
        if (text == null || text.isBlank()) return null;
        float[] vec = embeddingModel.embed(text);
        return Vectors.toCsv(vec);
    }

    /** Resilience4j fallback — returns null so the embedding column stays null. */
    @SuppressWarnings("unused")
    public String fallbackEmbedding(String text, Throwable t) {
        log.warn("Embedding fallback for text-length={}: {}", (text == null ? 0 : text.length()), t.toString());
        return null;
    }
}
