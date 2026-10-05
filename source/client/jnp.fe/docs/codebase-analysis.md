# Báo cáo Phân tích Kỹ thuật: cmc-dtqg.fe

> **Phân tích bởi:** Senior Developer / Tech Lead Review  
> **Ngày:** 02/07/2026  
> **Codebase:** `cmc-dtqg.fe` — 8.570 file TypeScript/TSX, ~1.038.000 dòng code  
> **Gateway:** `cmcdtqg-gateway.dieuhanhso.vn`

---

## 1. Tổng quan & Mục đích

### Đây là gì?

**CMC-DTQG** = **Cổng Quản lý Đầu tư Quốc gia**, phục vụ hệ thống quản lý đầu tư của Nhà nước Việt Nam. Đây là một **portal nội bộ dành cho cán bộ công chức**, không phải cổng dịch vụ công cho người dân.

### Domain nghiệp vụ

Hệ thống bao quát toàn bộ vòng đời quản lý đầu tư tại Việt Nam:

- **Quản lý đầu tư trong nước** (`ql-dau-tu-trong-nuoc`) — theo dõi dự án đầu tư nội địa
- **Quản lý đầu tư nước ngoài vào VN** (`ql-dau-tu-vao-viet-nam`) — FDI inbound
- **Quản lý đầu tư ra nước ngoài** (`ql-dau-tu-ra-nuoc-ngoai`) — OFDI outbound
- **Xúc tiến đầu tư** (`quan-ly-xuc-tien-dau-tu`) — chương trình XTDT, MOU, cảnh báo
- **Quản lý KCN/KKT** (`quan-ly-kcn-kkt`) — Khu Công nghiệp / Khu Kinh tế
- **Xử lý hồ sơ** (`xu-ly-ho-so`) — tiếp nhận, xử lý, trả kết quả (trực tiếp + trực tuyến)
- **Xử lý PAKN** (`xu-ly-PAKN`) — Phản Ánh Kiến Nghị của tổ chức/cá nhân
- **Bản đồ số** (`ban-do-so`) — GIS/Map hiển thị KCN/KKT, hạ tầng đầu tư (Map4D)
- **Quản lý tích hợp** (`quan-ly-tich-hop`) — kết nối hệ thống, đồng bộ dữ liệu, lịch sử kết nối
- **Quản lý bài viết** (`quan-ly-bai-viet`) — CMS nội bộ với workflow duyệt
- **Kho VBQPPL** (`kho-vbqppl`) — Kho văn bản quy phạm pháp luật
- **Quản trị hệ thống** (`admin`) — users, roles, menu, danh mục, cấu hình, kho tri thức AI
- **Phân công phê duyệt** (`phan-cong-phe-duyet`) — workflow giao việc
- **Ủy quyền tài khoản** (`uy-quyen-tai-khoan`) — quản lý ủy quyền

### Quy mô

- **8.570 files** TypeScript/TSX
- **~1.038.000 dòng code**
- **15+ feature apps** độc lập
- **100+ field types** trong form engine (packages/)
- **3 môi trường** CI/CD: development, staging, production

---

## 2. Tech Stack

### Core

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 19.1.1 | UI framework — phiên bản mới nhất |
| TypeScript | ~5.9.3 | Static typing |
| Vite | ^7.1.7 | Build tool, dev server |

### Routing

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `@tanstack/react-router` | ^1.133.36 | **Router chính** (file-wired) |
| `react-router-dom` | ^6.23.1 | **Đang trong quá trình thay thế** — còn sót trong deps |

### UI & Styling

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `antd` | ^5.27.6 | Component library chính — Vietnamese locale |
| `@ant-design/icons` | ^6.1.0 | Icon set |
| `@ant-design/plots` | ^2.6.6 | Charts (AntV G2 wrapper) |
| `tailwindcss` | ^4.1.17 | Utility CSS (v4 — PostCSS plugin) |
| `styled-components` | ^6.1.19 | CSS-in-JS (dùng trong Chat Widget) |
| `@heroicons/react` | ^2.2.0 | Icon bổ sung |

### State Management

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `@reduxjs/toolkit` | ^2.11.2 | Redux + RTK Query (form engine state) |
| `react-redux` | ^9.2.0 | React bindings for Redux |
| `react-query` | 3.39.3 | **Phiên bản cũ** — data fetching cho app logic |
| `@tanstack/react-query` | ^5.90.10 | **Phiên bản mới** — cả 2 cùng tồn tại (!) |

