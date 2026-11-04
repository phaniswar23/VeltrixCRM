import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { X, DollarSign, Calendar, User, Briefcase, Percent, FileText, Trash2 } from 'lucide-react';

const STAGES = [
  { id: 'lead', label: 'Lead (10%)', defaultProb: 10 },
  { id: 'qualified', label: 'Qualified (30%)', defaultProb: 30 },
  { id: 'proposal', label: 'Proposal (60%)', defaultProb: 60 },
  { id: 'negotiation', label: 'Negotiation (80%)', defaultProb: 80 },
  { id: 'closed_won', label: 'Closed Won (100%)', defaultProb: 100 },
  { id: 'closed_lost', label: 'Closed Lost (0%)', defaultProb: 0 },
];

const DealModal = ({ isOpen, onClose, onSave, deal = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'INR',
    customer_id: '',
    stage: 'lead',
    win_probability: 20,
    expected_close_date: '',
    assigned_to: '',
    notes: '',
    lost_reason: '',
  });

  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!deal?._id) return;
    if (!window.confirm(`Are you sure you want to delete "${deal.title}"?`)) return;
    try {
      setDeleting(true);
      await api.delete(`/deals/${deal._id}`);
      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error('Failed to delete deal:', err);
      setError(err.response?.data?.message || 'Failed to delete deal');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (deal) {
        setFormData({
          title: deal.title || '',
          amount: deal.amount || '',
          currency: deal.currency || 'INR',
          customer_id: deal.customer_id?._id || deal.customer_id || '',
          stage: deal.stage || 'lead',
          win_probability: deal.win_probability ?? 20,
          expected_close_date: deal.expected_close_date
            ? new Date(deal.expected_close_date).toISOString().split('T')[0]
            : '',
          assigned_to: deal.assigned_to?._id || deal.assigned_to || '',
          notes: deal.notes || '',
          lost_reason: deal.lost_reason || '',
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          currency: 'INR',
          customer_id: '',
          stage: 'lead',
          win_probability: 20,
          expected_close_date: '',
          assigned_to: '',
          notes: '',
          lost_reason: '',
        });
      }
    }
  }, [isOpen, deal]);

  const loadDropdowns = async () => {
    try {
      const [custRes, staffRes] = await Promise.all([
        api.get('/customers'),
        api.get('/staff'),
      ]);
      setCustomers(custRes.data?.customers || []);
      setStaffList(staffRes.data?.staff || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const handleStageChange = (newStage) => {
    const stageObj = STAGES.find((s) => s.id === newStage);
    setFormData((prev) => ({
      ...prev,
      stage: newStage,
      win_probability: stageObj ? stageObj.defaultProb : prev.win_probability,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Deal title is required');
      return;
    }
    if (!formData.customer_id) {
      setError('Please select a customer for this deal');
      return;
    }

    try {
      setLoading(true);
      if (deal?._id) {
        await api.put(`/deals/${deal._id}`, formData);
      } else {
        await api.post('/deals', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5E2DC] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {deal ? 'Edit Deal Opportunity' : 'Create New Deal Opportunity'}
              </h2>
              <p className="text-xs text-[#706F6C]">
                Track revenue, win probability, and stage advancement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Deal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise License - 50 Seats"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Deal Value (₹ Amount) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706F6C]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Customer / Account *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium bg-white"
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium bg-white"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Win Probability</span>
                <span className="text-[#2D3A2D] font-bold">{formData.win_probability}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.win_probability}
                onChange={(e) =>
                  setFormData({ ...formData, win_probability: Number(e.target.value) })
                }
                className="w-full accent-[#2D3A2D] mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Deal Owner / Staff
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium bg-white"
              >
                <option value="">Unassigned</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.stage === 'closed_lost' && (
            <div>
              <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5">
                Reason for Lost Deal *
              </label>
              <input
                type="text"
                placeholder="e.g. Budget constraints, opted for competitor, project cancelled"
                value={formData.lost_reason}
                onChange={(e) => setFormData({ ...formData, lost_reason: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Internal Notes
            </label>
            <textarea
              rows="3"
              placeholder="Requirements, customer pain points, negotiation milestones..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] focus:ring-1 focus:ring-[#2D3A2D] outline-none text-sm font-medium resize-none"
            ></textarea>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between gap-3">
            {deal ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete Deal'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-[#706F6C] hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || deleting}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;

