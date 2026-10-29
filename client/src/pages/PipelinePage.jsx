import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import {
  Layers,
  Plus,
  Search,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  Eye,
  CheckCircle2,
  Mail,
  User,
  X,
  TrendingUp,
} from 'lucide-react';

const PipelinePage = () => {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [inspectCustomer, setInspectCustomer] = useState(null);

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

      const res = await api.get('/customers', { params });
      setCustomers(res.data?.customers || []);
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

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      await api.put(`/customers/${customerId}`, { status: newStatus });
      fetchCustomers();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const leads = useMemo(() => customers.filter((c) => c.status === 'lead'), [customers]);
  const active = useMemo(() => customers.filter((c) => c.status === 'active'), [customers]);
  const inactive = useMemo(() => customers.filter((c) => c.status === 'inactive'), [customers]);

  const pipelineColumns = [
    {
      id: 'lead',
      title: 'Incoming Leads',
      count: leads.length,
      badge: 'bg-orange-100 text-orange-900 border-orange-200',
      actionLabel: 'Convert to Client',
      actionIcon: ArrowRight,
      nextStatus: 'active',
      customers: leads,
    },
    {
      id: 'active',
      title: 'Active Accounts',
      count: active.length,
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      actionLabel: 'Archive Account',
      actionIcon: CheckCircle2,
      nextStatus: 'inactive',
      customers: active,
    },
    {
      id: 'inactive',
      title: 'Inactive / Archived',
      count: inactive.length,
      badge: 'bg-stone-200 text-stone-800 border-stone-300',
      actionLabel: 'Reactivate Lead',
      actionIcon: RotateCcw,
      nextStatus: 'lead',
      customers: inactive,
    },
  ];

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Sales Pipeline
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {customers.length} Opportunities
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Visual customer conversion stages from prospective lead to active relationship.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary-veltrix !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunity by name..."
            className="w-full bg-white border border-[#E5E2DC] rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:border-[#2D3A2D] outline-none shadow-xs"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTimeout(fetchCustomers, 10);
              }}
              className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
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

        {/* Staff Filter */}
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
      </div>

      {/* 3 Pipeline Columns */}
      {loading ? (
        <div className="py-20 text-center text-[#706F6C]">
          <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading pipeline funnel...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {pipelineColumns.map((col) => {
            const ActionIcon = col.actionIcon;

            return (
              <div
                key={col.id}
                className="bg-[#FAF9F5] border border-[#E5E2DC] rounded-[24px] p-4 space-y-3.5 shadow-2xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1A1A1A] text-sm">{col.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${col.badge}`}
                    >
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3 min-h-[200px]">
                  {col.customers.length > 0 ? (
                    col.customers.map((c) => {
                      const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');

                      return (
                        <div
                          key={c._id}
                          className="bg-white border border-[#E5E2DC] rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-[#2D3A2D] transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#1A1A1A] text-sm">{c.name}</p>
                              {c.email && (
                                <p className="text-[11px] text-[#706F6C] truncate mt-0.5">
                                  {c.email}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setInspectCustomer(c)}
                              className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Contact quick actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E5E2DC]/60 text-xs">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition flex items-center gap-1 shadow-2xs"
                                title="Open WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {/* Assigned Staff */}
                            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#706F6C]">
                              <div className="w-4 h-4 rounded-full bg-[#2D3A2D] text-white font-bold flex items-center justify-center text-[8px]">
                                {c.assigned_to?.name?.charAt(0) || 'U'}
                              </div>
                              <span className="truncate max-w-[80px]">
                                {c.assigned_to?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>

                          {/* Stage Transition Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c._id, col.nextStatus)}
                            className="w-full mt-2 py-1.5 px-3 rounded-xl bg-[#F5F3EF] hover:bg-[#2D3A2D] text-[#1A1A1A] hover:text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <span>{col.actionLabel}</span>
                            <ActionIcon className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center border border-dashed border-[#E5E2DC] rounded-2xl">
                      <p className="text-xs text-[#706F6C]/60 font-medium">No records in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        staffList={staffList}
        onSaved={fetchCustomers}
      />

      {/* Inspect Customer Modal */}
      <CustomerDetailsModal
        customer={inspectCustomer}
        onClose={() => setInspectCustomer(null)}
      />
    </div>
  );
};

export default PipelinePage;

