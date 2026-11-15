package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionVO {
    private Long id;
    private WalletTxTypeEnum type;
    private Long amount;
    private Long balanceAfter;
    private Long heldAfter;
    private String sessionCode;
    private String note;
    private LocalDateTime createdAt;
}

