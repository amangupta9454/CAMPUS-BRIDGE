import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BookOpen, Calendar, Award, ArrowLeft } from 'lucide-react';

const StudentExams = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable');
  const [timetable, setTimetable] = useState([]);
  const [internalMarks, setInternalMarks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
       const parsedUser = JSON.parse(storedStudent);
       setStudent(parsedUser);
       fetchData(parsedUser.studentId);
    } else {
       navigate('/student/login');
    }
  }, [navigate]);

  const fetchData = async (enrollmentNo) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ttRes, intRes, extRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/exam/timetable`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/exam/internal/${encodeURIComponent(enrollmentNo)}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/exam/result/${encodeURIComponent(enrollmentNo)}`, { headers })
      ]);

      if(ttRes.data.success) setTimetable(ttRes.data.data);
      if(intRes.data.success) setInternalMarks(intRes.data.data);
      if(extRes.data.success) setResults(extRes.data.data);
    } catch (error) {
       toast.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <BookOpen size={20} className="text-indigo-500"/> Academic Portal
            </h2>
         </div>
         <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'timetable' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Calendar size={16}/> Timetable
            </button>
            <button 
              onClick={() => setActiveTab('internal')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'internal' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Award size={16}/> Internal
            </button>
            <button 
              onClick={() => setActiveTab('result')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'result' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Award size={16}/> Results
            </button>
         </div>
      </div>

      <div className="p-6">
         {/* TIMETABLE TAB */}
         {activeTab === 'timetable' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 font-bold">Date & Time</th>
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold">Exam Type</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {timetable.length === 0 ? (
                        <tr><td colSpan="3" className="py-8 text-center text-slate-500">No upcoming exams scheduled.</td></tr>
                     ) : (
                        timetable.map(tt => (
                           <tr key={tt._id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4">
                                 <p className="font-bold text-slate-800">{new Date(tt.date).toLocaleDateString()}</p>
                                 <p className="text-xs text-slate-500 font-mono">{tt.time}</p>
                              </td>
                              <td className="py-3 px-4 align-middle">
                                 <p className="font-bold text-slate-700">{tt.subjectName}</p>
                                 <p className="text-xs text-slate-400 font-mono">{tt.subjectId}</p>
                              </td>
                              <td className="py-3 px-4 align-middle">
                                 <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{tt.examType}</span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}

         {/* INTERNAL MARKS TAB */}
         {activeTab === 'internal' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold text-center">Internal (Obt/Tot)</th>
                        <th className="py-3 px-4 font-bold text-center">External (Obt/Tot)</th>
                        <th className="py-3 px-4 font-bold text-center">Lab (Obt/Tot)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {internalMarks.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-slate-500">Internal marks not uploaded yet.</td></tr>
                     ) : (
                        internalMarks.map(im => (
                           <tr key={im._id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4">
                                 <p className="font-bold text-slate-700">{im.subjectName}</p>
                                 <p className="text-xs text-slate-400 font-mono">{im.subjectId}</p>
                              </td>
                              <td className="py-3 px-4 text-center">
                                 <span className="font-bold text-slate-800">{im.obtainedInternalMarks}</span> / {im.totalInternalMarks}
                              </td>
                              <td className="py-3 px-4 text-center">
                                 <span className="font-bold text-slate-800">{im.obtainedExternalMarks}</span> / {im.totalExternalMarks}
                              </td>
                              <td className="py-3 px-4 text-center">
                                 <span className="font-bold text-slate-800">{im.obtainedLabMarks}</span> / {im.totalLabMarks}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         )}

         {/* RESULT TAB */}
         {activeTab === 'result' && (
             <div className="space-y-6">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                           <th className="py-3 px-4 font-bold">Subject</th>
                           <th className="py-3 px-4 font-bold text-center">Marks Obtained</th>
                           <th className="py-3 px-4 font-bold text-center">Total Marks</th>
                           <th className="py-3 px-4 font-bold text-right">Percentage</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {results.length === 0 ? (
                           <tr><td colSpan="4" className="py-8 text-center text-slate-500">Final results not declared yet.</td></tr>
                        ) : (
                           results.map(r => {
                              const percentage = ((r.obtainedMarks / r.totalMarks) * 100).toFixed(2);
                              let colorClass = 'text-green-600';
                              if (percentage < 33) colorClass = 'text-red-500';
                              else if (percentage < 60) colorClass = 'text-amber-500';

                              return (
                              <tr key={r._id} className="hover:bg-slate-50/50">
                                 <td className="py-3 px-4">
                                    <p className="font-bold text-slate-700">{r.subjectName}</p>
                                    <p className="text-xs text-slate-400 font-mono">{r.subjectId} - By {r.facultyName}</p>
                                 </td>
                                 <td className="py-3 px-4 text-center font-bold text-slate-800">{r.obtainedMarks}</td>
                                 <td className="py-3 px-4 text-center text-slate-600">{r.totalMarks}</td>
                                 <td className={`py-3 px-4 text-right font-black ${colorClass}`}>{percentage}%</td>
                              </tr>
                              )
                           })
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default StudentExams;
