
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },

  duration: {
    type: Number,
    required: [true, 'Exam duration in minutes is required'],
    min: 1
  },

  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    min: 1,
    default: 1
  },

  // Passing threshold is a percentage from 0 to 100.
  // Existing field name is retained for backward compatibility.
  passingMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 40
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isPublished: {
    type: Boolean,
    default: false
  },

  isArchived: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
