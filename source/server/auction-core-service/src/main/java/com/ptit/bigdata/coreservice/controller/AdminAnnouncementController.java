package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.model.dto.AnnouncementDTO;
import com.ptit.bigdata.coreservice.model.vo.RoomAnnouncementVO;
import com.ptit.bigdata.coreservice.service.RoomAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/admin/auction/{code}/announcements", "/api/admin/auction/{code}/announcements"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAnnouncementController {

    private final RoomAnnouncementService roomAnnouncementService;

    @PostMapping
    public SuccessResponse<RoomAnnouncementVO> postAnnouncement(
            @PathVariable("code") String code,
            @RequestBody AnnouncementDTO dto
    ) {
        Long adminId = ThreadContext.getCurrentUserId();
        return ResponseUtil.ok(roomAnnouncementService.post(code, adminId, dto));
    }

    @DeleteMapping("/{id}")
    public SuccessResponse<String> deleteAnnouncement(
            @PathVariable("code") String code,
            @PathVariable("id") Long id
    ) {
        roomAnnouncementService.delete(code, id);
        return ResponseUtil.ok("Đã gỡ bỏ thông báo");
    }
}

