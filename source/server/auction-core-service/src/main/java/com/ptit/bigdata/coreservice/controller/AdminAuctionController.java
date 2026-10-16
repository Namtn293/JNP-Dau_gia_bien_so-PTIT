package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.model.vo.AdminParticipantVO;
import com.ptit.bigdata.coreservice.model.vo.AdminRoomVO;
import com.ptit.bigdata.coreservice.model.vo.AdminServerMetricsVO;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAuctionController {

    private final AdminAuctionService adminAuctionService;

    @GetMapping("/auction/rooms")
    public ResponseEntity<List<AdminRoomVO>> getRooms() {
        return ResponseEntity.ok(adminAuctionService.getRooms());
    }

    @GetMapping("/auction/rooms/{roomId}/participants")
    public ResponseEntity<List<AdminParticipantVO>> getParticipants(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(adminAuctionService.getParticipants(roomId));
    }

    @GetMapping("/metrics/overview")
    public ResponseEntity<AdminServerMetricsVO> getMetrics() {
        return ResponseEntity.ok(adminAuctionService.getMetrics());
    }
}
