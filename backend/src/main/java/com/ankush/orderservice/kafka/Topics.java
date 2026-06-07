package com.ankush.orderservice.kafka;

/**
 * Central Kafka topic names. Keeps producers/consumers in sync.
 */
public final class Topics {
    private Topics() {}
    public static final String ORDER_CREATED = "order-created";
}
