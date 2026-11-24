package com.auction.ui.common;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import com.auction.model.RoomInfo;

/**
 * Mã phòng đang được chọn, dùng chung giữa tab Giám sát và tab Điều khiển phiên.
 * Chỉ đọc và ghi trên EDT.
 */
public final class RoomSelection {
    private RoomInfo room;
    private final List<Consumer<RoomInfo>> listeners = new ArrayList<>();

    public String roomId() {
        return room == null ? null : room.id();
    }

    public RoomInfo room() {
        return room;
    }

    public void select(RoomInfo room) {
        this.room = room;
        for (Consumer<RoomInfo> listener : List.copyOf(listeners)) {
            listener.accept(room);
        }
    }

    public void addListener(Consumer<RoomInfo> listener) {
        listeners.add(listener);
    }
}
