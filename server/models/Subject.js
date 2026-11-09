const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: '',
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Same subject name different classes mein allowed.
// Same class mein duplicate subject name allowed nahi.
subjectSchema.index(
  { className: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model('Subject', subjectSchema);