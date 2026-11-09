const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Submit Exam & Calculate Result
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body; // answers = [{ questionId, selectedOption }]

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Fetch all questions for this exam
    const questions = await Question.find({ exam: examId });

    let score = 0;
    const processedAnswers = [];

    // Evaluate answers
    questions.forEach((q) => {
      const userAns = answers.find((a) => a.questionId.toString() === q._id.toString());
      const selectedOption = userAns ? userAns.selectedOption : '';
      const isCorrect = selectedOption === q.correctAnswer;

      if (isCorrect) {
        score += q.marks;
      }

      processedAnswers.push({
        question: q._id,
        selectedOption,
        isCorrect
      });
    });

    const percentage = ((score / exam.totalMarks) * 100).toFixed(2);

    // Save result to database
    const result = await Result.create({
      student: req.user._id,
      exam: examId,
      score,
      totalMarks: exam.totalMarks,
      percentage,
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Student Results
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('exam', 'title subject')
      .populate('student', 'name email');

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};