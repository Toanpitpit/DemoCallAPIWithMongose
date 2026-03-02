# Hướng Dẫn API Quản Lý Nhà Hàng - Tiếng Việt

## 📋 Giới Thiệu Tổng Quan

API này là một hệ thống backend để quản lý nhà hàng với các tính năng:
- 🔐 Xác thực (Authentication) với JWT
- 🍽️ Quản lý món ăn (Dishes)
- 👨‍🍳 Quản lý đầu bếp (Chefs) - chỉ đọc
- 🥘 Quản lý nguyên liệu (Ingredients) - chỉ đọc
- 📂 Quản lý danh mục (Categories) - chỉ đọc

---

## 🔄 Sơ Đồ Luồng Dữ Liệu

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Postman/Web)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Nhận Request                                         │  │
│  │  2. Xử lý Middleware (CORS, JSON parse, etc.)           │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Router - Xác định Request đi đến Controller nào     │  │
│  │  (routes/api.js)                                         │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. Middleware (authMiddleware, uploadMiddleware)        │  │
│  │  - Kiểm tra JWT token                                   │  │
│  │  - Kiểm tra quyền (chỉ admin)                           │  │
│  │  - Xử lý upload hình ảnh                                │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. Controller (authController, dishController, etc.)    │  │
│  │  - Xử lý logic nghiệp vụ                                │  │
│  │  - Gọi Model để lấy/lưu dữ liệu                         │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. Model (mongoose schemas)                             │  │
│  │  - Định nghĩa cấu trúc dữ liệu                          │  │
│  │  - Validate dữ liệu                                     │  │
│  │  - Truy vấn cơ sở dữ liệu                              │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  7. MongoDB - Lưu trữ dữ liệu                            │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              │ Response từ DB                   │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  8. Trở về Controller, format JSON response              │  │
│  │  9. Error Handler nếu có lỗi (errorMiddleware)           │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  10. Gửi Response về Client                              │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTP Response (JSON)
                               ▼
                          ┌─────────────┐
                          │   CLIENT    │
                          └─────────────┘
```

---

## 🔐 Quy Trình Xác Thực & Phân Quyền

### Bước 1: Đăng Nhập (Login)

```
┌─────────────────────────────────────────┐
│ REQUEST: POST /api/auth/login           │
│ BODY: {                                 │
│   "username": "admin",                  │
│   "password": "admin123"                │
│ }                                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ authController      │
        │ - Tìm user theo    │
        │   username         │
        │ - So sánh password  │
        │   (bcryptjs)       │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Sinh JWT Token      │
        │ (jsonwebtoken)      │
        │ Expires: 7 days     │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ RESPONSE:           │
        │ {                   │
        │   "token": "..."    │
        │   "user": {...}     │
        │ }                   │
        └─────────────────────┘
```

### Bước 2: Sử Dụng Token (Protected Routes)

```
┌─────────────────────────────────────┐
│ REQUEST: POST /api/dishes           │
│ HEADERS: {                          │
│   Authorization: Bearer <token>     │
│   Content-Type: multipart/form-data │
│ }                                   │
│ BODY: {                             │
│   title, price, description, etc.   │
│   image: <file>                     │
│ }                                   │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ authMiddleware.protect()    │
    │ - Lấy token từ header       │
    │ - Xác minh token            │
    │ - Lấy user từ DB            │
    │ - Gắn user vào req.user     │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ authMiddleware.authorize()  │
    │ - Kiểm tra req.user.role    │
    │ - Role = 'admin'? ✓         │
    │ - Nếu không → 403 Forbidden │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ uploadMiddleware            │
    │ - Nhận file từ form-data    │
    │ - Lưu vào /assets/images/   │
    │ - Trả filename về req.file  │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ dishController.createDish() │
    │ - Xử lý logic               │
    │ - Lưu vào MongoDB           │
    │ - Populate references       │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ RESPONSE: 201 Created       │
    │ {                           │
    │   "data": {...}             │
    │ }                           │
    └─────────────────────────────┘
