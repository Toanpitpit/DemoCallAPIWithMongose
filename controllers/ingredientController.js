const Ingredient = require('../models/Ingredient');

// GET all ingredients
exports.getIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find();

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    next(error);
  }
};

// GET single ingredient by ID
exports.getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

// POST create ingredient (Admin and Chef)
exports.createIngredient = async (req, res, next) => {
  try {
    const { name, description, origin } = req.body;

    if (!name || !description || !origin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, description, origin).'
      });
    }

    const ingredient = await Ingredient.create({
      name,
      description,
      origin
    });

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully.',
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

// PUT update ingredient (Admin and Chef)
exports.updateIngredient = async (req, res, next) => {
  try {
    let ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found.'
      });
    }

    const { name, description, origin } = req.body;

    if (name) ingredient.name = name;
    if (description) ingredient.description = description;
    if (origin) ingredient.origin = origin;
    ingredient.updatedAt = new Date();

    await ingredient.save();

    res.status(200).json({
      success: true,
      message: 'Ingredient updated successfully.',
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ingredient (Admin only)
exports.deleteIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found.'
      });
    }

    await Ingredient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ingredient deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
