package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;

import java.util.List;

public interface RoomChatService {

    ChatMessageVO saveChatMessage(
            String roomCode,
            Long senderId,
            String senderName,
            String content,
            String clientMessageId
    );

    ChatMessageVO postChatFromRest(
            String roomCode,
            Long userId,
            String fallbackName,
            String content
    );

    List<ChatMessageVO> getChatHistory(String roomCode, int limit);
}

