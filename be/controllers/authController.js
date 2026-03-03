const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Seed test users
exports.seedUsers = async (req, res, next) => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Users already exist in the database.'
      });
    }

    const testUsers = [
      {
        username: 'admin',
        password: 'admin123',
        fullname: 'Admin User',
        role: 'admin'
      },
      {
        username: 'chef',
        password: 'chef123',
        fullname: 'Chef User',
        role: 'chef'
      },
      {
        username: 'customer',
        password: 'customer123',
        fullname: 'Customer User',
        role: 'customer'
      }
    ];

    const createdUsers = await User.create(testUsers);

    res.status(201).json({
      success: true,
      message: 'Test users created successfully.',
      users: createdUsers.map(user => ({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
      }))
    });
  } catch (error) {
    next(error);
  }
};
