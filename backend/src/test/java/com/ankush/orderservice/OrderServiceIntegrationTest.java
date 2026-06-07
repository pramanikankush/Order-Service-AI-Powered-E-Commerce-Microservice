package com.ankush.orderservice;

import com.ankush.orderservice.dto.ProductRequest;
import com.ankush.orderservice.dto.ProductResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test using Testcontainers — spins up a real Postgres with pgvector
 * enabled, runs Flyway migrations, and hits the real service end-to-end.
 *
 * Kafka & Ollama are disabled via properties so the test stays fast and isolated.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class OrderServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>(DockerImageName.parse("pgvector/pgvector:pg16")
            .asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("orders")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("test-init.sql");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.datasource.username", pg::getUsername);
        r.add("spring.datasource.password", pg::getPassword);
        r.add("spring.kafka.bootstrap-servers", () -> "localhost:9092");
        r.add("spring.ai.ollama.base-url", () -> "http://localhost:11434");
        r.add("spring.ai.ollama.embedding.options.model", () -> "nomic-embed-text");
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @Test
    void can_create_and_list_product() throws Exception {
        ProductRequest req = new ProductRequest("INT-001", "Integration Test Product",
                "Desc", "Testing", java.math.BigDecimal.valueOf(12.5), null, 5);

        String body = mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("INT-001"))
                .andExpect(jsonPath("$.stock").value(5))
                .andReturn().getResponse().getContentAsString();

        ProductResponse resp = om.readValue(body, ProductResponse.class);
        mvc.perform(get("/api/products/" + resp.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("INT-001"));
    }
}
