package com.ankush.orderservice.kafka;

import com.ankush.orderservice.entity.OutboxEvent;
import com.ankush.orderservice.repository.OutboxRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Outbox Publisher — polls PENDING outbox rows (using SELECT FOR UPDATE SKIP LOCKED),
 * publishes to Kafka, then marks them PUBLISHED.
 *
 * <p>Why SKIP LOCKED: multiple app instances can poll in parallel without
 * blocking each other. This is the enterprise-grade way to run the outbox
 * relay without a coordinator like Quartz.
 *
 * <p>Why we don't keep a long transaction open: we snapshot the batch in a
 * short tx, then do the network I/O to Kafka <em>outside</em> the row lock,
 * then mark rows in a separate tx. This keeps lock-hold time minimal and
 * prevents one slow broker from stalling the whole table.
 */
@Component
@Slf4j
public class OutboxPublisher {

    private final OutboxRepository outboxRepo;
    private final EventSender sender;
    private final OutboxProperties props;
    private final TransactionTemplate tx;

    public OutboxPublisher(OutboxRepository outboxRepo,
                           EventSender sender,
                           OutboxProperties props,
                           PlatformTransactionManager txManager) {
        this.outboxRepo = outboxRepo;
        this.sender = sender;
        this.props = props;
        this.tx = new TransactionTemplate(txManager);
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:1000}")
    public void publish() {
        List<OutboxEvent> batch = fetchBatch();
        if (batch.isEmpty()) return;

        List<UUID> published = new ArrayList<>();
        for (OutboxEvent ev : batch) {
            try {
                sender.send(ev);
                published.add(ev.getId());
            } catch (Exception ex) {
                log.error("Outbox publish failed id={}", ev.getId(), ex);
                markFailed(ev.getId());
            }
        }
        if (!published.isEmpty()) {
            markPublished(published);
            log.info("Outbox published {} events", published.size());
        }
    }

    private List<OutboxEvent> fetchBatch() {
        return tx.execute(status -> outboxRepo.findPendingForUpdate(props.batchSize()));
    }

    private void markPublished(List<UUID> ids) {
        tx.executeWithoutResult(status ->
                outboxRepo.markPublished(OutboxEvent.Status.PUBLISHED, Instant.now(), ids));
    }

    private void markFailed(UUID id) {
        tx.executeWithoutResult(status -> outboxRepo.markFailed(OutboxEvent.Status.FAILED, id));
    }
}
