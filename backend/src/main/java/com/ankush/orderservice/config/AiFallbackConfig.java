package com.ankush.orderservice.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;
import java.util.List;

/**
 * Fallback EmbeddingModel in case Spring AI Ollama autoconfig fails (e.g. Ollama is unreachable at startup).
 * This keeps the whole app bootable — AI just returns empty vectors via the EmbeddingService fallback.
 */
@Configuration
public class AiFallbackConfig {

    @Bean
    @ConditionalOnMissingBean(EmbeddingModel.class)
    public EmbeddingModel noopEmbeddingModel() {
        return new EmbeddingModel() {
            @Override
            public float[] embed(Document document) {
                return new float[0];
            }

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                return new EmbeddingResponse(Collections.emptyList());
            }
        };
    }
}
