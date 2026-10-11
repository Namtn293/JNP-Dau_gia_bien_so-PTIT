package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.StatusEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "MAIN_USER_INFO")
public class UserInfo extends EntityBase {
    @Column(name = "USERNAME", unique = true)
    private String userName;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "EMAIL", unique = true)
    private String email;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "DOB")
    private LocalDate dob;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private StatusEnum status;
}
