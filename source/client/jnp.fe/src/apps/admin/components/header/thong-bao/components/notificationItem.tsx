import React, { memo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { CalendarOutlined } from "@ant-design/icons";
import { App } from "antd";

import { coTheDieuHuongThongBao, layNghiepVuThongBao } from "../hooks/utils";
import { NotificationItemStyled } from "../styled";
import type { Notification } from "../services/type";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface Props {
  item: Notification;
  onMarkRead: (id: number) => void;
  onNavigate: (item: Notification) => Promise<void> | void;
}

const NotificationItem: React.FC<Props> = ({ item, onMarkRead, onNavigate }) => {
  const { notification } = App.useApp();

  const canNavigate = coTheDieuHuongThongBao(item);
  const nghiepVu = layNghiepVuThongBao(item);

  const handleClick = async () => {
    if (typeof window !== "undefined") {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim()) {
        return;
      }
    }

    if (!item.daXem) onMarkRead(item.id);

    if (canNavigate) {
      await onNavigate(item);
    } else {
      console.log("adasdasdas");
      notification.error({
        message: "Đã xem,chưa có thiết lập",
      });
    }

    console.log("check navigate>>>", canNavigate);
  };

  const isDauGia = nghiepVu === "DAU_GIA";
  const bgColor = isDauGia ? "#e0f2fe" : "#f0f7fb";
  const textColor = isDauGia ? "#0369a1" : "#256b8c";

  return (
    <NotificationItemStyled
      $unread={!item.daXem}
      onClick={handleClick}
      style={{ cursor: canNavigate ? "pointer" : "default" }}
    >
      <div className="content-container">
        <div className="item-title">
          <span className="title-text">{item.tieuDe}</span>
          <span
            className="nghiep-vu-badge"
            style={{ background: bgColor, color: textColor }}
          >
            {nghiepVu === "DAU_GIA" ? "ĐẤU GIÁ" : nghiepVu || "THÔNG BÁO"}
          </span>
        </div>
        <div className="item-text">{item.noiDung}</div>
        <div className="item-time">
          <CalendarOutlined />
          {dayjs(item.ngayTao).add(7, "hour").format("DD/MM/YYYY HH:mm")}
        </div>
      </div>
      {!item.daXem && <div className="unread-dot" />}
    </NotificationItemStyled>
  );
};

export default memo(NotificationItem);
