package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.ShillAlert;
import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShillAlertRepository extends JpaRepository<ShillAlert, Long> {

    Optional<ShillAlert> findBySessionIdAndUserAIdAndUserBIdAndStatus(
            Long sessionId, Long userAId, Long userBId, ShillAlertStatusEnum status);

    List<ShillAlert> findBySessionIdAndUserAIdAndUserBId(Long sessionId, Long userAId, Long userBId);

    Page<ShillAlert> findByStatusOrderByCreatedAtDesc(ShillAlertStatusEnum status, Pageable pageable);

    Page<ShillAlert> findBySessionCodeOrderByCreatedAtDesc(String sessionCode, Pageable pageable);

    Page<ShillAlert> findByStatusAndSessionCodeOrderByCreatedAtDesc(ShillAlertStatusEnum status, String sessionCode, Pageable pageable);

    Page<ShillAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

