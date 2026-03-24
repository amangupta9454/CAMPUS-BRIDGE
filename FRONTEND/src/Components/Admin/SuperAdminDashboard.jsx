import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Users, GraduationCap, FileText, Activity, LogOut, ArrowRight, CheckCircle, Database, Search, Lock, AlertTriangle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ faculty: [], students: [], admins: [] });
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, logsRes] = await Promise.all([
         axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/superadmin/dashboard`, { headers }),
         axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/superadmin/users`, { headers }),
         axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/superadmin/logs`, { headers })
      ]);

      if(statsRes.data.success) setStats(statsRes.data.data);
      if(usersRes.data.success) setUsers(usersRes.data.data);
      if(logsRes.data.success) setLogs(logsRes.data.data);
    } catch (error) {
      toast.error('Failed to load SuperAdmin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, targetRole) => {
     if(!window.confirm(`Are you sure you want to promote this user to ${targetRole}?`)) return;
     
     try {
        const token = localStorage.getItem('token');
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/superadmin/role-update`, 
        { userId, userType: 'Faculty', targetRole }, 
        { headers: { Authorization: `Bearer ${token}` }});
        
        if(res.data.success) {
           toast.success(res.data.message);
           fetchData(); // refresh to show new roles and audit logs
        }
     } catch (err) {
        toast.error(err.response?.data?.message || 'Error updating role');
     }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
         <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 text-white mb-2">
               <ShieldAlert size={28} className="text-purple-500" />
               <h1 className="text-xl font-black tracking-tight">SuperAdmin</h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">Global Command Center</p>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <Activity size={18} /> Global Overview
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <Users size={18} /> User Access Control
            </button>
            <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <Database size={18} /> System Audit Logs
            </button>
         </nav>
         
         <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-800 rounded-xl border border-slate-700">
               <div className="w-8 h-8 rounded-full bg-purple-500 flex justify-center items-center text-white font-bold text-xs">{admin?.name?.[0] || 'S'}</div>
               <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{admin?.name}</p>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest">{admin?.role}</p>
               </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
               <LogOut size={18} /> Terminate Session
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
         {activeTab === 'overview' && stats && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
               <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800">System Analytics</h2>
                  <p className="text-slate-500">Real-time macro view of the entire CampusBridge infrastructure.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-5 p-4"><Users size={64}/></div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                     <p className="text-4xl font-black text-slate-800">{stats.totalStudents}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-5 p-4"><GraduationCap size={64}/></div>
                     <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Total Faculty</p>
                     <p className="text-4xl font-black text-purple-700">{stats.totalFaculty}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-5 p-4"><FileText size={64}/></div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Complaints</p>
                     <p className="text-4xl font-black text-slate-800">{stats.totalComplaints}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-5 p-4"><CheckCircle size={64}/></div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">NOC Requests</p>
                     <p className="text-4xl font-black text-slate-800">{stats.totalNocRequests}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Complaint Breakdown */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Complaint Lifecycle</h3>
                     <div className="space-y-3">
                        {stats.complaintTrends && stats.complaintTrends.length > 0 ? stats.complaintTrends.map((t, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                              <span className="font-bold text-slate-600">{t.name}</span>
                              <span className="px-3 py-1 bg-slate-100 rounded-full font-black text-slate-800">{t.value}</span>
                           </div>
                        )) : <p className="text-slate-400 text-sm italic">No data</p>}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'users' && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                     <h2 className="text-2xl font-black text-slate-800">Access Control</h2>
                     <p className="text-slate-500">Manage overrides and elevate privileges across the platform.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>
               </div>

               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                     <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Faculty Directory (Privilege Escalation)</h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="bg-slate-50 text-slate-500">
                              <th className="px-6 py-3 font-semibold text-xs uppercase">Name & Email</th>
                              <th className="px-6 py-3 font-semibold text-xs uppercase">Department</th>
                              <th className="px-6 py-3 font-semibold text-xs uppercase">Current Role</th>
                              <th className="px-6 py-3 font-semibold text-xs uppercase text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {users.faculty.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())).map(f => (
                              <tr key={f._id} className="hover:bg-slate-50/50">
                                 <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">{f.name}</p>
                                    <p className="text-xs text-slate-500">{f.email}</p>
                                 </td>
                                 <td className="px-6 py-4 text-slate-600">{f.department}</td>
                                 <td className="px-6 py-4 flex flex-col items-start gap-1">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded uppercase">{f.designation || 'Faculty'}</span>
                                    {users.admins.some(a => a.email === f.email) && <span className="px-2 py-0.5 bg-red-100 text-red-600 font-bold text-[10px] rounded uppercase flex items-center gap-1"><ShieldAlert size={10}/> Admin access</span>}
                                 </td>
                                 <td className="px-6 py-4 text-right space-x-2">
                                    {f.designation !== 'HOD' ? (
                                       <button onClick={() => handleRoleUpdate(f._id, 'HOD')} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold rounded-lg border border-indigo-200 hover:border-indigo-600 transition-colors">Make HOD</button>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-400 italic px-2">Is HOD</span>
                                    )}
                                    
                                    {!users.admins.some(a => a.email === f.email) ? (
                                       <button onClick={() => handleRoleUpdate(f._id, 'Admin')} className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-bold rounded-lg border border-red-200 hover:border-red-600 transition-colors">Grant Admin</button>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-400 italic px-2">Is Admin</span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                           {users.faculty.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">No faculty records found</td></tr>}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'audit' && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
               <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800">System Audit Logs</h2>
                  <p className="text-slate-500">Immutable trail of critical security and infrastructure events.</p>
               </div>

               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 relative">
                  <div className="absolute inset-y-0 left-10 w-0.5 bg-slate-100"></div>
                  <div className="space-y-6 relative z-10 pl-4 py-2">
                     {logs.length === 0 ? (
                        <p className="text-slate-400 text-sm italic pl-6">No audit logs recorded yet.</p>
                     ) : (
                        logs.map((log) => (
                           <div key={log._id} className="relative">
                              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white shadow-sm"></div>
                              <div className="ml-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                 <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                       <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] uppercase rounded border border-purple-200">{log.actionType}</span>
                                       <span className="text-xs font-bold text-slate-700">Modifying {log.targetModel} access</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{new Date(log.createdAt).toLocaleString()}</span>
                                 </div>
                                 <p className="text-sm text-slate-600">{log.details}</p>
                                 <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex items-center gap-2">
                                    <Lock size={12} className="text-slate-400"/> 
                                    <span className="text-slate-500">Authorized by: <span className="font-bold text-slate-700">{log.performedBy?.name || 'Unknown User'}</span> ({log.performedByModel})</span>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
