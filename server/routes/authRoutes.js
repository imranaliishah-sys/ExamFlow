const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Profile Update Route
router.put('/profile/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, bio, avatar } = req.body;

    // User can update only their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this profile.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        phone,
        bio,
        avatar
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });

  } catch (err) {
    console.error('Error updating profile:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile.'
    });
  }
});

module.exports = router;