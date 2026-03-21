import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FileWarning, Search, User, LogOut, ArrowRight, ShieldCheck, Mail, Phone, Activity, Image as ImageIcon, X, Bell, PackageSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import StudentReportItem from './ReportItem';
import LostFoundList from '../LostFoundList';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Tracking Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  // Feedback State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      navigate('/student/login');
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, notifRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/complaint/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/student/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (notifRes.data.success) setNotifications(notifRes.data.notifications);
    } catch (error) {
       toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
     if(!window.confirm('Are you sure you want to withdraw this complaint? No further action will be taken.')) return;
     try {
        setWithdrawLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/complaint/withdraw/${id}`, {}, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) {
           toast.success('Complaint withdrawn successfully');
           setSelectedComplaint(res.data.complaint);
           fetchData();
        }
     } catch(err) {
        toast.error(err.response?.data?.message || 'Error withdrawing complaint');
     } finally {
        setWithdrawLoading(false);
     }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if(rating === 0) return toast.error('Please select a star rating');
    try {
       setFeedbackLoading(true);
       const token = localStorage.getItem('token');
       const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/complaint/feedback/${selectedComplaint._id}`, 
       { rating, comment }, 
       { headers: { Authorization: `Bearer ${token}` }});
       
       if(res.data.success) {
          toast.success('Feedback submitted successfully!');
          setSelectedComplaint(res.data.complaint);
          fetchData();
       }
    } catch(err) {
       toast.error(err.response?.data?.message || 'Error submitting feedback');
    } finally {
       setFeedbackLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    toast.success('Logged out successfully');
    navigate('/student/login');
  };

  const getPriorityColor = (priority) => {
     if (priority === 'High') return 'bg-red-100 text-red-700 border-red-200';
     if (priority === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
     return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getStatusStyle = (status) => {
     switch(status) {
       case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-300';
       case 'In Progress': return 'bg-sky-100 text-sky-700 border-sky-300';
       case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
       case 'Rejected': return 'bg-red-100 text-red-700 border-red-300';
       case 'Delayed': return 'bg-amber-100 text-amber-700 border-amber-300';
       case 'Withdrawn': return 'bg-slate-200 text-slate-500 border-slate-400';
       default: return 'bg-slate-100 text-slate-700 border-slate-200';
     }
  };

  // --------------------------------------------------------------------------
  // Analytics Crunching
  // --------------------------------------------------------------------------
  const analyticsData = useMemo(() => {
    if (!complaints.length) return null;

    const statusObj = {};
    let resolvedCount = 0;

    complaints.forEach(c => {
      statusObj[c.status] = (statusObj[c.status] || 0) + 1;
      if(c.status === 'Resolved') resolvedCount++;
    });

    return {
      total: complaints.length,
      resolvedRate: Math.round((resolvedCount / complaints.length) * 100),
      status: Object.keys(statusObj).map(k => ({ name: k, value: statusObj[k] })).filter(d => d.value > 0)
    };
  }, [complaints]);

  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#64748b'];

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                CB
              </div>
              <div>
                 <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Student Portal</h1>
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">CampusBridge</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Notifications Dropdown */}
               <div className="relative">
                 <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
                    <Bell size={20} />
                     {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                     )}
                 </button>
                 
                 {isNotifOpen && (
                   <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                     <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Notifications</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{notifications.length}</span>
                     </div>
                     <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-6 text-center text-sm text-slate-400">No new notifications</div>
                        ) : (
                           notifications.map(n => (
                              <div key={n._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                 <p className="text-xs font-bold text-slate-700 mb-1">{n.title}</p>
                                 <p className="text-xs text-slate-500">{n.message}</p>
                                 <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                           ))
                        )}
                     </div>
                   </div>
                 )}
               </div>

               <div className="w-px h-8 bg-slate-200"></div>

               <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
             
             <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                  {student?.profileImage ? (
                    <img src={student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={40}/></div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Hello, {student?.name}! 👋</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                     <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md"><ShieldCheck size={14}/> {student?.studentId}</span>
                     <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md"><Mail size={14}/> {student?.email}</span>
                     <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md"><Phone size={14}/> {student?.mobile}</span>
                  </div>
                </div>
             </div>

             <div className="w-full md:w-auto">
                <button 
                  onClick={() => navigate('/student/complaint/new')}
                  className="w-full md:w-auto flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                >
                   <FileWarning size={18} /> Register New Complaint
                </button>
             </div>

          </div>
        </div>

        {/* Analytics Section */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Activity size={28}/></div>
              <p className="text-4xl font-black text-slate-800">{analyticsData.total}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Total Filed</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 md:col-span-2 flex items-center gap-6">
              <div className="w-1/3">
                 <h3 className="font-bold text-slate-700 text-sm mb-1">Your Portfolio</h3>
                 <p className="text-xs text-slate-500 mb-4">{analyticsData.resolvedRate}% resolution rate overall resolving your complaints!</p>
              </div>
              <div className="w-2/3 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.status} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} width={80} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                      {analyticsData.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <Search size={18} className="text-slate-400"/> My Active Complaints
              </h2>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6 font-bold">Complaint ID</th>
                    <th className="py-4 px-6 font-bold">Title & Details</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                 {complaints.length === 0 ? (
                   <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <div className="inline-block p-4 bg-slate-50 rounded-full text-slate-300 mb-3"><Search size={32}/></div>
                        <p className="text-slate-500 font-medium">You haven't filed any complaints yet.</p>
                      </td>
                   </tr>
                 ) : (
                   complaints.map(c => (
                     <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 align-top">
                           <p className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">{c.complaintId || c._id.slice(-6)}</p>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold">{new Date(c.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6 align-top max-w-sm">
                           <p className="font-bold text-slate-800 text-sm truncate">{c.title}</p>
                           <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.category || 'Other'}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                           <span className={`inline-block px-2.5 py-1 rounded-md border text-xs font-bold ${getStatusStyle(c.status)}`}>
                             {c.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 align-top text-right">
                           <button 
                             onClick={() => setSelectedComplaint(c)}
                             className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-colors"
                           >
                              <ArrowRight size={16}/>
                           </button>
                        </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* TRACKING MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
              
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">{selectedComplaint.complaintId}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 border rounded-md ${getStatusStyle(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
                 </div>
                 <button onClick={() => { setSelectedComplaint(null); setRating(0); setComment(''); }} className="p-1.5 bg-white text-slate-400 hover:text-slate-800 rounded-full shadow-sm hover:shadow-md transition-all">
                    <X size={20}/>
                 </button>
              </div>

              <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                 
                 {/* Left Body Context */}
                 <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 bg-white space-y-8">
                    
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 mb-2">{selectedComplaint.title}</h2>
                      <div className="prose prose-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                         {selectedComplaint.description}
                      </div>
                    </div>

                    {/* Faculty Profile Visible to Student */}
                    {selectedComplaint.assignedFaculty && (
                       <div className="flex flex-col gap-4">
                           <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white flex items-center gap-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-5"><User size={60}/></div>
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 flex-shrink-0">
                                {selectedComplaint.assignedFaculty.profileImage ? (
                                   <img src={selectedComplaint.assignedFaculty.profileImage} className="w-full h-full object-cover" alt="Faculty" />
                                ) : (
                                   <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500"><User size={20}/></div>
                                )}
                              </div>
                              <div className="z-10">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Assigned Faculty</p>
                                <p className="text-sm font-bold text-slate-800">{selectedComplaint.assignedFaculty.name}</p>
                                <p className="text-xs text-slate-500">{selectedComplaint.assignedFaculty.designation}, {selectedComplaint.assignedFaculty.department}</p>
                              </div>
                           </div>
                           
                           {/* Render Faculty's Feedback if available */}
                           {selectedComplaint.facultyFeedback?.rating && (
                               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-3 opacity-10"><User size={40}/></div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Faculty Evaluation Note</p>
                                  <div className="flex gap-1 mb-2">
                                    {[1,2,3,4,5].map(star => (
                                      <svg key={star} className={`w-4 h-4 ${star <= selectedComplaint.facultyFeedback.rating ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    ))}
                                  </div>
                                  <p className="text-sm text-slate-700 italic">"{selectedComplaint.facultyFeedback.comment}"</p>
                               </div>
                           )}
                       </div>
                    )}

                    {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                           <ImageIcon size={14}/> Attached Evidence
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           {selectedComplaint.images.map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors">
                                 <img src={img} alt={`Provable Evidence ${idx}`} className="w-full h-full object-cover" />
                              </a>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Form for Student to leave StudentFeedback dynamically */}
                    {['Resolved', 'Rejected', 'Withdrawn'].includes(selectedComplaint.status) && (
                       <div className="mt-8 border-t border-slate-100 pt-8 relative">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">Evaluate your Experience</h4>
                          
                          {selectedComplaint.studentFeedback?.rating ? (
                             <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-xl">
                               <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-2">Your Evaluation</p>
                               <div className="flex gap-1 mb-2">
                                  {[1,2,3,4,5].map(star => (
                                    <svg key={star} className={`w-5 h-5 ${star <= selectedComplaint.studentFeedback.rating ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                  ))}
                               </div>
                               <p className="text-sm text-yellow-900">"{selectedComplaint.studentFeedback.comment}"</p>
                             </div>
                          ) : (
                             <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                               <div className="flex gap-2">
                                  {[1,2,3,4,5].map(star => (
                                    <button 
                                      type="button" 
                                      key={star} 
                                      onClick={() => setRating(star)}
                                      className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                       <svg className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    </button>
                                  ))}
                               </div>
                               <textarea 
                                 rows={2} 
                                 required
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all resize-none"
                                 placeholder="Leave a comment about your experience..."
                                 value={comment}
                                 onChange={e => setComment(e.target.value)}
                               ></textarea>
                               <button disabled={feedbackLoading} type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors disabled:opacity-70">
                                  {feedbackLoading ? 'Submitting...' : 'Submit Evaluation'}
                               </button>
                             </form>
                          )}
                       </div>
                    )}

                 </div>

                 {/* Right Stepper Timeline */}
                 <div className="md:w-2/5 p-6 bg-slate-50/50 flex flex-col items-center">
                    
                    {!['Resolved', 'Rejected', 'Withdrawn'].includes(selectedComplaint.status) && (
                       <button
                         onClick={() => handleWithdraw(selectedComplaint._id)}
                         disabled={withdrawLoading}
                         className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50 mb-6"
                       >
                          {withdrawLoading ? 'Withdrawing...' : 'Withdraw Complaint'}
                       </button>
                    )}

                    <div className="w-full flex-grow overflow-y-auto">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                         <Activity size={14}/> Timeline Record
                       </h4>
                       <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-slate-200">
                          {selectedComplaint.history && selectedComplaint.history.map((step, idx) => (
                             <div key={idx} className="relative flex items-start w-full transition-all hover:-translate-y-0.5 group">
                                <div className={`absolute left-[11px] -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full border-4 z-10 mt-1
                                  ${step.status === selectedComplaint.status ? 'bg-indigo-600 border-indigo-200 ring-4 ring-indigo-50' : 'bg-white border-slate-300'}
                                `}></div>
                                
                                <div className="w-full ml-8 pb-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className={`text-sm font-bold ${step.status === selectedComplaint.status ? 'text-indigo-600' : 'text-slate-700'}`}>
                                      {step.status}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed max-w-[90%]">{step.message}</p>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2 inline-block">
                                    {new Date(step.timestamp).toLocaleString(undefined, {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                    })}
                                  </span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}
      {/* ── Lost & Found Section ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <PackageSearch size={22} className="text-amber-600" />
          <h2 className="text-xl font-black text-slate-800">Lost & Found</h2>
          <span className="ml-2 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Campus Items</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StudentReportItem onSuccess={() => {}} />
          </div>
          <div className="lg:col-span-2">
            <LostFoundList canReturn={false} compact={false} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
