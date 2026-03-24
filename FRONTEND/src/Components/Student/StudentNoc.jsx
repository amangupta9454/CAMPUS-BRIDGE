import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FileText, ArrowLeft, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentNoc = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    documentType: 'NOC',
    name: '',
    course: '',
    branch: '',
    year: '',
    session: '',
    reason: '',
    description: ''
  });
  const [idCard, setIdCard] = useState(null);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
       const parsedUser = JSON.parse(storedStudent);
       setStudent(parsedUser);
       // Pre-fill name
       setFormData(prev => ({ ...prev, name: parsedUser.name }));
       fetchRequests();
    } else {
       navigate('/student/login');
    }
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/noc/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data.success) {
         setRequests(res.data.data);
      }
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idCard) return toast.error('Please upload your ID card');

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
    submitData.append('idCard', idCard);

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/noc/create`, submitData, {
        headers: { 
           Authorization: `Bearer ${token}`,
           'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
         toast.success('Request submitted successfully');
         setShowForm(false);
         fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
     switch(status) {
        case 'Pending_HOD': return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold text-xs"><Clock size={14}/> Pending HOD</span>;
        case 'Approved_HOD': return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-bold text-xs"><CheckCircle size={14}/> Approved by HOD, Pending Admin</span>;
        case 'Rejected_HOD': return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-xs"><XCircle size={14}/> Rejected by HOD</span>;
        case 'Approved_Admin': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold text-xs"><CheckCircle size={14}/> Approved</span>;
        case 'Rejected_Admin': return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-xs"><XCircle size={14}/> Rejected by Admin</span>;
        default: return null;
     }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <FileText size={20} className="text-indigo-500"/> Document Workflows (NOC/No Dues)
            </h2>
         </div>
         <button 
           onClick={() => setShowForm(!showForm)}
           className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
         >
            {showForm ? 'Cancel Request' : '+ New Request'}
         </button>
      </div>

      <div className="p-6">
         {showForm ? (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Document Type</label>
                     <select name="documentType" value={formData.documentType} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
                        <option value="NOC">NOC</option>
                        <option value="No Dues">No Dues</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
                     <input required readOnly name="name" value={formData.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Course</label>
                     <input required name="course" value={formData.course} onChange={handleInputChange} placeholder="e.g. B.Tech" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Branch</label>
                     <input required name="branch" value={formData.branch} onChange={handleInputChange} placeholder="e.g. CSE" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Year</label>
                     <input required name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g. 3rd Year" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700">Session</label>
                     <input required name="session" value={formData.session} onChange={handleInputChange} placeholder="e.g. 2022-2026" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Reason</label>
                  <input required name="reason" value={formData.reason} onChange={handleInputChange} placeholder="Brief reason for document..." className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
               </div>

               <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Explain why you need this document..." className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none resize-none" />
               </div>

               <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Upload Student ID Card (Image Format)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 bg-slate-50 transition-colors">
                     <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-10 w-10 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                           <span>Upload a file</span>
                           <input accept="image/*" type="file" required className="sr-only" onChange={(e) => setIdCard(e.target.files[0])} />
                        </label>
                        </div>
                        <p className="text-xs text-slate-500">{idCard ? idCard.name : 'PNG, JPG, GIF up to 5MB'}</p>
                     </div>
                  </div>
               </div>

               <button disabled={submitting} type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Request'}
               </button>
            </form>
         ) : (
            <div className="space-y-4">
               {requests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No document requests found.</div>
               ) : (
                  requests.map(req => (
                     <div key={req._id} className="p-5 border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all bg-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="font-black text-slate-800 text-lg">{req.documentType}</h3>
                                 <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-600 font-medium">{req.reason}</p>
                           </div>
                           <div>{getStatusDisplay(req.status)}</div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-100">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Details</p>
                                 <p className="font-medium text-slate-700 truncate">{req.description}</p>
                              </div>
                              {req.collectionDate && req.status === 'Approved_Admin' && (
                                 <div>
                                    <p className="text-xs text-emerald-600 font-black uppercase mb-0.5 animate-pulse">Collection Info</p>
                                    <p className="font-bold text-emerald-800">Visit Admin Office on {new Date(req.collectionDate).toDateString()}</p>
                                 </div>
                              )}
                              {(req.hodRemarks || req.adminRemarks) && (
                                 <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Official Remarks</p>
                                    {req.hodRemarks && <p className="text-slate-700"><span className="font-bold text-slate-500">HOD:</span> {req.hodRemarks}</p>}
                                    {req.adminRemarks && <p className="text-slate-700"><span className="font-bold text-slate-500">Admin:</span> {req.adminRemarks}</p>}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default StudentNoc;
