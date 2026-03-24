import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FileText, CheckCircle, XCircle, Search, RefreshCw, Calendar } from 'lucide-react';

const AdminNocTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  
  const [actionModal, setActionModal] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Approved_Admin' or 'Rejected_Admin'
  const [adminRemarks, setAdminRemarks] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const fetchStatus = activeTab === 'pending' ? 'Pending_Admin' : 'Processed';
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/noc/admin?status=${fetchStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data.success) {
         setRequests(res.data.data);
      }
    } catch (error) {
       toast.error('Failed to load NOC requests');
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleAction = async (e) => {
     e.preventDefault();
     if(actionType === 'Rejected_Admin' && !adminRemarks) return toast.error('Remarks are required for rejection');
     if(actionType === 'Approved_Admin' && !collectionDate) return toast.error('Collection date is required for approval');

     try {
        setActionLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/noc/admin-action/${actionModal._id}`, {
           action: actionType, 
           remarks: adminRemarks,
           collectionDate
        }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        
        if(res.data.success) {
           toast.success(`Request ${actionType === 'Approved_Admin' ? 'Approved' : 'Rejected'} successfully`);
           setActionModal(null);
           setAdminRemarks('');
           setCollectionDate('');
           fetchRequests();
        }
     } catch (err) {
        toast.error('Error processing request');
     } finally {
        setActionLoading(false);
     }
  };

  const filteredRequests = requests.filter(r => 
     r.name.toLowerCase().includes(search.toLowerCase()) || 
     r.documentType.toLowerCase().includes(search.toLowerCase()) ||
     r.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
         <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Requires Action</button>
           <button onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Processed History</button>
         </div>
         <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
         <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
         <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Student Name, Document Type, Course..."
            className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition"/>
         </div>
         <button onClick={fetchRequests} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500"><RefreshCw size={15}/></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
         <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2">
               <FileText size={16} className={activeTab === 'pending' ? 'text-indigo-500' : 'text-slate-400'} /> 
               {activeTab === 'pending' ? 'Pending Final Approvals' : 'Historical Processed NOCs'} 
               <span className="text-slate-400 font-normal ml-1">({requests.length})</span>
            </h2>
         </div>
         
         {loading ? (
            <div className="flex justify-center py-20"><span className="animate-spin w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full" /></div>
         ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
               <CheckCircle size={40} className="mx-auto text-emerald-300 mb-3 opacity-50" />
               <p>All HOD-approved clearings have been processed!</p>
            </div>
         ) : (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
               {filteredRequests.map(req => (
                  <div key={req._id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-colors shadow-sm bg-white">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-black text-slate-800">{req.documentType}</h3>
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded uppercase tracking-wider border border-blue-100">Pending Director</span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <a href={req.idCardUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-slate-100 text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded transition-colors">View ID ↗</a>
                     </div>

                     <div className="grid grid-cols-2 gap-y-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600">
                        <p><span className="font-bold text-slate-500 uppercase tracking-widest text-[9px] block">Student Name</span>{req.name}</p>
                        <p><span className="font-bold text-slate-500 uppercase tracking-widest text-[9px] block">Course Info</span>{req.course} - {req.branch} (Yr {req.year})</p>
                        <p className="col-span-2"><span className="font-bold text-slate-500 uppercase tracking-widest text-[9px] block">Reason for request</span>{req.reason}</p>
                     </div>

                     <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs">
                        <p className="font-bold text-blue-800 uppercase tracking-widest text-[9px] mb-1">HOD Endorsement</p>
                        <p className="text-blue-900 italic">"{req.hodRemarks || 'Approved without additional remarks'}"</p>
                        <p className="text-[10px] text-blue-500 mt-1 font-bold">Approved By HOD on {new Date(req.updatedAt).toLocaleDateString()}</p>
                     </div>
                     
                     {activeTab === 'history' && (
                        <div className={`mb-4 p-3 rounded-lg border text-xs ${req.status === 'Approved_Admin' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                           <p className={`font-bold uppercase tracking-widest text-[9px] mb-1 ${req.status === 'Approved_Admin' ? 'text-emerald-800' : 'text-red-800'}`}>Admin Decision</p>
                           <p className="italic">"{req.adminRemarks || 'Finalized parameters applied.'}"</p>
                           {req.collectionDate && <p className="text-[10px] mt-1 font-bold italic">Collection Date: {new Date(req.collectionDate).toLocaleDateString()}</p>}
                        </div>
                     )}

                     {activeTab === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                           <button onClick={() => { setActionModal(req); setActionType('Approved_Admin'); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">
                              <CheckCircle size={14}/> Final Approve
                           </button>
                           <button onClick={() => { setActionModal(req); setActionType('Rejected_Admin'); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-lg transition-colors">
                              <XCircle size={14}/> Reject Request
                           </button>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>

      {actionModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
               <h3 className={`text-xl font-black mb-1 ${actionType === 'Approved_Admin' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {actionType === 'Approved_Admin' ? 'Finalize Approval' : 'Reject Document Request'}
               </h3>
               <p className="text-sm text-slate-500 mb-5">For student: <span className="font-bold text-slate-700">{actionModal.name}</span></p>

               <form onSubmit={handleAction} className="space-y-4">
                  {actionType === 'Approved_Admin' && (
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Set Collection Date <span className="text-red-500">*</span></label>
                        <p className="text-[10px] text-slate-400 mb-2">When can the student pick up this document from the admin office?</p>
                        <div className="relative">
                           <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                           <input type="date" required value={collectionDate} onChange={e => setCollectionDate(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400 bg-emerald-50/30" />
                        </div>
                     </div>
                  )}

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Admin Remarks {actionType === 'Rejected_Admin' && <span className="text-red-500">*</span>}</label>
                     <textarea rows={3} required={actionType === 'Rejected_Admin'} placeholder={actionType === 'Approved_Admin' ? "Optional notes..." : "Reason for rejection..."} value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} className={`w-full p-3 rounded-xl border focus:outline-none resize-none text-sm ${actionType === 'Approved_Admin' ? 'border-emerald-200 focus:border-emerald-400 bg-emerald-50/20' : 'border-red-200 focus:border-red-400 bg-red-50/30'}`}></textarea>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => { setActionModal(null); setAdminRemarks(''); setCollectionDate(''); }} className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" disabled={actionLoading} className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50 ${actionType === 'Approved_Admin' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200'}`}>
                        {actionLoading ? 'Processing...' : 'Confirm'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminNocTab;
