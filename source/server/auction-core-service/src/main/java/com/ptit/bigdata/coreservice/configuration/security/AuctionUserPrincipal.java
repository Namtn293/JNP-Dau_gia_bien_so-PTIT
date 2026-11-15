package com.ptit.bigdata.coreservice.configuration.security;

import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionUserPrincipal implements Principal {
    private Long userId;
    private String username;
    private String fullName;
    private RoleEnum roleEnum;
    private boolean anonymous;

    @Override
    public String getName() {
        return this.username != null ? this.username : "anonymous";
    }

    public static AuctionUserPrincipal createAnonymous() {
        return AuctionUserPrincipal.builder()
                .userId(null)
                .username("anonymous")
                .fullName("Khách vãng lai")
                .roleEnum(null)
                .anonymous(true)
                .build();
    }
}
