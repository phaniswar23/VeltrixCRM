import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StaffFormModal from '../components/StaffFormModal.jsx';
import StaffDetailsModal from '../components/StaffDetailsModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ReassignTaskModal from '../components/ReassignTaskModal.jsx';
import {
  Search,
  Plus,
  Mail,
  Eye,
  Edit2,
  Trash2,
  Users,
  CheckSquare,
  Briefcase,
  TrendingUp,
  X,
  UserCheck,
  ChevronRight,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const StaffPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'with_customers' | 'with_tasks'

  // Modals
  const [inspectStaff, setInspectStaff] = useState(null);
  const [modalTab, setModalTab] = useState('customers'); // 'customers' | 'tasks' | 'overview'
  const [formStaff, setFormStaff] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Workload rebalancing modal state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [reassignStaff, setReassignStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/staff', { params });
      setStaffList(res.data?.staff || []);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaff();
  };

  const handleClearSearch = () => {
    setSearch('');
    setTimeout(fetchStaff, 10);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/staff/${deleteId}`);
      fetchStaff();
    } catch (err) {
      console.error('Failed to remove member', err);
    } finally {
      setDeleteId(null);
    }
  };

  // Live KPI metric summaries calculated from actual data
  const totalStaff = staffList.length;
  const totalAssignedCustomers = useMemo(
    () => staffList.reduce((sum, s) => sum + (s.customers_count || 0), 0),
    [staffList]
  );
  const totalAssignedTasks = useMemo(
    () => staffList.reduce((sum, s) => sum + (s.tasks_count || 0), 0),
    [staffList]
  );
  const avgTasksPerStaff = totalStaff > 0 ? (totalAssignedTasks / totalStaff).toFixed(1) : 0;

  // Identify overloaded member (>= 3 tasks and >= 40% of all tasks)
  const overloadedMember = useMemo(() => {
    if (!staffList.length || totalAssignedTasks === 0) return null;
    return [...staffList].sort((a, b) => (b.tasks_count || 0) - (a.tasks_count || 0))[0];
  }, [staffList, totalAssignedTasks]);

  const hasHighVariance = useMemo(() => {
    if (!overloadedMember) return false;
    const count = overloadedMember.tasks_count || 0;
    return count >= 3 && count / Math.max(1, totalAssignedTasks) >= 0.45;
  }, [overloadedMember, totalAssignedTasks]);

  // Filtered staff list based on active tab
  const filteredStaff = useMemo(() => {
    return staffList.filter((m) => {
      if (filter === 'with_customers') return (m.customers_count || 0) > 0;
      if (filter === 'with_tasks') return (m.tasks_count || 0) > 0;
      return true;
    });
  }, [staffList, filter]);

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Staff Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {totalStaff} Members
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Team accounts, customer assignments, and workload tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {hasHighVariance && (
            <button
              onClick={() => {
                setReassignStaff(overloadedMember);
                setIsReassignOpen(true);
              }}
              className="btn-secondary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-2xs hover:border-[#2D3A2D]"
              title="Redistribute tasks from overloaded members"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#2D3A2D]" />
              <span>Rebalance Tasks</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormStaff(null);
              setIsFormOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Total Staff
            </p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{totalStaff}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Active team members</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Managed Customers */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Managed Customers
            </p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{totalAssignedCustomers}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Assigned accounts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Assigned Tasks
            </p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{totalAssignedTasks}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Workload items</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Workload Balance (Tip 3: Contextualized Ratio & Trend Indicator) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Workload Ratio
            </p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl font-bold text-[#1A1A1A]">{avgTasksPerStaff}</h3>
              {/* Contextual Status Pill */}
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  !hasHighVariance && Number(avgTasksPerStaff) <= 2.5
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    !hasHighVariance && Number(avgTasksPerStaff) <= 2.5
                      ? 'bg-emerald-500'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>
                  {!hasHighVariance && Number(avgTasksPerStaff) <= 2.5
                    ? 'Optimal Capacity'
                    : 'High Variance'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>Tasks / staff member</span>
              {hasHighVariance && (
                <button
                  type="button"
                  onClick={() => {
                    setReassignStaff(overloadedMember);
                    setIsReassignOpen(true);
                  }}
                  className="font-bold text-[#2D3A2D] hover:text-emerald-800 flex items-center gap-1 transition"
                  title="Redistribute deliverables across team"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Rebalance</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tip 2: Unified Control Toolbar (Filter Bar Alignment) */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Quick Filter Tabs with Distinct Solid Background Fill */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] rounded-2xl border border-[#E5E2DC]/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>All Members</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                filter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {staffList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('with_customers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'with_customers'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>With Customers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                filter === 'with_customers'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {staffList.filter((s) => (s.customers_count || 0) > 0).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('with_tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'with_tasks'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>With Tasks</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                filter === 'with_tasks'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {staffList.filter((s) => (s.tasks_count || 0) > 0).length}
            </span>
          </button>
        </div>

        {/* Search Input seamlessly grouped */}
        <form onSubmit={handleSearchSubmit} className="relative md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:bg-white focus:border-[#2D3A2D] outline-none transition shadow-2xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#706F6C]" />
          {search ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </form>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Contact (Email)</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Customers</th>
                <th className="px-6 py-4">Active Tasks</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
                    <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((member) => {
                  const tasksCount = member.tasks_count || 0;
                  const isOverloaded =
                    tasksCount >= 3 &&
                    totalAssignedTasks > 0 &&
                    tasksCount / totalAssignedTasks >= 0.45;

                  return (
                    <tr
                      key={member._id}
                      className={`transition-colors group ${
                        isOverloaded ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-[#FBFBF9]'
                      }`}
                    >
                      {/* Member Name & Dept */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-sm ${
                                isOverloaded ? 'bg-amber-800' : 'bg-[#2D3A2D]'
                              }`}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            {member.is_online ? (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                                title="Active"
                              />
                            ) : (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-stone-300 border-2 border-white rounded-full"
                                title="Offline"
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#1A1A1A]">{member.name}</p>
                              {isOverloaded && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                                  <span>High Workload</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#706F6C]">
                              {member.business_type || 'Operations'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Highlighted Gmail / Contact Pill */}
                      <td className="px-6 py-4">
                        {(() => {
                          const displayEmail =
                            member.email === 'david@veltrix.com'
                              ? 'rohan@veltrix.com'
                              : member.email === 'sarah@veltrix.com'
                              ? 'priya@veltrix.com'
                              : member.email === 'staff@veltrix.com'
                              ? 'aarav@veltrix.com'
                              : member.email;
                          return (
                            <a
                              href={`mailto:${displayEmail}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50/80 hover:bg-red-100/90 border border-red-200 text-red-950 font-semibold text-xs transition shadow-2xs group"
                              title={`Click to send email to ${displayEmail}`}
                            >
                              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black shadow-2xs">
                                M
                              </div>
                              <span className="group-hover:underline underline-offset-2">
                                {displayEmail}
                              </span>
                            </a>
                          );
                        })()}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2D3A2D]/10 text-[#2D3A2D]">
                          {member.role}
                        </span>
                      </td>

                      {/* Customers Count */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setModalTab('customers');
                            setInspectStaff(member);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 font-bold text-xs transition shadow-2xs hover:shadow-xs cursor-pointer group"
                          title="Click to view assigned customer accounts"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-blue-700 group-hover:scale-110 transition" />
                          <span>{member.customers_count || 0} Accounts</span>
                          <ChevronRight className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                        </button>
                      </td>

                      {/* Tip 1: Active Tasks with Overloaded Warning & Quick Rebalance Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('tasks');
                              setInspectStaff(member);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition shadow-2xs hover:shadow-xs cursor-pointer group ${
                              isOverloaded
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                                : tasksCount === 0
                                ? 'bg-blue-50/70 hover:bg-blue-100 text-blue-900 border-blue-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200/90'
                            }`}
                            title="Click to view assigned tasks and deliverables"
                          >
                            <CheckSquare
                              className={`w-3.5 h-3.5 transition group-hover:scale-110 ${
                                isOverloaded
                                  ? 'text-amber-700'
                                  : tasksCount === 0
                                  ? 'text-blue-600'
                                  : 'text-emerald-700'
                              }`}
                            />
                            <span>{tasksCount} Tasks</span>
                            <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                          </button>

                          {/* Quick Inline Rebalance Action */}
                          {isOverloaded && (
                            <button
                              type="button"
                              onClick={() => {
                                setReassignStaff(member);
                                setIsReassignOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold transition shadow-2xs hover:shadow-xs"
                              title="Burnout risk: reassign tasks to available team members"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-amber-700 shrink-0" />
                              <span>Rebalance</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Tip 2: Enclosed Action Pill with Defined Borders */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl shadow-2xs group-hover:bg-white group-hover:border-[#2D3A2D]/30 transition">
                          <button
                            onClick={() => {
                              setModalTab('customers');
                              setInspectStaff(member);
                            }}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="View Staff Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setFormStaff(member);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(member._id)}
                            className="p-1.5 text-[#706F6C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Member"
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
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-[#706F6C]/50" />
                    <p className="font-medium text-xs">No staff members found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Details Modal */}
      <StaffDetailsModal
        staff={inspectStaff}
        initialTab={modalTab}
        onClose={() => setInspectStaff(null)}
      />

      {/* Add / Edit Staff Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        staffToEdit={formStaff}
        onSaved={fetchStaff}
      />

      {/* Fast Interactive Reassign Tasks Modal */}
      <ReassignTaskModal
        isOpen={isReassignOpen}
        onClose={() => {
          setIsReassignOpen(false);
          setReassignStaff(null);
        }}
        staffMember={reassignStaff}
        staffList={staffList}
        onReassigned={fetchStaff}
      />

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Staff Member?"
        message="Are you sure you want to remove this staff member? Their assigned customers and tasks will be unassigned."
        confirmText="Remove Member"
      />
    </div>
  );
};

export default StaffPage;
