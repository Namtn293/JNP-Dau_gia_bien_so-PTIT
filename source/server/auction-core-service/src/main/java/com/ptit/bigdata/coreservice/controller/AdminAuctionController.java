package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.model.vo.AdminParticipantVO;
import com.ptit.bigdata.coreservice.model.vo.AdminRoomVO;
import com.ptit.bigdata.coreservice.model.vo.AdminServerMetricsVO;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
import com.ptit.bigdata.coreservice.model.dto.CreateAuctionSessionDTO;
import com.ptit.bigdata.coreservice.model.vo.AvailablePlateVO;
import com.ptit.bigdata.coreservice.model.vo.CreateAuctionSessionVO;
import com.ptit.bigdata.coreservice.service.implement.AdminAuctionSessionCreator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping({ "/api/v1/admin", "/api/admin" })
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

    @PostMapping("/auction/rooms/{roomId}/halt")
    public ResponseEntity<AdminCommandResultVO> haltRoom(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(adminAuctionService.halt(roomId));
    }

    @PostMapping("/auction/rooms/{roomId}/resume")
    public ResponseEntity<AdminCommandResultVO> resumeRoom(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(adminAuctionService.resume(roomId));
    }

    @PostMapping("/auction/rooms/{roomId}/cancel")
    public ResponseEntity<AdminCommandResultVO> cancelRoom(@PathVariable("roomId") String roomId) {
        return ResponseEntity.ok(adminAuctionService.cancel(roomId));
    }

    @PostMapping("/auction/rooms/{roomId}/kick/{userId}")
    public ResponseEntity<AdminCommandResultVO> kickUser(
            @PathVariable("roomId") String roomId,
            @PathVariable("userId") String userId) {
        return ResponseEntity.ok(adminAuctionService.kick(userId, roomId));
    }

    @PostMapping("/auction/rooms/{roomId}/unkick/{userId}")
    public ResponseEntity<AdminCommandResultVO> unkickUser(
            @PathVariable("roomId") String roomId,
            @PathVariable("userId") String userId) {
        return ResponseEntity.ok(adminAuctionService.unkick(userId, roomId));
    }

    @GetMapping("/metrics/overview")
    public ResponseEntity<AdminServerMetricsVO> getMetrics() {
        return ResponseEntity.ok(adminAuctionService.getMetrics());
    }

    private final AdminAuctionSessionCreator auctionSessionCreator;

    @GetMapping("/auction/available-plates")
    public ResponseEntity<List<AvailablePlateVO>> getAvailablePlates() {
        return ResponseEntity.ok(auctionSessionCreator.getAvailablePlates());
    }

    @PostMapping("/auction/rooms")
    public ResponseEntity<CreateAuctionSessionVO> createRoom(
            @Valid @RequestBody CreateAuctionSessionDTO request) {
        CreateAuctionSessionVO result = auctionSessionCreator.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(result);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleCreationError(
            ResponseStatusException ex) {
        String message = ex.getReason() != null
                ? ex.getReason()
                : "Yêu cầu không hợp lệ";

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of("message", message));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField()
                        + ": " + error.getDefaultMessage())
                .orElse("Dữ liệu không hợp lệ");

        return ResponseEntity
                .badRequest()
                .body(Map.of("message", message));
    }
}
