const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  registrationNumber: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  // New Profile Fields
  avatar: { type: String, default: '' }, // Profile Image (Base64 or URL)
  phone: { type: String, default: '' },   // Contact Number
  bio: { type: String, default: '' }      // Short Description/Bio
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);