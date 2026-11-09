
const express = require('express');
const router = express.Router();

const {
  submitExam,
  getMyResults,
  getAllResults,
  gradeAttempt
} = require('../controllers/attemptController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

router.use(protect);

// Student submits an exam.
router.post(
  '/submit',
  authorize('student'),
  submitExam
);

// Student views own results.
router.get(
  '/my-results',
  authorize('student'),
  getMyResults
);

// Teacher/admin views results.
router.get(
  '/all-results',
  authorize('teacher', 'admin'),
  getAllResults
);

// Teacher manually grades theory answers.
router.patch(
  '/:attemptId/grade',
  authorize('teacher', 'admin'),
  gradeAttempt
);

module.exports = router;