### Rich Text & Code Editing

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `@lexical/react` + ecosystem | ^0.45.0 | Lexical editor — rich text chính trong form builder |
| `@ckeditor/ckeditor5-*` | ^43.3.0 | CKEditor5 — dùng trong quản lý bài viết |
| `@monaco-editor/react` | ^4.7.0 | Monaco (VS Code) — JSON/code editing |
| `@codemirror/*` | ^6.x | CodeMirror 6 — JSON editor nhẹ hơn |

### Bản đồ & GIS

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `leaflet` + `react-leaflet` | ^1.9.4 / ^5.0.0 | OpenStreetMap-based map |
| `leaflet-draw` | ^1.0.4 | Vẽ polygon trên bản đồ |
| `react-map4d-map` | ^1.3.9 | **Map4D SDK** — bản đồ số Việt Nam |
| `@turf/turf` | ^7.3.5 | GeoJSON geometry utilities |
| `geojson-validation` | ^1.0.2 | Validate GeoJSON input |
| `@placemarkio/check-geojson` | ^0.1.14 | Extended GeoJSON checker |

### Drag & Drop

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `@dnd-kit/core` + `sortable` + `utilities` | ^6.3.1 | Form builder drag-drop |
| `react-dnd` + `react-dnd-html5-backend` | ^16.0.1 | Legacy DnD (còn dùng trong một số component) |

### Flow Diagram

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `@xyflow/react` | ^12.10.0 | React Flow — sơ đồ quy trình xử lý |

### File & Document

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `pdfjs-dist` | ^5.4.296 | PDF rendering |
| `react-pdf` | ^10.4.1 | React wrapper cho PDF.js |
| `@cyntler/react-doc-viewer` | ^1.17.1 | Multi-format document viewer |
| `xlsx` | ^0.18.5 | Export Excel |

### Security & Auth

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `crypto-js` | ^4.2.0 | DES encryption cho tokens |
| `jwt-decode` | ^4.0.0 | Decode JWT |
| `dompurify` | ^3.3.1 | XSS sanitize HTML |

### Utilities

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `axios` | 1.15.0 | HTTP client (pinned version) |
| `zod` | ^4.1.12 | Schema validation |
| `lodash` | ^4.17.21 | Utility functions |
| `dayjs` | ^1.11.19 | Date/time |
| `moment` | ^2.30.1 | Date/time legacy (cả 2 cùng tồn tại) |
| `i18next` + `react-i18next` | ^25.7.2 | Internationalization (vi/en) |
| `react-cmdk` | ^1.3.9 | Command palette (Ctrl+K) |
| `react-detect-offline` | ^2.4.5 | Network status detection |
| `nprogress` | ^0.2.0 | Page loading progress bar |
| `pako` | ^2.1.0 | Gzip compression/decompression |
| `uuid` | ^10.0.0 | UUID generation |
| `slugify` | ^1.6.6 | Slug generation |
| `query-string` | ^9.3.1 | URL query string parse |
| `react-markdown` + `remark-gfm` | ^10.1.0 | Markdown rendering (Chat Widget) |
| `html-react-parser` | ^5.2.11 | HTML string → React elements |
| `immutability-helper` | ^3.1.1 | Immutable state updates |
| `recharts` | ^3.6.0 | Charts bổ sung |
| `react-js-cron` | ^6.0.2 | Cron expression builder UI |

### Dev Tools

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `plop` | ^4.0.4 | Code generator (plopfile.js) |
| `vite-plugin-mock-server` | ^1.3.1 | Mock server tích hợp Vite |
| `husky` | ^9.1.7 | Git hooks (pre-commit lint) |
| `vite-plugin-dts` | ^4.5.4 | TypeScript declarations cho packages |
| `sass` | ^1.93.2 | SCSS preprocessing |

---

## 3. Kiến trúc Thư mục

