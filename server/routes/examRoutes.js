
const express = require('express');
const router = express.Router();

const {
  createExam,
  getExams,
  togglePublishExam,
  deleteExam
} = require('../controllers/examController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

// Get exams and create exam
router.route('/')
  .get(protect, getExams)
  .post(protect, authorize('admin', 'teacher'), createExam);

// Publish / Unpublish
router.patch(
  '/:id/publish',
  protect,
  authorize('admin', 'teacher'),
  togglePublishExam
);

// Delete / Archive
router.delete(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  deleteExam
);

module.exports = router;
