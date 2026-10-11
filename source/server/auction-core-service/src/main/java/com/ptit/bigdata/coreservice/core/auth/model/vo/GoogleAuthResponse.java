package com.ptit.bigdata.coreservice.core.auth.model.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthResponse {
    @JsonProperty("isNewUser")
    private boolean isNewUser;

    private String email;
    private String fullName;
    private String tempToken;
    private String token;
}
