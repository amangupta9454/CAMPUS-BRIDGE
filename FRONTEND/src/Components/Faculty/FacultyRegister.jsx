import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Upload, User, Mail, Phone, BookOpen, MapPin, Lock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

const FacultyRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    department: '',
    otherDepartment: '',
    designation: '',
    otherDesignation: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
  });

  const [otp, setOtp] = useState('');

  const departments = [
    'Applied Science and Humanities',
    'Computer Science and Allied Branch',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Polytechnic',
    'Computer Application',
    'Educational Department',
    'Discipline',
    'Functionary',
    'Other'
  ];

  const designations = [
    'HOD',
    'Professor',
    'Assistant Professor',
    'Other'
  ];

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false, uppercase: false, lowercase: false, number: false, specialChar: false
  });

  useEffect(() => {
    setPasswordCriteria({
      minLength: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formData.password)
    });
  }, [formData.password]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'mobile') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image size should be less than 5MB');
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const isMobileValid = formData.mobile.length === 10 && /^[6-9]/.test(formData.mobile);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!isMobileValid) return toast.error('Please enter a valid 10-digit Indian mobile number');
    if (!doPasswordsMatch) return toast.error('Passwords do not match');
    if (!isPasswordValid) return toast.error('Please fulfill all password requirements');
    if (!formData.profileImage) return toast.error('Profile image is required');

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('mobile', formData.mobile);
    submitData.append('department', formData.department === 'Other' ? formData.otherDepartment : formData.department);
    submitData.append('designation', formData.designation === 'Other' ? formData.otherDesignation : formData.designation);
    submitData.append('password', formData.password);
    submitData.append('profileImage', formData.profileImage);

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/faculty/register`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Please enter a valid 6-character OTP');

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/faculty/verify-otp`, {
        email: formData.email,
        otp
      });

      if (res.data.success) {
        toast.success(`Account verified! Your Faculty ID is: ${res.data.facultyId}`);
        navigate('/faculty/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 my-8">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            {step === 1 ? 'Faculty Registration' : 'Verify Your Email'}
          </h2>
          <p className="text-slate-500 mt-2">
            {step === 1 ? 'Join CampusBridge as a Faculty Member.' : `We've sent a 6-character OTP to ${formData.email}`}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button type="button" onClick={() => navigate('/student/register')} className="flex-1 py-2 font-semibold text-sm rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all">Student</button>
          <button type="button" className="flex-1 py-2 font-semibold text-sm rounded-lg bg-white text-red-700 shadow-sm transition-all" disabled>Teacher</button>
        </div>

        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-red-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-200 transition-colors">
                  {imagePreview ? (
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-red-400" size={28} />
                  )}
                  <input type="file" name="profileImage" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Upload Profile Photo (Max 5MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><User size={16}/> Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="Prof. Jane Doe" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Mail size={16}/> Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="jane@college.edu" />
              </div>

              <div className="space-y-1">
                 <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                   <span className="flex items-center gap-1.5"><Phone size={16}/> Mobile Number</span>
                   {formData.mobile.length > 0 && (
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isMobileValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                       {isMobileValid ? 'Valid' : 'Invalid'}
                     </span>
                   )}
                 </label>
                <input required type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all bg-white/50 ${formData.mobile.length > 0 ? (isMobileValid ? 'border-emerald-400 focus:ring-emerald-200' : 'border-red-400 focus:ring-red-200') : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200'}`} placeholder="e.g. 9876543210" />
                {formData.mobile.length > 0 && !isMobileValid && (
                  <p className="text-xs text-red-500 mt-1">Must be exactly 10 digits starting with 6-9</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><BookOpen size={16}/> Department</label>
                <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {formData.department === 'Other' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><BookOpen size={16}/> Specify Department</label>
                  <input required type="text" name="otherDepartment" value={formData.otherDepartment} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="E.g. Bio-Tech" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><MapPin size={16}/> Designation</label>
                <select required name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50">
                  <option value="">Select Designation</option>
                  {designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              {formData.designation === 'Other' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><MapPin size={16}/> Specify Designation</label>
                  <input required type="text" name="otherDesignation" value={formData.otherDesignation} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50" placeholder="E.g. Guest Lecturer" />
                </div>
              )}

              {/* Password Section */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Lock size={16}/> Password</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all bg-white/50 pr-10 ${formData.password ? (isPasswordValid ? 'border-emerald-400 focus:ring-emerald-200' : 'border-amber-400 focus:ring-amber-200') : 'border-slate-200 focus:border-red-500 focus:ring-red-200'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Real-time validations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 text-xs">
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
                      {passwordCriteria.specialChar ? <CheckCircle2 size={12}/> : <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>} 1 Special Char
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                     <span className="flex items-center gap-1.5"><ShieldCheck size={16}/> Confirm Password</span>
                   </label>
                  <div className="relative">
                    <input required type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all bg-white/50 pr-10 ${formData.confirmPassword ? (doPasswordsMatch ? 'border-emerald-400 focus:ring-emerald-200' : 'border-red-400 focus:ring-red-200') : 'border-slate-200 focus:border-red-500 focus:ring-red-200'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                       {doPasswordsMatch ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} 
                       {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

            </div>

            <button disabled={loading || !isMobileValid || !isPasswordValid || !doPasswordsMatch} type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : 'Register Faculty Account'}
            </button>
            
            <p className="text-center text-sm text-slate-600 mt-4">
              Already have a faculty account? <Link to="/faculty/login" className="text-red-600 font-semibold hover:underline">Login here</Link>
            </p>

          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6 max-w-sm mx-auto">
             <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center justify-center gap-1.5 text-center">Enter 6-character OTP</label>
              <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} className="w-full text-center tracking-widest text-2xl font-mono px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white/50 uppercase" placeholder="XXXXXX" />
            </div>

            <button disabled={loading} type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default FacultyRegister;
