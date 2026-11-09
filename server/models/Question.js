
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },

  questionType: {
    type: String,
    enum: ['MCQ', 'SHORT', 'LONG'],
    default: 'MCQ',
    required: true
  },

  questionText: {
    type: String,
    required: true,
    trim: true
  },

  options: {
    type: [String],
    default: [],
    validate: {
      validator: function (options) {
        return this.questionType !== 'MCQ' ||
          (Array.isArray(options) && options.length >= 2);
      },
      message: 'MCQ questions must have at least two options.'
    }
  },

  correctAnswer: {
    type: Number,
    required: function () {
      return this.questionType === 'MCQ';
    },
    min: 0
  },

  marks: {
    type: Number,
    required: true,
    default: 1,
    min: 0.5
  }
}, { timestamps: true });

questionSchema.pre('validate', function () {
  if (this.questionType === 'MCQ') {
    if (
      !Number.isInteger(this.correctAnswer) ||
      this.correctAnswer < 0 ||
      this.correctAnswer >= this.options.length
    ) {
      this.invalidate(
        'correctAnswer',
        'Please select a valid correct option.'
      );
    }
  } else {
    this.options = [];
    this.correctAnswer = undefined;
  }
});

module.exports = mongoose.model('Question', questionSchema);
