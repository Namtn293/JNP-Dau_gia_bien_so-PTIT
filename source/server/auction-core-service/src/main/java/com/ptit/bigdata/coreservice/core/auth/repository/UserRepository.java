package com.ptit.bigdata.coreservice.core.auth.repository;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserName(String userName);

    Optional<User> findByUserName(String userName);

    @Query(value = "select a.roleEnum from User a where a.userName = :userInfoName")
    RoleEnum findRoleEnumByUserName(@Param(value = "userInfoName") String userName);

    void deleteUserByUserName(String userName);

    List<User> findByRoleEnum(RoleEnum roleEnum);
}
