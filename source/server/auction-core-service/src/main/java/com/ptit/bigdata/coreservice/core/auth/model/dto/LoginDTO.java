package com.ptit.bigdata.coreservice.core.auth.model.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String userName;
    private String password;
}
