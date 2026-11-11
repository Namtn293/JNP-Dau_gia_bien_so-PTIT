package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.RoomChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomChatMessageRepository extends JpaRepository<RoomChatMessage, Long> {

    List<RoomChatMessage> findByRoomCodeOrderByCreatedAtDescIdDesc(String roomCode, Pageable pageable);
}

