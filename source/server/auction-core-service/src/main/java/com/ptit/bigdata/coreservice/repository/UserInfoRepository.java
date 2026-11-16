package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {

    List<UserInfo> findAll();

    Optional<UserInfo> findByUserName(String userName);

    List<UserInfo> findByUserNameIn(Collection<String> userNames);

    Optional<UserInfo> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
}
