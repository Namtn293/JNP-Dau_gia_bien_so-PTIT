package com.ptit.bigdata.coreservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AuctionCoreServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuctionCoreServiceApplication.class, args);
    }

}
