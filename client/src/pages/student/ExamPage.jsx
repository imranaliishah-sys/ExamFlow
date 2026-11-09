import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchExamData = async () => {
      try {
        setLoading(true);
        setError('');

        const examRes = await API.get('/exams');
        const examList = examRes.data.exams || [];
        const foundExam = examList.find((item) => item._id === id);

        if (!foundExam) {
          if (active) setError('Exam not found.');
          return;
        }

        if (!foundExam.isPublished || foundExam.isArchived) {
          if (active) setError('This exam is not currently available.');
          return;
        }

        const qRes = await API.get(`/questions/exam/${id}`);
        const fetchedQuestions = qRes.data.questions || [];

        if (!fetchedQuestions.length) {
          if (active) setError('No questions available for this exam.');
          return;
        }

        if (active) {
          setExam(foundExam);
          setQuestions(fetchedQuestions);
          setTimeLeft(Math.max(1, Number(foundExam.duration) || 60) * 60);
        }
      } catch (err) {
        console.error('Error loading exam:', err);

        if (active) {
          setError(
            err.response?.data?.message || 'Unable to load exam.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchExamData();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmitExam = async () => {
    if (submitting || result || !exam) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await API.post('/attempts/submit', {
        examId: id,
        answers
      });

      if (response.data.success) {
        setResult(response.data.result);
      }
    } catch (err) {
      console.error('Submission failed:', err);

      setError(
        err.response?.data?.message ||
        'Exam submission failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown timer.
  useEffect(() => {
    if (
      timeLeft <= 0 ||
      !exam ||
      questions.length === 0 ||
      result ||
      loading ||
      submitting
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    exam,
    questions.length,
    result,
    loading,
    submitting
  ]);

  // Automatically submit when timer reaches zero.
  useEffect(() => {
    if (
      timeLeft === 0 &&
      exam &&
      questions.length > 0 &&
      !result &&
      !loading &&
      !submitting &&
      !autoSubmitTriggered
    ) {
      setAutoSubmitTriggered(true);
      handleSubmitExam();
    }
  }, [
    timeLeft,
    exam,
    questions.length,
    result,
    loading,
    submitting,
    autoSubmitTriggered
  ]);

  const updateAnswer = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // RESULT SCREEN
  if (result) {
    const isPending =
      result.status === 'Pending' ||
      result.gradingStatus === 'Pending';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">

          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Exam Submitted!
          </h2>

          <p className="text-sm text-slate-400 mb-6">
            {isPending
              ? 'Your MCQ answers have been checked. Theory answers are waiting for teacher evaluation.'
              : 'Your examination has been evaluated successfully.'}
          </p>

          <div className="bg-slate-800/60 p-4 rounded-2xl space-y-3 mb-6 text-left">

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Marks:</span>
              <span className="font-bold text-white">
                {result.totalMarks}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                Obtained Marks so far:
              </span>
              <span className="font-bold text-blue-400">
                {result.obtainedMarks}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                Current Percentage:
              </span>
              <span className="font-bold text-white">
                {Number(result.percentage || 0).toFixed(2)}%
              </span>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
              <span className="text-slate-400">Result Status:</span>

              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  isPending
                    ? 'bg-amber-500/20 text-amber-300'
                    : result.status === 'Pass'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isPending ? 'Pending Checking' : result.status}
              </span>
            </div>

          </div>

          {isPending && (
            <div className="flex gap-2 text-left text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />

              <p>
                Your final marks and Pass/Fail status will be available
                after the teacher checks all theory answers.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition text-sm"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading examination...
      </div>
    );
  }

  // ERROR SCREEN
  if (error && (!exam || questions.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4 p-6">

        <p className="text-red-400 text-center">
          {error}
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>

      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const currentType = currentQuestion?.questionType || 'MCQ';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-5 md:px-8 py-4 flex justify-between items-center gap-4">

        <div>
          <h1 className="text-lg font-bold">
            {exam?.title || 'Examination'}
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            {questions.length} Questions
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 font-mono font-bold">
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>

      </header>

      {/* EXAM CONTENT */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {currentQuestion ? (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 md:p-8 rounded-3xl shadow-xl space-y-6">

            {/* QUESTION INFO */}
            <div className="flex justify-between items-center text-xs text-slate-400 gap-3">

              <span>
                Question {currentIdx + 1} of {questions.length}
              </span>

              <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded-lg font-semibold">
                {currentType === 'MCQ'
                  ? 'Multiple Choice'
                  : currentType === 'SHORT'
                    ? 'Short Question'
                    : 'Long Question'}
              </span>

              <span>
                Marks: {currentQuestion.marks || 1}
              </span>

            </div>

            {/* QUESTION TEXT */}
            <h3 className="text-xl font-semibold text-white whitespace-pre-wrap">
              {currentQuestion.questionText}
            </h3>

            {/* MCQ OPTIONS */}
            {currentType === 'MCQ' ? (

              <div className="space-y-3">

                {(currentQuestion.options || []).map((option, optionIndex) => (

                  <button
                    type="button"
                    key={optionIndex}
                    onClick={() =>
                      updateAnswer(currentQuestion._id, optionIndex)
                    }
                    disabled={submitting}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                      answers[currentQuestion._id] === optionIndex
                        ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                        : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >

                    <span>{option}</span>

                    <span
                      className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${
                        answers[currentQuestion._id] === optionIndex
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-600'
                      }`}
                    >
                      {answers[currentQuestion._id] === optionIndex && (
                        <span className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </span>

                  </button>

                ))}

              </div>

            ) : (

              /* SHORT AND LONG ANSWERS */
              <div>

                <label className="block text-sm text-slate-300 font-semibold mb-2">
                  Write your answer
                </label>

                <textarea
                  rows={currentType === 'LONG' ? 9 : 4}
                  value={answers[currentQuestion._id] ?? ''}
                  onChange={(event) =>
                    updateAnswer(currentQuestion._id, event.target.value)
                  }
                  disabled={submitting}
                  placeholder="Type your answer here..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none rounded-xl p-4 text-white placeholder:text-slate-500 resize-y"
                />

                <p className="text-xs text-slate-500 mt-2">
                  This answer will be checked by your teacher.
                </p>

              </div>

            )}

            {/* PREVIOUS / NEXT / SUBMIT */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-700/80 gap-3">

              <button
                disabled={currentIdx === 0 || submitting}
                onClick={() =>
                  setCurrentIdx((previous) => previous - 1)
                }
                className="px-5 md:px-6 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-xl text-sm font-semibold transition"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (

                <button
                  disabled={submitting}
                  onClick={() =>
                    setCurrentIdx((previous) => previous + 1)
                  }
                  className="px-5 md:px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition"
                >
                  Next
                </button>

              ) : (

                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="px-5 md:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>

              )}

            </div>

            {/* QUESTION NAVIGATION */}
            <div className="flex flex-wrap gap-2 pt-1">

              {questions.map((question, index) => (

                <button
                  type="button"
                  key={question._id}
                  disabled={submitting}
                  onClick={() => setCurrentIdx(index)}
                  title={`Go to question ${index + 1}`}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    index === currentIdx
                      ? 'bg-blue-600 text-white'
                      : answers[question._id] !== undefined &&
                        answers[question._id] !== ''
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {index + 1}
                </button>

              ))}

            </div>

          </div>

        ) : (

          <div className="text-center py-20 text-slate-400">
            <p>No questions available for this exam.</p>
          </div>

        )}

      </main>

    </div>
  );
};

export default ExamPage;