```

---

## 📁 Chi Tiết Các Thành Phần

### 1️⃣ Routes (routes/api.js)
**Nhiệm vụ:** Xác định request đi đến controller nào
- Định nghĩa tất cả đường dẫn API
- Gán middleware vào từng route
- Route xác định controller nào xử lý

**Ví dụ:**
```javascript
// GET /api/dishes → dishController.getDishes (public)
// POST /api/dishes → protect → authorize → upload → dishController.createDish (admin)
```

### 2️⃣ Controllers (controllers/*)
**Nhiệm vụ:** Xử lý logic nghiệp vụ

#### authController.js
- `login`: Kiểm tra thông tin đăng nhập, sinh JWT
- `seedUsers`: Tạo 3 user test (admin, chef, customer)

#### dishController.js
- `getDishes`: Lấy tất cả món ăn (kèm category, chef, ingredients)
- `getDishById`: Lấy 1 món ăn theo ID
- `createDish`: Tạo món ăn mới (chỉ admin)
- `updateDish`: Cập nhật món ăn (chỉ admin)
- `deleteDish`: Xóa món ăn (chỉ admin)

#### Các controller khác (chefController, ingredientController, categoryController)
- Chỉ hỗ trợ GET (đọc dữ liệu, không sửa)

### 3️⃣ Middlewares (middleware/*)

#### authMiddleware.js
```
┌──────────────────────────────────┐
│ protect()                        │
│ - Kiểm tra Authorization header  │
│ - Xác minh JWT token             │
│ - req.user = user từ DB          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ authorize(...roles)              │
│ - Kiểm tra req.user.role         │
│ - Có phải admin không?           │
│ - 403 nếu không authorized       │
└──────────────────────────────────┘
```

#### uploadMiddleware.js
```
┌──────────────────────────────────┐
│ multer.diskStorage()             │
│ - destination: /assets/images/   │
│ - filename: dish-TIME-RANDOM.ext │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ fileFilter()                     │
│ - Kiểm tra MIME type             │
│ - Cho phép: jpeg, png, gif, webp │
│ - Giới hạn: 5MB                  │
└──────────────────────────────────┘
```

#### errorMiddleware.js
```
┌──────────────────────────────────┐
│ errorHandler()                   │
│ - Bắt CastError (MongoDB)        │
│ - Bắt ValidationError            │
│ - Bắt Duplicate key error        │
│ - Trả về JSON error response     │
└──────────────────────────────────┘
```

### 4️⃣ Models (models/*)
**Nhiệm vụ:** Định nghĩa cấu trúc dữ liệu và quy tắc

#### User Model
```javascript
{
  username: String (unique),
  password: String (hashed với bcryptjs),
  fullname: String,
  role: enum ['admin', 'chef', 'customer'],
  createdAt: Date
}
```

#### Dish Model
```javascript
{
  title: String,
  price: Number,
  description: String,
  image: String (đường dẫn tương đối),
  category: ObjectId → Category,
  chef: ObjectId → Chef,
  ingredients: [ObjectId] → Ingredient,
  is_signature: Boolean,
  rating: Number (0-5),
  createdAt: Date,
  updatedAt: Date
}
```

#### Các Model khác
- **Category**: name, description, image, createdAt
- **Chef**: fullname, rank, description, image, nationality
- **Ingredient**: name, description, origin, image

### 5️⃣ Database (MongoDB)
**Nhiệm vụ:** Lưu trữ toàn bộ dữ liệu

```
Restaurant Database
├── Users Collection
│   ├── admin (hashed password)
│   ├── chef
│   └── customer
├── Dishes Collection
│   ├── dish1 (ref: category, chef, ingredients)
│   └── dish2
├── Categories Collection
│   ├── Seafood
│   └── Dessert
├── Chefs Collection
│   └── Chef names
└── Ingredients Collection
    └── Ingredient names
