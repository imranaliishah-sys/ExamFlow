const mongoose = require('mongoose');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');

const canManageExam = (exam, user) => {
  return user.role === 'admin' ||
    exam.createdBy.toString() === user._id.toString();
};

const checkExamEditable = async (exam, user) => {
  if (!canManageExam(exam, user)) {
    return {
      allowed: false,
      status: 403,
      message: 'You are not allowed to manage this exam.'
    };
  }

  if (exam.isPublished || exam.isArchived) {
    return {
      allowed: false,
      status: 400,
      message: 'Unpublish the exam before modifying its questions. Archived exams cannot be modified.'
    };
  }

  const attemptExists = await Attempt.exists({ examId: exam._id });

  if (attemptExists) {
    return {
      allowed: false,
      status: 400,
      message: 'This exam already has student attempts. Its questions are locked to protect existing results.'
    };
  }

  return { allowed: true };
};

const updateExamTotalMarks = async (examId) => {
  const result = await Question.aggregate([
    { $match: { exam: new mongoose.Types.ObjectId(examId) } },
    { $group: { _id: null, total: { $sum: '$marks' } } }
  ]);

  const total = result.length ? result[0].total : 1;

  await Exam.findByIdAndUpdate(examId, {
    totalMarks: Math.max(total, 1)
  });
};

const validateQuestionPayload = (body) => {
  const {
    questionType = 'MCQ',
    questionText,
    options,
    correctAnswer,
    marks
  } = body;

  if (!['MCQ', 'SHORT', 'LONG'].includes(questionType)) {
    return { error: 'Invalid question type.' };
  }

  if (typeof questionText !== 'string' || !questionText.trim()) {
    return { error: 'Question text is required.' };
  }

  const questionMarks = Number(marks);

  if (!Number.isFinite(questionMarks) || questionMarks < 0.5) {
    return { error: 'Question marks must be at least 0.5.' };
  }

  let cleanOptions = [];
  let answerIndex;

  if (questionType === 'MCQ') {
    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.some(option =>
        typeof option !== 'string' || !option.trim()
      )
    ) {
      return {
        error: 'MCQ requires at least two non-empty options.'
      };
    }

    answerIndex = Number(correctAnswer);

    if (
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= options.length
    ) {
      return {
        error: 'Please select a valid correct answer.'
      };
    }

    cleanOptions = options.map(option => option.trim());
  }

  return {
    data: {
      questionType,
      questionText: questionText.trim(),
      options: cleanOptions,
      ...(questionType === 'MCQ'
        ? { correctAnswer: answerIndex }
        : {}),
      marks: questionMarks
    }
  };
};

// ADD QUESTION
exports.addQuestion = async (req, res) => {
  try {
    const { examId } = req.body;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid exam ID.'
      });
    }

    const validation = validateQuestionPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    const permission = await checkExamEditable(exam, req.user);

    if (!permission.allowed) {
      return res.status(permission.status).json({
        success: false,
        message: permission.message
      });
    }

    const question = await Question.create({
      exam: examId,
      ...validation.data
    });

    await updateExamTotalMarks(examId);

    const updatedExam = await Exam.findById(examId);

    return res.status(201).json({
      success: true,
      message: 'Question added successfully.',
      question,
      totalMarks: updatedExam.totalMarks
    });
  } catch (error) {
    console.error('Add Question Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET QUESTIONS FOR AN EXAM
exports.getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID.'
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    if (req.user.role === 'student') {
      if (!exam.isPublished || exam.isArchived) {
        return res.status(403).json({
          success: false,
          message: 'This exam is not available.'
        });
      }
    } else if (!canManageExam(exam, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view this paper.'
      });
    }

    let query = Question.find({ exam: examId })
      .sort({ createdAt: 1 });

    // Never send correct answers to students.
    if (req.user.role === 'student') {
      query = query.select('-correctAnswer');
    }

    const questions = await query;

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get Questions Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE QUESTION
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID.'
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const exam = await Exam.findById(question.exam);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Associated exam not found.'
      });
    }

    const permission = await checkExamEditable(exam, req.user);

    if (!permission.allowed) {
      return res.status(permission.status).json({
        success: false,
        message: permission.message
      });
    }

    const validation = validateQuestionPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    Object.assign(question, validation.data);

    await question.save();

    await updateExamTotalMarks(exam._id);

    const updatedExam = await Exam.findById(exam._id);

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question,
      totalMarks: updatedExam.totalMarks
    });
  } catch (error) {
    console.error('Update Question Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID.'
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const exam = await Exam.findById(question.exam);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Associated exam not found.'
      });
    }

    const permission = await checkExamEditable(exam, req.user);

    if (!permission.allowed) {
      return res.status(permission.status).json({
        success: false,
        message: permission.message
      });
    }

    await Question.findByIdAndDelete(id);

    await updateExamTotalMarks(exam._id);

    const updatedExam = await Exam.findById(exam._id);

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
      totalMarks: updatedExam.totalMarks
    });
  } catch (error) {
    console.error('Delete Question Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};