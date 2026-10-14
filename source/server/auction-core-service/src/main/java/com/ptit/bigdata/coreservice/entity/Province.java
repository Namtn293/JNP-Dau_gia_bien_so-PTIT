package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PROVINCE", indexes = {
        @Index(name = "idx_province_code", columnList = "CODE", unique = true),
        @Index(name = "idx_province_name", columnList = "NAME")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Province extends EntityBase {

    @Column(name = "CODE", length = 20, unique = true)
    private String code; // Mã ký hiệu địa phương (vd: "29, 30", "51", "43")

    @Column(name = "NAME", nullable = false, length = 100)
    private String name; // Tên tỉnh/thành phố (vd: "Hà Nội", "TP.HCM")
}
