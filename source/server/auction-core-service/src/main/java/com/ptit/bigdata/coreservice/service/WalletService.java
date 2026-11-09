package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import com.ptit.bigdata.coreservice.model.vo.RegistrationDetailVO;
import com.ptit.bigdata.coreservice.model.vo.WalletTransactionVO;
import com.ptit.bigdata.coreservice.model.vo.WalletVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WalletService {
    WalletVO getWallet(Long userId);

    WalletVO topup(Long userId, Long amount);

    Page<WalletTransactionVO> getTransactions(Long userId, WalletTxTypeEnum type, Pageable pageable);

    RegistrationDetailVO registerAuction(Long userId, String sessionCode);

    RegistrationDetailVO cancelRegistration(Long userId, String sessionCode);

    RegistrationDetailVO getRegistration(Long userId, String sessionCode);

    void handleSessionEnded(Long sessionId);

    void handleSessionCancelled(Long sessionId);
}

