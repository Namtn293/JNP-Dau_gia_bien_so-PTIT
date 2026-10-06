package com.ptit.bigdata.coreservice.core.auth.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.AuthProvider;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "AUTH_USER", indexes = {
        @Index(name = "user_name_index", columnList = "USERNAME", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends EntityBase implements UserDetails {
    @Column(name = "USERNAME", nullable = false, unique = true)
    private String userName;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private RoleEnum roleEnum;

    @Enumerated(EnumType.STRING)
    @Column(name = "AUTH_PROVIDER")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.roleEnum.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.userName;
    }

    public RoleEnum getRole() {
        return this.roleEnum;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.authProvider == null) {
            this.authProvider = AuthProvider.LOCAL;
        }
    }
}
