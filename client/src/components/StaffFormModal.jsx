import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import { X } from 'lucide-react';

const StaffFormModal = ({ isOpen, onClose, staffToEdit, onSaved }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        name: staffToEdit.name || '',
        email: staffToEdit.email || '',
        password: '',
        role: staffToEdit.role || 'staff',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
      });
    }
    setError('');
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!staffToEdit && !formData.password) {
      setError('Password is required for new personnel');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (staffToEdit) {
        await api.put(`/staff/${staffToEdit._id}`, formData);
      } else {
        await api.post('/staff', formData);
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
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]">
          <div>
            <h3 className="heading-editorial text-xl font-bold">
              {staffToEdit ? t('edit_member') : t('new_member')}
            </h3>
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mt-0.5">
              {t('operational_authority_onboarding')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#706F6C] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('name')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Marcus Vance"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('email')} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="member@veltrix.com"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('security_credential')}{' '}
              {staffToEdit ? '(Leave empty to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              required={!staffToEdit}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('operational_role')} *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
            >
              <option value="staff">{t('operational_staff')}</option>
              <option value="admin">{t('system_administrator')}</option>
            </select>
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
              {submitting
                ? 'Processing...'
                : staffToEdit
                ? t('save_changes')
                : t('authorize_member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
