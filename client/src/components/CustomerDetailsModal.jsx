import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { X, Mail, Phone, UserCheck, Calendar, MessageSquare } from 'lucide-react';

const CustomerDetailsModal = ({ customer, onClose }) => {
  const { t } = useLanguage();
  if (!customer) return null;

  const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

  const statusBg =
    customer.status === 'active'
      ? 'bg-emerald-50 text-emerald-800'
      : customer.status === 'lead'
      ? 'bg-orange-50 text-orange-800'
      : 'bg-slate-100 text-slate-600';

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

          {/* Customer Header */}
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#2D3A2D]/15">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="heading-editorial text-2xl">{customer.name}</h2>
              <div className="flex items-center space-x-2 mt-1.5">
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBg}`}
                >
                  {customer.status}
                </span>
                <span className="text-[#706F6C] text-xs font-mono">
                  #{customer._id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Info Card */}
            <div className="bg-[#F5F3EF] p-5 rounded-2xl border border-[#E5E2DC]">
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-3">
                {t('contact_info')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <Mail className="w-4 h-4 text-[#706F6C] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A] truncate">
                    {customer.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <Phone className="w-4 h-4 text-[#706F6C] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {customer.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Details Card */}
            <div className="bg-[#F5F3EF] p-5 rounded-2xl border border-[#E5E2DC]">
              <p className="text-[10px] font-bold text-[#9B5A46] uppercase tracking-widest mb-3">
                {t('assignment_details')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <UserCheck className="w-4 h-4 text-[#9B5A46] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {customer.assigned_to?.name || customer.assigned_to_name || t('unassigned')}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <Calendar className="w-4 h-4 text-[#9B5A46] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A]">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {cleanPhone ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">{t('whatsapp_dm')}</span>
              </a>
            ) : null}
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

export default CustomerDetailsModal;
