package com.ptit.bigdata.coreservice.core.auth.model.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String fullName;
    private String email;
    private String userName;
    private String password;
}
