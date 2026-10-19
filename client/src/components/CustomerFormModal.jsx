import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import { X } from 'lucide-react';

const CustomerFormModal = ({ isOpen, onClose, customerToEdit, staffList, onSaved }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead',
    assigned_to: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        email: customerToEdit.email || '',
        phone: customerToEdit.phone || '',
        status: customerToEdit.status || 'lead',
        assigned_to: customerToEdit.assigned_to?._id || customerToEdit.assigned_to || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'lead',
        assigned_to: '',
      });
    }
    setError('');
  }, [customerToEdit, isOpen]);

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
      if (customerToEdit) {
        await api.put(`/customers/${customerToEdit._id}`, formData);
      } else {
        await api.post('/customers', formData);
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
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-[#E5E2DC] overflow-hidden animate-bounce-in">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]">
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
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('full_name')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('email_address')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@acme.com"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('phone_number')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="lead">{t('lead')}</option>
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('assigned_to')}
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="">{t('unassigned')}</option>
                {staffList?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary-veltrix !py-3 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary-veltrix !py-3 text-xs font-bold disabled:opacity-50"
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
