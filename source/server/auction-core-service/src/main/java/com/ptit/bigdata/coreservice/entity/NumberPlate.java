package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NUMBER_PLATE", indexes = {
        @Index(name = "idx_number_plate_plate_number", columnList = "PLATE_NUMBER", unique = true),
        @Index(name = "idx_number_plate_province_id", columnList = "PROVINCE_ID")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NumberPlate extends EntityBase {

    @Column(name = "PLATE_NUMBER", nullable = false, unique = true, length = 20)
    private String plateNumber;

    @Column(name = "PROVINCE_ID")
    private Long provinceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "PLATE_TYPE", length = 30)
    private PlateTypeEnum plateType;

    @Column(name = "VEHICLE_TYPE", length = 50)
    @Builder.Default
    private String vehicleType = "Ô tô con";

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.vehicleType == null) {
            this.vehicleType = "Ô tô con";
        }
    }
}