```

---

## 🔄 Luồng Công Việc Chi Tiết - Ví Dụ Thực Tế

### Ví Dụ 1: Đăng Nhập

```
1. CLIENT gửi:
   POST /api/auth/login
   {
     "username": "admin",
     "password": "admin123"
   }

2. SERVER nhận request:
   - Line: routes/api.js → router.post('/auth/login', authController.login)

3. authController.login() xử lý:
   - Tìm User.findOne({ username: 'admin' })
   - So sánh password với bcryptjs.compare()
   - Nếu khớp → jwt.sign({ id }, JWT_SECRET)

4. Trả về client:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "username": "admin",
       "fullname": "Admin User",
       "role": "admin"
     }
   }

5. CLIENT lưu token này vào memory/localStorage
   → Sử dụng cho các request tiếp theo
```

### Ví Dụ 2: Tạo Món Ăn Mới

```
1. CLIENT gửi:
   POST /api/dishes
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: multipart/form-data
   
   Fields:
   - title: "Cơm Tấm Sài Gòn"
   - price: 50000
   - description: "Cơm tấm nướng với sườn non"
   - category: "category_id"
   - chef: "chef_id"
   - ingredients: ["ingredient_id_1", "ingredient_id_2"]
   - is_signature: true
   - rating: 4.5
   - image: <binary file>

2. routes/api.js nhận request:
   router.post('/dishes', 
     protect,                                    ← Kiểm tra token
     authorize('admin'),                         ← Kiểm tra role = admin
     upload.single('image'),                     ← Xử lý upload hình
     dishController.createDish                   ← Gọi controller
   )

3. authMiddleware.protect():
   - Lấy token từ req.headers.authorization
   - jwt.verify(token, JWT_SECRET)
   - User.findById(decoded.id)
   - req.user = user object
   - next() → tiếp tục

4. authMiddleware.authorize('admin'):
   - Kiểm tra req.user.role === 'admin'? ✓
   - Nếu không → res.status(403).json({ message: '403 Forbidden' })
   - Nếu có → next() → tiếp tục

5. uploadMiddleware (multer):
   - Tạo thư mục nếu chưa có
   - Lưu file vào /assets/images/dishes/
   - Đặt tên: dish-TIME-RANDOM.jpg
   - req.file = { filename: 'dish-1234-5678.jpg', ... }
   - next() → tiếp tục

6. dishController.createDish():
   - Lấy dữ liệu từ req.body
   - Xác thực (có category, chef không?)
   - Thêm image path: '/assets/images/dishes/dish-1234-5678.jpg'
   - Dish.create({ title, price, ..., image, category, chef, ingredients })
   
   Lưu vào MongoDB:
   {
     _id: new ObjectId(),
     title: "Cơm Tấm Sài Gòn",
     price: 50000,
     category: ObjectId("..."),
     chef: ObjectId("..."),
     ingredients: [ObjectId("..."), ObjectId("...")],
     image: "/assets/images/dishes/dish-1234-5678.jpg",
     is_signature: true,
     rating: 4.5,
     createdAt: 2026-03-01T...
   }

7. Populate data:
   - Dish.findById(id).populate('category')
   - Dish.findById(id).populate('chef')
   - Dish.findById(id).populate('ingredients')
   
   Kết quả:
   {
     _id: "...",
     title: "Cơm Tấm Sài Gòn",
     category: {
       _id: "...",
       name: "Cơm",
       description: "..."
     },
     chef: {
       _id: "...",
       fullname: "Đầu bếp A",
       rank: "..."
     },
     ingredients: [
       { _id: "...", name: "Gạo", ... },
       { _id: "...", name: "Sườn", ... }
     ],
     ...
   }

8. Gửi Response về client:
   HTTP 201 Created
   {
     "success": true,
     "message": "Dish created successfully.",
     "data": { ... fully populated dish ... }
   }

