import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'Director' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields are required');
    try {
      setLoading(true);
      const { data } = await axios.post(`${BACKEND_URL}/api/admin/login`, form);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        
        if(data.admin.role === 'SuperAdmin') {
           toast.success('Welcome back, Super Admin!');
           navigate('/superadmin/dashboard');
        } else {
           toast.success('Welcome back, Admin!');
           navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden px-4">
      {/* Soft background blobs matching the rest of the UI */}
      <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-10%] w-[45%] h-[45%] bg-purple-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 120 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl shadow-indigo-100/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-300/40 mb-4">
              <ShieldAlert size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">CampusBridge Super Control</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Access Portal Role</label>
              <div className="relative">
                <ShieldAlert size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="role"
                  value={form.role}
                  onChange={(e) => {
                     const v = e.target.value;
                     if(v === 'Student') navigate('/student/login');
                     else if(v === 'Teacher' || v === 'HOD') navigate('/faculty/login');
                     else handleChange(e);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer font-semibold"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher / Faculty</option>
                  <option value="HOD">Sector Head / HOD</option>
                  <option value="Director">Admin (Director)</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex flex-col justify-center pointer-events-none">
                   <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{form.role === 'SuperAdmin' ? 'Super Admin Email' : 'Admin Email'}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={form.role === 'SuperAdmin' ? 'superadmin@campusbridge.edu' : 'admin@campusbridge.edu'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <> Access Dashboard <ArrowRight size={16} /> </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-slate-400 text-xs">Admin accounts are pre-configured. Contact your system administrator for access.</p>
            <Link to="/" className="text-xs text-indigo-600 hover:underline font-medium">← Back to Homepage</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
