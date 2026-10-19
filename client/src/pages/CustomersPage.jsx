import React, { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';

const CustomersPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [inspectCustomer, setInspectCustomer] = useState(null);
  const [formCustomer, setFormCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStaff) params.staff_id = selectedStaff;
      if (selectedStatus) params.status = selectedStatus;

      // Staff users can view their assigned or all depending on filter
      if (!isAdmin && !selectedStaff) {
        params.staff_id = user?._id;
      }

      const [custRes, staffRes] = await Promise.all([
        api.get('/customers', { params }),
        api.get('/staff'),
      ]);

      setCustomers(custRes.data?.customers || []);
      setStaffList(staffRes.data?.staff || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedStaff, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStaff('');
    setSelectedStatus('');
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">
            {t('customers')}
          </h1>
          <p className="text-xs text-[#706F6C] mt-1">
            {t('staff_overview')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_client_records')}
              className="w-full bg-white border border-[#E5E2DC] rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-wider focus:border-[#2D3A2D] outline-none shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-3 text-[#706F6C] hover:text-[#2D3A2D]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Personnel Filter (Admin only) */}
          {isAdmin && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="bg-white border border-[#E5E2DC] rounded-2xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] focus:border-[#2D3A2D] outline-none shadow-sm cursor-pointer"
            >
              <option value="">{t('all_personnel')}</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#E5E2DC] rounded-2xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] focus:border-[#2D3A2D] outline-none shadow-sm cursor-pointer"
          >
            <option value="">Status Filter</option>
            <option value="lead">{t('lead')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>

          {(search || selectedStaff || selectedStatus) && (
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
              setFormCustomer(null);
              setIsFormOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_customer')}</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-veltrix bg-white !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3EF]/60 border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-8 py-5">{t('customer_name')}</th>
                <th className="px-8 py-5">{t('email_address')}</th>
                <th className="px-8 py-5">{t('phone_number')}</th>
                <th className="px-8 py-5">{t('status')}</th>
                <th className="px-8 py-5">{t('assigned_to')}</th>
                <th className="px-8 py-5 text-center">{t('action')}</th>
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
              ) : customers.length > 0 ? (
                customers.map((c) => {
                  const statusClass =
                    c.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800'
                      : c.status === 'lead'
                      ? 'bg-orange-50 text-orange-800'
                      : 'bg-slate-100 text-slate-600';
                  const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={c._id} className="hover:bg-[#FBFBF9] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[#1A1A1A]">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[#706F6C]">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:text-[#2D3A2D] flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{c.email}</span>
                          </a>
                        ) : (
                          <span className="opacity-40">N/A</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{c.phone}</span>
                          </a>
                        ) : (
                          <span className="opacity-40 text-[#706F6C]">N/A</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.assigned_to ? 'bg-emerald-500' : 'bg-[#E5E2DC]'
                            }`}
                          ></div>
                          <span>{c.assigned_to?.name || t('unassigned')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInspectCustomer(c)}
                            className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                            title={t('inspect')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setFormCustomer(c);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                            title={t('edit_customer')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(c._id)}
                            className="p-2 text-[#706F6C] hover:text-[#9B5A46] hover:bg-[#9B5A46]/10 rounded-xl transition"
                            title="Delete"
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
                    No customers found matching criteria.
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
        message="Are you sure you want to permanently delete this customer? This record will be removed from your MongoDB database."
        confirmText="Delete Customer"
      />
    </div>
  );
};

export default CustomersPage;
