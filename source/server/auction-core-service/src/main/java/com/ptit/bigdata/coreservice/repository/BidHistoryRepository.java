package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.BidHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {

}
