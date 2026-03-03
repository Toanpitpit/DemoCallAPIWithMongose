const Dish = require('../models/Dish');
const path = require('path');
const fs = require('fs');

// GET all dishes with population
exports.getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find()
      .populate('category', 'name description')
      .populate('chef', 'fullname rank nationality')
      .populate('ingredients', 'name description origin');

    res.status(200).json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    next(error);
  }
};

// GET single dish by ID
exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('category', 'name description')
      .populate('chef', 'fullname rank nationality')
      .populate('ingredients', 'name description origin');

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

// POST create new dish (Admin only)
exports.createDish = async (req, res, next) => {
  try {
    const { title, price, description, category, chef, ingredients, is_signature, rating } = req.body;

    // Validate required fields
    if (!title || !price || !description || !category || !chef) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, price, description, category, chef).'
      });
    }

    let imagePath = null;
    if (req.file) {
      // Store relative path for the image
      imagePath = '/assets/images/dishes/' + req.file.filename;
    }

    const dishData = {
      title,
      price,
      description,
      category,
      chef,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      is_signature: is_signature === 'true',
      rating: rating || 0,
      image: imagePath
    };

    const dish = await Dish.create(dishData);

    const populatedDish = await Dish.findById(dish._id)
      .populate('category', 'name description')
      .populate('chef', 'fullname rank nationality')
      .populate('ingredients', 'name description origin');

    res.status(201).json({
      success: true,
      message: 'Dish created successfully.',
      data: populatedDish
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../assets/images/dishes', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// PUT update dish (Admin only)
exports.updateDish = async (req, res, next) => {
  try {
    let dish = await Dish.findById(req.params.id);

    if (!dish) {
      // Delete uploaded file if dish doesn't exist
      if (req.file) {
        const filePath = path.join(__dirname, '../assets/images/dishes', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Dish not found.'
      });
    }

    const { title, price, description, category, chef, ingredients, is_signature, rating } = req.body;

    // Update fields
    if (title) dish.title = title;
    if (price) dish.price = price;
    if (description) dish.description = description;
    if (category) dish.category = category;
    if (chef) dish.chef = chef;
    if (ingredients) dish.ingredients = JSON.parse(ingredients);
    if (is_signature !== undefined) dish.is_signature = is_signature === 'true';
    if (rating !== undefined) dish.rating = rating;

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (dish.image) {
        const oldImagePath = path.join(__dirname, '../', dish.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      dish.image = '/assets/images/dishes/' + req.file.filename;
    }

    dish.updatedAt = new Date();
    await dish.save();

    const populatedDish = await Dish.findById(dish._id)
      .populate('category', 'name description')
      .populate('chef', 'fullname rank nationality')
      .populate('ingredients', 'name description origin');

    res.status(200).json({
      success: true,
      message: 'Dish updated successfully.',
      data: populatedDish
    });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../assets/images/dishes', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// DELETE dish (Admin only)
exports.deleteDish = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found.'
      });
    }

    // Delete image file if exists
    if (dish.image) {
      const imagePath = path.join(__dirname, '../', dish.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Dish.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Dish deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
