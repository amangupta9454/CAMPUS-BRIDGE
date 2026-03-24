import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BookOpen, Calendar, ArrowLeft, Upload, FileSpreadsheet } from 'lucide-react';

const FacultyExams = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timetable');
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  // Timetable form state
  const [ttList, setTtList] = useState([{
     subjectName: '', subjectId: '', date: '', time: '', examType: 'Mid'
  }]);

  const handleTtChange = (index, e) => {
     const newList = [...ttList];
     newList[index][e.target.name] = e.target.value;
     setTtList(newList);
  };

  const addSubject = () => {
    if (ttList.length < 6) {
      setTtList([...ttList, { subjectName: '', subjectId: '', date: '', time: '', examType: 'Mid' }]);
    } else {
      toast.error('Maximum 6 subjects allowed');
    }
  };

  const removeSubject = (index) => {
    if (ttList.length > 1) {
      const newList = ttList.filter((_, i) => i !== index);
      setTtList(newList);
    }
  };

  const submitTimetable = async (e) => {
     e.preventDefault();
     try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}/api/exam/timetable`, { subjects: ttList }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) {
           toast.success('Exams Scheduled Successfully!');
           setTtList([{ subjectName: '', subjectId: '', date: '', time: '', examType: 'Mid' }]);
        }
     } catch (err) {
        toast.error(err.response?.data?.message || 'Error scheduling exams');
     } finally {
        setLoading(false);
     }
  };

  const submitExcel = async (e, type) => {
     e.preventDefault();
     if(!excelFile) return toast.error('Please select an Excel file');
     
     try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('excel', excelFile);
        
        const endpoint = type === 'internal' ? '/api/exam/internal/upload' : '/api/exam/result/upload';

        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app'}${endpoint}`, formData, {
           headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
           }
        });
        
        if(res.data.success) {
           toast.success(res.data.message);
           setExcelFile(null);
        }
     } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed. Check data format.');
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate('/faculty/dashboard')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <BookOpen size={20} className="text-indigo-500"/> Exam Management
            </h2>
         </div>
         <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'timetable' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <Calendar size={16}/> Schedule
            </button>
            <button 
              onClick={() => setActiveTab('internal-upload')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'internal-upload' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <FileSpreadsheet size={16}/> Upload Marks
            </button>
         </div>
      </div>

      <div className="p-6">
         {activeTab === 'timetable' && (
            <div className="max-w-3xl mx-auto">
               <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Schedule Examination</h3>
                    <p className="text-sm text-slate-500">Exams must be scheduled at least 10 days in advance. Max 6 subjects.</p>
                  </div>
                  {ttList.length < 6 && (
                    <button type="button" onClick={addSubject} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
                      + Add Subject
                    </button>
                  )}
               </div>
               
               <form onSubmit={submitTimetable} className="space-y-6">
                  {ttList.map((ttForm, index) => (
                    <div key={index} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 relative">
                      {ttList.length > 1 && (
                        <button type="button" onClick={() => removeSubject(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-2 py-1 rounded">
                          Remove
                        </button>
                      )}
                      <h4 className="font-bold text-slate-700 mb-4">Subject {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Subject Name</label>
                            <input required name="subjectName" value={ttForm.subjectName} onChange={(e) => handleTtChange(index, e)} className="w-full px-4 py-2 border rounded-xl bg-white" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Subject ID / Code</label>
                            <input required name="subjectId" value={ttForm.subjectId} onChange={(e) => handleTtChange(index, e)} className="w-full px-4 py-2 border rounded-xl bg-white" />
                         </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Exam Date</label>
                            <input required type="date" name="date" value={ttForm.date} onChange={(e) => handleTtChange(index, e)} className="w-full px-4 py-2 border rounded-xl bg-white" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Time</label>
                            <input required type="time" name="time" value={ttForm.time} onChange={(e) => handleTtChange(index, e)} className="w-full px-4 py-2 border rounded-xl bg-white" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Type</label>
                            <select required name="examType" value={ttForm.examType} onChange={(e) => handleTtChange(index, e)} className="w-full px-4 py-2 border rounded-xl bg-white">
                               <option value="Mid">Mid Semester</option>
                               <option value="End">End Semester</option>
                               <option value="Practical">Practical</option>
                            </select>
                         </div>
                      </div>
                    </div>
                  ))}
                  <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                     {loading ? 'Scheduling...' : 'Schedule Exams'}
                  </button>
               </form>
            </div>
         )}

         {activeTab === 'internal-upload' && (
            <div className="max-w-3xl mx-auto space-y-10">
               
               {/* Internal Marks Section */}
               <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <div className="mb-4">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileSpreadsheet className="text-indigo-500"/> Internal Marks Upload</h3>
                     <p className="text-sm text-slate-500 mt-1">Expected columns: <code className="text-xs bg-slate-100 px-1 rounded">studentId, subjectName, subjectId, totalInternalMarks, obtainedInternalMarks, totalExternalMarks, obtainedExternalMarks, totalLabMarks, obtainedLabMarks</code></p>
                  </div>
                  <form onSubmit={(e) => submitExcel(e, 'internal')} className="space-y-4">
                     <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center justify-center bg-indigo-50/30">
                        <Upload className="text-indigo-400 mb-2" size={32} />
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setExcelFile(e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                     </div>
                     <button disabled={loading || !excelFile} type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? 'Processing...' : 'Upload Internal Marks'}
                     </button>
                  </form>
               </div>

               {/* External Result Section */}
               <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <div className="mb-4">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileSpreadsheet className="text-emerald-500"/> Final Result Upload</h3>
                     <p className="text-sm text-slate-500 mt-1">Expected columns: <code className="text-xs bg-slate-100 px-1 rounded">studentId, subjectName, subjectId, totalMarks, obtainedMarks, facultyName</code></p>
                  </div>
                  <form onSubmit={(e) => submitExcel(e, 'external')} className="space-y-4">
                     <div className="border-2 border-dashed border-emerald-200 rounded-xl p-6 flex flex-col items-center justify-center bg-emerald-50/30">
                        <Upload className="text-emerald-500 mb-2" size={32} />
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setExcelFile(e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                     </div>
                     <button disabled={loading || !excelFile} type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                        {loading ? 'Processing...' : 'Upload Final Results'}
                     </button>
                  </form>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};

export default FacultyExams;
