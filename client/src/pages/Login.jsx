import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, ShieldCheck, ArrowRight, BookOpenCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('teacher'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added state for registration success message
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        // Registration Flow: Create Account -> Show Success Message -> Redirect to Sign In
        const response = await API.post('/auth/register', { 
          name, 
          fullName: name, 
          email, 
          password, 
          role 
        });
        
        if (response.data.success || response.status === 201 || response.status === 200) {
          setSuccess('Account created successfully! Please sign in with your credentials.');
          setTimeout(() => {
            setIsRegister(false);
            setSuccess('');
            setPassword('');
          }, 4000);
        }
      } else {
        // Login Flow: Authenticate -> Navigate to Dashboard
        const response = await API.post('/auth/login', { email, password });
        if (response.data.success) {
          login(response.data.user, response.data.token);
          if (response.data.user.role === 'teacher' || response.data.user.role === 'admin') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Glowing Decorative Orbs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl mb-3 shadow-inner">
            <BookOpenCheck size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            Online Exam System <span className="text-blue-500">OES</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Create an account to start managing exams' : 'Welcome back! Please enter your details'}
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl mb-6 flex items-start gap-2">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-500" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g imranalii@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Account Role
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 text-slate-500" size={18} />
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
                >
                  <option value="teacher" className="bg-slate-900">Teacher / Educator</option>
                  <option value="student" className="bg-slate-900">Student</option>
                  <option value="admin" className="bg-slate-900">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition flex items-center justify-center gap-2 text-sm mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-xs text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold transition ml-1 underline"
            >
              {isRegister ? 'Sign In' : 'Register now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;