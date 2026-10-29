import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
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
  RefreshCw,
  Search,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Mail,
  Edit2,
  Check,
  Building,
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Filters
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'completed' | 'high'
  const [taskSearch, setTaskSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchStaffData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/staff/stats');
      setStats(res.data?.stats);
    } catch (err) {
      console.error('Error fetching staff data', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(newStatus === 'completed' ? 'Task marked as completed!' : 'Task status updated');
      fetchStaffData();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  // Helper for human-friendly relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filtered task items
  const filteredTasks = useMemo(() => {
    const list = stats?.recentTasks || [];
    return list.filter((task) => {
      if (taskFilter === 'pending' && task.status !== 'pending') return false;
      if (taskFilter === 'in_progress' && task.status !== 'in_progress') return false;
      if (taskFilter === 'completed' && task.status !== 'completed') return false;
      if (taskFilter === 'high' && task.priority !== 'high') return false;

      if (!taskSearch.trim()) return true;
      const q = taskSearch.toLowerCase();
      const title = task.title?.toLowerCase() || '';
      const desc = task.description?.toLowerCase() || '';
      const cust = task.customer_id?.name?.toLowerCase() || '';
      return title.includes(q) || desc.includes(q) || cust.includes(q);
    });
  }, [stats?.recentTasks, taskFilter, taskSearch]);

  // Filtered customer items
  const filteredCustomers = useMemo(() => {
    const list = stats?.recentCustomers || [];
    if (!customerSearch.trim()) return list;
    const q = customerSearch.toLowerCase();
    return list.filter((c) => {
      const name = c.name?.toLowerCase() || '';
      const email = c.email?.toLowerCase() || '';
      const phone = c.phone || '';
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [stats?.recentCustomers, customerSearch]);

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completionRate = stats?.totalTasks > 0
    ? Math.round(((stats?.completedTasks || 0) / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Top Welcome Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 sm:p-7 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Welcome back, {user?.name}
            </h1>
            <span className="text-[11px] font-bold text-[#2D3A2D] bg-[#2D3A2D]/10 px-3 py-1 rounded-full border border-[#2D3A2D]/20">
              Staff Portal
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#706F6C] mt-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#2D3A2D]" />
              {todayFormatted}
            </span>
            <span>•</span>
            <span>Here is your current task list and customer overview.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchStaffData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#E5E2DC] bg-[#FAF9F5] text-[#2D3A2D] hover:bg-[#eae7e1] transition shadow-2xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Customer Button */}
          <button
            type="button"
            onClick={() => setIsAddCustomerOpen(true)}
            className="btn-secondary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => {
              setTaskToEdit(null);
              setIsAddTaskOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: My Customers */}
        <Link
          to="/staff/customers"
          className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:border-[#2D3A2D] hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              My Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {stats?.totalCustomers || 0}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{stats?.activeCustomers || 0} Active • {stats?.leadCustomers || 0} Leads</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                View <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Pending Tasks */}
        <Link
          to="/staff/tasks"
          className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:border-[#2D3A2D] hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {stats?.pendingTasks || 0}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{stats?.inProgressTasks || 0} In Progress</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                {stats?.highPriorityTasks || 0} High Priority
              </span>
            </div>
          </div>
        </Link>

        {/* Card 3: Completed Tasks */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {stats?.completedTasks || 0}
            </div>
            <div className="mt-2 pt-2 border-t border-[#E5E2DC]/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#706F6C]">
                <span>Completion rate</span>
                <span className="font-bold text-emerald-700">{completionRate}%</span>
              </div>
              <div className="w-full bg-[#E5E2DC] h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Daily Work Status */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Work Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {stats?.pendingTasks === 0 ? 'All caught up' : `${stats?.pendingTasks} to do`}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{stats?.recentActivities?.length || 0} actions logged</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Column: My Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden flex flex-col">
          {/* Section Header */}
          <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="heading-editorial text-xl text-[#1A1A1A]">My Tasks</h3>
                <span className="text-[10px] font-bold text-[#2D3A2D] bg-[#2D3A2D]/10 px-2.5 py-0.5 rounded-full font-mono">
                  {filteredTasks.length}
                </span>
              </div>
              <p className="text-[11px] text-[#706F6C] mt-0.5">
                Tasks assigned to you for execution and review.
              </p>
            </div>

            <Link
              to="/staff/tasks"
              className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="p-4 border-b border-[#E5E2DC] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Quick status tabs */}
            <div className="flex items-center bg-[#F5F3EF] p-1 rounded-xl border border-[#E5E2DC] overflow-x-auto text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setTaskFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  taskFilter === 'all' ? 'bg-white text-[#2D3A2D] shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('pending')}
                className={`px-3 py-1 rounded-lg transition ${
                  taskFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('in_progress')}
                className={`px-3 py-1 rounded-lg transition ${
                  taskFilter === 'in_progress' ? 'bg-white text-blue-800 shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('completed')}
                className={`px-3 py-1 rounded-lg transition ${
                  taskFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-48">
              <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-2.5" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] outline-none focus:border-[#2D3A2D] transition placeholder:text-[#706F6C]/60"
              />
            </div>
          </div>

          {/* Task List */}
          <div className="p-3 divide-y divide-[#E5E2DC]/50 overflow-y-auto max-h-[520px]">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.status !== 'completed';

                return (
                  <div
                    key={task._id}
                    className="p-4 hover:bg-[#FAF9F5] transition rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            task.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : task.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>

                        {/* Priority Badge */}
                        {task.priority && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              task.priority === 'high'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}

                        <h4 className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#2D3A2D] transition">
                          {task.title}
                        </h4>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-[#706F6C] line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="text-[11px] text-[#706F6C] flex flex-wrap items-center gap-3 pt-0.5">
                        {task.customer_id?.name ? (
                          <span className="flex items-center gap-1 font-medium text-[#2D3A2D]">
                            <Building className="w-3 h-3" />
                            {task.customer_id.name}
                          </span>
                        ) : (
                          <span className="text-stone-400">Internal Task</span>
                        )}

                        {task.due_date && (
                          <span
                            className={`flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                                : 'bg-[#F5F3EF] text-[#706F6C]'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {task.status !== 'completed' ? (
                        <>
                          {task.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                            >
                              Start
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finished</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsAddTaskOpen(true);
                        }}
                        className="p-1.5 text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#F5F3EF] rounded-lg transition"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-[#706F6C] space-y-3">
                <CheckSquare className="w-9 h-9 text-[#706F6C]/40 mx-auto" />
                <p className="text-xs font-semibold">No tasks found matching your filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsAddTaskOpen(true);
                  }}
                  className="btn-secondary-veltrix !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create a task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customers & Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-7">
          
          {/* Card 1: My Customers */}
          <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F5] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="heading-editorial text-lg text-[#1A1A1A]">My Customers</h3>
                  <span className="text-[10px] font-bold text-[#2D3A2D] bg-[#2D3A2D]/10 px-2 py-0.5 rounded-full font-mono">
                    {filteredCustomers.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#706F6C] mt-0.5">
                  Customers assigned to you.
                </p>
              </div>

              <Link
                to="/staff/customers"
                className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick search input */}
            <div className="p-3 border-b border-[#E5E2DC]/60 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search my customers..."
                  className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] outline-none focus:border-[#2D3A2D] transition placeholder:text-[#706F6C]/60"
                />
              </div>
            </div>

            {/* Customer list */}
            <div className="p-3 divide-y divide-[#E5E2DC]/50 overflow-y-auto max-h-[300px]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <div
                      key={cust._id}
                      className="p-3 hover:bg-[#FAF9F5] transition rounded-2xl flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {cust.name?.charAt(0) || 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                              {cust.name}
                            </h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                cust.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : cust.status === 'lead'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {cust.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#706F6C] truncate mt-0.5">
                            {cust.email || cust.phone || 'No contact details'}
                          </p>
                        </div>
                      </div>

                      {/* Customer Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-transparent hover:border-emerald-200"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        {cust.email && (
                          <a
                            href={`mailto:${cust.email}`}
                            className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[#706F6C] space-y-2">
                  <Users className="w-7 h-7 text-[#706F6C]/40 mx-auto" />
                  <p className="text-xs font-semibold">No assigned customers yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="btn-secondary-veltrix !py-1 !px-3 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add customer</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: My Recent Actions */}
          <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E5E2DC] bg-[#FAF9F5] flex justify-between items-center">
              <div>
                <h3 className="heading-editorial text-base text-[#1A1A1A]">My Recent Activity</h3>
                <p className="text-[10px] text-[#706F6C] mt-0.5">
                  Actions you took recently in the workspace.
                </p>
              </div>
              <Activity className="w-4 h-4 text-[#706F6C]" />
            </div>

            <div className="p-3 divide-y divide-[#E5E2DC]/50 overflow-y-auto max-h-[220px]">
              {stats?.recentActivities?.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div key={act._id} className="p-3 hover:bg-[#FAF9F5] transition rounded-xl flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-[#1A1A1A] block truncate">{act.action}</span>
                      <span className="text-[11px] text-[#706F6C] block truncate">{act.description || 'No description'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#706F6C] shrink-0">
                      {getRelativeTime(act.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-[#706F6C] text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D3A2D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <CustomerFormModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        customerToEdit={null}
        staffList={user ? [user] : []}
        onSaved={fetchStaffData}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        staffList={user ? [user] : []}
        customerList={stats?.recentCustomers || []}
        onSaved={fetchStaffData}
      />
    </div>
  );
};

export default StaffDashboard;