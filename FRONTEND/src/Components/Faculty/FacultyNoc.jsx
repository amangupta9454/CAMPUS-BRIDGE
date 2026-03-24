import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FileText, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const FacultyNoc = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarkModal, setRemarkModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/noc/hod?status=Pending_HOD`, {
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

  const handleAction = async (id, action) => {
     if(action === 'Rejected_HOD' && !remarks) {
        return toast.error('Remarks are required for rejection');
     }
     try {
        setActionLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/noc/hod-action/${id}`, {
           action, remarks
        }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) {
           toast.success(action === 'Approved_HOD' ? 'Approved Successfully' : 'Rejected Successfully');
           setRemarkModal(null);
           setRemarks('');
           fetchRequests();
        }
     } catch (err) {
        toast.error('Error processing request');
     } finally {
        setActionLoading(false);
     }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate('/faculty/dashboard')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <FileText size={20} className="text-indigo-500"/> Pending NOC / No Dues (HOD)
            </h2>
         </div>
         <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{requests.length} Requests</span>
      </div>

      <div className="p-6">
         {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No pending requests for approval.</div>
         ) : (
            <div className="space-y-4">
               {requests.map(req => (
                  <div key={req._id} className="p-5 border border-slate-200 rounded-2xl bg-white relative">
                     <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-black text-slate-800 text-lg">{req.documentType}</h3>
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase font-bold border border-indigo-100">
                                 {req.course} • {req.branch} • {req.year}
                              </span>
                           </div>
                           <p className="text-sm font-bold text-slate-700 mb-1">Student: {req.name}</p>
                           <p className="text-xs text-slate-500 mb-3"><span className="font-semibold text-slate-600">Reason:</span> {req.reason}</p>
                           
                           <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                              <p><span className="font-bold">Description:</span> {req.description}</p>
                              <div className="mt-2">
                                 <a href={req.idCardUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">View ID Card ↗</a>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-2 justify-center md:w-48">
                           <button 
                             onClick={() => handleAction(req._id, 'Approved_HOD')}
                             className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-xl border border-emerald-200 transition-colors"
                           >
                              <CheckCircle size={16}/> Approve
                           </button>
                           <button 
                             onClick={() => setRemarkModal(req._id)}
                             className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-bold rounded-xl border border-red-200 transition-colors"
                           >
                              <XCircle size={16}/> Reject
                           </button>
                        </div>
                     </div>

                     {/* Rejection Modal Inline */}
                     {remarkModal === req._id && (
                        <div className="mt-4 p-4 border border-red-100 bg-red-50 rounded-xl animate-in fade-in">
                           <label className="text-sm font-bold text-red-800 mb-2 block">Reason for Rejection *</label>
                           <textarea className="w-full px-3 py-2 rounded-lg border border-red-200 outline-none text-sm resize-none" rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="State your reason..."></textarea>
                           <div className="mt-3 flex gap-2 justify-end">
                              <button onClick={() => setRemarkModal(null)} className="px-3 py-1.5 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                              <button disabled={actionLoading} onClick={() => handleAction(req._id, 'Rejected_HOD')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">Confirm Rejection</button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default FacultyNoc;
