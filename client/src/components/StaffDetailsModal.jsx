import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  X,
  Mail,
  Shield,
  Calendar,
  Users,
  CheckSquare,
  Briefcase,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const StaffDetailsModal = ({ staff, initialTab = 'customers', onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, staff]);

  if (!staff) return null;

  const customers = staff.customers || [];
  const tasks = staff.tasks || [];

  const handleOpenCustomerProfile = (customer) => {
    onClose();
    navigate(`/admin/customers?search=${encodeURIComponent(customer.name)}&inspectId=${customer._id}`);
  };

  const handleOpenTask = (task) => {
    onClose();
    navigate(`/admin/tasks?search=${encodeURIComponent(task.title)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3A2D]/30 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh] animate-bounce-in">
        
        {/* Header Bar */}
        <div className="p-6 sm:p-7 bg-[#FAF9F5] border-b border-[#E5E2DC] relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#706F6C] hover:text-[#1A1A1A] p-2 bg-white rounded-full border border-[#E5E2DC] transition hover:shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#2D3A2D]/15 flex-shrink-0">
              {staff.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="heading-editorial text-2xl text-[#1A1A1A]">{staff.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2D3A2D]/10 text-[#2D3A2D]">
                  {staff.role}
                </span>
              </div>
              <p className="text-xs text-[#706F6C] mt-0.5">
                {staff.business_type || 'Operations'} • {staff.email}
              </p>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-[#2D3A2D] text-white shadow-xs'
                  : 'bg-white text-[#706F6C] hover:text-[#1A1A1A] border border-[#E5E2DC]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Assigned Customers ({customers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-[#2D3A2D] text-white shadow-xs'
                  : 'bg-white text-[#706F6C] hover:text-[#1A1A1A] border border-[#E5E2DC]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Assigned Tasks ({tasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-[#2D3A2D] text-white shadow-xs'
                  : 'bg-white text-[#706F6C] hover:text-[#1A1A1A] border border-[#E5E2DC]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          </div>
        </div>

        {/* Tab Body Content - Scrollable */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: ASSIGNED CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#706F6C] uppercase tracking-wider">
                  Client Accounts Managed by {staff.name}
                </p>
                <span className="text-xs text-[#706F6C]">{customers.length} Accounts</span>
              </div>

              {customers.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {customers.map((c) => {
                    const statusClass =
                      c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : c.status === 'lead'
                        ? 'bg-orange-50 text-orange-800 border-orange-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200';
                    const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <div
                        key={c._id}
                        className="bg-[#FAF9F5] border border-[#E5E2DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2D3A2D] transition shadow-2xs group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenCustomerProfile(c)}
                              className="font-bold text-[#1A1A1A] text-sm hover:text-[#2D3A2D] hover:underline text-left flex items-center gap-1.5"
                              title="Click to view full customer profile"
                            >
                              <span>{c.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#706F6C] opacity-70 group-hover:opacity-100 transition" />
                            </button>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusClass}`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#706F6C]">{c.email || 'No email registered'}</p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {/* View Full Profile Redirect Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenCustomerProfile(c)}
                            className="px-3 py-1.5 rounded-xl bg-[#2D3A2D] text-white text-xs font-bold hover:bg-[#1f291f] transition flex items-center gap-1.5 shadow-2xs"
                            title="Open Customer Profile in Customers Page"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E2DC] text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F3EF] transition flex items-center gap-1 shadow-2xs"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#706F6C]" />
                              <span>Email</span>
                            </a>
                          )}

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1 shadow-2xs"
                              title="Direct WhatsApp Chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#E5E2DC]">
                  <Briefcase className="w-8 h-8 text-[#706F6C]/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-[#706F6C]">
                    No client accounts are currently assigned to this member.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNED TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#706F6C] uppercase tracking-wider">
                  Tasks Assigned to {staff.name}
                </p>
                <span className="text-xs text-[#706F6C]">{tasks.length} Tasks</span>
              </div>

              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {tasks.map((t) => {
                    const statusClass =
                      t.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : t.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={t._id}
                        className="bg-[#FAF9F5] border border-[#E5E2DC] rounded-2xl p-4 space-y-2 hover:border-[#2D3A2D] transition shadow-2xs group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenTask(t)}
                              className="font-bold text-[#1A1A1A] text-sm hover:text-[#2D3A2D] hover:underline text-left flex items-center gap-1.5"
                              title="Click to view task details in Tasks Page"
                            >
                              <span>{t.title}</span>
                              <ExternalLink className="w-3 h-3 text-[#706F6C] opacity-70 group-hover:opacity-100 transition" />
                            </button>
                            {t.customer_id && (
                              <p className="text-xs text-[#706F6C] mt-0.5">
                                Account: <span className="font-semibold text-[#1A1A1A]">{t.customer_id.name}</span>
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${statusClass}`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>

                        {t.due_date && (
                          <div className="flex items-center justify-between gap-1.5 text-[11px] text-[#706F6C] pt-2 border-t border-[#E5E2DC]/60">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#706F6C]" />
                              <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenTask(t)}
                              className="text-[10px] font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
                            >
                              <span>Open in Tasks</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#E5E2DC]">
                  <CheckSquare className="w-8 h-8 text-[#706F6C]/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-[#706F6C]">
                    No tasks currently assigned to this member.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E5E2DC] space-y-3">
                <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                  Contact Information
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#706F6C]" />
                    <span className="font-semibold text-[#1A1A1A]">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#706F6C]" />
                    <span className="font-semibold text-[#1A1A1A]">
                      {staff.role === 'admin' ? 'System Administrator' : 'Staff Member'}
                    </span>
                  </div>
                  {staff.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#706F6C]" />
                      <span className="text-[#706F6C]">
                        Joined: {new Date(staff.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E5E2DC] space-y-3">
                <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                  Current Allocation
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#706F6C]">Assigned Accounts:</span>
                    <span className="font-bold text-[#1A1A1A]">{customers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#706F6C]">Active Tasks:</span>
                    <span className="font-bold text-[#1A1A1A]">{tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#706F6C]">Department:</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {staff.business_type || 'Operations'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#FAF9F5] border-t border-[#E5E2DC] flex items-center justify-between gap-3 flex-shrink-0">
          <a
            href={`mailto:${staff.email}`}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email to {staff.name.split(' ')[0]}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-veltrix !py-2.5 !px-4 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
