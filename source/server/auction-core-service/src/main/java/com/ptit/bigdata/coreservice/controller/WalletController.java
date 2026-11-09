package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import com.ptit.bigdata.coreservice.model.dto.TopupDTO;
import com.ptit.bigdata.coreservice.model.vo.WalletTransactionVO;
import com.ptit.bigdata.coreservice.model.vo.WalletVO;
import com.ptit.bigdata.coreservice.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public SuccessResponse<WalletVO> getWallet() {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(walletService.getWallet(userId));
    }

    @PostMapping("/topup")
    public SuccessResponse<WalletVO> topup(@RequestBody TopupDTO dto) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(walletService.topup(userId, dto != null ? dto.getAmount() : null));
    }

    @GetMapping("/transactions")
    public SuccessResponse<Page<WalletTransactionVO>> getTransactions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "type", required = false) WalletTxTypeEnum type
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(walletService.getTransactions(userId, type, pageable));
    }
}

