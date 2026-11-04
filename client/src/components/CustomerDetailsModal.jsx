import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import {
  X,
  Mail,
  Phone,
  Building,
  UserCheck,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  PhoneCall,
  CalendarDays,
  Send,
  Plus,
  Tag,
  Sparkles,
  TrendingUp,
  Receipt,
  Trash2,
  CheckSquare,
} from 'lucide-react';

const CustomerDetailsModal = ({ customer, onClose, onCustomerUpdated }) => {
  const { user } = useAuth();
  const { addEventListener } = useRealtime();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'log'
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Quick Log form states
  const [logType, setLogType] = useState('note'); // 'note' | 'call' | 'meeting'
  const [logTitle, setLogTitle] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [callOutcome, setCallOutcome] = useState('connected');
  const [durationMins, setDurationMins] = useState(10);
  const [submittingLog, setSubmittingLog] = useState(false);

  // Tags state
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (customer?._id) {
      fetchTimeline();
    }
  }, [customer?._id]);

  useEffect(() => {
    const unsub = addEventListener('TIMELINE_EVENT_ADDED', (data) => {
      if (data?.event?.customer_id === customer?._id) {
        setTimelineEvents((prev) => [data.event, ...prev]);
      }
    });
    return () => unsub && unsub();
  }, [addEventListener, customer?._id]);

  const fetchTimeline = async () => {
    try {
      setLoadingTimeline(true);
      const res = await api.get(`/timeline/customer/${customer._id}`);
      setTimelineEvents(res.data?.events || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!logTitle.trim()) return;

    try {
      setSubmittingLog(true);
      const payload = {
        customer_id: customer._id,
        type: logType,
        title: logTitle.trim(),
        description: logDescription.trim(),
        metadata:
          logType === 'call'
            ? { call_outcome: callOutcome, duration_minutes: Number(durationMins) }
            : {},
      };

      const res = await api.post('/timeline', payload);
      setTimelineEvents((prev) => [res.data.event, ...prev]);
      setLogTitle('');
      setLogDescription('');
      setActiveTab('timeline');
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    const currentTags = customer.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      const updatedTags = [...currentTags, tagInput.trim()];
      try {
        await api.put(`/customers/${customer._id}`, { tags: updatedTags });
        if (onCustomerUpdated) onCustomerUpdated();
        customer.tags = updatedTags;
        setTagInput('');
      } catch (err) {
        console.error('Failed to add tag:', err);
      }
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = (customer.tags || []).filter((t) => t !== tagToRemove);
    try {
      await api.put(`/customers/${customer._id}`, { tags: updatedTags });
      if (onCustomerUpdated) onCustomerUpdated();
      customer.tags = updatedTags;
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const handleDeleteTimelineEvent = async (eventId) => {
    try {
      await api.delete(`/timeline/${eventId}`);
      setTimelineEvents((prev) => prev.filter((ev) => ev._id !== eventId));
    } catch (err) {
      alert('Could not delete event');
    }
  };

  if (!customer) return null;

  const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

  const statusBg =
    customer.status === 'active'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : customer.status === 'lead'
      ? 'bg-orange-50 text-orange-800 border-orange-200'
      : 'bg-neutral-100 text-neutral-600 border-neutral-200';

  const leadScore = customer.lead_score || 30;
  const leadScoreColor =
    leadScore >= 70
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : leadScore >= 40
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-neutral-600 bg-neutral-50 border-neutral-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2DC] bg-[#FBFBF9] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#2D3A2D]/20">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1A1A1A]">{customer.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBg}`}
                >
                  {customer.status}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${leadScoreColor}`}
                >
                  Score: {leadScore}/100
                </span>
              </div>
              <p className="text-xs text-[#706F6C] mt-0.5 flex items-center gap-2">
                {customer.company && (
                  <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#706F6C]" />
                    {customer.company}
                  </span>
                )}
                <span>• Client ID #{customer._id?.slice(-6).toUpperCase()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#706F6C] hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#E5E2DC] flex items-center gap-6 bg-white text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#2D3A2D] text-[#2D3A2D]'
                : 'border-transparent text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-[#2D3A2D] text-[#2D3A2D]'
                : 'border-transparent text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Activity Timeline ({timelineEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'log'
                ? 'border-[#2D3A2D] text-[#2D3A2D]'
                : 'border-transparent text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Quick Log
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC] space-y-3">
                  <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                    Contact Channels
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#706F6C]" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-[#1A1A1A] font-semibold hover:underline truncate"
                      >
                        {customer.email || 'No email provided'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#706F6C]" />
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-[#1A1A1A] font-semibold hover:underline"
                      >
                        {customer.phone || 'No phone provided'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC] space-y-3">
                  <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                    Account Ownership
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#706F6C]" />
                      <span className="font-semibold text-[#1A1A1A]">
                        {customer.assigned_to?.name || customer.assigned_to_name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#706F6C]" />
                      <span className="text-[#706F6C]">
                        Created {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E2DC] space-y-3">
                <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Customer Tags & Segments
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {(customer.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center gap-1.5"
                    >
                      {t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <form onSubmit={handleAddTag} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="px-3 py-1 rounded-full border border-[#E5E2DC] text-xs outline-none focus:border-[#2D3A2D]"
                    />
                    <button
                      type="submit"
                      className="w-6 h-6 rounded-full bg-[#2D3A2D] text-white flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </form>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 hover:bg-[#20ba59] transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Direct
                </a>
                <a
                  href={`mailto:${customer.email}`}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#2D3A2D] text-white font-bold text-xs shadow-md hover:bg-[#3D4F3D] transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Draft Email
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#706F6C] uppercase tracking-wider">
                  Chronological Interaction Stream
                </h3>
                <button
                  onClick={() => setActiveTab('log')}
                  className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Interaction
                </button>
              </div>

              {loadingTimeline ? (
                <div className="py-8 text-center text-xs text-[#706F6C]">
                  Loading timeline feed...
                </div>
              ) : timelineEvents.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[#E5E2DC] text-center space-y-2">
                  <Clock className="w-8 h-8 text-[#706F6C] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#1A1A1A]">No activity recorded yet</p>
                  <p className="text-xs text-[#706F6C]">
                    Log your first phone call, meeting note, or customer update.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E2DC]">
                  {timelineEvents.map((ev) => (
                    <div key={ev._id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#2D3A2D] flex items-center justify-center"></div>

                      <div className="bg-[#FBFBF9] p-4 rounded-2xl border border-[#E5E2DC] space-y-1 hover:border-[#2D3A2D]/40 transition-all">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                            {ev.type === 'call' && <PhoneCall className="w-3.5 h-3.5 text-blue-600" />}
                            {ev.type === 'meeting' && <CalendarDays className="w-3.5 h-3.5 text-purple-600" />}
                            {ev.type === 'note' && <FileText className="w-3.5 h-3.5 text-amber-600" />}
                            {ev.type === 'deal_created' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                            {ev.type === 'task_created' && <CheckSquare className="w-3.5 h-3.5 text-blue-600" />}
                            {ev.title}
                          </span>
                          <span className="text-[10px] text-[#706F6C]">
                            {new Date(ev.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {ev.description && (
                          <p className="text-xs text-[#4A5D4E] pt-1 leading-relaxed">
                            {ev.description}
                          </p>
                        )}

                        {ev.metadata?.call_outcome && (
                          <div className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-2">
                            Outcome: {ev.metadata.call_outcome} • Duration: {ev.metadata.duration_minutes || 0}m
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] text-[#706F6C]">
                          <span>Logged by: {ev.author?.name || 'Staff Member'}</span>
                          <button
                            onClick={() => handleDeleteTimelineEvent(ev._id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUICK LOG FORM */}
          {activeTab === 'log' && (
            <form onSubmit={handleCreateLog} className="space-y-4">
              <div className="flex gap-2">
                {[
                  { id: 'note', label: 'Internal Note', icon: FileText },
                  { id: 'call', label: 'Log Call', icon: PhoneCall },
                  { id: 'meeting', label: 'Meeting Note', icon: CalendarDays },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setLogType(type.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        logType === type.id
                          ? 'border-[#2D3A2D] bg-[#2D3A2D] text-white shadow-sm'
                          : 'border-[#E5E2DC] bg-white text-[#706F6C] hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    logType === 'call'
                      ? 'Outbound Discovery Call'
                      : logType === 'meeting'
                      ? 'Quarterly Contract Review'
                      : 'Client feedback on pricing proposal'
                  }
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-sm outline-none focus:border-[#2D3A2D]"
                />
              </div>

              {logType === 'call' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                      Call Outcome
                    </label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-sm outline-none bg-white"
                    >
                      <option value="connected">Connected & Discussed</option>
                      <option value="left_voicemail">Left Voicemail</option>
                      <option value="busy">Line Busy</option>
                      <option value="wrong_number">Wrong Number</option>
                      <option value="follow_up_scheduled">Follow-up Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={durationMins}
                      onChange={(e) => setDurationMins(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Details & Key Takeaways
                </label>
                <textarea
                  rows="4"
                  placeholder="Record summary, client pain points, next action items..."
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-sm outline-none focus:border-[#2D3A2D] resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#706F6C] hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md disabled:opacity-50"
                >
                  {submittingLog ? 'Saving...' : 'Add to Timeline'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
