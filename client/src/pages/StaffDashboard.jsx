import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
  Eye,
  Calendar,
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchStaffData = async () => {
    try {
      const res = await api.get('/staff/stats');
      setStats(res.data?.stats);
    } catch (err) {
      console.error('Error fetching staff data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: 'completed' });
      fetchStaffData();
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">
            {t('hello')}, {user?.name}
          </h1>
          <p className="text-xs text-[#706F6C] mt-1">{t('assignments_msg')}</p>
        </div>

        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('new_task')}</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-veltrix bg-white p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('my_customers')}
            </span>
            <Users className="w-5 h-5 text-[#2D3A2D]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A]">
            {stats?.totalCustomers || 0}
          </div>
          <p className="text-[10px] text-[#706F6C] mt-1">direct client relationships</p>
        </div>

        <div className="card-veltrix bg-white p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('pending_tasks')}
            </span>
            <Clock className="w-5 h-5 text-[#9B5A46]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A]">
            {stats?.pendingTasks || 0}
          </div>
          <p className="text-[10px] text-[#706F6C] mt-1">deliverables awaiting action</p>
        </div>

        <div className="card-veltrix bg-white p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('completed_tasks')}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A1A1A]">
            {stats?.completedTasks || 0}
          </div>
          <p className="text-[10px] text-[#706F6C] mt-1">successfully resolved</p>
        </div>
      </div>

      {/* Active Tasks & Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assigned Deliverables */}
        <div className="lg:col-span-7 card-veltrix bg-white !p-0 overflow-hidden">
          <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
            <div>
              <h3 className="heading-editorial text-lg">{t('my_tasks')}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C] mt-0.5">
                {t('staff_tasks_desc')}
              </p>
            </div>
            <Link
              to="/staff/tasks"
              className="text-xs font-bold text-[#2D3A2D] hover:underline"
            >
              {t('view_all')}
            </Link>
          </div>

          <div className="divide-y divide-[#E5E2DC]/60 p-2">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 hover:bg-[#FBFBF9] transition rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : task.status === 'in_progress'
                            ? 'bg-[#2D3A2D]/10 text-[#2D3A2D]'
                            : 'bg-orange-50 text-orange-800'
                        }`}
                      >
                        {task.status}
                      </span>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{task.title}</h4>
                    </div>
                    <div className="text-[10px] text-[#706F6C] flex items-center gap-3">
                      <span>{task.customer_id?.name || t('internal_project')}</span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      className="btn-primary-veltrix !py-1.5 !px-3 text-[10px] font-bold uppercase flex items-center gap-1 flex-shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#706F6C]">
                {t('all_tasks_processed')}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Customers */}
        <div className="lg:col-span-5 card-veltrix bg-white !p-0 overflow-hidden">
          <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
            <div>
              <h3 className="heading-editorial text-lg">{t('my_customers')}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C] mt-0.5">
                {t('direct_assignments')}
              </p>
            </div>
            <Link
              to="/staff/customers"
              className="text-xs font-bold text-[#2D3A2D] hover:underline"
            >
              {t('view_all')}
            </Link>
          </div>

          <div className="divide-y divide-[#E5E2DC]/60 p-2">
            {stats?.recentCustomers?.length > 0 ? (
              stats.recentCustomers.map((cust) => {
                const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');
                return (
                  <div
                    key={cust._id}
                    className="p-4 hover:bg-[#FBFBF9] transition rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A]">{cust.name}</h4>
                      <p className="text-[10px] text-[#706F6C]">{cust.email || 'No email'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="WhatsApp DM"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                        title={t('inspect')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#706F6C]">
                {t('no_recent_assignments')}
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        staffList={[user]}
        customerList={stats?.recentCustomers || []}
        onSaved={fetchStaffData}
      />
    </div>
  );
};

export default StaffDashboard;