```
cmc-dtqg.fe/
├── src/                          # Application source
│   ├── apps/                     # 15 Feature apps (micro-frontend-lite)
│   │   ├── admin/                # Quản trị hệ thống
│   │   ├── auth/                 # Xác thực (login cán bộ)
│   │   ├── ban-do-so/            # Bản đồ số (Map4D + Leaflet)
│   │   ├── dashboard/            # Dashboard tổng quan
│   │   ├── kho-vbqppl/           # Kho văn bản quy phạm pháp luật
│   │   ├── phan-cong-phe-duyet/  # Phân công phê duyệt
│   │   ├── ql-dau-tu-ra-nuoc-ngoai/ # OFDI management
│   │   ├── ql-dau-tu-trong-nuoc/    # Domestic investment
│   │   ├── ql-dau-tu-vao-viet-nam/  # FDI inbound
│   │   ├── quan-ly-bai-viet/     # CMS bài viết
│   │   ├── quan-ly-danh-muc-du-lieu/ # Danh mục dữ liệu
│   │   ├── quan-ly-kcn-kkt/      # KCN/KKT management
│   │   ├── quan-ly-tich-hop/     # Tích hợp & chia sẻ dữ liệu
│   │   ├── quan-ly-xuc-tien-dau-tu/ # Xúc tiến đầu tư
│   │   ├── uy-quyen-tai-khoan/   # Ủy quyền tài khoản
│   │   ├── xu-ly-PAKN/           # Xử lý phản ánh kiến nghị
│   │   └── xu-ly-ho-so/          # Xử lý hồ sơ hành chính
│   │
│   ├── shared/                   # Cross-app shared code
│   │   ├── components/           # Shared UI components (30+ folders)
│   │   │   ├── ChatWidget/       # AI Chat widget (embeddable)
│   │   │   ├── layouts/          # App layout shells
│   │   │   ├── tables/           # Data table abstractions
│   │   │   ├── map-view/         # Shared map components
│   │   │   ├── error-boundary/   # Error fallback UI
│   │   │   ├── form/             # Shared form helpers
│   │   │   ├── polygon-draw/     # GIS polygon drawing
│   │   │   └── ...               # 20+ other shared components
│   │   ├── hooks/                # 25 shared hooks
│   │   ├── services/             # Shared API layer (react-query wrappers)
│   │   ├── utils/                # 35+ utility modules
│   │   ├── types/                # Shared TypeScript types
│   │   ├── context/              # AppContext (permission/role)
│   │   ├── constants/            # Shared constants
│   │   └── styles/               # Global SCSS
│   │
│   ├── configs/                  # App configuration
│   │   ├── axios.ts              # 3 Axios instances + interceptors
│   │   ├── antDesign.tsx         # Ant Design ConfigProvider + theme
│   │   ├── reactQuery.ts         # QueryClient config
│   │   ├── theme.config.ts       # Form engine theme
│   │   ├── map-config.ts         # Map4D options
│   │   └── i18n/                 # i18next config
│   │
│   ├── constants/                # App-level constants
│   ├── pages/                    # Non-app pages (ViewPage, Details, ViewerPageDvc)
│   ├── assets/                   # Static assets (images, scss)
│   ├── types/                    # Global TypeScript declarations
│   ├── App.tsx                   # Root app + Ant Design patch
│   ├── main.tsx                  # Entry point + Providers tree
│   ├── Route.tsx                 # Route tree assembly
│   └── rootRoute.tsx             # Root route + auth guard
│
├── packages/                     # Internal form engine library
│   ├── @types/                   # Package-level types
│   ├── assets/                   # Package assets
│   ├── components/               # 150+ UI components
│   │   ├── View/                 # ~100 form field viewers
│   │   ├── Config/               # Field configuration panels
│   │   ├── BuilderBar/           # Form builder toolbar
│   │   ├── DigitalPaper/         # Giấy tờ số (Builder + Viewer)
│   │   ├── CommonTable/          # Table abstractions
│   │   ├── RichTextEditor/       # Lexical wrapper
│   │   ├── CMDK/                 # Command palette
│   │   └── ...
│   ├── main/                     # Core form engine
│   │   ├── BuilderBlock/         # Drag-drop builder block
│   │   └── Forms/
│   │       ├── FormBase/         # Base form (FieldItem, StyleWrapper)
│   │       ├── FormBuilder/      # Builder mode
│   │       └── FormViewer/       # Viewer mode (standalone + embed)
│   ├── redux/                    # Redux store
│   │   ├── slices/               # FormSlice, CMDKSlice, formCalculationSlice
│   │   ├── services/             # RTK Query (schemaApi)
│   │   ├── middleware/           # actionFuncMiddleware
│   │   └── store.ts              # Store config + persistence
│   ├── schema/                   # Form schema model
│   │   ├── schemaModel.ts        # JsonSchema, Field, Schema classes
│   │   └── fields/               # 100+ field type definitions
│   ├── dvc-service/              # DVC API service layer
│   ├── locales/                  # i18n translations (vi/en)
│   ├── hooks/                    # Package-level hooks
│   ├── constants/                # Package constants
│   ├── utils/                    # Package utilities
│   └── styles/                   # Package SCSS
│
├── libs/                         # Third-party JS libraries
│   └── vgcaplugin.js             # VGCA chữ ký số plugin
│
├── mock/                         # Mock server (dev only)
│   ├── schema.mock.ts            # CRUD /builders endpoints
│   └── books.ts                  # Mock data
│
├── vite.config.ts                # Main Vite config
├── vite.widget.config.ts         # Widget build config
├── Dockerfile                    # Multi-stage Docker build
├── nginx.conf                    # Nginx serving config
├── .gitlab-ci.yml                # GitLab CI/CD pipeline
├── plopfile.js                   # Code generator templates
└── global.d.ts                   # Global TypeScript declarations
```

