# Chirp — Ứng dụng chat thời gian thực

Chirp là ứng dụng web full-stack cho phép người dùng kết bạn, nhắn tin riêng và trò chuyện nhóm. Tin nhắn mới, trạng thái trực tuyến và lượt đọc được cập nhật ngay trên giao diện mà không cần tải lại trang.

Dự án tập trung vào luồng xử lý xuyên suốt từ giao diện React, API Express đến MongoDB và Socket.IO, cùng các tình huống thực tế như tải lịch sử chat, làm mới phiên đăng nhập và đồng bộ dữ liệu khi kết nối lại.

**Công nghệ chính:** React · TypeScript · Zustand · Node.js · Express · MongoDB · Socket.IO

**Trạng thái:** Có cấu hình triển khai cho Vercel và Render; chưa có bản demo công khai.

## Tính năng chính

| Nhóm tính năng        | Người dùng có thể làm gì?                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Tài khoản             | Đăng ký, đăng nhập, đăng xuất và duy trì phiên đăng nhập bằng refresh token.                   |
| Kết bạn               | Tìm người dùng theo username, gửi lời mời, xem lời mời đã gửi/đã nhận, chấp nhận hoặc từ chối. |
| Trò chuyện            | Nhắn tin riêng với bạn bè, tạo nhóm có tên và chọn bạn bè tham gia.                            |
| Cập nhật tức thời     | Nhận tin nhắn mới, xem ai đang trực tuyến, trạng thái đã xem và số tin chưa đọc.               |
| Lịch sử tin nhắn      | Cuộn lên để tải tin cũ và giữ vị trí đang đọc.                                                 |
| Hồ sơ cá nhân         | Đổi tên hiển thị, giới thiệu, số điện thoại và ảnh đại diện.                                   |
| Trải nghiệm giao diện | Chuyển chế độ sáng/tối, hiển thị khung chờ khi tải dữ liệu, thông báo lỗi và thử lại.          |

## Điểm kỹ thuật đáng chú ý

- **Kết hợp REST API và Socket.IO:** API xử lý thao tác và lưu dữ liệu; Socket.IO thông báo thay đổi để các máy khách cập nhật giao diện. Máy chủ theo dõi nhiều kết nối của cùng một người dùng để xử lý trạng thái online khi mở nhiều tab.
- **Phân trang lịch sử chat bằng con trỏ:** Kết hợp `createdAt` và `_id` để phân biệt các tin nhắn có cùng thời điểm tạo. Frontend gộp dữ liệu theo ID để tránh hiển thị trùng khi vừa tải lịch sử vừa nhận tin mới. Xem [xử lý phân trang](backend/src/untils/pagination.js) và [chat store](frontend/src/stores/useChatstore.ts).
- **Quản lý phiên đăng nhập:** Mật khẩu được băm bằng bcrypt; access token dùng JWT, refresh token được lưu trong cookie `HttpOnly`. Axios dùng chung một yêu cầu refresh khi nhiều request đồng thời gặp lỗi token. Xem [xác thực](backend/src/controllers/authController.js) và [Axios interceptor](frontend/src/lib/axios.ts).
- **Kiểm tra quyền ở backend:** Kiểm tra quan hệ bạn bè khi tạo cuộc trò chuyện và gửi tin riêng; kiểm tra thành viên khi truy cập lịch sử hoặc gửi tin nhóm.
- **Đồng bộ khi kết nối lại:** Frontend tải lại danh sách bạn bè, cuộc trò chuyện và tin nhắn của các cuộc trò chuyện đã tải sau khi Socket.IO kết nối lại. Xem [socket store](frontend/src/stores/useSocketStore.ts).
- **Upload ảnh đại diện:** Kiểm tra định dạng và dung lượng, xử lý bằng Multer rồi gửi ảnh lên Cloudinary; hỗ trợ JPG, PNG và WebP tối đa 2 MB.

## Công nghệ và tổ chức mã nguồn

| Thành phần           | Công nghệ                                     | Vai trò                                              |
| -------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Giao diện            | React, TypeScript, Vite                       | Xây dựng giao diện và kiểm tra kiểu dữ liệu.         |
| UI và biểu mẫu       | Tailwind CSS, shadcn/ui, React Hook Form, Zod | Tạo thành phần giao diện và kiểm tra dữ liệu nhập.   |
| Dữ liệu phía client  | Zustand, Axios                                | Quản lý trạng thái và gọi API.                       |
| Máy chủ              | Node.js, Express                              | Xử lý API và nghiệp vụ.                              |
| Cơ sở dữ liệu        | MongoDB, Mongoose                             | Lưu người dùng, phiên đăng nhập, bạn bè và tin nhắn. |
| Thời gian thực       | Socket.IO                                     | Đồng bộ tin nhắn, lượt đọc và trạng thái online.     |
| Xác thực và hình ảnh | JWT, bcrypt, Multer, Cloudinary               | Quản lý đăng nhập và xử lý ảnh đại diện.             |