9. CLIENT nhận dữ liệu, hiển thị trên UI
```

### Ví Dụ 3: Lấy Danh Sách Món Ăn (Public)

```
1. CLIENT gửi:
   GET /api/dishes
   (không cần token vì là public endpoint)

2. routes/api.js:
   router.get('/dishes', dishController.getDishes)
   (không có protect, authorize, upload)

3. dishController.getDishes():
   - Dish.find()
   - .populate('category', 'name description')
   - .populate('chef', 'fullname rank nationality')
   - .populate('ingredients', 'name description origin')
   
   MongoDB trả về danh sách tất cả dishes với dữ liệu đầy đủ

4. Controller format response:
   {
     "success": true,
     "count": 5,
     "data": [
       {
         _id: "...",
         title: "Cơm Tấm",
         category: { name: "Cơm", description: "..." },
         chef: { fullname: "Đầu bếp A", rank: "..." },
         ingredients: [{ name: "Gạo", ... }, ...],
         price: 50000,
         rating: 4.5,
         ...
       },
       ...
     ]
   }

5. CLIENT nhận response và hiển thị danh sách
```

---

## 🔌 Sơ Đồ Giải Thích Số Dòng Code

### từ Client đến Response

```
CLIENT
  ↓ (HTTP Request)
SERVER.js
  ↓ (Middleware: cors, morgan, express.json)
routes/api.js (Tìm route phù hợp)
  ↓
Middleware Chain:
  • authMiddleware.protect() (nếu cần)
  • authMiddleware.authorize() (nếu cần)
  • uploadMiddleware (nếu có file)
  ↓
Controller
  • Xử lý logic
  • Gọi Model
  ↓
Model (mongoose)
  • Validate dữ liệu
  • Gọi MongoDB
  ↓
MongoDB
  • Lưu/Lấy dữ liệu
  ↓ (Response từ DB)
Controller (tiếp tục)
  • Format dữ liệu
  • res.json({ success, data })
  ↓ (Nếu lỗi)
errorMiddleware.js
  • Bắt lỗi
  • Format error response
  ↓
CLIENT (nhận JSON response)
```

---

## 📊 Bảng Tóm Tắt Endpoint

| Method | Endpoint | Authentication | Authorization | File Upload | Chi Tiết |
|--------|----------|---|---|---|---|
| POST | /auth/login | ❌ | ❌ | ❌ | Đăng nhập, sinh JWT |
| POST | /auth/seed-users | ❌ | ❌ | ❌ | Tạo 3 user test |
| GET | /dishes | ❌ | ❌ | ❌ | Lấy danh sách (populate) |
| GET | /dishes/:id | ❌ | ❌ | ❌ | Lấy chi tiết (populate) |
| POST | /dishes | ✅ | Admin | ✅ | Tạo mới |
| PUT | /dishes/:id | ✅ | Admin | ✅ | Cập nhật |
| DELETE | /dishes/:id | ✅ | Admin | ❌ | Xóa |
| GET | /categories | ❌ | ❌ | ❌ | Lấy danh sách |
| GET | /categories/:id | ❌ | ❌ | ❌ | Lấy chi tiết |
| GET | /chefs | ❌ | ❌ | ❌ | Lấy danh sách |
| GET | /chefs/:id | ❌ | ❌ | ❌ | Lấy chi tiết |
| GET | /ingredients | ❌ | ❌ | ❌ | Lấy danh sách |
| GET | /ingredients/:id | ❌ | ❌ | ❌ | Lấy chi tiết |

---

## 🔒 Hệ Thống Quyền Hạn

```
┌─────────────────────────────────────────┐
│         Hệ Thống Quyền Hạn              │
└─────────────────────────────────────────┘

