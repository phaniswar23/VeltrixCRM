import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { X } from 'lucide-react';

const TaskFormModal = ({ isOpen, onClose, taskToEdit, staffList, customerList, onSaved }) => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    customer_id: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        assigned_to: taskToEdit.assigned_to?._id || taskToEdit.assigned_to || (isAdmin ? '' : user?._id || ''),
        customer_id: taskToEdit.customer_id?._id || taskToEdit.customer_id || '',
        status: taskToEdit.status || 'pending',
        priority: taskToEdit.priority || 'medium',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.substring(0, 10) : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assigned_to: isAdmin ? (staffList?.[0]?._id || '') : (user?._id || ''),
        customer_id: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
      });
    }
    setError('');
  }, [taskToEdit, isOpen, staffList, isAdmin, user?._id]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assigned_to) {
      setError('Task title and assigned user are required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit._id}`, formData);
      } else {
        await api.post('/tasks', formData);
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
              {taskToEdit ? t('edit_task') : t('add_task')}
            </h3>
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mt-0.5">
              Task Details
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
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('task_title')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('task_placeholder')}
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
              {t('description')}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('desc_placeholder')}
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('assigned_to')} *
              </label>
              {isAdmin ? (
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
                >
                  <option value="">{t('personnel')}</option>
                  {staffList?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#2D3A2D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{user?.name || 'You'} (Self)</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2D3A2D]/10 text-[#2D3A2D]">
                    Staff Task
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('customer')}
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="">{t('internal_project')}</option>
                {customerList?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="pending">{t('pending')}</option>
                <option value="in_progress">{t('in_progress')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none transition cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                {t('due_date')}
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition"
              />
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
              {submitting ? 'Saving...' : taskToEdit ? t('update_task') : t('create_task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
