package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageVO {
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private String timestamp;
    @Builder.Default
    private String type = "CHAT"; // CHAT, JOIN, LEAVE
}
