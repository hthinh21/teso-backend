# BÁO CÁO ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN BACKEND (NESTJS)
---

## Bảng Đánh Giá Mức Độ Hoàn Thành Yêu Cầu

Dưới đây là thống kê chi tiết tỷ lệ hoàn thành đối với từng yêu cầu của đề bài:

| STT | Yêu cầu đề bài | Trạng thái | Mức độ đạt (%) | Chi tiết triển khai & File minh chứng |
| :--- | :--- | :--- | :---: | :--- |
| **1** | **Cơ sở dữ liệu (PostgreSQL + TypeORM)** | Hoàn thành | **100%** | Tích hợp module database không đồng bộ sử dụng ConfigService tại [database.module.ts](file:///c:/CODE/teso-backend/src/infra/database/database.module.ts). |
| **2** | **Authen user log in (Đăng nhập User)** | Hoàn thành | **100%** | Kiểm tra mật khẩu (bcrypt), sinh JWT Token. Có bảo vệ chống brute-force mật khẩu bằng Redis tại [auth.service.ts](file:///c:/CODE/teso-backend/src/modules/auth/auth.service.ts) và [login-rate-limit.guard.ts](file:///c:/CODE/teso-backend/src/modules/auth/guards/login-rate-limit.guard.ts). |
| **3** | **API User Profile (Xem hồ sơ cá nhân)** | Hoàn thành | **100%** | Endpoint `/api/v1/users/profile` bảo mật bằng JWT và lấy thông tin tài khoản tự động bằng custom decorator `@GetUser()` tại [users.controller.ts](file:///c:/CODE/teso-backend/src/modules/users/users.controller.ts). |
| **4** | **API Xem quà hệ thống dành cho User** | Hoàn thành | **100%** | Endpoint `/api/v1/rewards` tự động cache dữ liệu danh sách và chi tiết món quà vào Redis trong 10 phút để giảm tải cho PostgreSQL tại [rewards.controller.ts](file:///c:/CODE/teso-backend/src/modules/rewards/rewards.controller.ts). |
| **5** | **Authen admin log in (Đăng nhập Admin)** | Hoàn thành | **100%** | Endpoint `/api/v1/auth/admin/login` kiểm tra phân quyền `role = admin` chặt chẽ, tích hợp chặn brute-force bằng Redis tại [auth.controller.ts](file:///c:/CODE/teso-backend/src/modules/auth/auth.controller.ts). |
| **6** | **API Quản lý quà hệ thống dành cho Admin** | Hoàn thành | **100%** | Các API CRUD (POST, PATCH, DELETE) được bảo vệ bằng RolesGuard và tự động xóa cache Redis ngay khi thay đổi dữ liệu tại [rewards-admin.controller.ts](file:///c:/CODE/teso-backend/src/modules/rewards/rewards-admin.controller.ts). |
| **7** | **Database Entity có Migration** | Hoàn thành | **100%** | Cấu hình DataSource CLI chạy migration độc lập tại [data-source.ts](file:///c:/CODE/teso-backend/src/infra/database/data-source.ts). Đã tạo và chạy thành công file migration đầu tiên tạo toàn bộ schema tại [migrations/](file:///c:/CODE/teso-backend/src/infra/database/migrations). |

> **TỔNG KẾT MỨC ĐỘ ĐÁP ỨNG CHỨC NĂNG:** **100% / 100%**

---

## Đánh Giá Theo Tiêu Chí Chất Lượng Đầu Ra

### 1. Đúng chuẩn NestJS và TypeORM (Đánh giá: 100%)
*   **NestJS:** Sử dụng Dependency Injection (DI) triệt để thông qua các `Injectable()`. Phân chia module rõ ràng, đóng gói hạ tầng riêng biệt (`infra/cache`, `infra/database`) và gom nghiệp vụ vào thư mục `modules/`.
*   **TypeORM:** Định nghĩa Entity kế thừa `BaseEntity` chung để tái sử dụng mã nguồn. Sử dụng phương thức nạp dữ liệu an toàn `preload` khi cập nhật thực thể. Cấu hình thực thể dạng Explicit Import trong `DataSource` giúp việc chạy Migration và Seed script không bị lỗi metadata (tránh lỗi của cơ chế quét glob pattern).

### 2. Đúng chuẩn RESTful API (Đánh giá: 100%)
*   Sử dụng đúng các phương thức HTTP (GET để đọc, POST để tạo mới, PATCH để cập nhật một phần, DELETE để xóa).
*   Sử dụng đúng mã trạng thái HTTP Status Codes:
    *   API Login trả về `200 OK` thay vì mặc định `201 Created` của NestJS.
    *   Sử dụng mã lỗi chuẩn: `401 Unauthorized` (sai mật khẩu), `403 Forbidden` (không đủ quyền Admin), `409 Conflict` (trùng email khi đăng ký), và `429 Too Many Requests` (bị khóa do brute-force).
*   Đường dẫn tài nguyên rõ ràng, phân cấp và có đánh phiên bản qua URI (`/api/v1/...`).

### 3. Đúng chuẩn MVC (Đánh giá: 100%)
*   **Model:** Đại diện bởi TypeORM Entity (`user.entity.ts`, `reward.entity.ts`) lưu trữ và biểu diễn cấu trúc bảng dữ liệu, kết hợp các Service (`*.service.ts`) xử lý logic dữ liệu.
*   **View:** Biểu diễn bởi các JSON Response được định dạng chuẩn hóa bằng `TransformInterceptor` và kiểm soát chặt chẽ các trường đầu vào/đầu ra thông qua các Class DTO nhằm ẩn đi các thông tin nhạy cảm (như mật khẩu).
*   **Controller:** Class Controller tiếp nhận request, kiểm tra Guard phân quyền và gọi Service tương ứng để thực thi.

### 4. Chuẩn Format Code theo ESLint & Prettier (Đánh giá: 100%)
*   Cấu hình ESLint đồng bộ với các quy tắc kiểm tra kiểu dữ liệu nghiêm ngặt của TypeScript (`typescript-eslint/recommendedTypeChecked`).
*   Toàn bộ mã nguồn đã được định dạng tự động qua Prettier và chạy lệnh linter thành công **0 lỗi / 0 cảnh báo**.

---

## Các Quyết Định Kỹ Thuật & Đánh Đổi (Architectural Trade-offs)

Trong quá trình thiết kế hệ thống, các quyết định kiến trúc đã được lựa chọn dựa trên sự cân đối giữa hiệu năng, bảo mật và khả năng mở rộng:

### 1. Thiết kế Bảng User tập trung (Unified User Table)
*   **Quyết định:** Sử dụng một bảng `users` duy nhất và phân biệt bằng cột `role` dạng Enum (`user` \| `admin`) thay vì tách ra làm 2 bảng độc lập (`users` và `admins`).
*   **Đánh đổi (Trade-off):**
    *   *Ưu điểm:* Thiết kế dữ liệu phẳng, tối ưu hóa hiệu năng truy vấn, dễ dàng mở rộng thêm các role mới (như `moderator`, `manager`), và giảm thiểu sự phức tạp khi xử lý các bảng liên quan (ví dụ: một người dùng có thể được thăng cấp làm admin mà không cần di chuyển dữ liệu giữa các bảng).
    *   *Nhược điểm:* Phải kiểm soát chặt chẽ các trường đầu vào ở DTO khi Đăng ký công khai (`RegisterDto`) để tránh lỗ hổng **Role Injection** (người dùng tự chèn quyền admin khi đăng ký). Chúng tôi đã giải quyết triệt để bằng cách cô lập `RegisterDto` chỉ cho phép nhập `email`, `password`, `fullName`.

### 2. Xác thực Stateless JWT kết hợp Redis Rate Limiting
*   **Quyết định:** Sử dụng cơ chế xác thực Stateless JWT để tăng hiệu năng xử lý của Server, kết hợp với bộ đếm Redis ở cổng đăng nhập.
*   **Đánh đổi (Trade-off):**
    *   *Ưu điểm:* Server không cần lưu trữ trạng thái phiên làm việc (Session) trong bộ nhớ, giúp hệ thống dễ dàng mở rộng theo chiều ngang (Horizontal Scaling). Tích hợp Redis Rate Limit giúp bảo vệ hệ thống khỏi các cuộc tấn công dò mật khẩu (Brute-force) mà không làm tăng tải cho PostgreSQL Database.
    *   *Nhược điểm:* JWT khó thu hồi lập tức khi người dùng đổi mật khẩu hoặc bị khóa tài khoản trước khi token hết hạn.
    *   *Hướng giải quyết:* Để xử lý triệt để, chúng tôi đã cấu hình sẵn cổng Redis Cache Module, sẵn sàng cho việc triển khai cơ chế **JWT Blacklist** khi logout trong tương lai nếu có yêu cầu cao hơn về bảo mật thời gian thực.

### 3. Redis Cache Invalidation chủ động (Active Cache Invalidation)
*   **Quyết định:** Áp dụng cơ chế xóa cache chủ động (Active Invalidation) ở các hành động ghi của Admin (`create`, `update`, `delete`) thay vì chỉ dựa vào thời gian hết hạn (TTL) của Cache.
*   **Đánh đổi (Trade-off):**
    *   *Ưu điểm:* Đảm bảo tính nhất quán dữ liệu tuyệt đối (Data Consistency). Người dùng luôn nhìn thấy thông tin quà tặng mới nhất ngay khi Admin thay đổi, thay vì phải chờ hết thời gian TTL của Cache.
    *   *Nhược điểm:* Tăng nhẹ độ trễ của các API ghi phía Admin do phải thực hiện thêm lệnh xóa key trên Redis. Tuy nhiên, do tần suất Admin cập nhật quà là rất thấp so với tần suất User xem quà, đánh đổi này mang lại lợi ích vượt trội về mặt trải nghiệm người dùng.
