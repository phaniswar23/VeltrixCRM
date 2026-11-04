import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { X, ShieldCheck, Zap, Briefcase, CheckSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const CustomerFormModal = ({ isOpen, onClose, customerToEdit, staffList, onSaved }) => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tags: '',
    status: 'lead',
    assigned_to: '',
  });

  // Quick Onboard: Attach Deal + Task in 1-Click
  const [withQuickOnboard, setWithQuickOnboard] = useState(false);
  const [dealData, setDealData] = useState({
    title: '',
    amount: '',
    stage: 'lead',
  });
  const [taskData, setTaskData] = useState({
    title: '',
    priority: 'medium',
    due_date: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        email: customerToEdit.email || '',
        phone: customerToEdit.phone || '',
        company: customerToEdit.company || '',
        tags: Array.isArray(customerToEdit.tags) ? customerToEdit.tags.join(', ') : customerToEdit.tags || '',
        status: customerToEdit.status || 'lead',
        assigned_to: customerToEdit.assigned_to?._id || customerToEdit.assigned_to || (isAdmin ? '' : user?._id || ''),
      });
      setWithQuickOnboard(false);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        tags: '',
        status: 'lead',
        assigned_to: isAdmin ? '' : (user?._id || ''),
      });
      setWithQuickOnboard(false);
      setDealData({ title: '', amount: '', stage: 'lead' });
      setTaskData({ title: '', priority: 'medium', due_date: '' });
    }
    setError('');
  }, [customerToEdit, isOpen, isAdmin, user?._id]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (!customerToEdit && withQuickOnboard) {
        if (dealData.title.trim() || dealData.amount) {
          payload.initial_deal = {
            title: dealData.title.trim() || `Deal - ${formData.company || formData.name}`,
            amount: Number(dealData.amount) || 0,
            stage: dealData.stage || 'lead',
          };
        }
        if (taskData.title.trim()) {
          payload.initial_task = {
            title: taskData.title.trim(),
            priority: taskData.priority || 'medium',
            due_date: taskData.due_date || undefined,
          };
        }
      }

      if (customerToEdit) {
        await api.put(`/customers/${customerToEdit._id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3A2D]/20 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh] animate-bounce-in">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF] shrink-0">
          <div>
            <h3 className="heading-editorial text-xl font-bold">
              {customerToEdit ? t('edit_customer') : t('add_customer')}
            </h3>
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mt-0.5">
              Client Records
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#706F6C] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('full_name')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Innovations"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('email_address')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@acme.com"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('phone_number')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="lead">{t('lead')}</option>
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('assigned_to')}
              </label>
              {isAdmin ? (
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
                >
                  <option value="">⚡ Auto-Assign (Round-Robin Queue)</option>
                  {staffList?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2 text-xs font-semibold text-[#2D3A2D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{user?.name || 'You'} (Self)</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#2D3A2D]/10 text-[#2D3A2D]">
                    Portfolio
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. VIP, Enterprise, High Budget, Retail"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          {/* Quick Onboard: Attach Deal + Task in 1-Click */}
          {!customerToEdit && (
            <div className="rounded-2xl border border-[#D6D2CA] bg-[#FAF9F5] p-4 space-y-3 shadow-2xs">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setWithQuickOnboard(!withQuickOnboard)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#2D3A2D] text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">
                      Quick Onboard: Attach Deal & First Task
                    </span>
                    <span className="text-[10px] text-[#706F6C]">
                      Create customer, pipeline deal, and initial to-do item all in 1 click!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
                >
                  {withQuickOnboard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {withQuickOnboard && (
                <div className="pt-2 border-t border-[#E5E2DC] space-y-3.5 animate-fadeIn">
                  {/* Deal Inputs */}
                  <div className="p-3 bg-white rounded-xl border border-[#E5E2DC] space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D3A2D]">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Initial Pipeline Deal (Optional)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-[#706F6C] uppercase mb-1">
                          Deal Project Title
                        </label>
                        <input
                          type="text"
                          value={dealData.title}
                          onChange={(e) => setDealData({ ...dealData, title: e.target.value })}
                          placeholder={formData.company ? `${formData.company} Project` : 'e.g. Website Development Contract'}
                          className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2D3A2D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#706F6C] uppercase mb-1">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={dealData.amount}
                          onChange={(e) => setDealData({ ...dealData, amount: e.target.value })}
                          placeholder="e.g. 150000"
                          className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2D3A2D]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task Inputs */}
                  <div className="p-3 bg-white rounded-xl border border-[#E5E2DC] space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D3A2D]">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>First Action Task (Optional)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-[#706F6C] uppercase mb-1">
                          Task To-Do
                        </label>
                        <input
                          type="text"
                          value={taskData.title}
                          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                          placeholder={formData.name ? `Discovery call with ${formData.name}` : 'e.g. Discovery call & requirements gathering'}
                          className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2D3A2D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#706F6C] uppercase mb-1">
                          Priority
                        </label>
                        <select
                          value={taskData.priority}
                          onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#2D3A2D]"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary-veltrix !py-2.5 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary-veltrix !py-2.5 text-xs font-bold disabled:opacity-50"
            >
              {submitting ? 'Saving...' : customerToEdit ? t('update_customer') : t('save_customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
