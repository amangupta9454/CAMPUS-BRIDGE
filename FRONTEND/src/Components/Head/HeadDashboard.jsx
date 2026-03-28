import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle, FileWarning, Search, User, X, BadgeInfo, Image as ImageIcon, Activity, PieChart as PieChartIcon, BarChart2, PackageSearch, BookOpen, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import FacultyReportItem from '../Faculty/ReportItem';
import LostFoundList from '../LostFoundList';
import SlaTimer from '../SlaTimer';

const HeadDashboard = () => {
  const navigate = useNavigate();
  const [head, setHead] = useState(null);
  const [stats, setStats] = useState({ total: 0, highPriority: 0, pending: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // HOD Assignment State
  const [colleagues, setColleagues] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const storedHead = localStorage.getItem('head');
    if (storedHead) {
      setHead(JSON.parse(storedHead));
    } else {
      navigate('/head/login');
    }
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredComplaints(complaints.filter(c => 
        (c.complaintId || c._id).toLowerCase().includes(lowerQ) ||
        (c.title || '').toLowerCase().includes(lowerQ)
      ));
    } else {
      setFilteredComplaints(complaints);
    }
  }, [searchQuery, complaints]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/head/login');
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/head/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
        setComplaints(res.data.complaints);
        setFilteredComplaints(res.data.complaints);
      }

      // Fetch colleagues separately — a failure here shouldn't break the main dashboard
      try {
        const colRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/head/colleagues`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (colRes.data.success) setColleagues(colRes.data.faculty);
      } catch (colErr) {
        console.error('Failed to load faculty list:', colErr.message);
      }

    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('head');
        navigate('/head/login');
      } else {
        toast.error('Failed to load complaints');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedColleague) return toast.error('Select a faculty member first');
    try {
      setAssignLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/head/assign-complaint/${selectedComplaint._id}`,
        { facultyId: selectedColleague },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setIsAssignModalOpen(false);
        fetchDashboardData();
        setSelectedComplaint(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error assigning complaint');
    } finally {
      setAssignLoading(false);
    }
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

  const checkSLA = (complaint) => {
    if (['Resolved', 'Rejected', 'Withdrawn'].includes(complaint.status)) return null;
    const createdAt = new Date(complaint.createdAt).getTime();
    const now = Date.now();
    const hoursPassed = (now - createdAt) / (1000 * 60 * 60);

    let slaLimit = 0;
    if (complaint.priority === 'High') slaLimit = 24;
    else if (complaint.priority === 'Medium') slaLimit = 72;
    else slaLimit = 168; // 7 days

    const isOverdue = hoursPassed > slaLimit;
    const hoursLeft = Math.max(0, Math.floor(slaLimit - hoursPassed));

    return {
      isOverdue,
      text: isOverdue ? 'Overdue SLAs!' : `${hoursLeft}h left (SLA)`
    };
  };

  const analyticsData = useMemo(() => {
    if (!complaints.length) return null;

    const statusObj = { Pending:0, 'In Progress':0, Resolved:0, Delayed:0, Rejected:0, Withdrawn:0 };
    const priorityObj = { High:0, Medium:0, Low:0 };
    const categoryObj = {};

    complaints.forEach(c => {
      if(statusObj[c.status] !== undefined) statusObj[c.status]++;
      else statusObj[c.status] = 1;
      
      if(priorityObj[c.priority] !== undefined) priorityObj[c.priority]++;
      else priorityObj[c.priority] = 1;
      
      const cat = c.category || 'Other';
      categoryObj[cat] = (categoryObj[cat] || 0) + 1;
    });

    return {
      status: Object.keys(statusObj).map(k => ({ name: k, value: statusObj[k] })).filter(d => d.value > 0),
      priority: Object.keys(priorityObj).map(k => ({ name: k, value: priorityObj[k] })).filter(d => d.value > 0),
      category: Object.keys(categoryObj).map(k => ({ name: k, value: categoryObj[k] })).sort((a,b)=> b.value - a.value)
    };
  }, [complaints]);

  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#64748b'];
  const PRIORITY_COLORS = { 'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#10b981' };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Head ID Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
        <BadgeInfo className="text-blue-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-blue-800">Your Official Head ID</h3>
          <p className="text-xs text-blue-600 mt-1 font-mono bg-blue-100/50 inline-block px-2 py-1 rounded">
            {head?.headId || 'Fetching...'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Sector Head Workspace
          </h1>
          <p className="text-slate-500 mt-1 mb-4">
            Manage departmental and sector complaints anonymously and assign workloads to faculty.
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-red-100 border-2 border-red-200 overflow-hidden flex items-center justify-center">
            {head?.profileImage ? (
              <img src={head.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-red-600" />
            )}
        </div>
      </div>

      {/* Analytics Dashboard Matrix (Realtime Recharts) */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Chart 1: Category Bar Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
             <div className="flex items-center gap-2 mb-6">
               <BarChart2 className="text-slate-400" size={20}/>
               <h3 className="font-bold text-slate-700">Complaint Volumes by Category</h3>
             </div>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analyticsData.category} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                   <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40}>
                     {analyticsData.category.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Chart 2: Status/Priority Radial Combo */}
           <div className="grid grid-rows-2 gap-6">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="text-slate-400" size={16}/>
                  <h3 className="font-bold text-slate-700 text-sm">Status Dist.</h3>
                </div>
                <div className="h-32">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={analyticsData.status} innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                         {analyticsData.status.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-slate-400" size={16}/>
                  <h3 className="font-bold text-slate-700 text-sm">Priorities</h3>
                </div>
                <div className="h-32">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={analyticsData.priority} outerRadius={50} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                         {analyticsData.priority.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#64748b'} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
           </div>
           
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center"><FileWarning size={20}/></div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
           </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Activity size={20}/></div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{stats.highPriority}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Priority</p>
           </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center"><Clock size={20}/></div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
           </div>
         </div>
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle size={20}/></div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
           </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Complaint Queue</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID or Title..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                   <th className="pb-3 px-2 font-bold">ID & Date</th>
                   <th className="pb-3 px-2 font-bold">Title & Category</th>
                   <th className="pb-3 px-2 font-bold">Priority</th>
                   <th className="pb-3 px-2 font-bold">Status</th>
                   <th className="pb-3 px-2 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-500 italic">No complaints found.</td></tr>
                ) : (
                  filteredComplaints.map((c) => {
                    const sla = checkSLA(c);
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-4 px-2 align-top">
                          <p className="font-mono text-xs font-bold text-slate-600">{c.complaintId || c._id.slice(-6)}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-2 align-top max-w-xs">
                          <p className="font-semibold text-slate-800 text-sm truncate pr-4">{c.title}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">{c.category || 'Other'}</span>
                        </td>
                        <td className="py-4 px-2 align-top">
                          <span className={`inline-block px-2.5 py-1 rounded border text-xs font-bold ${getPriorityColor(c.priority)}`}>
                            {c.priority || 'Medium'}
                          </span>
                          <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {c.assignedFaculty ? `Assigned to: ${c.assignedFaculty?.name}` : <span className="text-amber-600">Unassigned</span>}
                          </div>
                        </td>
                        <td className="py-4 px-2 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getStatusStyle(c.status)}`}>
                              {c.status}
                            </span>
                            <SlaTimer deadline={c.slaDeadline || c.createdAt} status={c.status} compact />
                            {c.escalatedToAdmin && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">🚨 ESCALATED</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 align-top text-right">
                          <button 
                            onClick={() => { setSelectedComplaint(c); }}
                            className="text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:border-red-300 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors inline-block"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Review Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center z-10">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded font-mono">{selectedComplaint.complaintId}</span>
                <span className={`text-xs font-bold px-2 py-1 border rounded ${getStatusStyle(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
              </div>
              <button onClick={() => { setSelectedComplaint(null); }} className="text-slate-400 hover:text-slate-800 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="flex flex-col md:flex-row overflow-hidden flex-grow">
               
               {/* Left Context */}
               <div className="md:w-3/5 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 bg-white">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedComplaint.title}</h2>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
                    {selectedComplaint.description}
                  </div>

                   <div className="mb-6">
                     <SlaTimer deadline={selectedComplaint.slaDeadline || selectedComplaint.createdAt} status={selectedComplaint.status} />
                   </div>

                  {selectedComplaint.remark && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                       <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Anonymous Student Note</p>
                       <p className="text-sm text-amber-700">{selectedComplaint.remark}</p>
                    </div>
                  )}

                  {/* Evidence Viewer */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                       <ImageIcon size={14}/> Evidence Provided ({selectedComplaint.images?.length || 0})
                    </h4>
                    {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                       <div className="grid grid-cols-2 gap-3">
                         {selectedComplaint.images.map((img, idx) => (
                           <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 hover:border-red-400 transition-colors cursor-zoom-in">
                             <img src={img} alt={`Provable Evidence ${idx}`} className="w-full h-full object-cover" />
                           </a>
                         ))}
                       </div>
                    ) : (
                       <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">No media attached.</p>
                    )}
                  </div>
               </div>

               {/* Right Actions & Timeline */}
               <div className="md:w-2/5 flex flex-col bg-slate-50/50">
                  <div className="p-6 border-b border-slate-100 bg-white space-y-3">
                      <button 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <User size={18}/> Assign to Faculty
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-grow">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                       <Activity size={14}/> Activity Log
                     </h4>
                     
                     <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-slate-200">
                       {selectedComplaint.history && selectedComplaint.history.map((step, idx) => (
                         <div key={idx} className="relative flex items-start w-full">
                           <div className="absolute left-[11px] -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-white border-4 border-slate-300 z-10 mt-0.5"></div>
                           
                           <div className="w-full ml-8 shadow-sm border border-slate-100 rounded-xl p-3 bg-white">
                             <div className="flex justify-between items-start mb-1">
                               <h4 className={`text-xs font-bold ${step.status === 'Resolved'? 'text-emerald-600': step.status==='Rejected'?'text-red-600':'text-slate-800'}`}>
                                 {step.status}
                               </h4>
                               <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(step.timestamp).toLocaleDateString()}</span>
                             </div>
                             <p className="text-xs text-slate-500 leading-relaxed mb-1.5">{step.message}</p>
                             <div className="flex justify-between items-center border-t border-slate-50 pt-1.5">
                               <span className="text-[10px] text-slate-400 font-medium">By: {step.updatedBy || 'System'}</span>
                             </div>
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

      {/* HOD Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-800">Assign Complaint</h3>
               <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 justify-center rounded-full"><X size={20}/></button>
             </div>

             <form onSubmit={handleAssignSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Select Faculty</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={selectedColleague} 
                      onChange={e => setSelectedColleague(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white appearance-none"
                    >
                      <option value="" disabled>Choose a faculty member...</option>
                      {colleagues.map(col => (
                        <option key={col._id} value={col._id}>{col.name} ({col.department})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button disabled={assignLoading} type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center disabled:opacity-70 gap-2">
                   {assignLoading ? 'Assigning...' : <><User size={18}/> Confirm Assignment</>}
                </button>
             </form>
           </div>
        </div>
      )}

      {/* ── Lost & Found Section ─────────────────────────────────────── */}
      {/* Heads might want to see L&F too */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <PackageSearch size={22} className="text-amber-600" />
          <h2 className="text-xl font-black text-slate-800">Lost & Found</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-1">
            <LostFoundList canReturn={true} compact={false} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeadDashboard;
