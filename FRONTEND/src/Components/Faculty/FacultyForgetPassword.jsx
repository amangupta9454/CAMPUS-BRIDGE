import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

const FacultyForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false, uppercase: false, lowercase: false, number: false, specialChar: false
  });

  useEffect(() => {
    setPasswordCriteria({
      minLength: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword)
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = newPassword === confirmPassword && newPassword !== '';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/faculty/forgot-password`, { email });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter a valid 6-character OTP');
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!doPasswordsMatch) return toast.error('Passwords do not match');
    if (!isPasswordValid) return toast.error('Please fulfill all password requirements');

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/faculty/reset-password`, {
        email, otp, newPassword
      });

      if (res.data.success) {
        toast.success('Password reset successfully!');
        navigate('/faculty/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resetting password');
      if (error.response?.data?.message === 'Invalid OTP' || error.response?.data?.message === 'OTP expired') {
        setStep(2); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 transition-all duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            {step === 1 && 'Faculty Password Reset'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
          </h2>
          <p className="text-slate-500 mt-2">
            {step === 1 && 'Enter your registered faculty email to receive an OTP.'}
            {step === 2 && `We've sent a 6-character OTP to ${email}`}
            {step === 3 && 'Enter your new strong password.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Mail size={16}/> Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="jane@college.edu" />
            </div>

            <button disabled={loading} type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Sending Request...' : 'Send OTP'}
            </button>
            <p className="text-center text-sm text-slate-600 mt-4">
              Remembered your password? <Link to="/faculty/login" className="text-red-600 font-semibold hover:underline">Login here</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-center gap-1.5"><KeyRound size={16}/> Enter 6-character OTP</label>
              <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} className="w-full text-center tracking-widest font-mono text-2xl px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50 uppercase" placeholder="XXXXXX" />
            </div>

            <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 mt-4">
              Continue
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
              Change Email Address
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Lock size={16}/> New Password</label>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all bg-white/50 pr-10 ${newPassword ? (isPasswordValid ? 'border-emerald-400 focus:ring-emerald-200' : 'border-amber-400 focus:ring-amber-200') : 'border-slate-200 focus:border-red-500 focus:ring-red-200'}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

               <div className="grid grid-cols-2 gap-1 mt-2 text-[11px]">
                  <div className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordCriteria.minLength ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} Min 8 chars
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordCriteria.uppercase ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} 1 Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordCriteria.lowercase ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} 1 Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordCriteria.number ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} 1 Number
                  </div>
                  <div className={`flex items-center gap-1 ${passwordCriteria.specialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordCriteria.specialChar ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} 1 Special
                  </div>
                </div>
            </div>

            <div className="space-y-1 mt-4">
               <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><ShieldCheck size={16}/> Confirm Password</label>
              <div className="relative">
                <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all bg-white/50 pr-10 ${confirmPassword ? (doPasswordsMatch ? 'border-emerald-400 focus:ring-emerald-200' : 'border-red-400 focus:ring-red-200') : 'border-slate-200 focus:border-red-500 focus:ring-red-200'}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                      {doPasswordsMatch ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} 
                      {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
            </div>

            <button disabled={loading || !isPasswordValid || !doPasswordsMatch} type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

export default FacultyForgetPassword;
