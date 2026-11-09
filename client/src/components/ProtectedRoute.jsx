import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {

  const { user, loading } = useContext(AuthContext);

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>

      </div>

    );

  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">

        <h1 className="text-3xl font-bold text-red-600">
          Access Denied
        </h1>

        <p className="mt-3 text-slate-600">
          You are not authorized to access this page.
        </p>

        <button
          onClick={() => window.location.href = '/login'}
          className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Back to Login
        </button>

      </div>

    );

  }

  return <Outlet />;

};

export default ProtectedRoute;