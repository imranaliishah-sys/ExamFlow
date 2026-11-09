const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      selectedOption: String,
      isCorrect: Boolean
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);