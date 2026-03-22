import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, FileText, Bell, LogOut,
  Search, X, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, Clock, ShieldAlert, RefreshCw, Menu,
  BarChart3, TrendingUp, Lock, PackageSearch
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import LostFoundList from '../LostFoundList';
import SlaTimer from '../SlaTimer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app';
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const CLOSED = ['Resolved', 'Rejected', 'Withdrawn'];

const STATUS_COLORS = {
  Pending:      'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress':'bg-blue-50 text-blue-700 border-blue-200',
  Resolved:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Delayed:      'bg-orange-50 text-orange-700 border-orange-200',
  Rejected:     'bg-red-50 text-red-700 border-red-200',
  Withdrawn:    'bg-slate-100 text-slate-600 border-slate-200',
  Objection:    'bg-purple-50 text-purple-700 border-purple-200',
};

const PRIORITY_DOT = { Critical: 'bg-purple-600', High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };
const PRIORITY_BADGE = {
  Critical: 'bg-purple-50 text-purple-700 border-purple-200',
  High:   'bg-red-50 text-red-600 border-red-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low:    'bg-emerald-50 text-emerald-600 border-emerald-200',
};

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, bg, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-all hover:-translate-y-0.5">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-slate-800">{value ?? '—'}</p>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── SLA Badge ─────────────────────────────────────────────────────────── */
const SLABadge = ({ slaStatus }) => {
  if (!slaStatus || slaStatus === 'closed' || slaStatus === 'ok') return null;
  if (slaStatus === 'overdue') return (
    <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 animate-pulse">OVERDUE</span>
  );
  return <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 border border-orange-200">DUE SOON</span>;
};

