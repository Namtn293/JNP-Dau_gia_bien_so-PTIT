package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.RoomAnnouncement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAnnouncementRepository extends JpaRepository<RoomAnnouncement, Long> {

    Page<RoomAnnouncement> findBySessionIdOrderByCreatedAtDesc(Long sessionId, Pageable pageable);

    List<RoomAnnouncement> findTop10BySessionIdOrderByCreatedAtDesc(Long sessionId);

    Optional<RoomAnnouncement> findFirstBySessionIdAndPinnedTrueOrderByCreatedAtDesc(Long sessionId);

    @Modifying
    @Query("update RoomAnnouncement r set r.pinned = false where r.sessionId = :sessionId and r.pinned = true")
    int clearPinned(@Param("sessionId") Long sessionId);
}

