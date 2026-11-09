const express = require('express');
const router = express.Router();

const {
  addQuestion,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

router.use(protect);

// Add new question
router.post(
  '/',
  authorize('admin', 'teacher'),
  addQuestion
);

// Get questions for an exam
router.get(
  '/exam/:examId',
  getQuestionsByExam
);

// Update question
router.put(
  '/:id',
  authorize('admin', 'teacher'),
  updateQuestion
);

// Delete question
router.delete(
  '/:id',
  authorize('admin', 'teacher'),
  deleteQuestion
);

module.exports = router;