# TESO Rewards System - Backend API

## Tính năng 

1. **Kiến trúc Modular & Phân Tầng Clean Architecture:** Tách biệt rõ ràng các tầng Core, Infrastructure (Hạ tầng Database/Redis) và Modules nghiệp vụ (MVC cho RESTful API).
2. **Xác thực Bảo mật (Auth & RBAC):** Đăng nhập phân quyền bằng JWT Passport (User và Admin).
3. **Chống Brute-force mật khẩu bằng Redis:** Tự động theo dõi và khóa tạm thời IP + Email nếu đăng nhập sai quá 5 lần liên tiếp (khóa trong 15 phút, trả về lỗi `429 Too Many Requests`).
4. **Tối ưu hóa Hiệu năng bằng Redis Caching:** Cache danh sách quà tặng và chi tiết quà tặng trong 10 phút. Tự động **xóa cache (Invalidate Cache)** ngay khi Admin thêm/sửa/xóa quà để đồng bộ dữ liệu.
5. **Database Version Control (Migrations):** Quản lý cấu trúc cơ sở dữ liệu Postgres bằng TypeORM Migrations.
6. **API Documentation (Swagger):** Tích hợp tài liệu hướng dẫn API trực quan tại `/api/docs` có ghi nhớ token đăng nhập (Persist Authorization).

---

## 🛠 Công nghệ sử dụng

* **Framework:** NestJS (v11)
* **Database:** PostgreSQL (v16) + TypeORM
* **Cache & Rate Limit:** Redis (v7) + `@nestjs/cache-manager`
* **Authentication:** Passport.js + `@nestjs/jwt` + `bcrypt`
* **API Documentation:** Swagger UI
* **Code Quality:** ESLint + Prettier

---

## Cấu trúc thư mục dự án

```text
src/
├── config/                  # Cấu hình độc lập (TypeORM Config)
├── core/                    # Bộ lọc, Interceptors, Guards toàn cục & Decorators
│   ├── decorators/          # @Roles(), @GetUser()
│   ├── filters/             # HttpExceptionFilter (Chuẩn hóa lỗi JSON)
│   ├── guards/              # JwtAuthGuard, RolesGuard (Kiểm tra quyền)
│   └── interceptors/        # TransformInterceptor (Chuẩn hóa đầu ra 200 OK)
├── infra/                   # Tầng hạ tầng cơ sở
│   ├── cache/               # Redis Cache Module
│   └── database/            # TypeORM Database Module & Migrations
└── modules/                 # Nghiệp vụ chức năng (MVC)
    ├── auth/                # Chức năng Đăng ký, Đăng nhập & Chặn brute-force
    ├── users/               # Chức năng xem Profile người dùng
    └── rewards/             # Chức năng xem quà (User) & Quản lý quà (Admin)
```

---

## Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Chuẩn bị môi trường
Tạo file `.env` tại thư mục gốc của dự án (sử dụng các giá trị cấu hình mẫu trong file `.env.example`).
Cổng kết nối Postgres được cấu hình mặc định là `5433` để tránh xung đột với cổng `5432` cục bộ trên máy.

### 2. Khởi động Docker (Postgres & Redis)
Đảm bảo bạn đã mở Docker Desktop, sau đó chạy lệnh:
```bash
docker compose up -d
```

### 3. Cài đặt các thư viện
```bash
npm install
```

### 4. Chạy Database Migrations
Tạo cấu trúc bảng tự động bằng TypeORM Migrations:
```bash
npm run migration:run
```

### 5. Tạo dữ liệu mẫu tài khoản Admin
Chạy script seeder để tạo nhanh một tài khoản Admin dùng để kiểm thử:
```bash
npm run seed:admin
```
* **Tài khoản Admin mẫu:**
  * **Email:** `admin@example.com`
  * **Password:** `adminpassword`

### 6. Khởi động Server NestJS
```bash
npm run start:dev
```
Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## Tài liệu API & Hướng dẫn Test (Swagger)

Sau khi khởi động server thành công, truy cập giao diện kiểm thử API tại:
**Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Danh sách API chính (Version `v1`):

#### Authentication
* `POST /api/v1/auth/register` - Đăng ký tài khoản User mới.
* `POST /api/v1/auth/login` - Đăng nhập tài khoản User (Có rate limit).
* `POST /api/v1/auth/admin/login` - Đăng nhập Admin (Có rate limit, yêu cầu role `admin`).

#### 👤 Users Profile
* `GET /api/v1/users/profile` - Xem thông tin cá nhân của User đang đăng nhập (Yêu cầu JWT Token).

#### Rewards (Quà tặng)
* `GET /api/v1/rewards` - Xem toàn bộ quà tặng (Có Redis Cache 10 phút, yêu cầu JWT Token).
* `GET /api/v1/rewards/:id` - Xem chi tiết một món quà (Có Redis Cache, yêu cầu JWT Token).

#### Admin Rewards Management (Quản lý quà tặng)
* `POST /api/v1/admin/rewards` - Tạo quà tặng mới (Yêu cầu quyền Admin, tự xóa cache).
* `PATCH /api/v1/admin/rewards/:id` - Chỉnh sửa quà tặng (Yêu cầu quyền Admin, tự xóa cache).
* `DELETE /api/v1/admin/rewards/:id` - Xóa quà tặng khỏi hệ thống (Yêu cầu quyền Admin, tự xóa cache).
