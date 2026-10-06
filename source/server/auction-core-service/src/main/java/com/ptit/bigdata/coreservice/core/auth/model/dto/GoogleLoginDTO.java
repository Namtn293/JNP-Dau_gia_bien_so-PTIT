package com.ptit.bigdata.coreservice.core.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginDTO {
    @NotBlank(message = "idToken không được để trống")
    private String idToken;
}
