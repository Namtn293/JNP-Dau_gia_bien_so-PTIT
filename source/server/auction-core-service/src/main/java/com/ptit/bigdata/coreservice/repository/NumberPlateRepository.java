package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NumberPlateRepository extends JpaRepository<NumberPlate, Long> {
    Optional<NumberPlate> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    List<NumberPlate> findByProvinceId(Long provinceId);

    @Query("SELECT n FROM NumberPlate n JOIN Province p ON n.provinceId = p.id WHERE p.name = :provinceName")
    List<NumberPlate> findByProvinceName(@Param("provinceName") String provinceName);

    default List<NumberPlate> findByProvince(Province province) {
        return province != null ? findByProvinceId(province.getId()) : java.util.Collections.emptyList();
    }

    default List<NumberPlate> findByProvince_Id(Long provinceId) {
        return findByProvinceId(provinceId);
    }

    default List<NumberPlate> findByProvince_Name(String provinceName) {
        return findByProvinceName(provinceName);
    }

    List<NumberPlate> findByPlateType(PlateTypeEnum plateType);
}
