package com.ptit.bigdata.coreservice.core.auth.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CompleteRegistrationDTO {
    @NotBlank(message = "tempToken không được để trống")
    private String tempToken;

    // Không bắt buộc — tự sinh ngẫu nhiên nếu FE không truyền
    private String userName;
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String address;
}
