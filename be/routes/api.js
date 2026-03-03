const express = require('express');
const router = express.Router();

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Controllers
const authController = require('../controllers/authController');
const dishController = require('../controllers/dishController');
const ingredientController = require('../controllers/ingredientController');
const chefController = require('../controllers/chefController');
const categoryController = require('../controllers/categoryController');

// ==================== AUTH ROUTES ====================
router.post('/auth/login', authController.login);
router.post('/auth/seed-users', authController.seedUsers);

// ==================== DISH ROUTES ====================
// GET all dishes (public)
router.get('/dishes', dishController.getDishes);

// GET single dish (public)
router.get('/dishes/:id', dishController.getDishById);

// POST create dish (Admin only)
router.post('/dishes', protect, authorize('admin'), upload.single('image'), dishController.createDish);

// PUT update dish (Admin only)
router.put('/dishes/:id', protect, authorize('admin'), upload.single('image'), dishController.updateDish);

// DELETE dish (Admin only)
router.delete('/dishes/:id', protect, authorize('admin'), dishController.deleteDish);

// ==================== INGREDIENT ROUTES ====================
// GET all ingredients (public)
router.get('/ingredients', ingredientController.getIngredients);

// GET single ingredient (public)
router.get('/ingredients/:id', ingredientController.getIngredientById);

// POST create ingredient (Admin, Chef)
router.post(
  '/ingredients',
  protect,
  authorize('admin', 'chef'),
  ingredientController.createIngredient
);

// PUT update ingredient (Admin, Chef)
router.put(
  '/ingredients/:id',
  protect,
  authorize('admin', 'chef'),
  ingredientController.updateIngredient
);

// DELETE ingredient (Admin only)
router.delete(
  '/ingredients/:id',
  protect,
  authorize('admin'),
  ingredientController.deleteIngredient
);

// ==================== CHEF ROUTES ====================
// GET all chefs (public)
router.get('/chefs', chefController.getChefs);

// GET single chef (public)
router.get('/chefs/:id', chefController.getChefById);

// POST create chef (Admin, Chef)
router.post(
  '/chefs',
  protect,
  authorize('admin', 'chef'),
  chefController.createChef
);

// PUT update chef (Admin, Chef)
router.put(
  '/chefs/:id',
  protect,
  authorize('admin', 'chef'),
  chefController.updateChef
);

// DELETE chef (Admin only)
router.delete(
  '/chefs/:id',
  protect,
  authorize('admin'),
  chefController.deleteChef
);

// ==================== CATEGORY ROUTES ====================
// GET all categories (public)
router.get('/categories', categoryController.getCategories);

// GET single category (public)
router.get('/categories/:id', categoryController.getCategoryById);

// POST create category (Admin only)
router.post(
  '/categories',
  protect,
  authorize('admin'),
  categoryController.createCategory
);

// PUT update category (Admin only)
router.put(
  '/categories/:id',
  protect,
  authorize('admin'),
  categoryController.updateCategory
);

// DELETE category (Admin only)
router.delete(
  '/categories/:id',
  protect,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;
