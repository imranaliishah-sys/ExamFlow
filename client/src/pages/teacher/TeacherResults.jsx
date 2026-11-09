import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, LogOut, CheckCircle, XCircle } from 'lucide-react';

const TeacherResults = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    try {
      const response = await API.get('/attempts/all-results');
      setAttempts(response.data.attempts || []);
    } catch (err) {
      console.error('Error fetching all results:', err);
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
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold text-xl">EF</div>
            <h1 className="text-xl font-extrabold tracking-wide text-white">
              ExamFlow <span className="text-purple-500 text-xs px-2 py-0.5 bg-purple-500/10 rounded-full border border-purple-500/20">TEACHER</span>
            </h1>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition text-left"
            >
              <BookOpen size={20} /> Manage Exams
            </button>
            <button
              onClick={() => navigate('/teacher/results')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition text-left"
            >
              <Award size={20} /> Student Results
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold uppercase">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl w-full font-medium transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Student Examination Results</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor overall student performance, obtained marks, and pass/fail statistics.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {attempts.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-slate-800">{att.studentId?.name || 'Unknown Student'}</td>
                    <td className="p-4 text-slate-600">{att.examId?.title || 'N/A'}</td>
                    <td className="p-4 text-slate-500">{att.examId?.subject?.name || 'General'}</td>
                    <td className="p-4 font-medium">{att.obtainedMarks} / {att.totalMarks}</td>
                    <td className="p-4 font-bold text-blue-600">{att.percentage?.toFixed(2)}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        att.status === 'Pass' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {att.status === 'Pass' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {att.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && attempts.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              No examination attempts recorded yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherResults;