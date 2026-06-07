package com.ankush.orderservice.kafka;

import com.ankush.orderservice.entity.OutboxEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Low-level Kafka sender. Real ordering is handled via the Outbox pattern:
 * business tx writes OutboxEvent → committed → OutboxPublisher drains and sends here.
 *
 * <p><b>Important:</b> {@link #send(OutboxEvent)} blocks until the broker acks
 * the record (or until the per-call timeout elapses) so the caller can safely
 * mark the outbox row PUBLISHED. Returning the underlying future and forgetting
 * to wait would risk marking the row PUBLISHED before the broker has the
 * record — which silently loses events on process death.
 */
@Component
@Slf4j
public class EventSender {

    private static final long SEND_TIMEOUT_SECONDS = 5;

    private final KafkaTemplate<String, String> kafkaTemplate;

    public EventSender(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(OutboxEvent ev) {
        CompletableFuture<?> future = kafkaTemplate.send(ev.getTopic(), ev.getAggregateId(), ev.getPayload());
        try {
            future.get(SEND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            log.debug("Kafka sent id={} topic={}", ev.getId(), ev.getTopic());
        } catch (TimeoutException te) {
            future.cancel(true);
            throw new KafkaSendException("Kafka send timed out for id=" + ev.getId(), te);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new KafkaSendException("Interrupted while sending id=" + ev.getId(), ie);
        } catch (Exception e) {
            throw new KafkaSendException("Kafka send failed for id=" + ev.getId(), e);
        }
    }
}
