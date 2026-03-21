import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const FacultyLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/faculty/login`, formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('faculty', JSON.stringify(res.data.faculty));
        toast.success('Logged in successfully');
        navigate('/faculty/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Faculty Portal
          </h2>
          <p className="text-slate-500 mt-2">Login to manage student complaints.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button type="button" onClick={() => navigate('/student/login')} className="flex-1 py-2 font-semibold text-sm rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all">Student</button>
          <button type="button" className="flex-1 py-2 font-semibold text-sm rounded-lg bg-white text-red-700 shadow-sm transition-all" disabled>Teacher</button>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Mail size={16}/> Email Address</label>
            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="jane@college.edu" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Lock size={16}/> Password</label>
              <Link to="/faculty/forgot-password" className="text-xs text-red-600 font-medium hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50 pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Authenticating...' : 'Login to Portal'}
          </button>
          
          <p className="text-center text-sm text-slate-600 mt-4">
            Don't have an account? <Link to="/faculty/register" className="text-red-600 font-semibold hover:underline">Register here</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default FacultyLogin;
