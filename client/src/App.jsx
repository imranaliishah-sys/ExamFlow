import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import StudentDashboard from './pages/student/StudentDashboard';
import ExamPage from './pages/student/ExamPage';
import MyResults from './pages/student/MyResults';
import TeacherResults from './pages/teacher/TeacherResults';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/exam/:id" element={<ExamPage />} />
          <Route path="/my-results" element={<MyResults />} />
        </Route>

        {/* Teacher and Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/results" element={<TeacherResults />} />
        </Route>

        {/* Profile Settings for All Authenticated Roles */}
        <Route element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />
        }>
          <Route path="/profile-settings" element={<ProfileSettings />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;