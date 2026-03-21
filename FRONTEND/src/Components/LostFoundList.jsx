import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageSearch, MapPin, Search, Filter, RefreshCw, X,
  Loader2, CheckCircle2, Clock, Camera, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-bridge-tau.vercel.app';

/* ── Return Modal ────────────────────────────────────────────────────────── */
const ReturnModal = ({ item, onClose, onReturned }) => {
  const [form, setForm] = useState({ receiverName: '', receiverEmail: '', receiverMobile: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type))
      return toast.error('Only JPG/PNG images');
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.receiverName || !form.receiverEmail || !form.receiverMobile)
      return toast.error('All receiver details required');
    if (!/^\d{10}$/.test(form.receiverMobile))
      return toast.error('Mobile must be exactly 10 digits');
    if (!photoFile) return toast.error('Receiver photo required');

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('receiverPhoto', photoFile);

      await axios.put(`${BACKEND_URL}/api/lostfound/return/${item._id}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Item marked as returned!');
      onReturned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-800 text-base">Mark as Returned</h2>
            <p className="text-xs text-slate-400 mt-0.5">"{item.itemName}"</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition"><X size={17} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pt-4 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'receiverName', label: 'Receiver Name', placeholder: 'Full name' },
              { name: 'receiverEmail', label: 'Receiver Email', placeholder: 'email@example.com', type: 'email' },
              { name: 'receiverMobile', label: 'Mobile (10 digits)', placeholder: '9876543210', maxLength: 10 },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type || 'text'}
                  maxLength={f.maxLength}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition text-slate-800"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Receiver Photo <span className="text-red-500">*</span></label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                  <button type="button" onClick={() => { setPhotoFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl p-5 flex flex-col items-center gap-2 transition hover:bg-emerald-50/30">
                  <Camera size={24} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold">Upload Receiver Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {loading ? 'Saving...' : 'Confirm Return'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Lost & Found List ───────────────────────────────────────────────────── */
const LostFoundList = ({ canReturn = false, compact = false }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BACKEND_URL}/api/lostfound/all?search=${search}&status=${statusFilter}&page=${page}&limit=12`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (data.success) { setItems(data.items); setTotal(data.total); }
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
            <PackageSearch size={17} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Lost & Found Items</h3>
            <p className="text-[11px] text-slate-400">{total} items reported across campus</p>
          </div>
        </div>
        <button onClick={fetchItems} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search item name..."
            className="w-full bg-white border border-slate-200 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-amber-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
          <PackageSearch size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No items found</p>
          <p className="text-slate-300 text-xs mt-1">Items reported across campus will appear here</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all group ${item.status === 'Returned' ? 'border-emerald-100' : 'border-slate-100'}`}
              >
                {/* Image */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={item.itemImage}
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status badge overlay */}
                  <div className="absolute top-2 right-2">
                    {item.status === 'Returned' ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg shadow">
                        <CheckCircle2 size={10} /> Returned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                  {/* New item highlight */}
                  {new Date() - new Date(item.createdAt) < 86400000 && (
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-md shadow animate-pulse">NEW</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <h4 className="font-black text-slate-800 text-sm truncate">{item.itemName}</h4>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <MapPin size={11} />
                    <p className="text-[11px] truncate">{item.foundLocation}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400">Found by</p>
                      <p className="text-[11px] font-bold text-slate-600">{item.foundBy} · {item.reporter?.name || '—'}</p>
                    </div>
                    <p className="text-[10px] text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Return details if returned */}
                  {item.status === 'Returned' && item.returnedDetails?.receiverName && (
                    <div className="mt-2 pt-2 border-t border-emerald-100 bg-emerald-50 -mx-4 px-4 pb-0">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Returned to:</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">{item.returnedDetails.receiverName}</p>
                    </div>
                  )}

                  {/* Mark Returned button — only for canReturn && Pending */}
                  {canReturn && item.status === 'Pending' && (
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition"
                    >
                      Mark as Returned
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-white rounded-2xl border border-slate-100 px-4 py-3">
          <span>Showing {items.length} of {total}</span>
          <div className="flex gap-1 items-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"><ChevronLeft size={14} /></button>
            <span className="px-2 font-bold text-slate-700">Page {page}</span>
            <button disabled={items.length < 12} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ReturnModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onReturned={fetchItems}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LostFoundList;
