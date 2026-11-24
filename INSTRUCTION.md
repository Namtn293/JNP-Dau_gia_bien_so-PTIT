# HƯỚNG DẪN THỰC HIỆN BÀI TẬP LỚN — MÔN LẬP TRÌNH MẠNG

**Giảng viên phụ trách:** Nguyễn Quốc Huy  
**Khoa:** Công nghệ thông tin 1

> ⚠️ **Lưu ý:** Đây là tài liệu do giảng viên soạn sẵn. Sinh viên **KHÔNG** được chỉnh sửa file này.

---

## 🎯 MỤC TIÊU

Sinh viên lựa chọn một chủ đề liên quan tới các nội dung đã được giới thiệu/topic trong môn lập trình mạng và triển khai thành một dự án hoàn chỉnh.

---

## 🧩 CẤU TRÚC REPOSITORY BẮT BUỘC
```
assignment-network-project/
├── README.md                    # Mô tả dự án (do sinh viên hoàn thiện)
├── INSTRUCTION.md               # Hướng dẫn (file này — KHÔNG chỉnh sửa)
├── statics/                     # Chứa hình ảnh, dataset, diagram
│   ├── logo.png
│   ├── dataset_sample.csv
│   └── diagram.png
└── source/                      # Chứa toàn bộ mã nguồn dự án
    ├── .gitignore
    ├── client/                  # Module phía client
    │   ├── README.md
    │   └── (client source files...)
    ├── server/                  # Module phía server
    │   ├── README.md
    │   └── (server source files...)
    └── (các module khác nếu có, ví dụ: common/, db/, service/, ...)
```

### Yêu cầu bắt buộc:

- ❌ Các nhóm **KHÔNG được chỉnh sửa hoặc xóa** file `INSTRUCTION.md`
- ✅ Toàn bộ mô tả hệ thống, giao tiếp, hướng dẫn build/run phải nằm trong `README.md`
- ✅ Tuân thủ đúng cấu trúc thư mục như trên

---

## 🧠 YÊU CẦU KỸ THUẬT

- Mỗi nhóm được phép dùng **ngôn ngữ và framework tùy chọn** (Python, Node.js, Java, Go, C++, C#...)
- Dự án phải chạy được **local** hoặc **trong Docker container**


---

## 🚀 HƯỚNG DẪN QUY TRÌNH

### Bước 1: Khởi tạo Repository
- **Fork hoặc clone** repo starter này
- Giữ nguyên cấu trúc thư mục ban đầu

### Bước 2: Đọc tài liệu
- Đọc kỹ nội dung trong `INSTRUCTION.md`
- Tham khảo mẫu trong `README.md`

### Bước 3: Cập nhật thông tin
- Điền đầy đủ thông tin nhóm vào `README.md` (root)
- Cập nhật chủ đề dự án đã đăng ký

### Bước 4: Phát triển dự án
- Phát triển code trong thư mục `source/`
- Tạo các thư mục con: `client/`, `server/`, hoặc module khác tùy thiết kế
- Viết `README.md` riêng cho từng module nếu cần

### Bước 5: Version Control
- Commit thường xuyên với message rõ ràng
- Push code lên GitHub/GitLab

### Bước 6: Hoàn thiện trước hạn nộp
- ✅ Đảm bảo `README.md` đầy đủ theo hướng dẫn
- ✅ Merge code về nhánh `main` hoặc tạo release
- ✅ Test lại toàn bộ hệ thống

---

## 🔍 TIÊU CHÍ CHẤM ĐIỂM

| Hạng mục | Tỷ trọng | Mô tả | Hình thức
|----------|----------|-------|-------|
| **Ý tưởng và Chức năng chính** | 40% | Tính sáng tạo, độ hoàn thiện, tính ứng dụng |  Nhóm
| **Tổ chức mã nguồn & cấu trúc repo** | 20% | Cấu trúc rõ ràng, code quality, Git usage |  Cá nhân
| **Tài liệu & hướng dẫn chạy** | 15% | README đầy đủ, dễ hiểu, chạy được theo hướng dẫn |  Nhóm
| **Trình bày & báo cáo** | 25% | Demo trực tiếp, khả năng giải thích, vấn đáp |    Cá nhân

**Tổng cộng:** 100%

---

## 🧩 QUY TRÌNH KIỂM TRA

Giảng viên sẽ kiểm tra theo thứ tự sau:

1. **Đọc tài liệu**  
   - Đọc file `README.md` (root) để hiểu tổng quan hệ thống
   - Kiểm tra cấu trúc repository

2. **Xem demo**  
   - Chạy thử dự án theo hướng dẫn trong README
   - Kiểm tra các chức năng chính

3. **Vấn đáp**  
   - Hỏi các thành viên về phần code họ phụ trách
   - Kiểm tra hiểu biết về công nghệ đã sử dụng

---

## 📅 THÔNG TIN QUAN TRỌNG

### Quy định chung:
- ✅ Mỗi nhóm tối đa **03 sinh viên**
- ✅ Chỉ chấm các repo có file `README.md` đầy đủ và **chạy được**
- ✅ Commit history phải thể hiện sự đóng góp của tất cả thành viên

### Hạn nộp:
- **[Sẽ được thông báo trên LMS/email]**
- Theo thông báo và phân chia kế hoạch từng nhóm

### Liên hệ hỗ trợ:
- Email giảng viên: **huynq@ptit.edu.vn**


---

## 📚 TÀI LIỆU THAM KHẢO

- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Markdown Guide](https://www.markdownguide.org/)
- [README Template Best Practices](https://github.com/othneildrew/Best-README-Template)

---

## ❓ CÂU HỎI THƯỜNG GẶP (FAQ)

**Q: Có được sử dụng thư viện/framework bên ngoài không?**  
A: Có, nhưng phải liệt kê rõ trong phần "Công nghệ sử dụng" và hướng dẫn cài đặt đầy đủ.


**Q: Làm sao biết dự án đã đủ yêu cầu?**  
A: Kiểm tra lại checklist trong phần "Tiêu chí chấm điểm" và đảm bảo README hướng dẫn đầy đủ.

**Q: Có được phép làm nhóm 1-2 người không?**  
A: Có, nhưng yêu cầu vẫn như nhóm 3 người.

---

*Chúc các nhóm thực hiện thành công! 🎉*

---

**© 2025 - Khoa Công nghệ thông tin 1**  