package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.WalletTransaction;
import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);

    Page<WalletTransaction> findByWalletIdAndTypeOrderByCreatedAtDesc(Long walletId, WalletTxTypeEnum type, Pageable pageable);

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}

