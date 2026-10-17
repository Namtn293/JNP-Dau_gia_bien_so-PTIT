package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomEventVO {
    private String roomId;
    private String event; // JOIN, LEAVE, HALT, RESUME, CANCEL, END
    private String message;
    private Integer participantCount;
    private String timestamp;
}
