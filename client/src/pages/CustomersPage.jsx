import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
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
} from 'lucide-react';

const CustomersPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlInspectId = searchParams.get('inspectId') || '';

  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(urlSearch);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'lead' | 'active' | 'inactive'

  // Modals
  const [inspectCustomer, setInspectCustomer] = useState(null);
  const [formCustomer, setFormCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

      // Staff users view assigned by default
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
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
    } finally {
      setDeleteId(null);
    }
  };

  // KPI Calculations
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

  // Filtered customer records based on selected status tab
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === 'all') return true;
      return c.status === statusFilter;
    });
  }, [customers, statusFilter]);

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Customers & Leads
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {totalCustomers} Total Accounts
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Manage customer accounts, sales leads, and 1-click WhatsApp messaging.
          </p>
        </div>

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

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Total Pipeline
            </p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{totalCustomers}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">All customer records</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Accounts */}
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

        {/* Leads */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Sales Leads
            </p>
            <h3 className="text-2xl font-bold text-orange-700 mt-1">{leadsCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Prospective opportunities</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Accounts */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Inactive
            </p>
            <h3 className="text-2xl font-bold text-stone-600 mt-1">{inactiveCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Archived or paused</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5F3EF] p-1 rounded-2xl border border-[#E5E2DC] self-start overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-[#2D3A2D] shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            All Accounts ({totalCustomers})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('lead')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'lead'
                ? 'bg-white text-orange-800 shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Leads ({leadsCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-white text-stone-700 shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        {/* Search & Staff Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Personnel Filter (Admin only) */}
          {isAdmin && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-white border border-[#E5E2DC] rounded-xl px-3 py-2 text-xs font-medium text-[#1A1A1A] outline-none shadow-xs cursor-pointer hover:border-[#2D3A2D] transition"
            >
              <option value="">All Team Members</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full bg-white border border-[#E5E2DC] rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:border-[#2D3A2D] outline-none shadow-xs"
            />
            {search ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#2D3A2D]"
              >
                <Search className="w-3.5 h-3.5" />
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
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Contact (Email)</th>
                <th className="px-6 py-4">Direct WhatsApp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Staff</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
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

                  return (
                    <tr key={c._id} className="hover:bg-[#FBFBF9] transition-colors">
                      {/* Customer Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#1A1A1A]">{c.name}</p>
                            <span className="text-[10px] text-[#706F6C]">
                              #{c._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Highlighted Gmail / Email Badge */}
                      <td className="px-6 py-4">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50/80 hover:bg-red-100 border border-red-200 text-red-950 font-semibold text-xs transition shadow-2xs group"
                            title={`Click to send email to ${c.email}`}
                          >
                            <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black shadow-2xs">
                              M
                            </div>
                            <span className="group-hover:underline underline-offset-2">{c.email}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#706F6C]/60 italic">No email</span>
                        )}
                      </td>

                      {/* Direct WhatsApp Outreach */}
                      <td className="px-6 py-4">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition shadow-2xs group"
                            title="Open WhatsApp Web chat directly"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition" />
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

                      {/* Assigned Staff */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              c.assigned_to ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          ></div>
                          <span className="font-semibold text-[#1A1A1A] text-xs">
                            {c.assigned_to?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setInspectCustomer(c)}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="View Customer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setFormCustomer(c);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(c._id)}
                            className="p-1.5 text-[#706F6C] hover:text-[#9B5A46] hover:bg-[#9B5A46]/10 rounded-lg transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
                    <Building className="w-8 h-8 text-[#706F6C]/40 mx-auto mb-2" />
                    <p className="font-medium text-xs">No customer records found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Customer Modal */}
      <CustomerDetailsModal
        customer={inspectCustomer}
        onClose={() => setInspectCustomer(null)}
      />

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customerToEdit={formCustomer}
        staffList={staffList}
        onSaved={fetchCustomers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer?"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone."
        confirmText="Delete Customer"
      />
    </div>
  );
};

export default CustomersPage;
