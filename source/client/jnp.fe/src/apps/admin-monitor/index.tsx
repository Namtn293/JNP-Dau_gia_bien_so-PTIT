import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AlertOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  HomeOutlined,
  NotificationOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PushpinOutlined,
  ReloadOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { TopNavbar } from "@/apps/dashboard/components/TopNavbar";
import { useNotification } from "@/shared/hooks/useNotification";
import { useStompSubscription } from "@/shared/realtime";
import tokenManager from "@/shared/utils/tokenManager";
import { getUserFromToken } from "@/shared/utils/jwt";
import type {
  AnnouncementLevel,
  RoomAnnouncement,
  ShillAlert,
  ShillAlertStatus,
} from "@/shared/types/auction";
import {
  banUserApi,
  cancelRoomApi,
  deleteRoomAnnouncementApi,
  getAdminRoomsApi,
  getRoomAnnouncementsApi,
  getShillAlertDetailApi,
  getShillAlertsApi,
  haltRoomApi,
  postRoomAnnouncementApi,
  resumeRoomApi,
  reviewShillAlertApi,
  type AdminRoomVO,
} from "./services/api";

const formatVnd = (n: number) => `${(n || 0).toLocaleString("vi-VN")} ₫`;

const ROOM_STATUS_TAG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Đang diễn ra", color: "green" },
  EXTENDING: { label: "Gia hạn", color: "cyan" },
  PAUSED: { label: "Tạm dừng", color: "red" },
  WAITING: { label: "Phòng chờ", color: "gold" },
  SCHEDULED: { label: "Sắp diễn ra", color: "blue" },
  CLOSED: { label: "Đã đóng", color: "default" },
  SETTLED: { label: "Đã quyết toán", color: "purple" },
};

const LEVEL_TAG: Record<string, { label: string; color: string }> = {
  INFO: { label: "Thông tin", color: "blue" },
  WARNING: { label: "Cảnh báo", color: "orange" },
  IMPORTANT: { label: "Khẩn cấp", color: "red" },
};

