
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  FileText,
  Camera,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Maximum Image Size: 2MB
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Check image type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    // Check image size
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Picture size must be less than 2MB. Please select a smaller picture.');
      e.target.value = '';
      return;
    }

    setError('');
    setSuccess('');

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result);
    };

    reader.onerror = () => {
      setError('Unable to read image. Please try another picture.');
    };

    reader.readAsDataURL(file);
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.put(
        `/auth/profile/${user._id || user.id}`,
        {
          fullName,
          phone,
          bio,
          avatar
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');

        const updatedUser = response.data.user;

        login(updatedUser, localStorage.getItem('token'));

        setTimeout(() => {
          if (
            updatedUser.role === 'teacher' ||
            updatedUser.role === 'admin'
          ) {
            navigate('/teacher-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Profile <span className="text-blue-500">Settings</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Update your personal information and avatar
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">

          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner">

              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400 uppercase">
                  {fullName?.[0] || 'U'}
                </span>
              )}

              <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition cursor-pointer">
                <Camera size={20} />
                <span className="text-[10px] mt-1 font-medium">
                  Change
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              Click image to upload avatar (Max 2MB)
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">
                <User size={18} />
              </span>

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition text-sm"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">
                <Phone size={18} />
              </span>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition text-sm"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bio / Description
            </label>

            <div className="relative">
              <span className="absolute top-3 left-4 text-slate-500 pointer-events-none">
                <FileText size={18} />
              </span>

              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