/* ── Info Row ──────────────────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  value ? (
    <div className="flex gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-700 font-medium break-all">{value}</span>
    </div>
  ) : null
);

/* ── Complaint Detail / Manage Modal ───────────────────────────────────── */
const ComplaintModal = ({ complaint, faculty, onClose, onUpdate }) => {
  const [tab, setTab] = useState('details');
  const [status, setStatus] = useState(complaint.status);
  const [reason, setReason] = useState('');
  const [assignId, setAssignId] = useState(complaint.assignedFaculty?._id || '');
  const [loading, setLoading] = useState(false);

  const isLocked = complaint.isLocked || CLOSED.includes(complaint.status);
  const needsReason = ['Delayed', 'Rejected'].includes(status);

  const handleUpdate = async () => {
    if (isLocked) return toast.error('This complaint is closed and cannot be modified.');
    if (needsReason && !reason.trim()) return toast.error('Reason is required');
    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/api/admin/complaint/update/${complaint._id}`, { status, reason }, authHeader());
      toast.success('Status updated');
      onUpdate(); onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (isLocked) return toast.error('This complaint is closed.');
    if (!assignId) return toast.error('Select a faculty member');
    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/api/admin/complaint/assign/${complaint._id}`, { facultyId: assignId }, authHeader());
      toast.success('Faculty assigned');
      onUpdate(); onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-800">{complaint.complaintId}</h2>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${STATUS_COLORS[complaint.status]}`}>{complaint.status}</span>
              {isLocked && <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md"><Lock size={11}/> Locked</span>}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">{complaint.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={18}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
          {['details', 'complainant', 'manage'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {t === 'complainant' ? 'complainant' : t}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ── Details Tab ── */}
          {tab === 'details' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
                <InfoRow label="ID" value={complaint.complaintId} />
                <InfoRow label="Title" value={complaint.title} />
                <InfoRow label="Category" value={complaint.category} />
                <InfoRow label="Priority" value={complaint.priority} />
                <InfoRow label="Status" value={complaint.status} />
                <InfoRow label="Submitted" value={new Date(complaint.createdAt).toLocaleString()} />
                {complaint.deadline && <InfoRow label="SLA Due" value={new Date(complaint.deadline).toLocaleString()} />}
                {complaint.delayReason && <InfoRow label="Delay Reason" value={complaint.delayReason} />}
                {complaint.rejectReason && <InfoRow label="Reject Reason" value={complaint.rejectReason} />}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-xs text-slate-700 leading-relaxed">{complaint.description}</p>
                {complaint.remark && <p className="text-xs text-slate-500 mt-2 italic">Student Remark: {complaint.remark}</p>}
              </div>

              {/* Assigned Faculty */}
              {complaint.assignedFaculty && (
                <div className="bg-indigo-50 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Assigned Faculty</p>
                  <InfoRow label="Name" value={complaint.assignedFaculty.name} />
                  <InfoRow label="Email" value={complaint.assignedFaculty.email} />
                  <InfoRow label="Dept" value={complaint.assignedFaculty.department} />
                  <InfoRow label="Desig." value={complaint.assignedFaculty.designation} />
                  <InfoRow label="Mobile" value={complaint.assignedFaculty.mobile} />
                  <InfoRow label="Faculty ID" value={complaint.assignedFaculty.facultyId} />
                </div>
              )}

              {/* History */}
              {complaint.history?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Activity History</p>
                  <div className="space-y-2">
                    {complaint.history.map((h, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{h.status}</p>
                          <p className="text-[11px] text-slate-500">{h.message}</p>
                          {h.reason && <p className="text-[11px] text-slate-400 italic">Reason: {h.reason}</p>}
                          <p className="text-[10px] text-slate-300 mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Complainant Tab ── */}
          {tab === 'complainant' && (
            <div className="space-y-4">
              {complaint.student ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-200">
                      {complaint.student.name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{complaint.student.name}</p>
                      <p className="text-xs text-slate-500">{complaint.student.email}</p>
                    </div>
                  </div>
                  <InfoRow label="Mobile" value={complaint.student.mobile} />
                  <InfoRow label="Course" value={complaint.student.course} />
                  <InfoRow label="Branch" value={complaint.student.branch} />
                  <InfoRow label="Year" value={complaint.student.year} />
                  <InfoRow label="Student ID" value={complaint.student.studentId} />
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Users size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Student data not available</p>
                </div>
              )}

              {/* Feedback */}
              {complaint.studentFeedback?.rating && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Student Feedback</p>
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${s <= complaint.studentFeedback.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                    <span className="text-xs text-slate-500 ml-1">({complaint.studentFeedback.rating}/5)</span>
                  </div>
                  {complaint.studentFeedback.comment && <p className="text-xs text-slate-600 italic">"{complaint.studentFeedback.comment}"</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Manage Tab ── */}
          {tab === 'manage' && (
            <div className="space-y-4">
              {isLocked ? (
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <Lock size={20} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-600 text-sm">Complaint Locked</p>
                    <p className="text-xs text-slate-400 mt-0.5">Status is <strong>{complaint.status}</strong> — no further modifications are allowed on closed complaints.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Change Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                    >
                      {['Pending', 'In Progress', 'Resolved', 'Delayed', 'Rejected'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {needsReason && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reason <span className="text-red-500">*</span></label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        placeholder="Required for Delayed / Rejected..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {loading ? 'Updating...' : 'Update Status'}
                  </button>

                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Assign / Reassign Faculty</label>
                    <div className="flex gap-2">
                      <select
                        value={assignId}
                        onChange={e => setAssignId(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                      >
                        <option value="">Select faculty...</option>
                        {faculty.map(f => (
                          <option key={f._id} value={f._id}>{f.name} — {f.department}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={loading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-60"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState({ pending: [], overdue: [] });
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [stuPage, setStuPage] = useState(1); const [stuTotal, setStuTotal] = useState(0);
  const [facPage, setFacPage] = useState(1); const [facTotal, setFacTotal] = useState(0);
  const [cmpPage, setCmpPage] = useState(1); const [cmpTotal, setCmpTotal] = useState(0);

  const [stuSearch, setStuSearch] = useState('');
  const [facSearch, setFacSearch] = useState('');
  const [cmpSearch, setCmpSearch] = useState('');
  const [cmpStatus, setCmpStatus] = useState('');
  const [cmpPriority, setCmpPriority] = useState('');

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    toast.success('Logged out');
    navigate('/admin/login');
  };

  /* ── Fetchers ── */
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/stats`, authHeader());
      if (data.success) setStats(data.stats);
    } catch { toast.error('Could not load stats'); }
  }, []);

  const fetchStudents = useCallback(async () => {
    try { setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/students?page=${stuPage}&search=${stuSearch}`, authHeader());
      if (data.success) { setStudents(data.students); setStuTotal(data.total); }
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [stuPage, stuSearch]);

  const fetchFaculty = useCallback(async () => {
    try { setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/faculty?page=${facPage}&search=${facSearch}`, authHeader());
      if (data.success) { setFaculty(data.faculty); setFacTotal(data.total); }
    } catch { toast.error('Failed to load faculty'); }
    finally { setLoading(false); }
  }, [facPage, facSearch]);

  const fetchComplaints = useCallback(async () => {
    try { setLoading(true);
      const { data } = await axios.get(
        `${BACKEND_URL}/api/admin/complaints?page=${cmpPage}&search=${cmpSearch}&status=${cmpStatus}&priority=${cmpPriority}`,
        authHeader()
      );
      if (data.success) { setComplaints(data.complaints); setCmpTotal(data.total); }
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [cmpPage, cmpSearch, cmpStatus, cmpPriority]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/notifications`, authHeader());
      if (data.success) setNotifications(data);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); fetchNotifications(); }, [fetchStats, fetchNotifications]);
  useEffect(() => { if (section === 'students') fetchStudents(); }, [section, fetchStudents]);
  useEffect(() => { if (section === 'faculty') fetchFaculty(); }, [section, fetchFaculty]);
  useEffect(() => { if (section === 'complaints') fetchComplaints(); }, [section, fetchComplaints]);
  // Fetch faculty list (for assignment dropdown) whenever complaints tab is active
  useEffect(() => { if (section === 'complaints' && faculty.length === 0) fetchFaculty(); }, [section]);

  const totalNotifs = (notifications.overdue?.length || 0) + (notifications.pending?.length || 0);

  const NAV = [
    { id: 'overview',   label: 'Overview',   icon: <LayoutDashboard size={18}/> },
    { id: 'students',   label: 'Students',   icon: <Users size={18}/> },
    { id: 'faculty',    label: 'Faculty',    icon: <GraduationCap size={18}/> },
    { id: 'complaints', label: 'Complaints', icon: <FileText size={18}/> },
    { id: 'lostfound',  label: 'Lost & Found', icon: <PackageSearch size={18}/> },
    { id: 'analytics',  label: 'Analytics',  icon: <BarChart3 size={18}/> },
  ];

  /* ── Pagination component ── */
  const Pager = ({ page, setPage, items, total }) => (
    <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
      <span>Showing <strong>{items}</strong> of <strong>{total}</strong></span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"><ChevronLeft size={15}/></button>
        <span className="px-3 py-1 font-bold text-slate-700">Page {page}</span>
        <button disabled={items < 20} onClick={() => setPage(p => p+1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"><ChevronRight size={15}/></button>
      </div>
    </div>
  );

  const TableLoader = () => (
    <div className="flex justify-center py-20"><span className="animate-spin w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full" /></div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} flex-shrink-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-sm`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200">
            <ShieldAlert size={16} className="text-white"/>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-black text-sm text-slate-800 truncate">CampusBridge</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === item.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18}/>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
              <Menu size={18}/>
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800">{NAV.find(n => n.id === section)?.label}</h1>
              <p className="text-[11px] text-slate-400">Welcome, {admin.name || 'Admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
                <Bell size={18}/>
                {totalNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{totalNotifs}</span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700 text-sm">Alerts</h3>
                      <button onClick={() => setNotifOpen(false)}><X size={14} className="text-slate-400"/></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.overdue?.length > 0 && <>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider px-4 py-2 bg-red-50">Overdue</p>
                        {notifications.overdue.map((c, i) => (
                          <div key={i} className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50">
                            <p className="text-xs font-bold text-slate-700">{c.complaintId}</p>
                            <p className="text-[11px] text-slate-400 truncate">{c.title}</p>
                          </div>
                        ))}
                      </>}
                      {notifications.pending?.length > 0 && <>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider px-4 py-2 bg-amber-50">Pending</p>
                        {notifications.pending.map((c, i) => (
                          <div key={i} className="px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50">
                            <p className="text-xs font-bold text-slate-700">{c.complaintId}</p>
                            <p className="text-[11px] text-slate-400 truncate">{c.title}</p>
                          </div>
                        ))}
                      </>}
                      {totalNotifs === 0 && <p className="text-center text-xs text-slate-400 py-8">All clear!</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">
              {(admin.name || 'A')[0]}
            </div>
          </div>
        </header>

        {/* Page Scroll Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-6">

            {/* ═══ OVERVIEW ══════════════════════════════════════════════ */}
            {section === 'overview' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Students"   value={stats?.totalStudents}  icon={<Users size={20} className="text-blue-600"/>}    bg="bg-blue-50" />
                  <StatCard label="Faculty"    value={stats?.totalFaculty}   icon={<GraduationCap size={20} className="text-indigo-600"/>} bg="bg-indigo-50" />
                  <StatCard label="Total"      value={stats?.totalComplaints} icon={<FileText size={20} className="text-slate-600"/>}  bg="bg-slate-100" />
                  <StatCard label="Pending"    value={stats?.pending}        icon={<Clock size={20} className="text-amber-600"/>}    bg="bg-amber-50" />
                  <StatCard label="Resolved"   value={stats?.resolved}       icon={<CheckCircle size={20} className="text-emerald-600"/>} bg="bg-emerald-50" />
                  <StatCard label="Overdue"    value={stats?.overdueCount}   icon={<AlertTriangle size={20} className="text-red-600"/>} bg="bg-red-50" sub="Need action" />
                  <StatCard label="Escalated"  value={stats?.escalatedCount} icon={<ShieldAlert size={20} className="text-purple-600"/>} bg="bg-purple-50" sub="Auto-escalated" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-emerald-600">{stats?.resolutionRate ?? '—'}%</p>
                      <TrendingUp size={18} className="text-emerald-400 mb-1"/>
                    </div>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${stats?.resolutionRate || 0}%` }}/>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Avg. Resolution Time</p>
                    <p className="text-4xl font-black text-blue-600">{stats?.avgResolutionHrs ?? '—'}<span className="text-lg font-bold text-slate-300 ml-1">hrs</span></p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Status Breakdown</p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'In Progress', val: stats?.inProgress, dot: 'bg-blue-500' },
                        { label: 'Delayed',     val: stats?.delayed,    dot: 'bg-orange-500' },
                        { label: 'Rejected',    val: stats?.rejected,   dot: 'bg-red-500' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className={`w-2 h-2 rounded-full ${row.dot}`}/>
                            {row.label}
                          </div>
                          <span className="font-black text-slate-700">{row.val ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {notifications.overdue?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-red-500"/>
                      <p className="font-bold text-red-600 text-sm">{notifications.overdue.length} Overdue — Immediate Action Required</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {notifications.overdue.slice(0, 4).map((c, i) => (
                        <div key={i} className="bg-white rounded-xl p-3 border border-red-100">
                          <p className="font-bold text-xs text-red-600">{c.complaintId}</p>
                          <p className="text-[11px] text-slate-500 truncate">{c.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ STUDENTS ════════════════════════════════════════════════ */}
            {section === 'students' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" value={stuSearch} onChange={e => { setStuSearch(e.target.value); setStuPage(1); }}
                      placeholder="Name, email, mobile..."
                      className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition"/>
                  </div>
                  <button onClick={fetchStudents} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500"><RefreshCw size={15}/></button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <p className="font-bold text-slate-700 text-sm">All Students <span className="text-slate-400 font-normal ml-1">({stuTotal})</span></p>
                  </div>
                  {loading ? <TableLoader/> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[700px]">
                        <thead><tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="text-left px-5 py-3">Name</th>
                          <th className="text-left px-5 py-3">Email</th>
                          <th className="text-left px-5 py-3">Mobile</th>
                          <th className="text-left px-5 py-3">Course</th>
                          <th className="text-left px-5 py-3">Branch</th>
                          <th className="text-left px-5 py-3">Year</th>
                          <th className="text-left px-5 py-3">Status</th>
                          <th className="text-left px-5 py-3">Joined</th>
                        </tr></thead>
                        <tbody>
                          {students.map(s => (
                            <tr key={s._id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">{s.name[0]}</div>
                                  <span className="font-semibold text-slate-800">{s.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-slate-500 text-xs">{s.email}</td>
                              <td className="px-5 py-3 text-slate-500 text-xs">{s.mobile}</td>
                              <td className="px-5 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{s.course}</span></td>
                              <td className="px-5 py-3 text-slate-600 text-xs">{s.branch}</td>
                              <td className="px-5 py-3 text-slate-600 text-xs">{s.year}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${s.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {s.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {students.length === 0 && <tr><td colSpan={8} className="text-center py-14 text-slate-400">No students found</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <Pager page={stuPage} setPage={setStuPage} items={students.length} total={stuTotal}/>
                </div>
              </div>
            )}

            {/* ═══ FACULTY ═════════════════════════════════════════════════ */}
            {section === 'faculty' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" value={facSearch} onChange={e => { setFacSearch(e.target.value); setFacPage(1); }}
                      placeholder="Name, email, department..."
                      className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition"/>
                  </div>
                  <button onClick={fetchFaculty} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500"><RefreshCw size={15}/></button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="font-bold text-slate-700 text-sm">All Faculty <span className="text-slate-400 font-normal ml-1">({facTotal})</span></p>
                  </div>
                  {loading ? <TableLoader/> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[700px]">
                        <thead><tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="text-left px-5 py-3">Name</th>
                          <th className="text-left px-5 py-3">Email</th>
                          <th className="text-left px-5 py-3">Mobile</th>
                          <th className="text-left px-5 py-3">Department</th>
                          <th className="text-left px-5 py-3">Designation</th>
                          <th className="text-left px-5 py-3">Faculty ID</th>
                          <th className="text-left px-5 py-3">Status</th>
                        </tr></thead>
                        <tbody>
                          {faculty.map(f => (
                            <tr key={f._id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">{f.name[0]}</div>
                                  <span className="font-semibold text-slate-800">{f.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-slate-500 text-xs">{f.email}</td>
                              <td className="px-5 py-3 text-slate-500 text-xs">{f.mobile}</td>
                              <td className="px-5 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">{f.department}</span></td>
                              <td className="px-5 py-3 text-slate-600 text-xs">{f.designation}</td>
                              <td className="px-5 py-3 text-slate-400 font-mono text-xs">{f.facultyId || '—'}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${f.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {f.isVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {faculty.length === 0 && <tr><td colSpan={7} className="text-center py-14 text-slate-400">No faculty found</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <Pager page={facPage} setPage={setFacPage} items={faculty.length} total={facTotal}/>
                </div>
              </div>
            )}

            {/* ═══ COMPLAINTS ══════════════════════════════════════════════ */}
            {section === 'complaints' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" value={cmpSearch} onChange={e => { setCmpSearch(e.target.value); setCmpPage(1); }}
                      placeholder="ID or title..."
                      className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition"/>
                  </div>
                  <select value={cmpStatus} onChange={e => { setCmpStatus(e.target.value); setCmpPage(1); }}
                    className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">All Statuses</option>
                    {['Pending','In Progress','Resolved','Delayed','Rejected','Withdrawn'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select value={cmpPriority} onChange={e => { setCmpPriority(e.target.value); setCmpPage(1); }}
                    className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">All Priorities</option>
                    {['Critical','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
                  </select>
                  <button onClick={fetchComplaints} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500"><RefreshCw size={15}/></button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="font-bold text-slate-700 text-sm">All Complaints <span className="text-slate-400 font-normal ml-1">({cmpTotal})</span></p>
                  </div>
                  {loading ? <TableLoader/> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[900px]">
                        <thead><tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="text-left px-5 py-3">Complaint ID</th>
                          <th className="text-left px-5 py-3">Title</th>
                          <th className="text-left px-5 py-3">Complainant</th>
                          <th className="text-left px-5 py-3">Priority</th>
                          <th className="text-left px-5 py-3">Status</th>
                          <th className="text-left px-5 py-3">SLA Timer</th>
                          <th className="text-left px-5 py-3">Assigned To</th>
                          <th className="text-left px-5 py-3">Date</th>
                          <th className="text-left px-5 py-3">Action</th>
                        </tr></thead>
                        <tbody>
                          {complaints.map(c => (
                            <tr key={c._id} className={`border-t border-slate-50 hover:bg-slate-50/70 transition-colors ${c.slaStatus === 'overdue' ? 'bg-red-50/30' : ''}`}>
                              <td className="px-5 py-3">
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs text-slate-600 font-bold">{c.complaintId}</span>
                                  <SLABadge slaStatus={c.slaStatus}/>
                                </div>
                              </td>
                              <td className="px-5 py-3 max-w-[180px]">
                                <p className="font-semibold text-slate-800 truncate text-xs">{c.title}</p>
                                <p className="text-slate-400 text-[10px]">{c.category}</p>
                              </td>
                              <td className="px-5 py-3">
                                {c.student ? (
                                  <div>
                                    <p className="font-bold text-slate-700 text-xs">{c.student.name}</p>
                                    <p className="text-slate-400 text-[10px]">{c.student.course} • {c.student.year}</p>
                                  </div>
                                ) : <span className="text-slate-300 text-xs">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[c.priority]}`}/>
                                  <span className={`px-2 py-0.5 text-[11px] font-bold border rounded-lg ${PRIORITY_BADGE[c.priority]}`}>{c.priority}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 text-[11px] font-bold border rounded-lg ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                                {c.isLocked && <Lock size={10} className="inline ml-1 text-slate-400"/>}
                                {c.escalatedToAdmin && (
                                  <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 animate-pulse">🚨 CRITICAL</span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <SlaTimer deadline={c.slaDeadline || c.deadline} status={c.status} compact />
                              </td>
                              <td className="px-5 py-3">
                                {c.assignedFaculty ? (
                                  <div>
                                    <p className="font-bold text-slate-700 text-xs">{c.assignedFaculty.name}</p>
                                    <p className="text-slate-400 text-[10px]">{c.assignedFaculty.department}</p>
                                  </div>
                                ) : <span className="text-slate-300 text-xs">Unassigned</span>}
                              </td>
                              <td className="px-5 py-3 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => setSelectedComplaint(c)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                          {complaints.length === 0 && <tr><td colSpan={9} className="text-center py-14 text-slate-400">No complaints found</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <Pager page={cmpPage} setPage={setCmpPage} items={complaints.length} total={cmpTotal}/>
                </div>
              </div>
            )}

            {/* ═══ LOST & FOUND ════════════════════════════════════════════ */}
            {section === 'lostfound' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <LostFoundList canReturn={true} compact={false} />
              </div>
            )}

            {/* ═══ ANALYTICS ═══════════════════════════════════════════════ */}
            {section === 'analytics' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="font-bold text-slate-700 text-sm mb-4">Complaints by Category</h3>
                    {stats?.byCategory?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.byCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }}/>
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }}/>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }}/>
                          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-slate-400 text-sm py-10">No data yet</p>}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="font-bold text-slate-700 text-sm mb-4">Complaints by Priority</h3>
                    {stats?.byPriority?.some(p => p.count > 0) ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={stats.byPriority} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {stats.byPriority.map((_, i) => <Cell key={i} fill={['#7c3aed', '#ef4444', '#f59e0b', '#10b981'][i]}/>)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-slate-400 text-sm py-10">No data yet</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats && [
                    { label: 'Total',       value: stats.totalComplaints, border: 'border-slate-200' },
                    { label: 'Pending',     value: stats.pending,         border: 'border-amber-200' },
                    { label: 'In Progress', value: stats.inProgress,      border: 'border-blue-200' },
                    { label: 'Delayed',     value: stats.delayed,         border: 'border-orange-200' },
                  ].map((item, i) => (
                    <div key={i} className={`bg-white rounded-2xl border-2 ${item.border} p-5 shadow-sm`}>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-3xl font-black text-slate-800 mt-1">{item.value ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Complaint Modal ── */}
      <AnimatePresence>
        {selectedComplaint && (
          <ComplaintModal
            complaint={selectedComplaint}
            faculty={faculty}
            onClose={() => setSelectedComplaint(null)}
            onUpdate={fetchComplaints}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