export const AdminMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessNotify, showErrorNotify, showWarningNotify } = useNotification();

  const token = tokenManager.getAccessToken();
  const userInfo = useMemo(() => getUserFromToken(token), [token]);
  const isAdmin = Boolean(
    userInfo?.roles?.includes("ROLE_ADMIN") || userInfo?.username === "admin"
  );

  // 1. Rooms & Announcements State
  const [rooms, setRooms] = useState<AdminRoomVO[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>("");
  const [announcements, setAnnouncements] = useState<RoomAnnouncement[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [sendingAnn, setSendingAnn] = useState(false);
  const [form] = Form.useForm();

  // 2. Shill Alerts State
  const [alerts, setAlerts] = useState<ShillAlert[]>([]);
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>("");
  const [alertPage, setAlertPage] = useState(0);
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    alert?: ShillAlert;
    loading: boolean;
    note: string;
  }>({ open: false, loading: false, note: "" });

  const selectedRoomRef = React.useRef(selectedRoomCode);
  selectedRoomRef.current = selectedRoomCode;

  const loadRooms = useCallback(async () => {
    if (!isAdmin) return;
    setRoomsLoading(true);
    try {
      const list = await getAdminRoomsApi();
      setRooms(list);
      if (!selectedRoomRef.current && list.length > 0) {
        const firstActive = list.find((r) => r.status === "ACTIVE" || r.status === "EXTENDING");
        setSelectedRoomCode((firstActive || list[0]).id);
      }
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Không tải được danh sách phòng");
    } finally {
      setRoomsLoading(false);
    }
  }, [isAdmin, showErrorNotify]);

  const loadAnnouncements = useCallback(async (code: string) => {
    if (!code) return;
    setAnnLoading(true);
    try {
      const pageRes = await getRoomAnnouncementsApi(code, 0, 20);
      setAnnouncements(pageRes?.content ?? []);
    } catch {
      setAnnouncements([]);
    } finally {
      setAnnLoading(false);
    }
  }, []);

  const loadShillAlerts = useCallback(async () => {
    if (!isAdmin) return;
    setAlertsLoading(true);
    try {
      const pageRes = await getShillAlertsApi({
        status: alertStatusFilter || undefined,
        page: alertPage,
        size: 10,
      });
      setAlerts(pageRes?.content ?? []);
      setAlertsTotal(pageRes?.totalElements ?? 0);
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Không tải được cảnh báo thổi giá");
    } finally {
      setAlertsLoading(false);
    }
  }, [isAdmin, alertStatusFilter, alertPage, showErrorNotify]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (selectedRoomCode) {
      loadAnnouncements(selectedRoomCode);
    }
  }, [selectedRoomCode, loadAnnouncements]);

  useEffect(() => {
    loadShillAlerts();
  }, [loadShillAlerts]);

  // Realtime Shill Bidding Alerts subscription
  useStompSubscription<ShillAlert>(
    "/topic/admin/alerts",
    (alert) => {
      if (!alert) return;
      showWarningNotify(
        `[CẢNH BÁO THỔI GIÁ] Phiên ${alert.sessionCode}: ${alert.userAName} & ${alert.userBName} (${alert.bidCount} lượt liên tục)`
      );
      loadShillAlerts();
    },
    isAdmin
  );

  const handleRoomAction = async (
    actionType: "halt" | "resume" | "cancel",
    roomId: string
  ) => {
    try {
      const res =
        actionType === "halt"
          ? await haltRoomApi(roomId)
          : actionType === "resume"
          ? await resumeRoomApi(roomId)
          : await cancelRoomApi(roomId);
      showSuccessNotify(res?.message || `Thao tác ${actionType.toUpperCase()} thành công`);
      loadRooms();
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleSendAnnouncement = async (values: {
    content: string;
    level: AnnouncementLevel;
    pinned: boolean;
    notifyWatchers: boolean;
  }) => {
    if (!selectedRoomCode) {
      showErrorNotify("Vui lòng chọn phòng đấu giá");
      return;
    }
    setSendingAnn(true);
    try {
      await postRoomAnnouncementApi(selectedRoomCode, {
        content: values.content,
        level: values.level,
        pinned: Boolean(values.pinned),
        notifyWatchers: Boolean(values.notifyWatchers),
      });
      showSuccessNotify(`Đã phát thông điệp tới phòng ${selectedRoomCode}`);
      form.resetFields(["content"]);
      loadAnnouncements(selectedRoomCode);
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Gửi thông điệp thất bại");
    } finally {
      setSendingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!selectedRoomCode) return;
    try {
      await deleteRoomAnnouncementApi(selectedRoomCode, id);
      showSuccessNotify("Đã gỡ thông báo khỏi phòng");
      loadAnnouncements(selectedRoomCode);
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Gỡ thông báo thất bại");
    }
  };

  const openShillDetail = async (id: number) => {
    setDetailModal({ open: true, loading: true, note: "" });
    try {
      const detail = await getShillAlertDetailApi(id);
      setDetailModal({
        open: true,
        alert: detail,
        loading: false,
        note: detail.note || "",
      });
    } catch {
      setDetailModal({ open: false, loading: false, note: "" });
      showErrorNotify("Không tải được chi tiết cảnh báo");
    }
  };

  const handleReviewAlert = async (status: ShillAlertStatus) => {
    if (!detailModal.alert) return;
    try {
      await reviewShillAlertApi(detailModal.alert.id, {
        status,
        note: detailModal.note,
      });
      showSuccessNotify(`Đã cập nhật trạng thái cảnh báo sang ${status}`);
      setDetailModal({ open: false, loading: false, note: "" });
      loadShillAlerts();
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Xử lý cảnh báo thất bại");
    }
  };

  const handleBanUser = async (userId: number, userName: string) => {
    try {
      await banUserApi(userId, detailModal.note || "Phát hiện hành vi thổi giá");
      showSuccessNotify(`Đã khóa tài khoản ${userName} (#${userId})`);
      loadShillAlerts();
    } catch (err: any) {
      showErrorNotify(err?.response?.data?.message || "Không thể khóa tài khoản");
    }
  };

  const roomColumns: ColumnsType<AdminRoomVO> = [
    {
      title: "Phiên / Biển số",
      key: "room",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{r.plate}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {r.id} &bull; {r.region}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (st: string) => {
        const cfg = ROOM_STATUS_TAG[st] || { label: st, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Giá hiện tại",
      dataIndex: "currentPrice",
      align: "right",
      render: (v: number) => <b>{formatVnd(v)}</b>,
    },
    {
      title: "Còn lại",
      dataIndex: "remainingLabel",
      align: "center",
    },
    {
      title: "Điều hành & Thông điệp",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Space size={6} wrap>
          <Button
            size="small"
            type={selectedRoomCode === r.id ? "primary" : "default"}
            icon={<NotificationOutlined />}
            onClick={() => setSelectedRoomCode(r.id)}
          >
            Nhắn phòng
          </Button>
          {r.status !== "PAUSED" && r.status !== "CLOSED" && r.status !== "SETTLED" && (
            <Popconfirm
              title={`Tạm dừng khẩn cấp phiên ${r.id}?`}
              onConfirm={() => handleRoomAction("halt", r.id)}
            >
              <Button size="small" danger icon={<PauseCircleOutlined />}>
                HALT
              </Button>
            </Popconfirm>
          )}
          {r.status === "PAUSED" && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRoomAction("resume", r.id)}
            >
              RESUME (+30s)
            </Button>
          )}
          {r.status !== "CLOSED" && r.status !== "SETTLED" && (
            <Popconfirm
              title={`Hủy phiên ${r.id} và hoàn cọc 100%?`}
              onConfirm={() => handleRoomAction("cancel", r.id)}
            >
              <Button size="small" icon={<StopOutlined />}>
                CANCEL
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() =>
              navigate({ to: "/phong-dau-gia/$roomId", params: { roomId: r.id } })
            }
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  const alertColumns: ColumnsType<ShillAlert> = [
    {
      title: "Phiên đấu giá",
      dataIndex: "sessionCode",
      render: (code: string) => <b>{code}</b>,
    },
    {
      title: "Cặp tài khoản nghi vấn",
      key: "users",
      render: (_, r) => (
        <div>
          <b>{r.userAName}</b> <span style={{ color: "#94a3b8" }}>↔</span>{" "}
          <b>{r.userBName}</b>
          {r.sameIp && (
            <Tag color="red" style={{ marginLeft: 6 }}>
              Trùng IP
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Chuỗi lượt / Tốc độ",
      key: "stats",
      render: (_, r) => (
        <span>
          <b>{r.bidCount}</b> lượt liên tiếp &bull; TB {r.avgGapSeconds.toFixed(1)}s/lượt
          (min {r.minGapSeconds}s)
        </span>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      align: "center",
      render: (sev: string) => (
        <Tag color={sev === "HIGH" ? "red" : "orange"}>{sev}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (st: string) => (
        <Tag
          color={
            st === "OPEN" ? "volcano" : st === "CONFIRMED" ? "red" : "default"
          }
        >
          {st}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Button size="small" type="primary" ghost onClick={() => openShillDetail(r.id)}>
          Chi tiết & Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <TopNavbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <Link to="/danh-sach-dau-gia" style={{ color: "#1b6284" }}>
            <HomeOutlined style={{ marginRight: 4 }} />
            Trang chủ đấu giá
          </Link>
          <RightOutlined style={{ fontSize: 10 }} />
          <span>Trung tâm Điều hành & Giám sát (Admin)</span>
        </div>

        {!isAdmin ? (
          <Alert
            type="error"
            showIcon
            message="Không có quyền truy cập"
            description="Trang này chỉ dành cho tài khoản Quản trị viên (ROLE_ADMIN)."
          />
        ) : (
          <Tabs
            defaultActiveKey="rooms"
            size="large"
            items={[
              {
                key: "rooms",
                label: (
                  <span>
                    <NotificationOutlined style={{ marginRight: 6 }} />
                    Điều hành phòng &amp; Gửi thông điệp
                  </span>
                ),
                children: (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr",
                      gap: 20,
                      alignItems: "start",
                    }}
                  >
                    <Card
                      title="Danh sách phòng đấu giá"
                      extra={
                        <Button
                          size="small"
                          icon={<ReloadOutlined spin={roomsLoading} />}
                          onClick={loadRooms}
                        >
                          Làm mới
                        </Button>
                      }
                    >
                      <Table<AdminRoomVO>
                        rowKey="id"
                        columns={roomColumns}
                        dataSource={rooms}
                        loading={roomsLoading}
                        pagination={{ pageSize: 8 }}
                        size="small"
                      />
                    </Card>

                    <Card
                      title={
                        <span>
                          <PushpinOutlined style={{ marginRight: 6, color: "#1b6284" }} />
                          Gửi thông điệp vào phòng{" "}
                          {selectedRoomCode ? `(${selectedRoomCode})` : ""}
                        </span>
                      }
                    >
                      <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                          level: "INFO",
                          pinned: true,
                          notifyWatchers: true,
                        }}
                        onFinish={handleSendAnnouncement}
                      >
                        <Form.Item label="Phòng đấu giá mục tiêu">
                          <Select
                            value={selectedRoomCode || undefined}
                            onChange={setSelectedRoomCode}
                            placeholder="Chọn phiên đấu giá..."
                            showSearch
                            options={rooms.map((r) => ({
                              label: `${r.plate} (${r.id}) — ${r.status}`,
                              value: r.id,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          name="content"
                          label="Nội dung thông điệp"
                          rules={[
                            { required: true, message: "Vui lòng nhập nội dung thông điệp" },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            maxLength={1000}
                            showCount
                            placeholder="VD: Lưu ý các đấu giá viên chuẩn bị vào vòng gia hạn phút chót..."
                          />
                        </Form.Item>

                        <Form.Item name="level" label="Mức độ">
                          <Select
                            options={[
                              { label: "Thông tin (INFO)", value: "INFO" },
                              { label: "Cảnh báo (WARNING)", value: "WARNING" },
                              { label: "Khẩn cấp (IMPORTANT)", value: "IMPORTANT" },
                            ]}
                          />
                        </Form.Item>

                        <Space direction="vertical" style={{ marginBottom: 16 }}>
                          <Form.Item name="pinned" valuePropName="checked" noStyle>
                            <Checkbox>Ghim lên đầu khung chat phòng đấu giá</Checkbox>
                          </Form.Item>
                          <Form.Item name="notifyWatchers" valuePropName="checked" noStyle>
                            <Checkbox>
                              Gửi thông báo chuông tới người theo dõi &amp; đã cọc
                            </Checkbox>
                          </Form.Item>
                        </Space>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={sendingAnn}
                          block
                          icon={<NotificationOutlined />}
                        >
                          Phát thông điệp vào phòng ngay
                        </Button>
                      </Form>

                      <div style={{ marginTop: 20 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#334155" }}>
                          Thông điệp gần đây trong phòng {selectedRoomCode}
                        </div>
                        <Table<RoomAnnouncement>
                          rowKey="id"
                          loading={annLoading}
                          dataSource={announcements}
                          size="small"
                          pagination={false}
                          locale={{ emptyText: "Chưa có thông điệp nào" }}
                          columns={[
                            {
                              title: "Nội dung",
                              key: "content",
                              render: (_, a) => (
                                <div>
                                  <Space size={4} style={{ marginBottom: 2 }}>
                                    <Tag color={(LEVEL_TAG[a.level] || LEVEL_TAG.INFO).color}>
                                      {a.level}
                                    </Tag>
                                    {a.pinned && <Tag color="gold">Đang ghim</Tag>}
                                  </Space>
                                  <div style={{ fontSize: 13 }}>{a.content}</div>
                                </div>
                              ),
                            },
                            {
                              title: "",
                              key: "del",
                              width: 50,
                              render: (_, a) => (
                                <Popconfirm
                                  title="Gỡ thông báo này?"
                                  onConfirm={() => handleDeleteAnnouncement(a.id)}
                                >
                                  <Button
                                    size="small"
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                key: "shill",
                label: (
                  <span>
                    <AlertOutlined style={{ marginRight: 6, color: "#dc2626" }} />
                    Cảnh báo thổi giá ({alertsTotal})
                  </span>
                ),
                children: (
                  <Card
                    title={
                      <span>
                        <WarningOutlined style={{ color: "#ea580c", marginRight: 8 }} />
                        Giám sát nghi vấn thổi giá (Đặt giá qua lại liên tục ≤ 15s)
                      </span>
                    }
                    extra={
                      <Space>
                        <Select
                          style={{ width: 170 }}
                          value={alertStatusFilter}
                          onChange={(val) => {
                            setAlertStatusFilter(val || "");
                            setAlertPage(0);
                          }}
                          allowClear
                          placeholder="Tất cả trạng thái"
                          options={[
                            { label: "Tất cả", value: "" },
                            { label: "Chờ xử lý (OPEN)", value: "OPEN" },
                            { label: "Đã xác nhận (CONFIRMED)", value: "CONFIRMED" },
                            { label: "Đã bác bỏ (DISMISSED)", value: "DISMISSED" },
                          ]}
                        />
                        <Button
                          icon={<ReloadOutlined spin={alertsLoading} />}
                          onClick={loadShillAlerts}
                        >
                          Làm mới
                        </Button>
                      </Space>
                    }
                  >
                    <Table<ShillAlert>
                      rowKey="id"
                      columns={alertColumns}
                      dataSource={alerts}
                      loading={alertsLoading}
                      pagination={{
                        current: alertPage + 1,
                        pageSize: 10,
                        total: alertsTotal,
                        onChange: (p) => setAlertPage(p - 1),
                      }}
                    />
                  </Card>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Modal chi tiết Shill Alert */}
      <Modal
        open={detailModal.open}
        title={
          detailModal.alert
            ? `Chi tiết nghi vấn thổi giá — Phiên ${detailModal.alert.sessionCode}`
            : "Chi tiết cảnh báo"
        }
        onCancel={() => setDetailModal({ open: false, loading: false, note: "" })}
        width={740}
        footer={
          detailModal.alert ? (
            <Space wrap>
              <Popconfirm
                title={`Khóa tài khoản ${detailModal.alert.userAName}?`}
                onConfirm={() =>
                  handleBanUser(detailModal.alert!.userAId, detailModal.alert!.userAName)
                }
              >
                <Button danger icon={<StopOutlined />}>
                  Khóa {detailModal.alert.userAName}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={`Khóa tài khoản ${detailModal.alert.userBName}?`}
                onConfirm={() =>
                  handleBanUser(detailModal.alert!.userBId, detailModal.alert!.userBName)
                }
              >
                <Button danger icon={<StopOutlined />}>
                  Khóa {detailModal.alert.userBName}
                </Button>
              </Popconfirm>
              <Button onClick={() => handleReviewAlert("DISMISSED")}>
                Bác bỏ (Hợp lệ)
              </Button>
              <Button
                type="primary"
                danger
                icon={<SafetyCertificateOutlined />}
                onClick={() => handleReviewAlert("CONFIRMED")}
              >
                Xác nhận thổi giá
              </Button>
            </Space>
          ) : null
        }
      >
        {detailModal.alert && (
          <div>
            <Alert
              type={detailModal.alert.severity === "HIGH" ? "error" : "warning"}
              showIcon
              style={{ marginBottom: 14 }}
              message={`Cặp đấu giá: ${detailModal.alert.userAName} ↔ ${detailModal.alert.userBName} (${detailModal.alert.bidCount} lượt xen kẽ)`}
              description={`Khoảng cách trung bình: ${detailModal.alert.avgGapSeconds.toFixed(1)}s | Ngắn nhất: ${detailModal.alert.minGapSeconds}s | Trùng IP: ${detailModal.alert.sameIp ? "CÓ" : "Không"}`}
            />

            <Table
              rowKey={(_, i) => String(i)}
              size="small"
              pagination={{ pageSize: 8 }}
              dataSource={detailModal.alert.recentBids || []}
              columns={[
                { title: "Người đặt", dataIndex: "userName" },
                {
                  title: "Số tiền",
                  dataIndex: "bidAmount",
                  align: "right",
                  render: (v: number) => <b>{formatVnd(v)}</b>,
                },
                {
                  title: "Thời gian",
                  key: "t",
                  render: (_, b: any) =>
                    b.bidTime ? b.bidTime.replace("T", " ").slice(0, 19) : b.time,
                },
                { title: "Nguồn", dataIndex: "source" },
              ]}
            />

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Ghi chú xử lý của Admin:</div>
              <Input.TextArea
                rows={2}
                value={detailModal.note}
                onChange={(e) =>
                  setDetailModal((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Nhập lý do xác nhận hoặc bác bỏ cảnh báo..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMonitorPage;

