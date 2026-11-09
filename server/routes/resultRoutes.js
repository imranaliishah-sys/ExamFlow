const express = require('express');
const router = express.Router();
const { submitExam, getMyResults } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/submit', protect, authorize('student'), submitExam);
router.get('/my-results', protect, authorize('student'), getMyResults);

module.exports = router;