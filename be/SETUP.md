# Restaurant Management API - Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Missing Dependencies

The project uses **Multer** for file uploads, which needs to be installed:

```bash
npm install multer
```

**Complete Dependencies List:**
```bash
npm install bcryptjs cors dotenv express jsonwebtoken mongoose morgan multer
npm install --save-dev nodemon
```

### 2. Verify Project Structure

Ensure your project structure matches:

```
GivenProject/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── dishController.js
│   ├── ingredientController.js
│   ├── chefController.js
│   └── categoryController.js
├── middleware/
│   ├── auth.js (old - can be kept for reference)
│   ├── authMiddleware.js (NEW)
│   ├── errorMiddleware.js (NEW)
│   └── uploadMiddleware.js (NEW)
├── models/
│   ├── User.js (NEW)
│   ├── Category.js (NEW)
│   ├── Chef.js (NEW)
│   ├── Ingredient.js (NEW)
│   └── Dish.js (NEW)
├── routes/
│   └── api.js (UPDATED)
├── assets/
│   └── images/
│       └── dishes/ (created automatically on first upload)
├── .env (UPDATED)
├── .gitignore
├── package.json (UPDATED - run npm install)
├── server.js (UPDATED)
└── README.md (NEW)
```

### 3. Configure Environment Variables

Edit `.env` file:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/restaurant_db
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_db

# Server Configuration
PORT=9999

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Bcrypt Configuration
BCRYPT_SALT=10

# Node Environment
NODE_ENV=development
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
- Create cluster and get connection string
- Update `MONGO_URI` in `.env`

### 5. Run the Server

```bash
npm start
```

You should see:
```
🚀 Restaurant API Server running on port 9999
📍 Environment: development
MongoDB connected successfully
```

### 6. Seed Test Data

Use any API client (Postman, Thunder Client, Insomnia, or curl):

**Create test users:**
```bash
curl -X POST http://localhost:9999/api/auth/seed-users
```

**Response:**
```json
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

### 7. Login and Get Token

**Login as admin:**
```bash
curl -X POST http://localhost:9999/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response:**
```json
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

Copy the token for authenticated requests.

---

## Testing All Features

### Test Flow (in order):

#### 1. Create Category
```bash
curl -X POST http://localhost:9999/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seafood",
    "description": "Fresh seafood dishes"
  }'
```

Save the category `_id`.

#### 2. Create Chef
```bash
curl -X POST http://localhost:9999/api/chefs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Gordon Ramsay",
    "rank": "Executive Chef",
    "description": "Award-winning chef",
    "nationality": "British"
  }'
```

Save the chef `_id`.

#### 3. Create Ingredient
```bash
curl -X POST http://localhost:9999/api/ingredients \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salmon",
    "description": "Fresh Atlantic salmon",
    "origin": "Norway"
  }'
```

Save the ingredient `_id`.

#### 4. Create Dish (with image upload)
```bash
curl -X POST http://localhost:9999/api/dishes \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Grilled Salmon" \
  -F "price=25.99" \
  -F "description=Fresh grilled salmon with herbs" \
  -F "category=CATEGORY_ID" \
  -F "chef=CHEF_ID" \
  -F "ingredients=[\"INGREDIENT_ID\"]" \
  -F "is_signature=true" \
  -F "rating=4.5" \
  -F "image=@path/to/image.jpg"
```

#### 5. Get All Dishes (with populated data)
```bash
curl http://localhost:9999/api/dishes
```

#### 6. Test Authorization Rules

**Customer tries to create dish (should fail with 403):**
```bash
curl -X POST http://localhost:9999/api/categories \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test"}'
```

---

## Common Issues & Solutions

### Issue: `Cannot find module 'multer'`
**Solution:** Run `npm install multer`

### Issue: `MongoDB connection failed`
**Solution:** 
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network access if using Atlas

### Issue: `JWT Token expired`
**Solution:** Login again to get a new token

### Issue: Image upload fails
**Solution:**
- Ensure `assets/images/dishes/` directory exists
- Check file size (max 5MB)
- Use only image file types (JPEG, PNG, GIF, WebP)

### Issue: Duplicate key error on seedUsers
**Solution:** That user/category/item already exists. Clear the database or use different values.

---

## API Health Check

```bash
curl http://localhost:9999/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running healthy",
  "timestamp": "2026-03-01T12:00:00.000Z"
}
```

---

## Development Tips

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create environment variables:
   ```
   token = (copy-paste from login response)
   categoryId = (copy-paste from category creation)
   chefId = (copy-paste from chef creation)
   ingredientId = (copy-paste from ingredient creation)
   ```
3. Use in requests: `{{token}}`, `{{categoryId}}`, etc.

### Database Management

**Use MongoDB Compass** to visualize data:
- Download: https://www.mongodb.com/products/compass
- Connect to `localhost:27017`
- View collections and documents

---

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas instead of local DB
- [ ] Enable HTTPS
- [ ] Set up rate limiting and API throttling
- [ ] Configure CORS for your frontend domain
- [ ] Set up logging and monitoring
- [ ] Implement request validation
- [ ] Add input sanitization
- [ ] Set up backup strategies for MongoDB

---

## Need Help?

- Check MongoDB connection: Look for "MongoDB connected successfully" in console
- Verify token format: Should start with "Bearer " in Authorization header
- Check role permissions: Only admin/chef can modify certain resources
- Review error messages: API returns detailed error descriptions

---

**Happy coding! 🚀**