### Pattern mỗi Feature App

Mỗi app trong `src/apps/` tuân theo cấu trúc nhất quán:

```
apps/<feature>/
├── Route.tsx          # Route definition (TanStack Router)
├── pages/             # Page components (lazy-loaded)
├── components/        # Feature-specific components
├── hooks/             # Feature hooks
├── services/          # Feature API calls
├── constants/         # Feature constants/routes/enums
├── types/             # Feature types
└── utils/             # Feature utilities
```

---

## 4. State Management

Dự án sử dụng **3 lớp state** song song:

### 4.1. Redux Toolkit — Form Engine State

Quản lý state của form builder/viewer (trong `packages/redux/`):

```
store.reducer = {
  form:             FormSlice      // Active schema, fields, mode, documentId, donViThuLy
  CMDK:             CMDKSlice      // Command palette open/close
  formCalculation:  formCalculationSlice  // Tính toán tỷ lệ góp vốn theo nhóm
  schemaApi:        RTK Query      // CRUD form schemas qua /builders
}
```

**FormSlice** là slice lớn nhất, chứa:
- `activeSchema` — schema form đang active
- `modeView` — builder | viewer | preview
- `documentId`, `donViThuLy` — context hồ sơ
- Các selectors (createSelector) cho derived state

**formCalculationSlice** — tính toán tự động tỷ lệ vốn góp giữa các nhà đầu tư.

**Persistence:** `donViThuLy` và `documentId` được persist vào `sessionStorage` qua `store.subscribe()`.

### 4.2. RTK Query — Schema API

```typescript
schemaApi = createApi({
  baseUrl: '/builders',
  endpoints: getForms, getSchemaDetail, updateSchema, deleteSchema, createSchema
})
```

Dùng cho CRUD form schema — kết nối trực tiếp `/builders` endpoint (mock trong dev).

### 4.3. react-query v3 — Business Data Fetching

Toàn bộ data fetching của các app nghiệp vụ dùng `react-query` v3 (legacy):

```typescript
// Ví dụ pattern
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,    // ⚠️ Never refetch
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
```

`useGetUserInfo`, `useMenuUser`, `useQuyenUserQuery` — các query chia sẻ.

### 4.4. React Context — Permission

```typescript
// AppContext: load permission khi app khởi động
AppContext = { permission: IRoleUser | null }
```

Permission được load từ API ngay khi mount, truyền xuống toàn app qua context.

---

## 5. Routing

### TanStack Router v1 (File-wired, không phải file-based)

```
rootRoute (auth guard + error boundary)
├── adminRoute (_adminLayout)
│   ├── quanLyLoaiVanBanRoute
│   ├── thuTucHanhChinhRoute
│   ├── vaiTroRoute
│   ├── quanLyKhoTriThucRoute
│   ├── banDoSoRoute
│   └── ... (30+ sub-routes)
├── dashboardRoute
├── authdRoute
├── quanLyBaiVietRoute
├── xuLyHoSoRoute
├── QuanLyTichHopRoute
├── quanLyDauTuTrongNuoc
├── quanLyDauTuVaoVietNam
├── quanLyDauTuRaNuocNgoai
├── xuLyPAKNRoute
├── kcnkktRoute
└── xtdtRoute
```

### Auth Guard (rootRoute.beforeLoad)

```typescript
// Logic: nếu chưa đăng nhập → redirect /admin/login
// Nếu đã đăng nhập, truy cập "/" → redirect /admin
const accessToken = lcStorage.get(LOCAL_STORAGE_KEYS.accessToken);
const loggedIn = !!accessToken;
if (!loggedIn && !isPublicRoute) throw redirect({ to: ADMIN_LOGIN_ROUTE });
```

### Lazy Loading

Hầu hết pages dùng `createLazyRoute` để code-split:

```typescript
export const Route = createLazyRoute(ROUTE_PATH)({
  component: () => <PageComponent />
});
```

### ChunkLoadError Recovery

Khi dynamic import thất bại (deploy mới + user đang dùng cũ), app tự reload:

```typescript
window.addEventListener('vite:preloadError', () => reloadForChunkError());
window.addEventListener('unhandledrejection', (e) => {
  if (isDynamicImportError(e.reason)) reloadForChunkError();
});
```

---

## 6. Widget Build (AI Chat Widget)

### Kiến trúc

```
vite.widget.config.ts
  └── Entry: src/shared/components/ChatWidget/index.tsx
      └── Build: dist/widget/ai-widget.js (IIFE, standalone)
          └── copy → public/ai-widget.js
```

### Cơ chế Embedding

