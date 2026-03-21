import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, FileWarning, Upload, X, ArrowLeft, Send } from 'lucide-react';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: '',
    description: '',
    remark: ''
  });

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      navigate('/student/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total count
    if (images.length + files.length > 3) {
      return toast.error('Maximum 3 images allowed');
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        return toast.error(`File ${file.name} is not an image (NO PDF allowed)`);
      }
      if (file.size > 5 * 1024 * 1024) {
        return toast.error(`File ${file.name} exceeds 5MB`);
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = null; // Reset input
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) return toast.error('Minimum 1 evidence image is required');
    if (images.length > 3) return toast.error('Maximum 3 images allowed');

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('category', formData.category);
    submitData.append('priority', formData.priority);
    submitData.append('description', formData.description);
    if (formData.remark) submitData.append('remark', formData.remark);
    
    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/complaint/create`, submitData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success(`Complaint Submitted! ID: ${res.data.complaint.complaintId}`);
        navigate('/student/dashboard');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2"><FileWarning size={24}/> Register a New Complaint</h1>
              <p className="opacity-90 mt-1">Provide clear evidence and details to help us resolve the issue swiftly.</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* Left Column - Readonly Info */}
              <div className="p-8 bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 mb-6 text-lg">Complainant Details</h3>
                 <p className="text-xs text-slate-500 mb-8">*Your identity remains hidden from the resolving faculty.</p>

                 <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><User size={14}/> Student Info</label>
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">{student.studentId || 'ID Not Generated'}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Mail size={14}/> Email Address</label>
                      <p className="font-medium text-slate-700">{student.email}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Phone size={14}/> Mobile Number</label>
                      <p className="font-medium text-slate-700">+91 {student.mobile || 'XXXXX XXXXX'}</p>
                    </div>
                 </div>
              </div>

              {/* Right Column - Form */}
              <div className="p-8 lg:col-span-2">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Complaint Title <span className="text-red-500">*</span></label>
                      <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="E.g. Projector not working in Room 302" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                          <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white">
                            <option value="">Select Category</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Academic">Academic</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Technical">Technical</option>
                            <option value="Other">Other</option>
                          </select>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700">Priority Level <span className="text-red-500">*</span></label>
                          <select required name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white">
                            <option value="">Select Priority</option>
                            <option value="High">🔴 High (24 Hrs SLA)</option>
                            <option value="Medium">🟡 Medium (72 Hrs SLA)</option>
                            <option value="Low">🟢 Low (7 Days SLA)</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Detailed Description <span className="text-red-500">*</span></label>
                      <textarea required rows={4} name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none" placeholder="Explain the issue clearly..." />
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                         <span>Evidence Files <span className="text-red-500">*</span></span>
                         <span className="text-xs font-normal text-slate-500">{images.length}/3 Uploaded (Images Only)</span>
                       </label>
                       
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {imagePreviews.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-md">
                                <X size={14} />
                              </button>
                            </div>
                          ))}

                          {images.length < 3 && (
                            <label className="aspect-square rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-indigo-400 hover:text-indigo-600">
                               <Upload size={24} className="mb-2" />
                               <span className="text-xs font-medium">Upload Image</span>
                               <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                          )}
                       </div>
                    </div>

                    <div className="space-y-1 border-t border-slate-100 pt-6">
                      <label className="text-sm font-semibold text-slate-700">Remarks / Extra Notes (Optional)</label>
                      <input type="text" name="remark" value={formData.remark} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm" placeholder="Any specific availability times or additional context..." />
                    </div>

                    <div className="pt-4">
                      <button disabled={loading} type="submit" className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? 'Submitting secure claim...' : <><Send size={18}/> Submit Complaint</>}
                      </button>
                    </div>

                 </form>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintForm;
