const Chef = require('../models/Chef');

// GET all chefs
exports.getChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find();

    res.status(200).json({
      success: true,
      count: chefs.length,
      data: chefs
    });
  } catch (error) {
    next(error);
  }
};

// GET single chef by ID
exports.getChefById = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: chef
    });
  } catch (error) {
    next(error);
  }
};

// POST create chef (Admin and Chef)
exports.createChef = async (req, res, next) => {
  try {
    const { fullname, rank, description, nationality } = req.body;

    if (!fullname || !rank || !description || !nationality) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (fullname, rank, description, nationality).'
      });
    }

    const chef = await Chef.create({
      fullname,
      rank,
      description,
      nationality
    });

    res.status(201).json({
      success: true,
      message: 'Chef created successfully.',
      data: chef
    });
  } catch (error) {
    next(error);
  }
};

// PUT update chef (Admin and Chef)
exports.updateChef = async (req, res, next) => {
  try {
    let chef = await Chef.findById(req.params.id);

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found.'
      });
    }

    const { fullname, rank, description, nationality } = req.body;

    if (fullname) chef.fullname = fullname;
    if (rank) chef.rank = rank;
    if (description) chef.description = description;
    if (nationality) chef.nationality = nationality;
    chef.updatedAt = new Date();

    await chef.save();

    res.status(200).json({
      success: true,
      message: 'Chef updated successfully.',
      data: chef
    });
  } catch (error) {
    next(error);
  }
};

// DELETE chef (Admin only)
exports.deleteChef = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found.'
      });
    }

    await Chef.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chef deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
