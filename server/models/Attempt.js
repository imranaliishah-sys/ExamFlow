
const mongoose = require('mongoose');

const questionResultSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },

  questionType: {
    type: String,
    enum: ['MCQ', 'SHORT', 'LONG'],
    default: 'MCQ'
  },

  answer: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },

  maxMarks: {
    type: Number,
    required: true,
    min: 0
  },

  obtainedMarks: {
    type: Number,
    default: 0,
    min: 0
  },

  isGraded: {
    type: Boolean,
    default: false
  },

  feedback: {
    type: String,
    default: ''
  }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },

  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  questionResults: {
    type: [questionResultSchema],
    default: []
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: {
    type: Date
  },

  totalMarks: {
    type: Number,
    default: 0,
    min: 0
  },

  obtainedMarks: {
    type: Number,
    default: 0,
    min: 0
  },

  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  gradingStatus: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },

  status: {
    type: String,
    enum: ['Pending', 'Pass', 'Fail'],
    default: 'Pending'
  },

  resultStatus: {
    type: String,
    enum: ['Pending', 'Pass', 'Fail'],
    default: 'Pending'
  }

}, { timestamps: true });

// A student can submit only one attempt for an exam.
attemptSchema.index(
  { studentId: 1, examId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
