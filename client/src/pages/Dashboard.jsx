import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacherOrAdmin = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <h2 className="text-xl font-bold mb-8 text-blue-400">ExamFlow SaaS</h2>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-600 rounded-md text-white font-medium">
              <BookOpen size={18} /> Dashboard
            </button>
            {isTeacherOrAdmin && (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md text-gray-300">
                  <FileText size={18} /> Subjects & Exams
                </button>
              </>
            )}
            {!isTeacherOrAdmin && (
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md text-gray-300">
                <CheckCircle size={18} /> My Results
              </button>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white w-full justify-center"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-sm text-gray-500">
              Role: <span className="font-semibold uppercase text-blue-600">{user?.role}</span>
            </p>
          </div>
        </header>

        {/* Dynamic Cards according to Role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isTeacherOrAdmin ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm">Manage Subjects</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">Create & Edit</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm">Manage Exams</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">Setup MCQs</p>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm">Available Exams</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">Take Exam</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;