Script tag injection vào bất kỳ trang nào:

```html
<script src="/ai-widget.js?key=c049c098-b17e-4d8e-b8c7-951de0777e4d"></script>
```

Widget tự bootstrap:
1. Tìm script tag → đọc `?key` param (widgetKey)
2. Tạo `<div id="ai-chat-widget-root">`
3. Tạo **Shadow DOM** để CSS isolation hoàn toàn
4. Mount React app vào shadowRoot qua `createRoot`
5. Dùng `StyleSheetManager target={shadowRoot}` để styled-components inject đúng vào Shadow DOM

### Tính năng Chat Widget

- **Streaming AI** (Server-Sent Events / streaming response)
- **Conversation management** (conversationId persistence)
- **Expandable window** (expand/collapse)
- **Markdown rendering** (react-markdown + remark-gfm)
- **Like/Dislike feedback**
- **Auth-aware** (truyền JWT token nếu đã đăng nhập)
- **Guest ID** (fingerprint cho user chưa đăng nhập)
- **Thinking content** (hiển thị chain-of-thought)
- **Bot config từ API** (botName, welcomeMessage)

### AI Backend

```
VITE_API_AI_URL=https://cmcai.tinix.ai/api
Stream endpoint: POST /api/v1/chat/widget/stream
```

### Build Pipeline

```bash
# Build order:
1. vite build -c vite.widget.config.ts        # → dist/widget/ai-widget.js
2. node -e "copyFileSync('dist/widget/ai-widget.js', 'public/ai-widget.js')"
3. tsc -b (NODE_OPTIONS=--max-old-space-size=6144)
4. vite build                                   # Main app
```

---

## 7. API Layer

### 3 Axios Instances

```typescript
// 1. API chính — DVC / admin
axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // cmcdtqg-gateway.dieuhanhso.vn
  timeout: 120_000,
});

// 2. News / Article API
axiosNewsClient = axios.create({
  baseURL: import.meta.env.VITE_ARTICLE_API_URL,  // .../qtbv/api
  // ⚠️ Không set Content-Type cứng — để axios auto-detect (hỗ trợ FormData)
});

// 3. AI API
axiosAIClient = axios.create({
  baseURL: import.meta.env.VITE_API_AI_URL,  // cmcai.tinix.ai/api
  timeout: 120_000,
});
```

### Request Interceptor (shared cho cả 3)

```typescript
// 1. Thêm Bearer token từ tokenManager
// 2. Thêm header ngonngu (vi/en) — trừ Article API
// 3. validateStatus: chấp nhận 404 (không throw)
```

### Response Interceptor

```typescript
// Success: trả thẳng response.data (unwrap)
// 401: trigger refresh token flow
// 500: notification.error global
// 405: "Bạn không có quyền thao tác này"
// Khác: parse message từ errorData.messages[] hoặc errorData.message
// skip-global-notification header: bypass global error toast
```

### Token Management

Token được mã hóa DES trước khi lưu localStorage (production):

```typescript
tokenManager = {
  getAccessToken()    // decrypt từ localStorage
  setAccessToken()    // encrypt rồi lưu localStorage
  getRefreshToken()   // decrypt từ localStorage
  removeAllToken()    // localStorage.clear()
  getRoles() / setRoles()  // JSON + encrypt
}
```

### Refresh Token Flow (Queue Pattern)

Khi nhận 401, nếu đang refresh thì queue các request lại:

```typescript
let isRefreshing = false;
let failedQueue: IFailedQueue[] = [];

// POST /admin/v1/auth/refresh → { accessToken, refreshToken }
// processQueue() → replay tất cả request trong queue
// Nếu refresh fail → clearTokens + redirect /admin/login
```

### Environments

```
VITE_API_URL              = https://cmcdtqg-gateway.dieuhanhso.vn
VITE_ARTICLE_API_URL      = https://cmcdtqg-gateway.dieuhanhso.vn/qtbv/api
VITE_API_AI_URL           = https://cmcai.tinix.ai/api
VITE_RESOURCE_URL         = https://minio.zamiga.vn/    (MinIO object storage)
VITE_MAP_KEY              = (Map4D key)
VITE_DES_ENCRYPT_KEY      = ghkd324i0230   ⚠️ Được commit vào .env
VITE_TINYMCE_LICENSE_KEY  = (TinyMCE license)
```

---

## 8. Packages / Libs Nội bộ

### `packages/` — Form Engine (Internal Library)

Đây là **trái tim kỹ thuật** của hệ thống — một form builder/viewer engine đầy đủ được nhúng trực tiếp vào monorepo (không phải npm package riêng).

#### Schema Model

