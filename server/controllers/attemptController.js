
const mongoose = require('mongoose');

const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

const canManageExam = (exam, user) => {
  return user.role === 'admin' ||
    exam.createdBy.toString() === user._id.toString();
};

const calculateFinalResult = (attempt, exam) => {
  const obtainedMarks = attempt.questionResults.reduce(
    (sum, item) => sum + (Number(item.obtainedMarks) || 0),
    0
  );

  const totalMarks = attempt.questionResults.reduce(
    (sum, item) => sum + (Number(item.maxMarks) || 0),
    0
  );

  const hasPendingTheory = attempt.questionResults.some(
    item => item.questionType !== 'MCQ' && !item.isGraded
  );

  const percentage = totalMarks > 0
    ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2))
    : 0;

  attempt.obtainedMarks = obtainedMarks;
  attempt.totalMarks = totalMarks;
  attempt.percentage = percentage;

  if (hasPendingTheory) {
    attempt.gradingStatus = 'Pending';
    attempt.status = 'Pending';
    attempt.resultStatus = 'Pending';
  } else {
    const passed = percentage >= Number(exam.passingMarks);

    attempt.gradingStatus = 'Completed';
    attempt.status = passed ? 'Pass' : 'Fail';
    attempt.resultStatus = passed ? 'Pass' : 'Fail';
  }

  return {
    obtainedMarks,
    totalMarks,
    percentage,
    status: attempt.status,
    gradingStatus: attempt.gradingStatus
  };
};

// SUBMIT EXAM
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers = {} } = req.body;
    const studentId = req.user._id;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid exam ID.'
      });
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers submitted.'
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.'
      });
    }

    if (!exam.isPublished || exam.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'This exam is not available for submission.'
      });
    }

    const existingAttempt = await Attempt.findOne({
      studentId,
      examId
    });

    if (existingAttempt) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted this exam.'
      });
    }

    const questions = await Question.find({ exam: examId }).sort({
      createdAt: 1
    });

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: 'This exam does not contain any questions.'
      });
    }

    const questionResults = [];
    let obtainedMarks = 0;
    let totalMarks = 0;
    let hasTheory = false;

    for (const question of questions) {
      const questionId = question._id.toString();
      const questionType = question.questionType || 'MCQ';
      const maxMarks = Number(question.marks) || 1;

      totalMarks += maxMarks;

      const submittedAnswer = answers[questionId] ??
        answers[String(question._id)];

      if (questionType === 'MCQ') {
        const answerIndex = submittedAnswer === undefined ||
          submittedAnswer === null ||
          submittedAnswer === ''
          ? NaN
          : Number(submittedAnswer);

        const isCorrect =
          Number.isInteger(answerIndex) &&
          answerIndex === Number(question.correctAnswer);

        const marksAwarded = isCorrect ? maxMarks : 0;

        obtainedMarks += marksAwarded;

        questionResults.push({
          questionId: question._id,
          questionType: 'MCQ',
          answer: Number.isInteger(answerIndex) ? answerIndex : '',
          maxMarks,
          obtainedMarks: marksAwarded,
          isGraded: true
        });
      } else {
        hasTheory = true;

        const answerText = typeof submittedAnswer === 'string'
          ? submittedAnswer.trim()
          : '';

        questionResults.push({
          questionId: question._id,
          questionType,
          answer: answerText,
          maxMarks,
          obtainedMarks: 0,
          isGraded: false
        });
      }
    }

    const percentage = totalMarks > 0
      ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2))
      : 0;

    const status = hasTheory
      ? 'Pending'
      : percentage >= Number(exam.passingMarks)
        ? 'Pass'
        : 'Fail';

    const attempt = await Attempt.create({
      studentId,
      examId,
      answers,
      questionResults,
      totalMarks,
      obtainedMarks,
      percentage,
      gradingStatus: hasTheory ? 'Pending' : 'Completed',
      status,
      resultStatus: status,
      submittedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: hasTheory
        ? 'Exam submitted successfully. Theory answers are waiting for teacher checking.'
        : 'Exam submitted and checked successfully.',
      result: {
        obtainedMarks,
        totalMarks,
        percentage,
        status,
        gradingStatus: attempt.gradingStatus
      }
    });

  } catch (error) {
    console.error('Submit Exam Error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted this exam.'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// STUDENT: GET OWN RESULTS
exports.getMyResults = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      studentId: req.user._id
    })
      .populate({
        path: 'examId',
        select: 'title totalMarks passingMarks subject',
        populate: {
          path: 'subject',
          select: 'name className'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error('Get My Results Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// TEACHER / ADMIN: GET RESULTS
exports.getAllResults = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'teacher') {
      const teacherExams = await Exam.find({
        createdBy: req.user._id
      }).select('_id');

      filter.examId = {
        $in: teacherExams.map(exam => exam._id)
      };
    }

    const attempts = await Attempt.find(filter)
      .populate(
        'studentId',
        'fullName email registrationNumber'
      )
      .populate({
        path: 'examId',
        select: 'title totalMarks passingMarks subject createdBy',
        populate: [
          {
            path: 'subject',
            select: 'name className'
          },
          {
            path: 'createdBy',
            select: 'fullName email'
          }
        ]
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error('Get All Results Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// TEACHER / ADMIN: MANUAL THEORY GRADING
exports.gradeAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { grades } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attempt ID.'
      });
    }

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one question grade.'
      });
    }

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Student attempt not found.'
      });
    }

    const exam = await Exam.findById(attempt.examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Associated exam not found.'
      });
    }

    if (!canManageExam(exam, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to grade this exam.'
      });
    }

    if (!attempt.questionResults || attempt.questionResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This is an older attempt without question-level answer records. It cannot be manually graded.'
      });
    }

    for (const grade of grades) {
      if (
        !grade.questionId ||
        !mongoose.Types.ObjectId.isValid(grade.questionId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question ID in grading data.'
        });
      }

      const resultItem = attempt.questionResults.find(
        item => item.questionId.toString() === grade.questionId
      );

      if (!resultItem) {
        return res.status(400).json({
          success: false,
          message: 'Question does not belong to this attempt.'
        });
      }

      if (resultItem.questionType === 'MCQ') {
        return res.status(400).json({
          success: false,
          message: 'MCQ answers are checked automatically and cannot be manually graded.'
        });
      }

      const awardedMarks = Number(grade.obtainedMarks);

      if (
        !Number.isFinite(awardedMarks) ||
        awardedMarks < 0 ||
        awardedMarks > resultItem.maxMarks
      ) {
        return res.status(400).json({
          success: false,
          message: `Marks for a question must be between 0 and ${resultItem.maxMarks}.`
        });
      }

      resultItem.obtainedMarks = awardedMarks;
      resultItem.isGraded = true;
      resultItem.feedback = typeof grade.feedback === 'string'
        ? grade.feedback.trim()
        : '';
    }

    const result = calculateFinalResult(attempt, exam);

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: result.gradingStatus === 'Completed'
        ? 'All theory answers have been checked. Final result is ready.'
        : 'Marks saved. Some theory answers are still waiting for checking.',
      result,
      attempt
    });

  } catch (error) {
    console.error('Grade Attempt Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
