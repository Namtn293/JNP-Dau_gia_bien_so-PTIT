# MODULE CLIENT

> 📘 *Module giao diện người dùng Web dành cho đấu giá viên và khách theo dõi sàn đấu giá biển số xe trực tuyến.*

---

## 🎯 MỤC TIÊU

Client chịu trách nhiệm:
- **Giao diện sảnh chờ thời gian thực:** Hiển thị danh mục biển số xe theo tỉnh thành, cập nhật mức giá và số lượt bid nhảy tức thì qua WebSocket mà không cần reload trang.
- **Phòng đấu giá trực tiếp:**
  - Đồng bộ đồng hồ đếm ngược từng giây với Server (thuật toán bù trừ độ trễ mạng kiểu NTP).
  - Bàn phím bước giá nhanh (+5tr, +10tr, +20tr, +50tr) và đặt giá tùy chọn.
  - Vòng gia hạn phút chót (Anti-Sniping) tự động nhận diện thời gian gia hạn 30s.
  - Khung trò chuyện trực tuyến (Live Chat) giữa các đấu giá viên trong phòng.
- **Quản lý ví và thông báo:** Nạp tiền ví đấu giá, nộp tiền ký quỹ tham gia phòng, nhận chuông thông báo realtime (vượt giá, nạp tiền thành công, trúng đấu giá).
- **Cơ chế chịu lỗi mạng:** Tự động kết nối lại (Auto-reconnect) với thuật toán Exponential Backoff khi mạng chập chờn.

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Mục đích |
|------------|-----------|----------|
| **Ngôn ngữ & Nền tảng** | Node.js 18+, TypeScript, React 18 | Phát triển giao diện người dùng SPA |
| **Công cụ Build** | Vite 5 | Đóng gói và biên dịch siêu tốc |
| **Thư viện UI** | Ant Design 5, TailwindCSS, Lucide Icons | Thiết kế thành phần giao diện chuẩn thẩm mỹ |
| **Giao thức WebSocket** | `@stomp/stompjs`, `sockjs-client` | Kết nối STOMP over WebSocket đến Server |
| **Giao thức HTTP** | `axios` | Gọi RESTful API xác thực JWT, ví và biển số |

---

## 🚀 HƯỚNG DẪN CHẠY

### 1. Cài đặt phụ thuộc
Di chuyển vào thư mục `source/client/jnp.fe`:
```bash
cd source/client/jnp.fe
npm install
```

### 2. Khởi động Web Client (Development Mode)
```bash
npm run dev
```
Giao diện Web sẽ chạy tại: **`http://localhost:5173`**

### 3. Cấu hình kết nối
File cấu hình tại `source/client/jnp.fe/vite.config.ts` hoặc biến môi trường:
- **Backend API URL:** `http://localhost:8080/api`
- **WebSocket Endpoint:** `http://localhost:8080/ws` (SockJS fallback) hoặc `ws://localhost:8080/ws`

---

## 📦 CẤU TRÚC

```text
source/client/
├── README.md                    # Tài liệu hướng dẫn module Client (file này)
└── jnp.fe/                      # Mã nguồn ứng dụng Web React
    ├── public/                  # Tài nguyên tĩnh (ảnh nền, icon, logo)
    ├── src/
    │   ├── apps/                # Các trang chức năng chính
    │   │   ├── auction-list/    # Sảnh chờ danh sách biển số đấu giá
    │   │   ├── auction-room/    # Phòng đấu giá trực tuyến thời gian thực
    │   │   ├── auth/            # Đăng nhập, đăng ký, callback OAuth2
    │   │   ├── profile/         # Thông tin tài khoản & nạp ví
    │   │   └── wallet/          # Quản lý giao dịch ví đấu giá
    │   ├── shared/              # Thành phần dùng chung
    │   │   ├── components/      # UI components (Header, Footer, Chuông thông báo)
    │   │   ├── services/        # Quản lý kết nối WebSocket STOMP & Axios API
    │   │   └── utils/           # TokenManager, định dạng tiền tệ VNĐ
    │   ├── App.tsx              # Cấu hình Routing ứng dụng
    │   └── main.tsx             # Entry point React DOM
    ├── package.json
    └── vite.config.ts
```

---

## 💡 SỬ DỤNG

1. Mở trình duyệt tại `http://localhost:5173`.
2. Đăng nhập với tài khoản có sẵn (ví dụ: `namtran` / mật khẩu `123456`) hoặc đăng ký mới.
3. Vào trang cá nhân nạp tiền ví đấu giá (tối thiểu 40.000.000 VNĐ tiền cọc).
4. Vào sảnh chờ, bấm **"Đăng ký tham gia"** để nộp tiền đặt trước cho biển số yêu thích.
5. Khi phiên mở sảnh (`LIVE`), bấm vào phòng để trải nghiệm đặt giá thời gian thực!

---

## 📝 GHI CHÚ

- Đảm bảo **Auction Core Service** (cổng 8080) đã khởi động trước khi bật Web Client.
- Giao diện có tính năng tự động chuyển trạng thái sảnh chờ ngay khi Server phát tín hiệu mở phiên hoặc chốt phiên.
