import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StaffFormModal from '../components/StaffFormModal.jsx';
import StaffDetailsModal from '../components/StaffDetailsModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  Search,
  Plus,
  Mail,
  Shield,
  Eye,
  Edit2,
  Trash2,
  Users,
  CheckSquare,
  X,
} from 'lucide-react';

const StaffPage = () => {
  const { t } = useLanguage();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [inspectStaff, setInspectStaff] = useState(null);
  const [formStaff, setFormStaff] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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
      console.error('Failed to deauthorize member', err);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">{t('manage_staff')}</h1>
          <p className="text-xs text-[#706F6C] mt-1">{t('orchestrate_team_desc')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_personnel')}
              className="w-full bg-white border border-[#E5E2DC] rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold uppercase tracking-wider focus:border-[#2D3A2D] outline-none shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-3 text-[#706F6C] hover:text-[#2D3A2D]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {search && (
            <button
              onClick={handleClearSearch}
              className="p-2 text-[#706F6C] hover:text-[#9B5A46] transition"
              title="Clear Search"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => {
              setFormStaff(null);
              setIsFormOpen(true);
            }}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_member')}</span>
          </button>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="card-veltrix bg-white !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3EF]/60 border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-8 py-5">{t('name')}</th>
                <th className="px-8 py-5">{t('email')}</th>
                <th className="px-8 py-5">{t('role')}</th>
                <th className="px-8 py-5">Customers</th>
                <th className="px-8 py-5">Tasks</th>
                <th className="px-8 py-5 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
                    <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading personnel...
                  </td>
                </tr>
              ) : staffList.length > 0 ? (
                staffList.map((member) => (
                  <tr key={member._id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          {member.is_online ? (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online now" />
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-stone-300 border-2 border-white rounded-full" title="Offline" />
                          )}
                        </div>
                        <span className="font-bold text-[#1A1A1A]">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[#706F6C]">
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-[#2D3A2D] flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{member.email}</span>
                      </a>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2D3A2D]/10 text-[#2D3A2D]">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-semibold text-[#1A1A1A]">
                      {member.customers_count || 0}
                    </td>
                    <td className="px-8 py-5 font-semibold text-[#1A1A1A]">
                      {member.tasks_count || 0}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectStaff(member)}
                          className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                          title={t('inspect')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setFormStaff(member);
                            setIsFormOpen(true);
                          }}
                          className="p-2 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-xl transition"
                          title={t('edit_member')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(member._id)}
                          className="p-2 text-[#706F6C] hover:text-[#9B5A46] hover:bg-[#9B5A46]/10 rounded-xl transition"
                          title="Deauthorize"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#706F6C]">
                    {t('no_personnel_registered')}
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
        onClose={() => setInspectStaff(null)}
      />

      {/* Add / Edit Staff Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        staffToEdit={formStaff}
        onSaved={fetchStaff}
      />

      {/* Deauthorize Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deauthorize Member?"
        message="Are you sure you want to permanently deauthorize this member? Their operational deliverables and accounts will be unassigned."
        confirmText="Deauthorize Member"
      />
    </div>
  );
};

export default StaffPage;
