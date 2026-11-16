---
trigger: always_on
---

styled thuộc folder components được viết trong file style.ts của folder của trang đó
# Yêu cầu cấu trúc thư mục

Mỗi **trang (page)** phải được tổ chức theo cấu trúc sau:

```text
<ten-trang>/
├── components/
│   └── ...
├── hooks/
│   ├── useData.ts
│   ├── useAction.ts
│   ├── useColumn.ts
│   └── ...
├── feature/
│   └── ...
├── util/
│   └── ...
├── services/
│   ├── api.ts
│   ├── mutation.ts
│   ├── query.ts
│   └── type.ts
├── index.tsx
└── route.ts
Quy ước
<ten-trang>: tên thư mục của trang/feature tương ứng.
components/: chứa các component UI chỉ phục vụ cho trang.
hooks/: chứa các custom hook của trang.
useData: xử lý/lấy dữ liệu cho trang.
useAction: xử lý các action/thao tác của người dùng.
useColumn: định nghĩa cấu hình column cho table.
Có thể bổ sung các hook khác khi cần.
feature/: chứa các logic hoặc module nghiệp vụ riêng của trang.
util/: chứa các hàm tiện ích/helper chỉ phục vụ cho trang.
services/: chứa tầng giao tiếp API và định nghĩa kiểu dữ liệu:
api.ts: cấu hình hoặc hàm gọi API cơ bản.
mutation.ts: các API mutation như create/update/delete.
query.ts: các API query lấy dữ liệu.
type.ts: type/interface liên quan đến API và dữ liệu của trang.
index.tsx: entry point của trang.
route.ts: định nghĩa route của trang.

Dùng showSuccessNotify hoặc showErrorNotify đã có trong code, không dùng message của ant
Yêu cầu sử dụng icon: sử dụng icon của thư viện thay vì dùng các icon text