```text
Chirp/
├── frontend/src/
│   ├── components/     # Giao diện chat, hồ sơ, đăng nhập và UI dùng chung
│   ├── pages/          # Các trang của ứng dụng
│   ├── services/       # Hàm gọi API
│   ├── stores/         # Trạng thái đăng nhập, chat, bạn bè và socket
│   └── types/          # Kiểu dữ liệu TypeScript
├── backend/src/
│   ├── routes/         # Các endpoint API
│   ├── controllers/    # Xử lý nghiệp vụ
│   ├── middlewares/    # Xác thực, kiểm tra quyền và upload
│   ├── models/         # Schema MongoDB
│   ├── socket/         # Kết nối và phòng Socket.IO
│   └── untils/         # Hàm hỗ trợ tin nhắn và phân trang
├── frontend/vercel.json
└── render.yaml
```

## Chạy dự án trên máy

### 1. Chuẩn bị

- Node.js 24 và npm.
- MongoDB đang chạy trên máy hoặc chuỗi kết nối MongoDB Atlas.
- Tài khoản Cloudinary nếu muốn thử upload ảnh đại diện. Các chức năng chat không yêu cầu Cloudinary.

Các lệnh bên dưới dùng **PowerShell**, bắt đầu từ thư mục gốc dự án.

### 2. Khởi động backend

```powershell
cd backend
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Mở `backend/.env` và điền cấu hình trước khi chạy:

| Biến                                                                   | Giá trị / mục đích                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MONGODB_CONNECTIONSTRING`                                             | Chuỗi kết nối MongoDB; mẫu local: `mongodb://127.0.0.1:27017/chirp`.      |
| `ACCESS_TOKEN_SECRET`                                                  | Thay giá trị mẫu bằng chuỗi bí mật ngẫu nhiên, đủ dài để ký JWT.          |
| `PORT`                                                                 | Cổng backend, mặc định `5001`.                                            |
| `CLIENT_URL`                                                           | Địa chỉ frontend, mặc định `http://localhost:5173`.                       |
| `NODE_ENV`                                                             | Dùng `development` khi chạy local.                                        |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Tùy chọn, chỉ cần cho upload ảnh đại diện. Giữ các giá trị này ở backend. |

```powershell
npm run dev
```

Backend chạy tại `http://localhost:5001`. Kiểm tra máy chủ tại `http://localhost:5001/health`.

### 3. Khởi động frontend

Mở terminal thứ hai tại thư mục gốc dự án:

```powershell
cd frontend
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Mở **http://localhost:5173** để sử dụng ứng dụng.

File `frontend/.env.example` đã có `VITE_BASE_URL=http://localhost:5001/api` và `VITE_SOCKET_URL=http://localhost:5001`. Nếu đổi cổng hoặc domain, cập nhật hai biến này cùng `CLIENT_URL` ở backend; kiểm tra cả `.env.development` nếu có vì Vite ưu tiên cấu hình theo môi trường. Dùng hostname `localhost` nhất quán cho cả hai phía khi chạy local để cookie hoạt động đúng.

### 4. Thử luồng sử dụng chính

1. Tạo hai tài khoản trong hai phiên trình duyệt riêng, ví dụ cửa sổ thường và cửa sổ ẩn danh.
2. Tìm username của tài khoản còn lại, gửi và chấp nhận lời mời kết bạn.
3. Mở chat riêng, gửi tin nhắn và quan sát số tin chưa đọc, trạng thái đã xem.
4. Tạo nhóm từ danh sách bạn bè, gửi tin và kiểm tra cập nhật ở tài khoản còn lại.
5. Thử đổi hồ sơ, chuyển giao diện sáng/tối và upload avatar nếu đã cấu hình Cloudinary.

## Kiểm tra mã nguồn

Chạy từ thư mục gốc dự án sau khi cài dependencies:

```powershell
cd frontend
npm run build
npm run lint
```

`build` kiểm tra TypeScript và tạo bản build bằng Vite; `lint` kiểm tra mã frontend bằng Oxlint.

Backend đã khai báo script `npm test`, nhưng hiện chưa có thư mục `backend/test/` trong mã nguồn. Bộ kiểm thử tự động cần được bổ sung; luồng thử bằng hai tài khoản ở trên dùng để kiểm tra thủ công.

## Triển khai và tài liệu API

- **Backend:** Có cấu hình Render trong [render.yaml](render.yaml), sử dụng Node.js 24, `npm start` và endpoint `/health`.
- **Frontend:** Có cấu hình Vercel trong [frontend/vercel.json](frontend/vercel.json), bao gồm chuyển các đường dẫn về `index.html` cho ứng dụng React.
- **Biến môi trường:** Khi triển khai, đặt `CLIENT_URL` theo domain frontend, `VITE_BASE_URL` theo URL backend kèm `/api`, và `VITE_SOCKET_URL` theo URL gốc backend. Backend cần `NODE_ENV=production`, kết nối MongoDB và secret JWT.
- **API:** Swagger có tại `http://localhost:5001/api-docs` khi backend chạy local. Tài liệu này có thể chưa bao quát các thay đổi mới; xem [routes](backend/src/routes) để đối chiếu endpoint hiện tại.
