
const express = require('express');
const router = express.Router();

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(authorize('admin', 'teacher'), createSubject);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateSubject)
  .delete(authorize('admin', 'teacher'), deleteSubject);

module.exports = router;
