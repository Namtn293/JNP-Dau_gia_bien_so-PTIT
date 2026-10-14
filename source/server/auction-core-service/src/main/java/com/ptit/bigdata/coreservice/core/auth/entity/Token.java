package com.ptit.bigdata.coreservice.core.auth.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "AUTH_TOKEN")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token extends EntityBase {
    @Column(name = "TOKEN", length = 1000)
    private String token;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "EXPIRED")
    private boolean expired;

    @Column(name = "REVOKED")
    private boolean revoked;
}
