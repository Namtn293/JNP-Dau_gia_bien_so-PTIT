package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.model.vo.AdminParticipantVO;
import com.ptit.bigdata.coreservice.model.vo.AdminRoomVO;
import com.ptit.bigdata.coreservice.model.vo.AdminServerMetricsVO;
import com.ptit.bigdata.coreservice.model.vo.AdminAuctionResultVO;

import java.util.List;

public interface AdminAuctionService {
    List<AdminRoomVO> getRooms();

    List<AdminParticipantVO> getParticipants(String roomId);

    AdminAuctionResultVO getResult(String roomId);

    AdminServerMetricsVO getMetrics();

    AdminCommandResultVO halt(String roomId);

    AdminCommandResultVO resume(String roomId);

    AdminCommandResultVO kick(String userId, String roomId);

    AdminCommandResultVO cancel(String roomId);
}