```typescript
// Core data model
JsonSchema = {
  title: string
  type: string
  layout: 'horizontal' | 'vertical' | 'inline'
  fields: Field[]
  currentTheme?: string
  requiredForm?: any
}

Field = {
  fieldKey: string       // unique identifier
  fieldType: FIELD_NAME  // enum (100+ types)
  label: string
  config: {...}          // type-specific config
  validations: [...]
  hideIf?: [...]         // conditional display
  children?: Field[]     // nested fields
}
```

#### 100+ Field Types

Categories chính:

- **Input fields:** Text, TextArea, InputNumber, InputNumberVND, Email, PhoneNumber, MSTNumber, CMNDNumber, FaxNumber, Password
- **Selection:** Select, AsyncSelect, RadioGroup, CheckboxGroup, AsyncRadioGroup, AsyncCheckboxGroup, GroupSelect, TREE_SELECT, SelectQuocGia
- **Date/Time:** DatePicker, DateTimePicker, Rangepicker
- **File:** Upload, SelectFile, Document
- **Table:** Table, FormListTable, AsyncTable, TableGroup, TableFinancial, TableCapitalContribution, TableDatDai13B/C/D, TableKhoangSan, v.v.
- **Investment-specific:** ViewInvestor, ViewInvestorInfo, ViewInvestorBase, ViewProject, ViewInvestmentCapital, ViewEconomicOrgCapital, ViewGeneralInfoForeign, ViewOutwardInvestmentAdjustment, v.v.
- **Layout:** Column, GroupFields, Tab, FormStep
- **Special:** DigitalSignature, CoordinateSelect, FormulaInput, NumberToText, InputWithUpload, CaptchaBox, HtmlField, ViewHtml, ViewInfo

#### DigitalPaper (Giấy Tờ Số)

Builder + Viewer cho giấy tờ điện tử dạng PDF layout — cho phép thiết kế mẫu văn bản theo tọa độ pixel, tương tự word processor.

#### Form Modes

```typescript
MODE_VIEW = {
  BUILDER:  'builder',   // Drag-drop build form
  VIEWER:   'viewer',    // Fill/view form data
  PREVIEW:  'preview'    // Preview without data binding
}
```

#### FormViewer Variants

- `withEmbedBuilder` — nhúng trong builder (có context redux)
- `withStandalone` — standalone viewer (không cần redux)

### `libs/vgcaplugin.js` — VGCA Chữ Ký Số

Plugin tích hợp với phần mềm ký số VGCA của Chính phủ Việt Nam. App expose các hooks:

```typescript
window.vgca_sign_issued()   // Đóng dấu phát hành
window.vgca_sign_approved() // Ký phê duyệt
window.vgca_sign_income()   // Ký công văn đến
window.vgca_comment()       // Thêm ý kiến
window.vgca_sign_appendix() // Ký phụ lục
window.vgca_sign_copy()     // Ký bản sao điện tử
window.vgca_sign_files()    // Ký danh sách file
```

Plugin được copy vào dist thông qua `viteStaticCopy` trong vite.config.ts.

---

## 9. Build & Deploy

### Docker (Multi-stage Build)

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build-stage
ARG VITE_API_URL, VITE_DES_ENCRYPT_KEY, ...  # 10+ build args
RUN yarn install --frozen-lockfile
RUN yarn build  # widget + tsc + vite build

# Stage 2: Serve
FROM nginx:1.25-alpine AS run-stage
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
```

### Nginx Configuration

Chiến lược cache được tối ưu:

```nginx
# index.html: never cache (deploy mới → browser lấy ngay)
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# JS/CSS: cache 1 năm (Vite content-hash → immutable)
location ~* \.(?:css|js)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# Media: cache 1 tháng
location ~* \.(?:jpg|jpeg|gif|png|ico|svg|mp4)$ {
  expires 1M;
}

