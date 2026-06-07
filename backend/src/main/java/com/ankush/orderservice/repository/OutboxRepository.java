package com.ankush.orderservice.repository;

import com.ankush.orderservice.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEvent, java.util.UUID> {

    @Query(value = "select * from outbox_events where status = 'PENDING' order by created_at asc limit :limit for update skip locked",
           nativeQuery = true)
    List<OutboxEvent> findPendingForUpdate(@Param("limit") int limit);

    @Modifying
    @Query("update OutboxEvent o set o.status = :status, o.publishedAt = :ts where o.id in :ids")
    int markPublished(@Param("status") OutboxEvent.Status status,
                      @Param("ts") Instant ts,
                      @Param("ids") List<java.util.UUID> ids);

    @Modifying
    @Query("update OutboxEvent o set o.status = :status, o.retryCount = o.retryCount + 1 where o.id = :id")
    int markFailed(@Param("status") OutboxEvent.Status status, @Param("id") java.util.UUID id);
}
