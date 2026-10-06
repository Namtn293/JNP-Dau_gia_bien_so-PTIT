package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NumberPlateRepository extends JpaRepository<NumberPlate, Long> {
    Optional<NumberPlate> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    List<NumberPlate> findByProvince(Province province);

    List<NumberPlate> findByProvince_Id(Long provinceId);

    List<NumberPlate> findByProvince_Name(String provinceName);

    List<NumberPlate> findByPlateType(PlateTypeEnum plateType);
}
