import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import CSVImportModal from '../components/CSVImportModal.jsx';
import {
  Search,
  Plus,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Mail,
  User,
  Users,
  Briefcase,
  TrendingUp,
  X,
  UserCheck,
  Building,
  Upload,
  Download,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';

const CustomersPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { addEventListener } = useRealtime();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlInspectId = searchParams.get('inspectId') || '';

  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [search, setSearch] = useState(urlSearch);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [inspectCustomer, setInspectCustomer] = useState(null);
  const [formCustomer, setFormCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data?.staff || []);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStaff) params.staff_id = selectedStaff;

      if (!isAdmin && !selectedStaff) {
        params.staff_id = user?._id;
      }

      const custRes = await api.get('/customers', { params });
      const fetched = custRes.data?.customers || [];
      setCustomers(fetched);

      if (urlInspectId) {
        const found = fetched.find((c) => c._id === urlInspectId);
        if (found) {
          setInspectCustomer(found);
        }
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [selectedStaff]);

  // Subscribe to real-time events
  useEffect(() => {
    const unsub1 = addEventListener('CUSTOMER_CREATED', () => fetchCustomers());
    const unsub2 = addEventListener('CUSTOMER_UPDATED', () => fetchCustomers());
    const unsub3 = addEventListener('CUSTOMER_DELETED', () => fetchCustomers());
    const unsub4 = addEventListener('CUSTOMERS_IMPORTED', () => fetchCustomers());
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
      unsub3 && unsub3();
      unsub4 && unsub4();
    };
  }, [addEventListener]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStaff('');
    setStatusFilter('all');
    setTimeout(fetchCustomers, 10);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/customers/${deleteId}`);
      showToast('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
    } finally {
      setDeleteId(null);
    }
  };

  // Tip 3: Quick Inline Staff Assignment
  const handleInlineAssign = async (customerId, staffId) => {
    try {
      const targetRep = staffList.find((s) => s._id === staffId);
      // Instant optimistic update
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customerId ? { ...c, assigned_to: targetRep || null } : c
        )
      );
      await api.put(`/customers/${customerId}`, { assigned_to: staffId || null });
      showToast(`Assigned account to ${targetRep?.name || 'staff member'}`);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to assign staff:', err);
      fetchCustomers();
    }
  };

  const handleExportCSV = () => {
    if (!filteredCustomers.length) {
      alert('No customer records to export');
      return;
    }
    const headers = [
      'Name',
      'Company',
      'Email',
      'Phone',
      'Status',
      'Lead Score',
      'Tags',
      'Assigned Staff',
      'Created At',
    ];
    const rows = filteredCustomers.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      c.status || 'lead',
      c.lead_score || 30,
      `"${(c.tags || []).join('; ')}"`,
      `"${(c.assigned_to?.name || 'Unassigned').replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `VeltrixCRM_Customers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCustomers = customers.length;
  const activeCount = useMemo(
    () => customers.filter((c) => c.status === 'active').length,
    [customers]
  );
  const leadsCount = useMemo(
    () => customers.filter((c) => c.status === 'lead').length,
    [customers]
  );
  const inactiveCount = useMemo(
    () => customers.filter((c) => c.status === 'inactive').length,
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === 'all') return true;
      return c.status === statusFilter;
    });
  }, [customers, statusFilter]);

  return (
    <div className="space-y-7 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#2D3A2D] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce-in">
          {toastMsg}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Customers & Accounts
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {totalCustomers} Total Accounts
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Omnichannel customer 360, contact history, lead scoring, and instant WhatsApp outreach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#E5E2DC] hover:bg-neutral-50 text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-[#706F6C]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-[#E5E2DC] hover:bg-neutral-50 text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#706F6C]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setFormCustomer(null);
              setIsFormOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Total Accounts
            </p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{totalCustomers}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">All customer records</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Active Clients
            </p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Operational clients</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Sales Leads
            </p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{leadsCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">In prospecting</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Inactive
            </p>
            <h3 className="text-2xl font-bold text-neutral-600 mt-1">{inactiveCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Churned / dormant</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Unified Filtering Toolbar */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] p-3 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Status Filter Tabs with Solid Fill on Active */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] rounded-2xl border border-[#E5E2DC]/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: totalCustomers },
            { id: 'lead', label: 'Leads', count: leadsCount },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'inactive', label: 'Inactive', count: inactiveCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#2D3A2D] text-white shadow-xs'
                  : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E5E2DC]/60 text-[#706F6C]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Staff Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {isAdmin && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1A1A1A] outline-none shadow-2xs cursor-pointer hover:bg-white hover:border-[#2D3A2D] transition"
            >
              <option value="">All Staff Portfolio</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:bg-white focus:border-[#2D3A2D] outline-none transition shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4">Customer & Organization</th>
                <th className="px-6 py-4">Lead Score</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Direct WhatsApp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Staff</th>
                <th className="px-6 py-4 text-right pr-8 min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#706F6C]">
                    <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const statusClass =
                    c.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : c.status === 'lead'
                      ? 'bg-orange-50 text-orange-800 border-orange-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200';
                  const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                  const score = c.lead_score || 30;
                  const isUnassigned = !c.assigned_to;

                  // Tip 1: Vibrant Color-Coded Lead Scoring
                  const isHot = score >= 80;
                  const isWarm = score >= 50 && score < 80;
                  const isCold = score < 50;

                  return (
                    <tr
                      key={c._id}
                      className={`transition-colors group ${
                        isUnassigned
                          ? 'bg-amber-50/15 hover:bg-amber-50/35'
                          : 'hover:bg-[#FBFBF9]'
                      }`}
                    >
                      {/* Customer Name & Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p
                              onClick={() => setInspectCustomer(c)}
                              className="font-bold text-[#1A1A1A] hover:text-[#2D3A2D] cursor-pointer"
                              title="Click to view 360 profile"
                            >
                              {c.name}
                            </p>
                            <span className="text-[10px] text-[#706F6C]">
                              {c.company ? `${c.company} • ` : ''}#{c._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Lead Score Visual Representation with Semantic Color Coding */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-14 h-2 rounded-full overflow-hidden shadow-2xs ${
                              isHot
                                ? 'bg-emerald-100'
                                : isWarm
                                ? 'bg-amber-100'
                                : 'bg-rose-100'
                            }`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHot
                                  ? 'bg-emerald-500'
                                  : isWarm
                                  ? 'bg-amber-500'
                                  : 'bg-rose-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                            />
                          </div>

                          <span
                            className={`text-[11px] font-mono font-bold ${
                              isHot
                                ? 'text-emerald-800'
                                : isWarm
                                ? 'text-amber-800'
                                : 'text-rose-700'
                            }`}
                          >
                            {score}
                          </span>
                        </div>
                      </td>

                      {/* Gmail / Email */}
                      <td className="px-6 py-4">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A] hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#706F6C]" />
                            <span className="truncate max-w-[140px]">{c.email}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#706F6C]/60 italic">No email</span>
                        )}
                      </td>

                      {/* Direct WhatsApp */}
                      <td className="px-6 py-4">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{c.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#706F6C]/60 italic">No phone</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Tip 3: Assigned Staff with Unassigned Alerting & Inline Dropdown */}
                      <td className="px-6 py-4">
                        {c.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                              {c.assigned_to.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#1A1A1A] text-xs leading-none">
                                {c.assigned_to.name}
                              </p>
                              <span className="text-[10px] text-[#706F6C] font-normal capitalize">
                                {c.assigned_to.role || 'Staff'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Unassigned Alert with 1-Click Assignment */
                          <div className="flex items-center gap-1.5">
                            {isAdmin ? (
                              <select
                                value=""
                                onChange={(e) => handleInlineAssign(c._id, e.target.value)}
                                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100/90 outline-none cursor-pointer shadow-2xs transition"
                                title="Unassigned account: click to assign immediately to a team member"
                              >
                                <option value="" disabled>
                                  ⚠️ Assign Rep...
                                </option>
                                {staffList.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.name} ({s.tasks_count ?? s.tasksCount ?? 0} tasks)
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Unassigned</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Tip 2: Streamlined Enclosed Actions Pill with Breathing Room */}
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="inline-flex items-center justify-end gap-1 p-1 bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl shadow-2xs group-hover:bg-white group-hover:border-[#2D3A2D]/30 transition">
                          <button
                            onClick={() => setInspectCustomer(c)}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="View Customer 360"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setFormCustomer(c);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteId(c._id)}
                              className="p-1.5 text-[#706F6C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#706F6C]">
                    No customers found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Details Modal */}
      {inspectCustomer && (
        <CustomerDetailsModal
          customer={inspectCustomer}
          onClose={() => setInspectCustomer(null)}
          onCustomerUpdated={fetchCustomers}
        />
      )}

      {/* Customer Create/Edit Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormCustomer(null);
        }}
        customerToEdit={formCustomer}
        staffList={staffList}
        onSaved={fetchCustomers}
      />

      {/* Bulk CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={fetchCustomers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Account"
        message="Are you sure you want to delete this customer? All associated deals and task deliverables will be permanently removed."
        confirmText="Delete Customer"
        isDestructive={true}
      />
    </div>
  );
};

export default CustomersPage;
