import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
  BookOpen,
  PlusCircle,
  FileText,
  LogOut,
  CheckCircle2,
  Trash2,
  HelpCircle,
  X,
  ClipboardList,
  RefreshCw,
  Eye,
  EyeOff,
  Archive,
  Pencil,
  GraduationCap,
  Clock,
  Award,
  MessageSquare,
  Save
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subjectForm, setSubjectForm] = useState({
    className: '',
    name: '',
    description: ''
  });
  const [editingSubject, setEditingSubject] = useState(null);

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    passingMarks: 40
  });

  const [paperExam, setPaperExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    questionType: 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });

  const [gradingAttempt, setGradingAttempt] = useState(null);
  const [gradingQuestions, setGradingQuestions] = useState([]);
  const [grades, setGrades] = useState({});
  const [gradingLoading, setGradingLoading] = useState(false);

  const [questionTypeFilter, setQuestionTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchSubjects();
    fetchExams();
    fetchResults();
  }, []);

  const showMessage = (message, type = 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }

    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
  };

  const fetchSubjects = async () => {
    try {
      const response = await API.get('/subjects');
      setSubjects(response.data.subjects || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to load subjects.',
        'error'
      );
    }
  };

  const fetchExams = async () => {
    try {
      const response = await API.get('/exams');
      setExams(response.data.exams || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to load exams.',
        'error'
      );
    }
  };

  const fetchResults = async () => {
    try {
      const response = await API.get('/attempts/all-results');
      setResults(response.data.attempts || []);
    } catch (err) {
      console.error('Results loading error:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubjects(),
      fetchExams(),
      fetchResults()
    ]);
    setLoading(false);
  };

  // SUBJECT MANAGEMENT

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSubject) {
        await API.put(`/subjects/${editingSubject._id}`, subjectForm);
        showMessage('Subject updated successfully.');
      } else {
        await API.post('/subjects', subjectForm);
        showMessage('Subject created successfully.');
      }

      setSubjectForm({
        className: '',
        name: '',
        description: ''
      });

      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to save subject.',
        'error'
      );
    }
  };

  const editSubject = (subject) => {
    setEditingSubject(subject);

    setSubjectForm({
      className: subject.className || 'General',
      name: subject.name || '',
      description: subject.description || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelSubjectEdit = () => {
    setEditingSubject(null);
    setSubjectForm({
      className: '',
      name: '',
      description: ''
    });
  };

  const deleteSubject = async (subject) => {
    const confirmed = window.confirm(
      `Delete "${subject.name}" from "${subject.className || 'General'}"?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/subjects/${subject._id}`);
      showMessage('Subject deleted successfully.');
      fetchSubjects();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to delete subject.',
        'error'
      );
    }
  };

  // EXAM MANAGEMENT

  const handleExamSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!examForm.subject) {
        showMessage('Please select a subject.', 'error');
        return;
      }

      const payload = {
        ...examForm,
        duration: Number(examForm.duration),
        totalMarks: 1,
        passingMarks: Number(examForm.passingMarks)
      };

      await API.post('/exams', payload);

      showMessage(
        'Exam created. Now add questions to calculate its total marks.'
      );

      setExamForm({
        title: '',
        description: '',
        subject: '',
        duration: 60,
        passingMarks: 40
      });

      fetchExams();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to create exam.',
        'error'
      );
    }
  };

  const togglePublish = async (exam) => {
    try {
      await API.patch(`/exams/${exam._id}/publish`, {
        isPublished: !exam.isPublished
      });

      showMessage(
        exam.isPublished
          ? 'Exam unpublished successfully.'
          : 'Exam published successfully.'
      );

      fetchExams();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to update exam status.',
        'error'
      );
    }
  };

  const deleteExam = async (exam) => {
    const confirmed = window.confirm(
      `Delete or archive "${exam.title}"? Student attempts, if any, will be preserved.`
    );

    if (!confirmed) return;

    try {
      const response = await API.delete(`/exams/${exam._id}`);

      showMessage(
        response.data.message || 'Exam operation completed.'
      );

      fetchExams();
      fetchResults();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to delete exam.',
        'error'
      );
    }
  };

  // PAPER BUILDER

  const openPaperBuilder = async (exam) => {
    setPaperExam(exam);
    setQuestionLoading(true);
    setQuestionTypeFilter('ALL');

    try {
      const response = await API.get(`/questions/exam/${exam._id}`);
      setQuestions(response.data.questions || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to load paper questions.',
        'error'
      );
      setPaperExam(null);
    } finally {
      setQuestionLoading(false);
    }
  };

  const closePaperBuilder = () => {
    setPaperExam(null);
    setQuestions([]);
    setEditingQuestion(null);
    setQuestionForm({
      questionType: 'MCQ',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });

    fetchExams();
  };

  const updateOption = (index, value) => {
    setQuestionForm((previous) => {
      const updated = [...previous.options];
      updated[index] = value;

      return {
        ...previous,
        options: updated
      };
    });
  };

  const addOption = () => {
    setQuestionForm((previous) => ({
      ...previous,
      options: [...previous.options, '']
    }));
  };

  const removeOption = (index) => {
    setQuestionForm((previous) => {
      const updated = previous.options.filter((_, i) => i !== index);

      let correctAnswer = previous.correctAnswer;

      if (correctAnswer === index) {
        correctAnswer = 0;
      } else if (correctAnswer > index) {
        correctAnswer -= 1;
      }

      return {
        ...previous,
        options: updated,
        correctAnswer
      };
    });
  };

  const changeQuestionType = (type) => {
    setQuestionForm((previous) => ({
      ...previous,
      questionType: type,
      options: ['', '', '', ''],
      correctAnswer: 0
    }));
  };

  const addQuestion = async (e) => {
    e.preventDefault();

    if (!paperExam) return;

    try {
      const payload = {
        examId: paperExam._id,
        questionType: questionForm.questionType,
        questionText: questionForm.questionText,
        marks: Number(questionForm.marks)
      };

      if (questionForm.questionType === 'MCQ') {
        payload.options = questionForm.options;
        payload.correctAnswer = Number(questionForm.correctAnswer);
      }

      const response = editingQuestion
        ? await API.put(`/questions/${editingQuestion._id}`, payload)
        : await API.post('/questions', payload);

      if (editingQuestion) {
        setQuestions((previous) =>
          previous.map((item) =>
            item._id === editingQuestion._id ? response.data.question : item
          )
        );
      } else {
        setQuestions((previous) => [
          ...previous,
          response.data.question
        ]);
      }

      setPaperExam((previous) => ({
        ...previous,
        totalMarks: response.data.totalMarks
      }));

      setQuestionForm({
        questionType: 'MCQ',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      });
      showMessage(editingQuestion ? 'Question updated successfully.' : 'Question added successfully.');
      setEditingQuestion(null);
      fetchExams();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to add question.',
        'error'
      );
    }
  };

  const editQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionType: question.questionType || 'MCQ',
      questionText: question.questionText || '',
      options: question.questionType === 'MCQ'
        ? [...(question.options || ['', ''])]
        : ['', '', '', ''],
      correctAnswer: Number(question.correctAnswer ?? 0),
      marks: question.marks ?? 1
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelQuestionEdit = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionType: 'MCQ',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });
  };

  const deleteQuestion = async (question) => {
    if (!window.confirm('Delete this question from the paper?')) return;

    try {
      const response = await API.delete(`/questions/${question._id}`);

      setQuestions((previous) =>
        previous.filter((item) => item._id !== question._id)
      );

      setPaperExam((previous) => ({
        ...previous,
        totalMarks: response.data.totalMarks
      }));

      showMessage('Question deleted successfully.');
      fetchExams();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to delete question.',
        'error'
      );
    }
  };

  const filteredQuestions = questionTypeFilter === 'ALL'
    ? questions
    : questions.filter(
        (question) => (question.questionType || 'MCQ') === questionTypeFilter
      );

  const paperTotal = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0
  );

  // MANUAL THEORY CHECKING

  const openGrading = async (attempt) => {
    setGradingAttempt(attempt);
    setGradingLoading(true);

    try {
      const examId = attempt.examId?._id || attempt.examId;

      const response = await API.get(`/questions/exam/${examId}`);
      const examQuestions = response.data.questions || [];

      const attemptItems = attempt.questionResults || [];

      const theoryQuestions = examQuestions
        .filter((question) => {
          const type = question.questionType || 'MCQ';
          return type === 'SHORT' || type === 'LONG';
        })
        .map((question) => {
          const saved = attemptItems.find(
            (item) =>
              String(item.questionId) === String(question._id)
          );

          return {
            ...question,
            studentAnswer: saved?.answer ?? '',
            maxMarks: saved?.maxMarks ?? question.marks,
            obtainedMarks: saved?.obtainedMarks ?? 0,
            isGraded: saved?.isGraded ?? false,
            feedback: saved?.feedback ?? ''
          };
        });

      setGradingQuestions(theoryQuestions);

      const initialGrades = {};

      theoryQuestions.forEach((question) => {
        initialGrades[question._id] = {
          obtainedMarks: question.obtainedMarks,
          feedback: question.feedback
        };
      });

      setGrades(initialGrades);
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to load answers.',
        'error'
      );
      setGradingAttempt(null);
    } finally {
      setGradingLoading(false);
    }
  };

  const updateGrade = (questionId, field, value) => {
    setGrades((previous) => ({
      ...previous,
      [questionId]: {
        ...previous[questionId],
        [field]: value
      }
    }));
  };

  const saveGrades = async (e) => {
    e.preventDefault();

    if (!gradingAttempt) return;

    try {
      const gradePayload = gradingQuestions.map((question) => ({
        questionId: question._id,
        obtainedMarks: Number(
          grades[question._id]?.obtainedMarks ?? 0
        ),
        feedback: grades[question._id]?.feedback || ''
      }));

      for (const grade of gradePayload) {
        const question = gradingQuestions.find(
          (item) => item._id === grade.questionId
        );

        if (
          !Number.isFinite(grade.obtainedMarks) ||
          grade.obtainedMarks < 0 ||
          grade.obtainedMarks > Number(question.maxMarks)
        ) {
          showMessage(
            `Marks must be between 0 and ${question.maxMarks}.`,
            'error'
          );
          return;
        }
      }

      const response = await API.patch(
        `/attempts/${gradingAttempt._id}/grade`,
        { grades: gradePayload }
      );

      showMessage(response.data.message || 'Marks saved successfully.');

      setGradingAttempt(null);
      setGradingQuestions([]);
      setGrades({});

      fetchResults();
    } catch (err) {
      showMessage(
        err.response?.data?.message || 'Unable to save marks.',
        'error'
      );
    }
  };

  const pendingCount = results.filter(
    (attempt) =>
      attempt.status === 'Pending' ||
      attempt.gradingStatus === 'Pending'
  ).length;

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white';

  const buttonClass =
    'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition';

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col justify-between p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl font-bold text-xl">
              OES
            </div>

            <div>
              <h1 className="text-lg font-extrabold">
                Online Exam System
              </h1>
              <span className="text-blue-400 text-xs font-semibold">
                TEACHER PORTAL
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'subjects', label: 'Subject Management', icon: BookOpen },
              { id: 'exams', label: 'Exam Management', icon: FileText },
              { id: 'results', label: 'Student Results', icon: Award }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-left ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                  {item.id === 'results' && pendingCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold uppercase">
              {user?.fullName?.[0] || 'T'}
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-400">
                TEACHER
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile-settings')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 mb-2 bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl w-full font-medium transition"
          >
            <Pencil size={18} />
            Edit Profile Settings
          </button>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl w-full font-medium transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'subjects'
                ? 'Subject Management'
                : activeTab === 'exams'
                  ? 'Exam Management'
                  : 'Student Results'}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Welcome, {user?.fullName || 'Teacher'}
            </p>
          </div>

          <button
            onClick={refreshAll}
            disabled={loading}
            className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* SUBJECT MANAGEMENT */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">

            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                {editingSubject ? <Pencil size={20} /> : <PlusCircle size={20} />}
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>

              <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Class / Course Name
                  </label>

                  <input
                    className={inputClass}
                    placeholder="e.g. DAE, CIT, Web Designing"
                    value={subjectForm.className}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        className: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Subject Name
                  </label>

                  <input
                    className={inputClass}
                    placeholder="e.g. Computer Science"
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        name: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Description
                  </label>

                  <textarea
                    className={inputClass}
                    rows="3"
                    placeholder="Enter subject description..."
                    value={subjectForm.description}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        description: e.target.value
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`}
                  >
                    {editingSubject ? <Save size={17} /> : <PlusCircle size={17} />}
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </button>

                  {editingSubject && (
                    <button
                      type="button"
                      onClick={cancelSubjectEdit}
                      className={`${buttonClass} bg-slate-100 hover:bg-slate-200 text-slate-700`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  Available Subjects ({subjects.length})
                </h3>
              </div>

              {subjects.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <BookOpen size={38} className="mx-auto mb-3" />
                  No subjects created yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="p-5 flex flex-wrap justify-between items-center gap-4"
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {subject.className || 'General'}
                        </span>

                        <h4 className="font-bold text-slate-800 mt-2">
                          {subject.name}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {subject.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => editSubject(subject)}
                          className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="Edit subject"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => deleteSubject(subject)}
                          className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete subject"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* EXAM MANAGEMENT */}
        {activeTab === 'exams' && (
          <div className="space-y-6">

            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <PlusCircle size={20} />
                Create New Examination
              </h3>

              <form onSubmit={handleExamSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Exam Title
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Enter exam title"
                    value={examForm.title}
                    onChange={(e) =>
                      setExamForm({ ...examForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Subject
                  </label>

                  <select
                    className={inputClass}
                    value={examForm.subject}
                    onChange={(e) =>
                      setExamForm({ ...examForm, subject: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Subject</option>

                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.className || 'General'} — {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={examForm.duration}
                    onChange={(e) =>
                      setExamForm({ ...examForm, duration: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Passing Percentage (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputClass}
                    value={examForm.passingMarks}
                    onChange={(e) =>
                      setExamForm({ ...examForm, passingMarks: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Description
                  </label>

                  <textarea
                    className={inputClass}
                    rows="2"
                    placeholder="Optional exam description..."
                    value={examForm.description}
                    onChange={(e) =>
                      setExamForm({ ...examForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 mb-3">
                    Exam total marks will be calculated automatically from the marks assigned to its questions.
                  </p>

                  <button
                    type="submit"
                    className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`}
                  >
                    <PlusCircle size={17} />
                    Create Exam
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  Your Examinations ({exams.length})
                </h3>
              </div>

              {exams.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <FileText size={38} className="mx-auto mb-3" />
                  No exams created yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {exams.map((exam) => (
                    <div
                      key={exam._id}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                            {exam.subject?.className || 'General'} — {exam.subject?.name || 'Subject'}
                          </span>

                          {exam.isPublished ? (
                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                              Published
                            </span>
                          ) : exam.isArchived ? (
                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
                              Archived
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                              Draft
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-800 text-lg">
                          {exam.title}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {exam.description || 'No description provided.'}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {exam.duration} minutes
                          </span>

                          <span>
                            Total: {exam.totalMarks} marks
                          </span>

                          <span>
                            Passing: {exam.passingMarks}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!exam.isArchived && (
                          <>
                            <button
                              onClick={() => openPaperBuilder(exam)}
                              className={`${buttonClass} bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
                            >
                              <ClipboardList size={16} />
                              Manage Paper
                            </button>

                            <button
                              onClick={() => togglePublish(exam)}
                              className={`${buttonClass} ${
                                exam.isPublished
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {exam.isPublished ? (
                                <><EyeOff size={16} /> Unpublish</>
                              ) : (
                                <><Eye size={16} /> Publish</>
                              )}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => deleteExam(exam)}
                          className={`${buttonClass} bg-red-50 text-red-600 hover:bg-red-100`}
                        >
                          {exam.isArchived ? <Trash2 size={16} /> : <Archive size={16} />}
                          {exam.isArchived ? 'Delete' : 'Delete / Archive'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* STUDENT RESULTS */}
        {activeTab === 'results' && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Student Results
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Review MCQ results and manually check theory answers.
                </p>
              </div>

              <span className="text-sm bg-amber-50 text-amber-700 px-3 py-2 rounded-lg font-semibold">
                {pendingCount} Pending Checking
              </span>
            </div>

            {results.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Award size={38} className="mx-auto mb-3" />
                No student attempts available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Examination</th>
                      <th className="p-4">Marks</th>
                      <th className="p-4">Percentage</th>
                      <th className="p-4">Result</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {results.map((attempt) => (
                      <tr key={attempt._id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">
                            {attempt.studentId?.fullName || 'Student'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {attempt.studentId?.email}
                          </p>
                        </td>

                        <td className="p-4">
                          {attempt.examId?.title || 'Exam'}
                        </td>

                        <td className="p-4 font-semibold">
                          {attempt.obtainedMarks} / {attempt.totalMarks}
                        </td>

                        <td className="p-4">
                          {Number(attempt.percentage || 0).toFixed(2)}%
                        </td>

                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            attempt.status === 'Pass'
                              ? 'bg-green-50 text-green-700'
                              : attempt.status === 'Fail'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}>
                            {attempt.status || 'Pending'}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => openGrading(attempt)}
                            className={`${buttonClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}
                          >
                            <Pencil size={15} />
                            Check Answers
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* PAPER BUILDER MODAL */}
      {paperExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-start justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4">

            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Manage Paper
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {paperExam.title}
                </p>
              </div>

              <button
                onClick={closePaperBuilder}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-semibold">
                    TOTAL QUESTIONS
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {questions.length}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-semibold">
                    TOTAL PAPER MARKS
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {paperTotal}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-semibold">
                    PASSING PERCENTAGE
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {paperExam.passingMarks}%
                  </p>
                </div>
              </div>

              {/* ADD QUESTION FORM */}
              <form
                onSubmit={addQuestion}
                className="border border-slate-200 rounded-2xl p-5 mb-7"
              >
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {editingQuestion ? <Pencil size={19} /> : <PlusCircle size={19} />}
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Question Type
                    </label>

                    <select
                      className={inputClass}
                      value={questionForm.questionType}
                      onChange={(e) => changeQuestionType(e.target.value)}
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="SHORT">Short Question</option>
                      <option value="LONG">Long Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Question Marks
                    </label>

                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      className={inputClass}
                      value={questionForm.marks}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          marks: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                      Marks are added automatically to the paper total.
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Question Statement
                  </label>

                  <textarea
                    className={inputClass}
                    rows="3"
                    placeholder="Write your question here..."
                    value={questionForm.questionText}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        questionText: e.target.value
                      })
                    }
                    required
                  />
                </div>

                {questionForm.questionType === 'MCQ' && (
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-semibold text-slate-600">
                        Options
                      </label>

                      <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-blue-600 font-semibold hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-3">
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={Number(questionForm.correctAnswer) === index}
                            onChange={() =>
                              setQuestionForm({
                                ...questionForm,
                                correctAnswer: index
                              })
                            }
                            title="Select correct answer"
                          />

                          <input
                            className={inputClass}
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            required
                          />

                          {questionForm.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Select the radio button next to the correct option.
                    </p>
                  </div>
                )}

                {questionForm.questionType !== 'MCQ' && (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm mb-5">
                    <MessageSquare size={17} className="inline mr-2" />
                    Students will write their answers. Teacher will check and award marks manually.
                  </div>
                )}

                <button
                  type="submit"
                  className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`}
                >
                  {editingQuestion ? <Save size={17} /> : <PlusCircle size={17} />}
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={cancelQuestionEdit}
                    className="ml-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {/* EXISTING QUESTIONS */}
              <div>
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <h4 className="font-bold text-slate-800">
                    Paper Questions ({questions.length})
                  </h4>

                  <select
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    value={questionTypeFilter}
                    onChange={(e) => setQuestionTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Questions</option>
                    <option value="MCQ">MCQs</option>
                    <option value="SHORT">Short Questions</option>
                    <option value="LONG">Long Questions</option>
                  </select>
                </div>

                {questionLoading ? (
                  <p className="text-center text-slate-500 py-8">
                    Loading questions...
                  </p>
                ) : filteredQuestions.length === 0 ? (
                  <div className="text-center bg-slate-50 rounded-xl p-8 text-slate-400">
                    <HelpCircle size={32} className="mx-auto mb-2" />
                    No questions found in this category.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions.map((question, index) => (
                      <div
                        key={question._id}
                        className="border border-slate-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">
                                Q{index + 1}
                              </span>

                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
                                {question.questionType || 'MCQ'}
                              </span>

                              <span className="text-xs text-slate-500 font-semibold">
                                {question.marks} Marks
                              </span>
                            </div>

                            <p className="font-semibold text-slate-800">
                              {question.questionText}
                            </p>

                            {question.questionType === 'MCQ' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                {question.options?.map((option, i) => (
                                  <div
                                    key={i}
                                    className={`text-sm p-2 rounded-lg ${
                                      Number(question.correctAnswer) === i
                                        ? 'bg-green-50 text-green-700 font-semibold'
                                        : 'bg-slate-50 text-slate-600'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + i)}. {option}
                                    {Number(question.correctAnswer) === i && ' ✓'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => editQuestion(question)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit question"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              onClick={() => deleteQuestion(question)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Delete question"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end">
              <button
                onClick={closePaperBuilder}
                className={`${buttonClass} bg-slate-900 hover:bg-slate-800 text-white`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL GRADING MODAL */}
      {gradingAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-start justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">

            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Check Theory Answers
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {gradingAttempt.studentId?.fullName} — {gradingAttempt.examId?.title}
                </p>
              </div>

              <button
                onClick={() => setGradingAttempt(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={saveGrades} className="p-5 md:p-6">
              {gradingLoading ? (
                <p className="text-center py-10 text-slate-500">
                  Loading student answers...
                </p>
              ) : gradingQuestions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 size={36} className="mx-auto mb-3" />
                  No theory questions found for this attempt.
                </div>
              ) : (
                <div className="space-y-6">
                  {gradingQuestions.map((question, index) => (
                    <div
                      key={question._id}
                      className="border border-slate-200 rounded-xl p-5"
                    >
                      <div className="flex flex-wrap justify-between gap-2 mb-3">
                        <span className="text-sm font-bold text-slate-700">
                          Question {index + 1} — {question.questionType}
                        </span>

                        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          Maximum {question.maxMarks} Marks
                        </span>
                      </div>

                      <p className="font-semibold text-slate-800 mb-4">
                        {question.questionText}
                      </p>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
                          Student Answer
                        </p>

                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                          {question.studentAnswer || 'No answer provided.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Awarded Marks
                          </label>

                          <input
                            type="number"
                            min="0"
                            max={question.maxMarks}
                            step="0.5"
                            className={inputClass}
                            value={grades[question._id]?.obtainedMarks ?? 0}
                            onChange={(e) =>
                              updateGrade(
                                question._id,
                                'obtainedMarks',
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Feedback (Optional)
                          </label>

                          <input
                            className={inputClass}
                            placeholder="Write feedback..."
                            value={grades[question._id]?.feedback || ''}
                            onChange={(e) =>
                              updateGrade(
                                question._id,
                                'feedback',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-2">
                        Previous status: {question.isGraded ? 'Checked' : 'Pending'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGradingAttempt(null)}
                  className={`${buttonClass} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={gradingLoading || gradingQuestions.length === 0}
                  className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}
                >
                  <Save size={17} />
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;