package com.ptit.bigdata.coreservice.core.auth.model.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class LoginDTO {
    @NotEmpty
    private String userName;

    @NotEmpty
    private String password;
}
