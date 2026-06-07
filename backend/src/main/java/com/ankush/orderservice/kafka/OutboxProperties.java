package com.ankush.orderservice.kafka;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.outbox")
public record OutboxProperties(int batchSize, long pollIntervalMs) {
    public OutboxProperties {
        if (batchSize <= 0) batchSize = 50;
        if (pollIntervalMs <= 0) pollIntervalMs = 1000;
    }
    public int batchSize() { return batchSize; }
    public long pollIntervalMs() { return pollIntervalMs; }
}
