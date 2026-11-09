package com.ptit.bigdata.coreservice.core.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginDTO {
    @NotNull
    private String userName;

    @NotNull
    private String password;
}
