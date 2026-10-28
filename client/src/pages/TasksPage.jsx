import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  Search,
  Plus,
  Calendar,
  CheckCircle,
  Edit2,
  Trash2,
  Briefcase,
  User,
  X,
} from 'lucide-react';

const TasksPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [tasks, setTasks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Modals
  const [formTask, setFormTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMetadata = async () => {
    try {
      const [staffRes, custRes] = await Promise.all([
        api.get('/staff'),
        api.get('/customers'),
      ]);
      setStaffList(staffRes.data?.staff || []);
      setCustomerList(custRes.data?.customers || []);
    } catch (err) {
      console.error('Error fetching task metadata:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedStaff) params.staff_id = selectedStaff;

      // Staff users view assigned by default
      if (!isAdmin && !selectedStaff) {
        params.staff_id = user?._id;
      }

      const tasksRes = await api.get('/tasks', { params });
      setTasks(tasksRes.data?.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus, selectedStaff]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatus('');
    setSelectedStaff('');
    setTimeout(fetchTasks, 10);
  };

  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/tasks/${deleteId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">{t('tasks')}</h1>
          <p className="text-xs text-[#706F6C] mt-1">{t('staff_overview')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_objectives')}
              className="w-full bg-white border border-[#E5E2DC] rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-wider focus:border-[#2D3A2D] outline-none shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-3 text-[#706F6C] hover:text-[#2D3A2D]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#E5E2DC] rounded-2xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] focus:border-[#2D3A2D] outline-none shadow-sm cursor-pointer"
          >
            <option value="">{t('status_filter')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('in_progress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>

          {/* Staff Filter (Admin) */}
          {isAdmin && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-white border border-[#E5E2DC] rounded-2xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] focus:border-[#2D3A2D] outline-none shadow-sm cursor-pointer"
            >
              <option value="">{t('personnel')}</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {(search || selectedStatus || selectedStaff) && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-[#706F6C] hover:text-[#9B5A46] transition"
              title="Clear Filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => {
              setFormTask(null);
              setIsFormOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_task')}</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#706F6C]">
          <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading tasks...
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const statusClass =
              task.status === 'completed'
                ? 'bg-emerald-50 text-emerald-800'
                : task.status === 'in_progress'
                ? 'bg-[#2D3A2D]/10 text-[#2D3A2D]'
                : 'bg-orange-50 text-orange-800';

            return (
              <div
                key={task._id}
                className="card-veltrix bg-white group flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}
                    >
                      {t(task.status) || task.status}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleToggleStatus(task._id, 'completed')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Mark Complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setFormTask(task);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                        title={t('edit_task')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(task._id)}
                        className="p-1.5 text-[#706F6C] hover:text-[#9B5A46] hover:bg-[#9B5A46]/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="heading-editorial text-lg mb-2 text-[#1A1A1A]">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#706F6C] line-clamp-3 mb-6 leading-relaxed">
                    {task.description || 'No objective details provided.'}
                  </p>
                </div>

                <div>
                  {/* Due date */}
                  <div className="mb-4 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#706F6C]/70" />
                    <span>
                      {task.due_date
                        ? `${t('due')}: ${new Date(task.due_date).toLocaleDateString()}`
                        : t('no_due_date')}
                    </span>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-4 border-t border-[#E5E2DC] flex justify-between items-center text-[10px] font-semibold text-[#706F6C]">
                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                      <span className="truncate">
                        {task.customer_id?.name || t('internal_project')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#2D3A2D] text-white text-[9px] font-bold flex items-center justify-center">
                        {task.assigned_to?.name?.charAt(0) || 'U'}
                      </div>
                      <span>{task.assigned_to?.name || t('unassigned')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center card-veltrix bg-white">
          <CheckCircle className="w-12 h-12 text-[#706F6C]/40 mx-auto mb-3" />
          <h3 className="heading-editorial text-2xl mb-1">{t('no_tasks_found')}</h3>
          <p className="text-xs text-[#706F6C]">All objectives for this view have been resolved.</p>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={formTask}
        staffList={staffList}
        customerList={customerList}
        onSaved={fetchTasks}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Objective?"
        message="Are you sure you want to permanently remove this operational objective? This action cannot be undone."
        confirmText="Remove Objective"
      />
    </div>
  );
};

export default TasksPage;
