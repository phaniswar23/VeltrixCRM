import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import ReassignTaskModal from '../components/ReassignTaskModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
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
  Check,
  Mail,
  Briefcase,
  Edit2,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  Info,
  Sparkles,
  Phone,
  ChevronDown,
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
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Workload rebalancing modal state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignStaffMember, setReassignStaffMember] = useState(null);

  // Customer deletion state
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);

  // Collapsible activity grouping state (Tip 2: Contextual Redundancy Reduction)
  const [expandedActivityGroupId, setExpandedActivityGroupId] = useState(null);

  const groupedRecentActivities = useMemo(() => {
    if (!stats?.recentActivities?.length) return [];
    const groups = [];

    stats.recentActivities.forEach((act) => {
      const prev = groups[groups.length - 1];
      const isSameAction = prev && prev.action === act.action;
      const prevTime = prev ? new Date(prev.createdAt).getTime() : 0;
      const currTime = new Date(act.createdAt).getTime();
      const isClose = Math.abs(currTime - prevTime) < 15 * 60 * 1000;

      if (isSameAction && isClose) {
        prev.items.push(act);
        prev.count += 1;
      } else {
        groups.push({
          ...act,
          groupId: act._id,
          count: 1,
          items: [act],
        });
      }
    });

    return groups;
  }, [stats?.recentActivities]);

  const handleDeleteCustomer = async () => {
    if (!deleteCustomerTarget) return;
    try {
      await api.delete(`/customers/${deleteCustomerTarget.id}`);
      fetchStats();
    } catch (err) {
      console.error('Failed to delete customer:', err);
    } finally {
      setDeleteCustomerTarget(null);
    }
  };

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

  /**
   * Helper to format Activity descriptions cleanly,
   * converting raw backend import logs into informative admin badges.
   */
  const renderActivityDetails = (act) => {
    const desc = act.description || '';

    // Detect CSV Import with skipped duplicates
    if (
      act.action?.toLowerCase().includes('csv') ||
      desc.toLowerCase().includes('bulk imported') ||
      desc.toLowerCase().includes('skipped')
    ) {
      // Extract numbers if present: "Bulk imported 0 customers, updated 0, skipped 5"
      const match = desc.match(/imported\s*(\d+).*?updated\s*(\d+).*?skipped\s*(\d+)/i);
      const skippedMatch = desc.match(/skipped\s*(\d+)/i);
      const skippedCount = match ? parseInt(match[3], 10) : skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
      const importedCount = match ? parseInt(match[1], 10) : 0;
      const updatedCount = match ? parseInt(match[2], 10) : 0;

      return (
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {importedCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                +{importedCount} New
              </span>
            )}
            {updatedCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                {updatedCount} Updated
              </span>
            )}
            {skippedCount > 0 ? (
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 cursor-help"
                title="Existing contacts with matching email addresses were skipped to prevent duplicate accounts."
              >
                <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                <span>{skippedCount} Duplicate emails skipped</span>
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-[#706F6C]">
            CSV batch import processed. Existing records protected against duplicates.
          </p>
        </div>
      );
    }

    return <p className="text-xs text-[#706F6C] leading-relaxed mt-0.5">{desc}</p>;
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

        {/* Action Button Alignment: Subtle Refresh Icon Button + Primary Add Customer CTA */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Subtle Refresh Icon Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || countdown > 0}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-2xs ${
              refreshing
                ? 'border-emerald-600/40 bg-emerald-50/70 text-emerald-900 shadow-inner cursor-wait'
                : showSyncSuccess
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-[#E5E2DC] bg-white hover:border-[#2D3A2D] text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
            title={
              refreshing
                ? `Syncing data (${countdown}s remaining)`
                : showSyncSuccess
                ? 'Workspace data synced!'
                : 'Refresh real-time data'
            }
            aria-label="Refresh real-time data"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            ) : showSyncSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>

          {/* Add Customer Button (Primary Brand Fill) */}
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsAddCustomerOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-sm"
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
            {/* Meaningful Contextual Indicator instead of misleading +100% baseline jump */}
            {(stats?.totalCustomers || 0) <= 10 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>New Workspace</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{stats?.customerGrowth || 0}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#706F6C]">Active customer records</p>
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
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                (stats?.onlineStaffCount ?? 0) > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-[#FAF9F5] text-[#706F6C] border-[#E5E2DC]'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  (stats?.onlineStaffCount ?? 0) > 0
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-[#706F6C]/50'
                }`}
              />
              <span>{stats?.onlineStaffCount ?? 0} Online</span>
            </span>
          </div>
          <p className="text-[11px] text-[#706F6C]">Assigned workspace team</p>
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
            {(stats?.totalTasks || 0) <= 10 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Sprint
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{stats?.taskGrowth || 0}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#706F6C]">Scheduled team deliverables</p>
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
                    <th className="px-6 py-4 text-center">Actions</th>
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

                          {/* Defined Quick Action Targets Enclosed in Pill */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1 p-1 bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl shadow-2xs group-hover:bg-white group-hover:border-[#2D3A2D]/30 transition">
                              {/* Action 1: View 360° Profile */}
                              <button
                                onClick={() => setSelectedCustomer(cust)}
                                className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                                title="View Customer Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Action 2: Edit Customer */}
                              <button
                                onClick={() => {
                                  setCustomerToEdit(cust);
                                  setIsAddCustomerOpen(true);
                                }}
                                className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                                title="Edit Customer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Action 3: Direct Outreach (WhatsApp or Mail) */}
                              {cleanPhone ? (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                  title={`WhatsApp: ${cust.phone}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              ) : cust.email ? (
                                <a
                                  href={`mailto:${cust.email}`}
                                  className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                                  title={`Send Email: ${cust.email}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              ) : null}

                              {/* Action 4: Delete Customer */}
                              <button
                                onClick={() => setDeleteCustomerTarget({ id: cust._id, name: cust.name })}
                                className="p-1.5 text-[#706F6C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
              <Link
                to="/admin/activity"
                className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
              >
                <span>Full Audit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 space-y-3.5 max-h-[380px] overflow-y-auto">
              {groupedRecentActivities?.length > 0 ? (
                groupedRecentActivities.map((group) => {
                  const isMulti = group.count > 1;
                  const isExpanded = expandedActivityGroupId === group.groupId;

                  if (isMulti) {
                    return (
                      <div
                        key={group.groupId}
                        className="rounded-2xl bg-[#FAF9F5] border border-[#E5E2DC]/90 overflow-hidden shadow-2xs transition hover:border-[#2D3A2D]/40"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedActivityGroupId(isExpanded ? null : group.groupId)}
                          className="w-full p-3.5 flex items-center justify-between text-left gap-2 hover:bg-[#F5F3EF]/60 transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-[#1A1A1A] truncate">{group.action}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#2D3A2D]/10 text-[#2D3A2D] border border-[#2D3A2D]/20">
                              {group.count} grouped
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-medium text-[#706F6C] bg-white px-2 py-0.5 rounded-lg border border-[#E5E2DC]">
                              {new Date(group.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-[#706F6C] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#2D3A2D]' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Collapsed Preview */}
                        {!isExpanded && (
                          <div className="px-3.5 pb-3 pt-0">
                            <p className="text-[11px] text-[#706F6C] italic truncate">
                              {group.count} consecutive operations collapsed to reduce feed clutter. Click to inspect individual timestamps.
                            </p>
                          </div>
                        )}

                        {/* Expanded Individual Items */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-[#E5E2DC]/70 bg-white/70">
                            {group.items.map((item, idx) => (
                              <div
                                key={item._id || idx}
                                className="p-2.5 rounded-xl bg-white border border-[#E5E2DC] space-y-1 shadow-3xs"
                              >
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-semibold text-[#1A1A1A]">Entry #{idx + 1}</span>
                                  <span className="text-[#706F6C] font-mono">
                                    {new Date(item.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {renderActivityDetails(item)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={group._id}
                      className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E2DC]/80 space-y-1 hover:border-[#2D3A2D] transition shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1A1A1A]">{group.action}</span>
                        <span className="text-[10px] font-medium text-[#706F6C] bg-white px-2 py-0.5 rounded-lg border border-[#E5E2DC]">
                          {new Date(group.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {renderActivityDetails(group)}
                    </div>
                  );
                })
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

                // Capacity conditions
                const isOverloaded = workloadPercent >= 50 && (staff.tasksCount || 0) >= 2;
                const isHeavy = workloadPercent >= 35 && !isOverloaded;
                const isAvailable = (staff.tasksCount || 0) === 0;

                return (
                  <div
                    key={staff._id}
                    className={`rounded-[24px] p-5 space-y-4 transition group flex flex-col justify-between shadow-2xs hover:shadow-md ${
                      isOverloaded
                        ? 'bg-rose-50/20 border-2 border-rose-300/80 hover:border-rose-400'
                        : isHeavy
                        ? 'bg-[#FAF9F5] border border-amber-300 hover:border-amber-400'
                        : 'bg-[#FAF9F5] border border-[#E5E2DC] hover:border-[#2D3A2D]'
                    }`}
                  >
                    <div>
                      {/* Member Info */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                              isOverloaded
                                ? 'bg-rose-700 text-white'
                                : 'bg-[#2D3A2D] text-white'
                            }`}
                          >
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1A1A] text-sm truncate">{staff.name}</p>
                            <p className="text-[11px] text-[#706F6C] truncate">{staff.email || 'Team Staff'}</p>
                          </div>
                        </div>

                        {/* Status Capacity Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 flex items-center gap-1 ${
                            isOverloaded
                              ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                              : isHeavy
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isAvailable
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isOverloaded ? (
                            <>
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-700" />
                              <span>Overloaded</span>
                            </>
                          ) : isHeavy ? (
                            'Active Load'
                          ) : isAvailable ? (
                            'Available Capacity'
                          ) : (
                            'Optimal'
                          )}
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
                            <CheckSquare
                              className={`w-3.5 h-3.5 ${
                                isOverloaded ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            />
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
                    <div className="pt-3 border-t border-[#E5E2DC]/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#706F6C] font-medium text-[11px]">Workload Share:</span>
                        <span className="font-bold text-[#1A1A1A] text-xs">
                          {workloadPercent}%{' '}
                          <span className="font-normal text-[#706F6C]">
                            ({staff.tasksCount} of {totalTasksCount} tasks)
                          </span>
                        </span>
                      </div>

                      {/* Visual progress bar with dynamic capacity color */}
                      <div className="w-full bg-[#E5E2DC]/80 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverloaded
                              ? 'bg-rose-500'
                              : isHeavy
                              ? 'bg-amber-500'
                              : isAvailable
                              ? 'bg-blue-400'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.max(6, workloadPercent)}%` }}
                        />
                      </div>

                      {/* Fast-Action Button: Reassign Tasks */}
                      {(staff.tasksCount || 0) > 0 ? (
                        <button
                          onClick={() => {
                            setReassignStaffMember(staff);
                            setReassignModalOpen(true);
                          }}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs hover:shadow-xs mt-2 ${
                            isOverloaded
                              ? 'bg-white hover:bg-rose-100 border-rose-300 text-rose-800'
                              : 'bg-white hover:bg-[#F5F3EF] border-[#E5E2DC] text-[#2D3A2D]'
                          }`}
                          title={`Rebalance workload: reassign tasks from ${staff.name}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Reassign Tasks</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 mt-2">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Ready for new tasks</span>
                        </div>
                      )}
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

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
        staffList={staffList}
        onSaved={fetchStats}
      />

      {/* Fast Interactive Reassign Tasks Modal */}
      <ReassignTaskModal
        isOpen={reassignModalOpen}
        onClose={() => {
          setReassignModalOpen(false);
          setReassignStaffMember(null);
        }}
        staffMember={reassignStaffMember}
        staffList={staffList}
        onReassigned={fetchStats}
      />

      {/* Delete Customer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCustomerTarget)}
        onClose={() => setDeleteCustomerTarget(null)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer Account"
        message={`Are you sure you want to delete "${deleteCustomerTarget?.name}"? All associated pipeline deals, task history, and contact records will be impacted.`}
        confirmText="Delete Customer"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminDashboard;
