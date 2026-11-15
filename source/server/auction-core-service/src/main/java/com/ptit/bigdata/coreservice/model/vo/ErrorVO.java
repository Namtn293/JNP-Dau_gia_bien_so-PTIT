package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorVO {
    private String code;
    private String message;
    @Builder.Default
    private String timestamp = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());

    public ErrorVO(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
    }
}