# Gzip: on (level 6), min-length 1024
# SPA: try_files $uri $uri/ /index.html
```

### GitLab CI/CD Pipeline

Tag-based deployment với 3 environments:

```yaml
# Tag format → Environment
dev_v1.0.0    → development  (port 5175)
staging_v1.0.0 → staging    (port 5275)
prod_v1.0.0   → production  (port 5375)
```

Stages:
1. **publish** — `docker build` với build args → `docker save` → transfer sang server
2. **deploy** — `docker load` → `docker run` với port mapping

---

## 10. Điểm Mạnh & Điểm Yếu

### Điểm Mạnh

**Kiến trúc:**
- **Feature-app isolation** tốt — mỗi app trong `src/apps/` độc lập, dễ phân chia team
- **packages/ form engine** là tài sản kỹ thuật quý giá — 100+ field types, drag-drop, digital paper, đủ dùng cho mọi loại hồ sơ hành chính
- **Code splitting** với `createLazyRoute` — tránh bundle monolithic
- **ChunkLoadError auto-recovery** — UX tốt sau deploy

**Security:**
- Token encryption DES trong localStorage (dù DES đã lỗi thời — xem điểm yếu)
- VGCA digital signature integration
- DOMPurify để sanitize HTML
- `skip-global-notification` header pattern để kiểm soát UX error
- `validateStatus` chấp nhận 404 để tránh throw error không cần thiết

**Infrastructure:**
- Multi-stage Docker build tối ưu image size
- Nginx cache strategy đúng (immutable JS/CSS, no-cache index.html)
- GitLab CI/CD 3 environments, tag-based rõ ràng

**UX/DX:**
- AI Chat Widget embeddable via Shadow DOM — không ảnh hưởng host page
- Streaming AI response (SSE)
- Map4D SDK integration (bản đồ số VN)
- CMDK command palette
- plop code generator
- Auto-zoom để fit màn hình desktop lớn
- Ant Design patch để hiển thị multi-error toast với "Đóng tất cả"

**Đặc thù domain:**
- Hỗ trợ đầy đủ lifecycle đầu tư: tạo hồ sơ → xử lý → phê duyệt → thống kê
- Tích hợp GIS (bản đồ số KCN/KKT)
- Workflow phân công phê duyệt
- Quản lý tích hợp API (API gateway, lịch sử kết nối)

---

### Điểm Yếu

**Dependency Conflicts:**

1. **Hai phiên bản React Query đồng thời:**
   ```json
   "react-query": "3.39.3",             // Đang dùng thực tế
   "@tanstack/react-query": "^5.90.10"  // Cũng có trong deps
   ```
   Tạo ra 2 QueryClient instances riêng biệt, cache không chia sẻ được.

2. **Hai thư viện routing:**
   ```json
   "@tanstack/react-router": "^1.133.36",  // Router đang dùng
   "react-router-dom": "^6.23.1"          // Còn sót trong deps
   ```

3. **Hai thư viện ngày tháng:**
   ```json
   "dayjs": "^1.11.19",
   "moment": "^2.30.1"   // Moment.js đã deprecated
   ```

**Security:**

4. **DES Encryption đã lỗi thời** — DES chỉ có 56-bit key, đã bị crack từ 1999. Token trong localStorage nên dùng AES-256 hoặc không mã hóa nhưng dùng httpOnly cookie thay thế.

5. **Secret keys trong repository:**
   ```
   VITE_DES_ENCRYPT_KEY=ghkd324i0230   # Commit vào .env.development
   VITE_MAP_KEY=5c643df61c0356ba...     # Commit vào .gitlab-ci.yml
   ```

**Performance:**

6. **`staleTime: Infinity` trong QueryClient** — data không bao giờ tự refresh, phải gọi `invalidateQueries` thủ công. Dễ gây stale data nếu dev quên.

7. **Bundle size** — `manualChunks` trong vite.config.ts bị comment out. Toàn bộ vendor đi vào 1 chunk. Cần 6GB RAM để build (`NODE_OPTIONS=--max-old-space-size=6144`) cho thấy bundle rất lớn.

8. **TanStack Router plugin bị comment out:**
   ```typescript
   // tanstackRouter({ target: 'react', autoCodeSplitting: true })
   ```
   Mất tính năng auto code-splitting tự động theo route.

**Code Quality:**

9. **`console.log` trong production** — response error handler có `console.log('Request error: ', { error })` trong `axios.ts`.

10. **File backup còn trong codebase:**
    ```
    src/shared/utils/getZoomRatio copy.ts
    ```

11. **Typo Unicode trong code:**
    ```typescript
    const đefaultValue = { permission: null }  // 'đ' thay vì 'd'
    ```

12. **Không có test nào** — zero test files trong toàn bộ codebase 8.570 files.

13. **ReactQueryDevtools luôn render:**
    ```typescript
    <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
    // Không có điều kiện process.env.NODE_ENV === 'development'
    ```

14. **`tokenManager` là global singleton** — khó mock trong testing, side effects khó kiểm soát.

15. **`(window as any).formFields = form.getFieldsValue()`** trong FormBuilder — debug artifact bị quên xóa.

16. **Tên thư mục tiếng Việt có dấu** — `src/apps/xu-ly-PAKN/contants/` (typo: thiếu 's') và `xu-ly-PAKN` mix case.

---

## 11. Recommendations

### P0 — Bảo mật (Cần làm ngay)

**1. Thay thế DES bằng AES-256:**
```typescript
// Hiện tại (không an toàn):
CryptoJS.DES.encrypt(data, key)