ADMIN (Quản trị viên)
├── Đọc (GET) all endpoints ✅
├── Tạo (POST) /dishes ✅
├── Sửa (PUT) /dishes/:id ✅
├── Xóa (DELETE) /dishes/:id ✅
└── (Các endpoint khác: chỉ đọc)

CHEF (Đầu bếp)
├── Đọc (GET) all endpoints ✅
├── Tạo (POST) /dishes ❌
├── Sửa (PUT) /dishes/:id ❌
├── Xóa (DELETE) /dishes/:id ❌
└── (Các endpoint khác: chỉ đọc)

CUSTOMER (Khách hàng)
├── Đọc (GET) all endpoints ✅
├── Tạo (POST) /dishes ❌
├── Sửa (PUT) /dishes/:id ❌
├── Xóa (DELETE) /dishes/:id ❌
└── (Các endpoint khác: chỉ đọc)
```

---

## 📱 Ví Dụ Request & Response

### 1. Đăng Nhập

**Request:**
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YjkxNWM5MDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTcwOTczOTIwMCwiZXhwIjoxNzEwMzQ0MDAwfQ.SIGNATURE",
  "user": {
    "id": "64b915c90000000000000000",
    "username": "admin",
    "fullname": "Admin User",
    "role": "admin"
  }
}
```

### 2. Tạo Món Ăn

