
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

// Check whether user can manage this exam
const canManageExam = (exam, user) => {
  if (user.role === 'admin') return true;

  return exam.createdBy.toString() === user._id.toString();
};

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      duration,
      totalMarks,
      passingMarks
    } = req.body;

    if (
      !title ||
      !subject ||
      !duration ||
      !totalMarks ||
      passingMarks === undefined ||
      passingMarks === null ||
      passingMarks === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required exam details.'
      });
    }

    const exam = await Exam.create({
      title,
      description,
      subject,
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      exam
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get exams
// Students only receive published and non-archived exams.
// Teachers and admins can see all exams.
exports.getExams = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      filter = {
        isPublished: true,
        isArchived: false
      };
    } else if (req.user.role === 'teacher') {
      filter = {
        createdBy: req.user._id
      };
    }

    const exams = await Exam.find(filter)
      .populate('subject', 'name')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Publish or Unpublish exam
exports.togglePublishExam = async (req, res) => {
  try {
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid publish status.'
      });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    if (!canManageExam(exam, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to manage this exam.'
      });
    }

    if (exam.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Archived exams cannot be published.'
      });
    }

    if (isPublished) {
      const questionCount = await Question.countDocuments({
        exam: exam._id
      });

      if (questionCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please add at least one question before publishing this exam.'
        });
      }
    }

    exam.isPublished = isPublished;
    await exam.save();

    res.status(200).json({
      success: true,
      message: isPublished
        ? 'Exam published successfully.'
        : 'Exam unpublished successfully.',
      exam
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete exam or archive it if attempts exist
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    if (!canManageExam(exam, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this exam.'
      });
    }

    const attemptCount = await Attempt.countDocuments({
      examId: exam._id
    });

    // Preserve exam and questions if student attempts already exist.
    if (attemptCount > 0) {
      exam.isPublished = false;
      exam.isArchived = true;

      await exam.save();

      return res.status(200).json({
        success: true,
        archived: true,
        message: `This exam has ${attemptCount} student attempt(s). It has been archived to preserve student results.`,
        exam
      });
    }

    // No attempts: permanently delete questions and exam.
    await Question.deleteMany({
      exam: exam._id
    });

    await Exam.findByIdAndDelete(exam._id);

    return res.status(200).json({
      success: true,
      archived: false,
      message: 'Exam and its questions deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