// Nên dùng:
CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
```
Hoặc tốt hơn: dùng `httpOnly cookie` để lưu token — browser không cho JS đọc, miễn nhiễm với XSS.

**2. Đưa secrets ra khỏi repository:**
```bash
# Xóa VITE_DES_ENCRYPT_KEY khỏi .env.development và .gitlab-ci.yml
# Dùng GitLab CI/CD Variables (masked) thay thế
```

**3. Remove console.log trong axios interceptor:**
```typescript
// Xóa dòng này trong configs/axios.ts:
console.log('Request error: ', { error });
```

---

### P1 — Kỹ thuật (Quan trọng)

**4. Thống nhất React Query — migrate từ v3 lên v5:**
```typescript
// Xóa: "react-query": "3.39.3"
// Giữ: "@tanstack/react-query": "^5.90.10"

// Thay đổi import:
// Cũ: import { useQuery } from 'react-query'
// Mới: import { useQuery } from '@tanstack/react-query'
```
Đây là migration quan trọng nhất. Cần review tất cả các hook query — API có thay đổi.

**5. Xóa react-router-dom:**
```bash
yarn remove react-router-dom @types/react-router-dom
# Chắc chắn không còn import nào từ 'react-router-dom'
```

**6. Enable TanStack Router plugin với autoCodeSplitting:**
```typescript
// vite.config.ts — uncomment:
tanstackRouter({
  target: 'react',
  autoCodeSplitting: true,
})
```

**7. Enable manualChunks để tách vendor bundle:**
```typescript
// vite.config.ts:
build: {
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('@ckeditor')) return 'vendor_ckeditor';
          if (id.includes('lexical')) return 'vendor_lexical';
          if (id.includes('leaflet') || id.includes('turf')) return 'vendor_map';
          if (id.includes('antd') || id.includes('@ant-design')) return 'vendor_antd';
          if (id.includes('react')) return 'vendor_react';
          return 'vendor';
        }
      }
    }
  }
}
```

**8. Fix staleTime:**
```typescript
// configs/reactQuery.ts:
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,  // 5 phút thay vì Infinity
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  }
}
```

**9. ReactQueryDevtools chỉ trong development:**
```typescript
// main.tsx:
{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
```

---

### P2 — Chất lượng Code

**10. Xóa moment.js, dùng thuần dayjs:**
```bash
yarn remove moment @types/moment
# Review các import moment trong codebase
```

**11. Dọn dẹp file backup:**
```bash
rm src/shared/utils/getZoomRatio\ copy.ts
```

**12. Remove debug artifacts:**
```typescript
// packages/main/Forms/FormBuilder/index.tsx — xóa:
(window as any).formFields = form.getFieldsValue();
```

**13. Thêm test coverage:**
```bash
yarn add -D vitest @testing-library/react @testing-library/user-event jsdom
```
Bắt đầu với: utils functions, tokenManager, axios interceptors, các shared hooks.

**14. Tách packages/ thành npm workspace (dài hạn):**
```json
// package.json root:
{
  "workspaces": ["apps/main", "packages/form-engine"]
}
```
Giúp form engine có thể tái sử dụng ở project khác, build riêng biệt.

---

### P3 — Developer Experience

**15. Kích hoạt stricter TypeScript:**
```json
// tsconfig.app.json:
"noImplicitAny": true,   // hiện tại = false
"noUnusedLocals": true,  // đã bật — tốt
"noUnusedParameters": true // đã bật — tốt
```

**16. Upgrade axios từ pinned 1.15.0:**
```bash
# 1.15.0 bị pin → có thể có security patches bỏ lỡ
yarn add axios@latest
```

**17. Đưa plopfile templates vào thư mục riêng:**
```
plop-templates/
├── feature-app/
│   ├── Route.tsx.hbs
│   ├── constants/index.ts.hbs
│   └── ...
```

---

## Tổng kết

Đây là một hệ thống **quy mô lớn và phức tạp** phục vụ domain nghiệp vụ đặc thù của Nhà nước Việt Nam. Codebase thể hiện sự đầu tư nghiêm túc vào form engine (`packages/`) với 100+ field types — đây là nền tảng kỹ thuật độc đáo.

Các vấn đề chính cần giải quyết theo thứ tự ưu tiên:

1. **Bảo mật** — DES encryption lỗi thời, secrets trong repo
2. **Dependency conflict** — dual react-query versions, dual routing libs
3. **Bundle size** — manualChunks, autoCodeSplitting
4. **Test coverage** — zero tests là rủi ro lớn cho hệ thống nhà nước
5. **staleTime: Infinity** — tiềm ẩn stale data bugs

Nếu giải quyết được P0 + P1, system sẽ tăng đáng kể về security, performance và maintainability.
