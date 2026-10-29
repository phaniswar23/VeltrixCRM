import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import {
  Users,
  UserCheck,
  CheckSquare,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowUpRight,
  MessageSquare,
  Eye,
  Activity,
  Layers,
  Check,
  Mail,
  Briefcase,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const countdownIntervalRef = useRef(null);
  const successTimeoutRef = useRef(null);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);

  const fetchStats = async () => {
    try {
      const [statsRes, staffRes] = await Promise.all([
        api.get('/staff/stats'),
        api.get('/staff'),
      ]);
      setStats(statsRes.data?.stats);
      setStaffList(staffRes.data?.staff || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto sync polling every 30 seconds
    const autoSyncInterval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => {
      clearInterval(autoSyncInterval);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (refreshing || countdown > 0) return;

    setRefreshing(true);
    setShowSyncSuccess(false);
    setCountdown(5);

    // Immediately fetch fresh backend data
    fetchStats();

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let remainingSeconds = 5;
    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds > 0) {
        setCountdown(remainingSeconds);
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(0);
        setRefreshing(false);
        setShowSyncSuccess(true);
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = setTimeout(() => {
          setShowSyncSuccess(false);
        }, 1500);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
            {t('admin_dashboard') || 'Admin Dashboard'}
          </h1>
          <p className="text-xs text-[#706F6C] mt-1">
            Real-time overview of customer pipelines, team tasks, and workspace activities.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || countdown > 0}
            className={`btn-secondary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 relative overflow-hidden transition-all duration-300 shadow-2xs ${
              refreshing
                ? '!border-emerald-600/40 !bg-emerald-50/70 !text-emerald-900 shadow-inner cursor-wait'
                : showSyncSuccess
                ? '!border-emerald-600 !bg-emerald-50 !text-emerald-800'
                : 'hover:border-[#2D3A2D]'
            }`}
            title={refreshing ? `Refreshing (${countdown}s remaining)` : 'Refresh real-time data'}
          >
            {refreshing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span className="tabular-nums">
                  Refreshing ({countdown}s)...
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />
              </>
            ) : showSyncSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Synced!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#2D3A2D]" />
                <span>Refresh Data</span>
              </>
            )}
          </button>

          {/* Add Customer Button */}
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E5E2DC] shadow-xs relative overflow-hidden hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706F6C]">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#2D3A2D]/10 flex items-center justify-center text-[#2D3A2D]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalCustomers || 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stats?.customerGrowth || 0}%
            </span>
          </div>
          <p className="text-[11px] text-[#706F6C]">Active pipeline accounts</p>
        </div>

        {/* Card 2: Total Staff */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E5E2DC] shadow-xs relative overflow-hidden hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706F6C]">
              Total Staff
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalStaff || 0}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
                (stats?.onlineStaffCount ?? 0) > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  (stats?.onlineStaffCount ?? 0) > 0
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-stone-400'
                }`}
              ></div>
              <span>
                {stats?.onlineStaffCount ?? 0} Online
              </span>
            </span>
          </div>
          <p className="text-[11px] text-[#706F6C]">Active team members</p>
        </div>

        {/* Card 3: Total Tasks */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E5E2DC] shadow-xs relative overflow-hidden hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706F6C]">
              Total Tasks
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalTasks || 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stats?.taskGrowth || 0}%
            </span>
          </div>
          <p className="text-[11px] text-[#706F6C]">Scheduled deliverables</p>
        </div>

        {/* Card 4: Task Efficiency */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E5E2DC] shadow-xs relative overflow-hidden hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706F6C]">
              Completed Tasks
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.completedTasks || 0}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {stats?.taskEfficiency || 0}% Efficiency
            </span>
          </div>
          <p className="text-[11px] text-[#706F6C]">Task resolution rate</p>
        </div>
      </div>

      {/* Main Grid: Recent Customers & Activity Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Customers Table */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#FAF9F5]">
              <div>
                <h3 className="heading-editorial text-lg text-[#1A1A1A]">Recent Customers</h3>
                <p className="text-xs text-[#706F6C] mt-0.5">
                  Latest leads and client accounts
                </p>
              </div>
              <Link
                to="/admin/customers"
                className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2DC] bg-[#FAF9F5]/50 text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
                  {stats?.recentCustomers?.length > 0 ? (
                    stats.recentCustomers.map((cust) => {
                      const statusClass =
                        cust.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : cust.status === 'lead'
                          ? 'bg-orange-50 text-orange-800 border-orange-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200';
                      const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');

                      return (
                        <tr key={cust._id} className="hover:bg-[#FBFBF9] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#1A1A1A]">{cust.name}</p>
                                {/* Highlighted Gmail / Contact email */}
                                {cust.email ? (
                                  <a
                                    href={`mailto:${cust.email}`}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-[#706F6C] hover:text-red-700 font-medium transition"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span>{cust.email}</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-[#706F6C]/60">No email</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}
                            >
                              {cust.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-medium text-[#1A1A1A]">
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-4 h-4 rounded-full bg-[#F5F3EF] border border-[#E5E2DC] text-[8px] font-bold flex items-center justify-center text-[#2D3A2D]">
                                {cust.assigned_to?.name?.charAt(0) || 'U'}
                              </div>
                              <span>{cust.assigned_to?.name || 'Unassigned'}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition shadow-2xs"
                                  title="Direct WhatsApp Chat"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => setSelectedCustomer(cust)}
                                className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] border border-[#E5E2DC] rounded-lg transition shadow-2xs"
                                title="View Customer Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#706F6C]">
                        No customers registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time System Pulse Activity Feed */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2D3A2D]" />
                <h3 className="heading-editorial text-lg text-[#1A1A1A]">Activity History</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3.5 max-h-[380px] overflow-y-auto">
              {stats?.recentActivities?.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div
                    key={act._id}
                    className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E2DC]/80 space-y-1 hover:border-[#2D3A2D] transition shadow-2xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#1A1A1A]">{act.action}</span>
                      <span className="text-[10px] font-medium text-[#706F6C] bg-white px-2 py-0.5 rounded-lg border border-[#E5E2DC]">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#706F6C] leading-relaxed">{act.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[#706F6C]">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload & Capacity Section */}
      <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#FAF9F5]">
          <div>
            <h3 className="heading-editorial text-lg text-[#1A1A1A]">Team Workload & Capacity</h3>
            <p className="text-xs text-[#706F6C] mt-0.5">
              Customer pipeline and active task distribution across team members.
            </p>
          </div>
          <Link
            to="/admin/staff"
            className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#E5E2DC] shadow-2xs hover:shadow-xs transition"
          >
            <span>Staff Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6">
          {stats?.staffPerformance?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.staffPerformance.map((staff) => {
                const totalTasksCount = Math.max(1, stats?.totalTasks || 1);
                const workloadPercent = Math.round(((staff.tasksCount || 0) / totalTasksCount) * 100);
                const isHighLoad = workloadPercent >= 40;

                return (
                  <div
                    key={staff._id}
                    className="bg-[#FAF9F5] border border-[#E5E2DC] rounded-[24px] p-5 space-y-4 hover:border-[#2D3A2D] hover:shadow-md transition group flex flex-col justify-between"
                  >
                    <div>
                      {/* Member Info */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1A1A] text-sm truncate">{staff.name}</p>
                            <p className="text-[11px] text-[#706F6C] truncate">{staff.email || 'Team Staff'}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${
                            isHighLoad
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isHighLoad ? 'Active Load' : 'Balanced'}
                        </span>
                      </div>

                      {/* 2 Stat Boxes */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white border border-[#E5E2DC] rounded-2xl p-3 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-[#706F6C] mb-1">
                            <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Clients</span>
                          </div>
                          <p className="text-xl font-black text-[#1A1A1A]">
                            {staff.customersCount}{' '}
                            <span className="text-xs font-medium text-[#706F6C]">Accounts</span>
                          </p>
                        </div>

                        <div className="bg-white border border-[#E5E2DC] rounded-2xl p-3 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-[#706F6C] mb-1">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
                          </div>
                          <p className="text-xl font-black text-[#1A1A1A]">
                            {staff.tasksCount}{' '}
                            <span className="text-xs font-medium text-[#706F6C]">Active</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="pt-3 border-t border-[#E5E2DC]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#706F6C] font-medium text-[11px]">Workload Share:</span>
                        <span className="font-bold text-[#1A1A1A] text-xs">
                          {workloadPercent}% <span className="font-normal text-[#706F6C]">({staff.tasksCount} of {totalTasksCount} tasks)</span>
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E2DC]/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2D3A2D] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(6, workloadPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#706F6C]">
              No team members recorded.
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        staffList={staffList}
        onSaved={fetchStats}
      />
    </div>
  );
};

export default AdminDashboard;
