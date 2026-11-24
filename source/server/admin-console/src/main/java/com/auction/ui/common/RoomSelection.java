package com.auction.ui.common;

import com.auction.model.RoomInfo;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

/**
 * Mã phòng đang được chọn, dùng chung giữa tab Giám sát và tab Điều khiển phiên.
 * Chỉ đọc và ghi trên EDT.
 */
public final class RoomSelection {
    private String roomId;
    private RoomInfo selectedRoom;
    private final List<Consumer<String>> listeners = new ArrayList<>();

    public String roomId() {
        return roomId;
    }

    public RoomInfo selectedRoom() {
        return selectedRoom;
    }

    public void select(String roomId) {
        if (Objects.equals(this.roomId, roomId)) {
            return;
        }
        this.roomId = roomId;
        selectedRoom = null;
        notifyListeners();
    }

    /** Lưu cả dữ liệu phòng để tab điều khiển có thể hiển thị ngay, không chờ HTTP. */
    public void selectRoom(RoomInfo room) {
        if (room == null) {
            select((String) null);
            return;
        }

        boolean shouldNotify = !Objects.equals(roomId, room.id()) || selectedRoom == null;
        roomId = room.id();
        selectedRoom = room;
        if (shouldNotify) {
            notifyListeners();
        }
    }

    private void notifyListeners() {
        for (Consumer<String> listener : listeners) {
            listener.accept(roomId);
        }
    }

    public void addListener(Consumer<String> listener) {
        listeners.add(listener);
    }
}
