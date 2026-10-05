package com.ptit.bigdata.coreservice.core.auth.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CompleteRegistrationDTO {
    @NotBlank(message = "tempToken không được để trống")
    private String tempToken;

    @NotBlank(message = "userName không được để trống")
    private String userName;

    @NotBlank(message = "password không được để trống")
    private String password;

    private String fullName;

    private String phoneNumber;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String address;
}
