# Restaurant Management Backend API

A comprehensive REST API for managing a restaurant's operations including dishes, chefs, ingredients, and categories with authentication and authorization.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install additional dependencies** (multer is required):
```bash
npm install multer
```

2. **Environment Configuration**
   - A `.env` file is already created with default values
   - Update `MONGO_URI` with your MongoDB connection string
   - Change `JWT_SECRET` for production use

3. **Start the server**:
```bash
npm start
```

The server will run on `http://localhost:9999`

## 📚 API Endpoints

### Authentication (`/api/auth`)

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "fullname": "Admin User",
    "role": "admin"
  }
}
```

#### Seed Users (Create test accounts)
```
POST /api/auth/seed-users

Response:
{
  "success": true,
  "message": "Test users created successfully.",
  "users": [
    {
      "id": "...",
      "username": "admin",
      "fullname": "Admin User",
      "role": "admin"
    },
    {
      "id": "...",
      "username": "chef",
      "fullname": "Chef User",
      "role": "chef"
    },
    {
      "id": "...",
      "username": "customer",
      "fullname": "Customer User",
      "role": "customer"
    }
  ]
}
```

### Authorization Header
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

---

### Dishes (`/api/dishes`)

#### Get All Dishes (Public)
```
GET /api/dishes

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Grilled Salmon",
      "price": 25.99,
      "description": "Fresh grilled salmon with herbs",
      "image": "/assets/images/dishes/dish-1234.jpg",
      "category": {
        "_id": "...",
        "name": "Seafood",
        "description": "Seafood dishes"
      },
      "chef": {
        "_id": "...",
        "fullname": "Gordon Ramsay",
        "rank": "Executive Chef",
        "nationality": "British"
      },
      "ingredients": [...],
      "is_signature": true,
      "rating": 4.5,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Get Dish by ID (Public)
```
GET /api/dishes/:id
```

#### Create Dish (Admin only)
```
POST /api/dishes
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- title: "Grilled Salmon"
- price: 25.99
- description: "Fresh grilled salmon with herbs"
- category: "category_id"
- chef: "chef_id"
- ingredients: ["ingredient_id_1", "ingredient_id_2"]  (JSON array)
- is_signature: true
- rating: 4.5
- image: <binary file>

Response:
{
  "success": true,
  "message": "Dish created successfully.",
  "data": { ... }
}
```

#### Update Dish (Admin only)
```
PUT /api/dishes/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data: (same as create, all optional)

Response:
{
  "success": true,
  "message": "Dish updated successfully.",
  "data": { ... }
}
```

#### Delete Dish (Admin only)
```
DELETE /api/dishes/:id
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Dish deleted successfully."
}
```

---

### Ingredients (`/api/ingredients`)

#### Get All Ingredients (Public)
```
GET /api/ingredients
```

#### Get Ingredient by ID (Public)
```
GET /api/ingredients/:id
```

#### Create Ingredient (Admin & Chef)
```
POST /api/ingredients
Authorization: Bearer <admin_or_chef_token>
Content-Type: application/json

{
  "name": "Salmon",
  "description": "Fresh Atlantic salmon",
  "origin": "Norway"
}

Response:
{
  "success": true,
  "message": "Ingredient created successfully.",
  "data": { ... }
}
```

#### Update Ingredient (Admin & Chef)
```
PUT /api/ingredients/:id
Authorization: Bearer <admin_or_chef_token>
Content-Type: application/json

{
  "name": "Salmon",
  "description": "Fresh Atlantic salmon",
  "origin": "Norway"
}
```

#### Delete Ingredient (Admin only)
```
DELETE /api/ingredients/:id
Authorization: Bearer <admin_token>
```

---

### Chefs (`/api/chefs`)

#### Get All Chefs (Public)
```
GET /api/chefs
```

#### Get Chef by ID (Public)
```
GET /api/chefs/:id
```

#### Create Chef (Admin & Chef)
```
POST /api/chefs
Authorization: Bearer <admin_or_chef_token>
Content-Type: application/json

{
  "fullname": "Gordon Ramsay",
  "rank": "Executive Chef",
  "description": "Renowned chef with Michelin stars",
  "nationality": "British"
}
```

