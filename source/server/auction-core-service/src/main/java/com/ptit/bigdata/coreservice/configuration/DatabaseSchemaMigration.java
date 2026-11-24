package com.ptit.bigdata.coreservice.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE wallet_transaction DROP CONSTRAINT IF EXISTS wallet_transaction_type_check");
            log.info("[DB-MIGRATION] Đã drop constraint wallet_transaction_type_check thành công!");
        } catch (Exception e) {
            log.warn("[DB-MIGRATION] Lỗi khi drop constraint wallet_transaction_type_check: {}", e.getMessage());
        }
    }
}
