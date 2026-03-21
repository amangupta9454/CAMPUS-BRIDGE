import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Upload, X, Loader2, PackageSearch } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app';

const StudentReportItem = ({ onSuccess }) => {
  const [form, setForm] = useState({ itemName: '', foundLocation: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      return toast.error('Only JPG, PNG, or WEBP images allowed');
    }
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.foundLocation.trim()) return toast.error('All fields are required');
    if (!imageFile) return toast.error('Item photo is required');

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('itemName', form.itemName.trim());
      fd.append('foundLocation', form.foundLocation.trim());
      fd.append('itemImage', imageFile);

      await axios.post(`${BACKEND_URL}/api/lostfound/report`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Item reported successfully!');
      setForm({ itemName: '', foundLocation: '' });
      setImageFile(null);
      setPreview(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <PackageSearch size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-800">Report Found Item</h3>
          <p className="text-xs text-slate-400">Help return lost items to their owners</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Item Name</label>
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="e.g. Black Leather Wallet"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Found Location</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="foundLocation"
              value={form.foundLocation}
              onChange={handleChange}
              placeholder="e.g. Library, Block-A Room 203"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Item Photo <span className="text-red-500">*</span></label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
              <button
                type="button"
                onClick={() => { setPreview(null); setImageFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'}`}
            >
              <label className="cursor-pointer">
                <Camera size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-500">Drop image or <span className="text-amber-600">Browse</span></p>
                <p className="text-[10px] text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" onChange={e => handleImageSelect(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>

        <div className="pt-1">
          <p className="text-xs text-slate-400 mb-3">
            <span className="font-semibold text-slate-500">Found by:</span> Student (auto)
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-200 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
            {loading ? 'Submitting...' : 'Report Found Item'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StudentReportItem;