#### Update Chef (Admin & Chef)
```
PUT /api/chefs/:id
Authorization: Bearer <admin_or_chef_token>
Content-Type: application/json

{
  "fullname": "Gordon Ramsay",
  "rank": "Head Chef",
  "description": "Renowned chef",
  "nationality": "British"
}
```

#### Delete Chef (Admin only)
```
DELETE /api/chefs/:id
Authorization: Bearer <admin_token>
```

---

### Categories (`/api/categories`)

#### Get All Categories (Public)
```
GET /api/categories
```

#### Get Category by ID (Public)
```
GET /api/categories/:id
```

#### Create Category (Admin only)
```
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Seafood",
  "description": "Fresh seafood dishes"
}
```

#### Update Category (Admin only)
```
PUT /api/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Seafood",
  "description": "Premium fresh seafood"
}
```

#### Delete Category (Admin only)
```
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

---

## 🔐 Authorization Rules

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| **Dishes** | Public | Admin | Admin | Admin |
| **Ingredients** | Public | Admin, Chef | Admin, Chef | Admin |
| **Chefs** | Public | Admin, Chef | Admin, Chef | Admin |
| **Categories** | Public | Admin | Admin | Admin |

---

## 📁 Project Structure

```
GivenProject/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js               # User schema with password hashing
│   ├── Category.js           # Category schema
│   ├── Chef.js               # Chef schema
│   ├── Ingredient.js         # Ingredient schema
│   └── Dish.js               # Dish schema with references
├── middleware/
│   ├── authMiddleware.js     # JWT verification and authorization
│   ├── errorMiddleware.js    # Centralized error handling
│   └── uploadMiddleware.js   # Multer configuration for image uploads
├── controllers/
│   ├── authController.js     # Login and seedUsers logic
│   ├── dishController.js     # Dish CRUD with populate
│   ├── ingredientController.js
│   ├── chefController.js
│   └── categoryController.js
├── routes/
│   └── api.js                # All route definitions
├── assets/
│   └── images/
│       └── dishes/           # Uploaded dish images
├── .env                      # Environment variables
├── package.json              # Dependencies
└── server.js                 # Express app setup
```

---

## 🔧 Database Models

### User
```javascript
{
  username: String (unique),
  password: String (hashed),
  fullname: String,
  role: enum ['admin', 'chef', 'customer'],
  createdAt: Date
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
  image: String,
  createdAt: Date
}
```

### Chef
```javascript
{
  fullname: String,
  rank: String,
  description: String,
  image: String,
  nationality: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Ingredient
```javascript
{
  name: String (unique),
  description: String,
  origin: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Dish
```javascript
{
  title: String,
  price: Number,
  description: String,
  image: String (relative path),
  category: ObjectId (ref: Category),
  chef: ObjectId (ref: Chef),
  ingredients: [ObjectId] (ref: Ingredient),
  is_signature: Boolean,
  rating: Number (0-5),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛠️ Error Handling

The API handles various error types:

1. **Mongoose CastError**: Invalid ObjectId format → 404
2. **Mongoose ValidationError**: Invalid field values → 400
3. **Duplicate Keys**: Unique field violations → 400
4. **Authentication Errors**: No token or invalid token → 401
5. **Authorization Errors**: Insufficient role permissions → 403

---

## 📝 Testing with Postman/Thunder Client

1. **Seed Users**: POST `/api/auth/seed-users`
2. **Login**: POST `/api/auth/login`
   - Use returned token in Authorization header
3. **Create Category**: POST `/api/categories` (as admin)
4. **Create Chef**: POST `/api/chefs` (as admin)
5. **Create Ingredient**: POST `/api/ingredients` (as admin)
6. **Create Dish**: POST `/api/dishes` (as admin, with image upload)
7. **Get Dishes**: GET `/api/dishes` (public, with populated references)

---

## 🚀 Deployment Checklist

- [ ] Update `.env` with production MongoDB URI
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Ensure `assets/images/dishes/` directory is writable
- [ ] Configure CORS for your frontend domain
- [ ] Set up rate limiting (recommended)
- [ ] Use HTTPS in production

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.10.1",
  "morgan": "^1.10.0",
  "multer": "^1.4.5"  // ADD THIS
}
```

---

## 📄 License

ISC

---

## 👤 Author

FPTU HN