**Request:**
```
POST /api/dishes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

Form Data:
- title: Phở Bò Hà Nội
- price: 45000
- description: Phở bò truyền thống nước dùng đậm đà
- category: 64b915c90000000000000001
- chef: 64b915c90000000000000002
- ingredients: ["64b915c90000000000000003", "64b915c90000000000000004"]
- is_signature: true
- rating: 4.8
- image: <file>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Dish created successfully.",
  "data": {
    "_id": "64b915c90000000000000005",
    "title": "Phở Bò Hà Nội",
    "price": 45000,
    "description": "Phở bò truyền thống nước dùng đậm đà",
    "image": "/assets/images/dishes/dish-1709739200-987654321.jpg",
    "category": {
      "_id": "64b915c90000000000000001",
      "name": "Bánh Phở",
      "description": "Các món phở truyền thống"
    },
    "chef": {
      "_id": "64b915c90000000000000002",
      "fullname": "Nguyễn Văn A",
      "rank": "Executive Chef",
      "nationality": "Vietnam"
    },
    "ingredients": [
      {
        "_id": "64b915c90000000000000003",
        "name": "Thịt bò",
        "description": "Thịt bò tươi",
        "origin": "Vietnam"
      },
      {
        "_id": "64b915c90000000000000004",
        "name": "Bánh phở",
        "description": "Bánh phở tươi ngày",
        "origin": "Vietnam"
      }
    ],
    "is_signature": true,
    "rating": 4.8,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

### 3. Lấy Danh Sách Món Ăn

**Request:**
```
GET /api/dishes
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64b915c90000000000000005",
      "title": "Phở Bò Hà Nội",
      "price": 45000,
      "description": "...",
      "image": "/assets/images/dishes/dish-1709739200-987654321.jpg",
      "category": {
        "_id": "64b915c90000000000000001",
        "name": "Bánh Phở"
      },
      "chef": {
        "_id": "64b915c90000000000000002",
        "fullname": "Nguyễn Văn A"
      },
      "ingredients": [...],
      "is_signature": true,
      "rating": 4.8
    },
    ...
  ]
}
```

### 4. Lỗi - Không Phải Admin

**Request:**
```
POST /api/dishes
Authorization: Bearer <customer_token>
Content-Type: multipart/form-data
...
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "User role 'customer' is not authorized to access this resource."
}
```

---

## 🛠️ Các File Quan Trọng & Chức Năng

| File | Chức Năng | Quy Trình |
|------|----------|----------|
| server.js | Khởi động server, load models, setup middleware | Khởi động → Setup → Lắng nghe port |
| routes/api.js | Định nghĩa tất cả routes | Request → Router → Controller |
| middleware/authMiddleware.js | Xác thực JWT, kiểm tra quyền | Token → Verify → User → Role check |
| middleware/uploadMiddleware.js | Xử lý upload file | File → Storage → Filename |
| middleware/errorMiddleware.js | Xử lý tất cả lỗi | Error → Handler → Response |
| controllers/authController.js | Login, seed users | Credentials → Hash → Token |
| controllers/dishController.js | CRUD dishes | Request → DB → Populate → Response |
| models/Dish.js | Schema món ăn, liên kết | Define fields → Validate → Save |
| models/User.js | Schema user, hash password | Define fields → Hash → Save |
| config/db.js | Kết nối MongoDB | Env → Connect → Success/Fail |

---

## 🚀 Quy Trình Một Request Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENT gửi HTTP Request (POST /api/dishes + token)  │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 2. server.js nhận request                               │
│    - express middleware (cors, json parse)              │
│    - res.use("/assets", static files)                   │
│    - app.use("/api", router)                            │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 3. routes/api.js tìm route /api/dishes POST             │
│    router.post('/dishes', protect, authorize, upload,   │
│    dishController.createDish)                           │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 4. authMiddleware.protect() chạy                        │
│    - Lấy token từ Authorization header                  │
│    - jwt.verify() xác minh token                        │
│    - User.findById() lấy user từ MongoDB                │
│    - req.user = user                                    │
│    - next() để middleware tiếp theo chạy               │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 5. authMiddleware.authorize('admin') chạy              │
│    - Kiểm tra req.user.role === 'admin'?               │
│    - Nếu không → 403 Forbidden, dừng xử lý             │
│    - Nếu có → next()                                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 6. uploadMiddleware (multer.single('image')) chạy      │
│    - Tìm file trong form-data                           │
│    - Kiểm tra MIME type (jpeg, png, etc.)              │
│    - Lưu vào /assets/images/dishes/disk-TIME-ID.jpg   │
│    - req.file = { filename: '...', ... }              │
│    - next()                                             │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 7. dishController.createDish() chạy                    │
│    - Lấy body: title, price, description, etc.          │
│    - Kiểm tra dữ liệu bắt buộc                         │
│    - Lấy filename từ req.file.filename                  │
│    - Tạo object dish có image path                      │
│    - Dish.create(dishData)                              │
│      → MongoDB lưu document mới                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Populate references                                  │
│    - Dish.findById(id).populate('category')             │
│    - Dish.findById(id).populate('chef')                 │
│    - Dish.findById(id).populate('ingredients')          │
│    → MongoDB trộn dữ liệu từ các collection khác        │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 9. Format response                                      │
│    res.status(201).json({                               │
│      success: true,                                     │
│      message: 'Dish created successfully.',             │
│      data: populatedDish                                │
│    })                                                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ 10. CLIENT nhận JSON response (201 Created)            │
│     - Lưu data vào state/redux                          │
│     - Render lại UI                                     │
└─────────────────────────────────────────────────────────┘

Nếu có lỗi ở bất kỳ bước nào:
→ errorMiddleware.js bắt lỗi
→ Format error response
→ Gửi về client (400, 401, 403, 500, etc.)
```

---

## 📝 Ghi Chú

- **Populate**: Lấy dữ liệu từ collection khác thay vì chỉ ObjectId
- **Middleware Chain**: Các middleware chạy lần lượt, nếu một bước thất bại → request dừng
- **JWT Token**: Được lưu ở client, gửi kèm mỗi request protected
- **Hash Password**: Password được mã hóa, không lưu plaintext
- **Image Upload**: File được lưu vào thư mục, đường dẫn được lưu vào DB
- **Error Handling**: Lỗi của bất kỳ layer nào đều được bắt và format thành JSON

---

**Tài liệu này giải thích cách dữ liệu chảy qua hệ thống API từ client → server → database → response**

