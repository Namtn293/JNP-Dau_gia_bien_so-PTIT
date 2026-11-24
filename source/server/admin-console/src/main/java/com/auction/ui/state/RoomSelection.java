package com.auction.ui.state;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import com.auction.model.RoomInfo;

/**
 * Mã phòng đang được chọn, dùng chung giữa tab Giám sát và tab Điều khiển
 * phiên.
 * Chỉ đọc và ghi trên EDT.
 */
public final class RoomSelection {
    private RoomInfo room;
    private final List<Consumer<RoomInfo>> listeners = new ArrayList<>();

    /** Trả về mã phòng đang được chọn. */
    public String roomId() {
        return room == null ? null : room.id();
    }

    /** Trả về dữ liệu phòng đang được chọn. */
    public RoomInfo room() {
        return room;
    }

    /** Cập nhật phòng được chọn và thông báo các listener. */
    public void select(RoomInfo room) {
        this.room = room;
        for (Consumer<RoomInfo> listener : List.copyOf(listeners)) {
            listener.accept(room);
        }
    }

    /** Đăng ký listener theo dõi thay đổi lựa chọn. */
    public void addListener(Consumer<RoomInfo> listener) {
        listeners.add(listener);
    }
}
