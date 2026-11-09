
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  LogOut,
  PlayCircle,
  RefreshCw
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('/exams');

      const publishedExams = (response.data.exams || []).filter(
        (exam) => exam.isPublished === true && exam.isArchived !== true
      );

      setExams(publishedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);

      setError(
        err.response?.data?.message || 'Unable to load available exams.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col justify-between p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold text-xl">
              OES
            </div>

            <h1 className="text-xl font-extrabold tracking-wide">
              Online Exam System
              <span className="text-blue-500 text-xs px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 ml-1">
                STUDENT
              </span>
            </h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition text-left"
            >
              <BookOpen size={20} />
              Available Exams
            </button>

            <button
              onClick={() => navigate('/my-results')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition text-left"
            >
              <Award size={20} />
              My Results
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold uppercase overflow-hidden border border-blue-500/30">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName?.[0] || user?.name?.[0] || 'U'
              )}
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user?.fullName || user?.name}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile-settings')}
            className="text-xs text-blue-400 hover:underline mb-3 px-2 block font-medium"
          >
            Edit Profile Settings
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl w-full font-medium transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome Back, {user?.fullName || user?.name}!
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select an active examination below to begin your test.
            </p>
          </div>

          <button
            onClick={fetchAvailableExams}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh Exams
          </button>
        </header>

        {loading ? (
          <div className="text-center py-16 text-slate-500">
            Loading available exams...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl">
            <p>{error}</p>

            <button
              onClick={fetchAvailableExams}
              className="mt-3 text-sm font-semibold underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {exam.subject?.name || 'General'}
                  </span>

                  <h3 className="text-lg font-bold text-slate-800 mt-3">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {exam.description || 'No description provided for this exam.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {exam.duration} Mins
                    </span>

                    <span>
                      Total: {exam.totalMarks} Marks
                    </span>

                    <span>
                      Passing: {exam.passingMarks} Marks
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/exam/${exam._id}`)}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1"
                  >
                    <PlayCircle size={15} />
                    Take Exam
                  </button>
                </div>
              </div>
            ))}

            {exams.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
                <BookOpen
                  size={42}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500 font-medium">
                  No published examinations available at the moment.
                </p>

                <p className="text-slate-400 text-sm mt-1">
                  Please check again later.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
