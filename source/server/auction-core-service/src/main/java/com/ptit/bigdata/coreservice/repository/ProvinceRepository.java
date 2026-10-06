package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    Optional<Province> findByName(String name);

    Optional<Province> findByCode(String code);

    boolean existsByName(String name);

    boolean existsByCode(String code);
}
