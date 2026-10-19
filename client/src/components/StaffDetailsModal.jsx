import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { X, Mail, Shield, Calendar, Users, CheckSquare } from 'lucide-react';

const StaffDetailsModal = ({ staff, onClose }) => {
  const { t } = useLanguage();
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3A2D]/20 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl border border-[#E5E2DC] overflow-hidden animate-bounce-in">
        <div className="p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#706F6C] hover:text-[#1A1A1A] p-2 bg-[#F5F3EF] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#2D3A2D]/15">
              {staff.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="heading-editorial text-2xl">{staff.name}</h2>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2D3A2D]/10 text-[#2D3A2D]">
                  {staff.role}
                </span>
                <span className="text-[#706F6C] text-xs font-mono">
                  #{staff._id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F5F3EF] p-5 rounded-2xl border border-[#E5E2DC]">
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-3">
                {t('contact_info')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <Mail className="w-4 h-4 text-[#706F6C] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A] truncate">
                    {staff.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <Shield className="w-4 h-4 text-[#706F6C] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {staff.role === 'admin' ? t('system_administrator') : t('operational_staff')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F3EF] p-5 rounded-2xl border border-[#E5E2DC]">
              <p className="text-[10px] font-bold text-[#9B5A46] uppercase tracking-widest mb-3">
                {t('assignment_details')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <Users className="w-4 h-4 text-[#9B5A46] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {staff.customers_count || 0} Customers Assigned
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <CheckSquare className="w-4 h-4 text-[#9B5A46] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {staff.tasks_count || 0} Tasks Assigned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-8 flex gap-3">
            <a
              href={`mailto:${staff.email}`}
              className="flex-1 btn-primary-veltrix !py-3.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </a>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary-veltrix !py-3.5 text-xs font-bold"
            >
              {t('close_details')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
