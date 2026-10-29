import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Inbox,
  Mail,
  UserPlus,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [convertingId, setConvertingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/contact');
      setInquiries(res.data?.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleConvertToLead = async (inquiryId, name) => {
    setConvertingId(inquiryId);
    try {
      await api.post(`/contact/${inquiryId}/convert`);
      showToast(`✓ ${name} converted to Customer Lead successfully!`);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to convert inquiry:', err);
      showToast('Conversion failed. Please try again.');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async (inquiryId) => {
    try {
      await api.delete(`/contact/${inquiryId}`);
      showToast('Inquiry deleted.');
      fetchInquiries();
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      inq.name.toLowerCase().includes(query) ||
      inq.email.toLowerCase().includes(query) ||
      inq.message.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#2D3A2D] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce-in flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Website Inquiries
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {inquiries.length} Inquiries
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Incoming prospective messages submitted through your public website contact form.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full bg-white border border-[#E5E2DC] rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:border-[#2D3A2D] outline-none shadow-xs"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#706F6C]" />
          )}
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="py-20 text-center text-[#706F6C]">
          <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading contact inquiries...
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq._id}
              className="bg-white border border-[#E5E2DC] rounded-[24px] p-6 shadow-xs hover:border-[#2D3A2D] hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-base">{inq.name}</h3>
                    {/* Highlighted Gmail / Email Tag */}
                    <a
                      href={`mailto:${inq.email}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#706F6C] hover:text-red-700 font-medium transition mt-0.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{inq.email}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-[#706F6C] bg-[#FAF9F5] border border-[#E5E2DC] px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </span>

                  <button
                    onClick={() => handleDelete(inq._id)}
                    className="p-1.5 text-[#706F6C] hover:text-[#9B5A46] hover:bg-[#9B5A46]/10 rounded-xl transition"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E2DC]/80">
                <p className="text-xs text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                  "{inq.message}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${inq.email}?subject=Re: Inquiry with VeltrixCRM`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E2DC] text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F3EF] transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#706F6C]" />
                    <span>Reply via Email</span>
                  </a>
                </div>

                {/* 1-Click Convert to Customer Lead Button */}
                <button
                  type="button"
                  onClick={() => handleConvertToLead(inq._id, inq.name)}
                  disabled={convertingId === inq._id}
                  className="btn-primary-veltrix !py-2 !px-4 text-xs font-bold flex items-center gap-2 shadow-2xs disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{convertingId === inq._id ? 'Converting...' : 'Convert to CRM Lead'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[24px] border border-[#E5E2DC]">
          <Inbox className="w-10 h-10 text-[#706F6C]/40 mx-auto mb-2" />
          <h3 className="font-bold text-base text-[#1A1A1A]">No Inquiries Found</h3>
          <p className="text-xs text-[#706F6C] mt-1">
            New contact submissions from the public website will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default InquiriesPage;

