import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  ShieldCheck,
  Activity,
  Search,
  Trash2,
  Clock,
  Filter,
  Users,
  CheckSquare,
  Lock,
  Layers,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Briefcase,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  ArrowRight,
  Info,
} from 'lucide-react';

const ActivityPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'customer' | 'task' | 'deal' | 'staff'
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/analytics/data');
      setLogs(res.data?.data?.logs || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePurgeLogs = async () => {
    try {
      await api.delete('/analytics/logs');
      showToast('Activity log history cleared successfully.');
      fetchLogs();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsPurgeModalOpen(false);
    }
  };

  const handleCopyJSON = (log, e) => {
    e.stopPropagation();
    const payload = {
      id: log._id,
      operation: log.action,
      description: log.description,
      performed_by: {
        name: log.user_id?.name || 'System / Workspace',
        email: log.user_id?.email || 'N/A',
        role: log.user_id?.role || 'system',
      },
      timestamp: log.createdAt,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(log._id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSecs = Math.floor((now - date) / 1000);
    if (diffInSecs < 60) return 'Just now';
    const diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatActionName = (action = '') => {
    if (!action) return 'System Operation';
    if (action.includes('_')) {
      return action
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return action;
  };

  /**
   * Tip 1: Visual Distinction for Destructive Actions
   * Semantic color badges with soft background tints and icons
   */
  const getEventBadge = (action = '', description = '') => {
    const act = action.toLowerCase();
    const desc = description.toLowerCase();
    const displayLabel = formatActionName(action);

    // 1. Destructive Actions (Deletions, Deauthorizations, Purges)
    if (act.includes('delete') || act.includes('deauthoriz') || act.includes('purge') || act.includes('remove') || desc.includes('deleted')) {
      return {
        type: 'destructive',
        label: displayLabel,
        classes: 'bg-rose-50 text-rose-800 border-rose-200/80 ring-1 ring-rose-500/10',
        dot: 'bg-rose-500',
        icon: <Trash2 className="w-3 h-3 text-rose-600 shrink-0" />,
      };
    }

    // 2. Creation Actions
    if (act.includes('create') || act.includes('import') || act.includes('added') || desc.includes('created')) {
      return {
        type: 'creation',
        label: displayLabel,
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-500/10',
        dot: 'bg-emerald-500',
        icon: <Plus className="w-3 h-3 text-emerald-600 shrink-0" />,
      };
    }

    // 3. Update & Pipeline Stage Shift Actions
    if (act.includes('update') || act.includes('stage') || act.includes('reassign') || act.includes('status') || act.includes('edit')) {
      return {
        type: 'update',
        label: displayLabel,
        classes: 'bg-blue-50 text-blue-800 border-blue-200/80 ring-1 ring-blue-500/10',
        dot: 'bg-blue-500',
        icon: <RefreshCw className="w-3 h-3 text-blue-600 shrink-0" />,
      };
    }

    // 4. Security & Authentication
    if (act.includes('login') || act.includes('logged') || act.includes('auth') || act.includes('security') || act.includes('password')) {
      return {
        type: 'security',
        label: displayLabel,
        classes: 'bg-amber-50 text-amber-900 border-amber-200/80 ring-1 ring-amber-500/10',
        dot: 'bg-amber-500',
        icon: <Lock className="w-3 h-3 text-amber-600 shrink-0" />,
      };
    }

    // 5. Default / System Events
    return {
      type: 'default',
      label: displayLabel,
      classes: 'bg-stone-100 text-stone-800 border-stone-200',
      dot: 'bg-stone-500',
      icon: <Activity className="w-3 h-3 text-stone-600 shrink-0" />,
    };
  };

  // Filter logs by search query and category
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const action = (log.action || '').toLowerCase();
      const desc = (log.description || '').toLowerCase();
      const user = (log.user_id?.name || '').toLowerCase();

      // Category filter
      if (categoryFilter === 'customer' && !action.includes('customer') && !desc.includes('customer')) {
        return false;
      }
      if (categoryFilter === 'task' && !action.includes('task') && !desc.includes('task') && !desc.includes('objective')) {
        return false;
      }
      if (categoryFilter === 'deal' && !action.includes('deal') && !desc.includes('deal') && !action.includes('pipeline')) {
        return false;
      }
      if (categoryFilter === 'staff' && !action.includes('staff') && !desc.includes('staff') && !desc.includes('member')) {
        return false;
      }

      // Search keyword filter
      if (search) {
        const q = search.toLowerCase();
        return action.includes(q) || desc.includes(q) || user.includes(q);
      }
      return true;
    });
  }, [logs, categoryFilter, search]);

  const customerEventsCount = logs.filter(
    (l) => (l.action || '').toLowerCase().includes('customer') || (l.description || '').toLowerCase().includes('customer')
  ).length;

  const taskEventsCount = logs.filter(
    (l) => (l.action || '').toLowerCase().includes('task') || (l.description || '').toLowerCase().includes('task')
  ).length;

  const dealEventsCount = logs.filter(
    (l) => (l.action || '').toLowerCase().includes('deal') || (l.description || '').toLowerCase().includes('deal')
  ).length;

  const staffEventsCount = logs.filter(
    (l) => (l.action || '').toLowerCase().includes('staff') || (l.description || '').toLowerCase().includes('member')
  ).length;

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#2D3A2D] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce-in">
          {toastMsg}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              Activity Logs
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {logs.length} Recorded Events
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1">
            Real-time audit trail and history of all workspace operations and security events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchLogs(true)}
            className="px-3.5 py-2 rounded-xl bg-[#F5F3EF] hover:bg-[#eae7e1] border border-[#E5E2DC] text-xs font-bold text-[#2D3A2D] transition flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPurgeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E2DC] text-xs font-bold text-rose-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">Total Events</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{logs.length}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Recorded operations</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">Customer Events</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{customerEventsCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Leads & accounts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">Task Milestones</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{taskEventsCount}</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Deliverable updates</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">System Health</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">99.8%</h3>
            <p className="text-[11px] text-[#706F6C] mt-0.5">Workspace integrity</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tip 3: Cohesive Unified Toolbar (Category Filter Pills on Left + Search on Right) */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Filter Pills with Distinct Solid Background Fill */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] rounded-2xl border border-[#E5E2DC]/80 overflow-x-auto">
          {/* All Logs */}
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === 'all'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>All Logs</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                categoryFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {logs.length}
            </span>
          </button>

          {/* Customers */}
          <button
            type="button"
            onClick={() => setCategoryFilter('customer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === 'customer'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>Customers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                categoryFilter === 'customer'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {customerEventsCount}
            </span>
          </button>

          {/* Tasks */}
          <button
            type="button"
            onClick={() => setCategoryFilter('task')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === 'task'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>Tasks</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                categoryFilter === 'task'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {taskEventsCount}
            </span>
          </button>

          {/* Deals */}
          <button
            type="button"
            onClick={() => setCategoryFilter('deal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === 'deal'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>Deals</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                categoryFilter === 'deal'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {dealEventsCount}
            </span>
          </button>

          {/* Staff */}
          <button
            type="button"
            onClick={() => setCategoryFilter('staff')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === 'staff'
                ? 'bg-[#2D3A2D] text-white shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white/80'
            }`}
          >
            <span>Staff</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                categoryFilter === 'staff'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E5E2DC]/60 text-[#706F6C]'
              }`}
            >
              {staffEventsCount}
            </span>
          </button>
        </div>

        {/* Search Bar seamlessly aligned inside the toolbar */}
        <div className="relative md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by keyword, user, or entity..."
            className="w-full bg-[#FAF9F5] border border-[#E5E2DC] rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-[#1A1A1A] placeholder-[#706F6C] focus:bg-white focus:border-[#2D3A2D] outline-none transition shadow-2xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#706F6C]" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-[#706F6C] hover:text-[#1A1A1A]"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table with Tip 1 (Badges) & Tip 2 (Inline Diff / Expandable Context) */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">Inspect</th>
                <th className="px-6 py-4">Event Operation</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Triggered By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#706F6C]">
                    <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const badge = getEventBadge(log.action, log.description);
                  const isExpanded = expandedLogId === log._id;

                  return (
                    <React.Fragment key={log._id}>
                      {/* Primary Log Row */}
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                        className={`transition-colors cursor-pointer group ${
                          isExpanded
                            ? 'bg-[#F5F3EF]/70 border-l-4 border-l-[#2D3A2D]'
                            : 'hover:bg-[#FBFBF9]'
                        }`}
                      >
                        {/* Interactive Expand Chevron Icon */}
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[#706F6C] group-hover:text-[#1A1A1A] group-hover:bg-[#FAF9F5] transition-transform duration-200 ${
                              isExpanded ? 'rotate-90 text-[#2D3A2D]' : ''
                            }`}
                            title={isExpanded ? 'Collapse event details' : 'Expand event details & payload diff'}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* Semantic Color Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition shadow-2xs ${badge.classes}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 text-[#1A1A1A] leading-relaxed max-w-md">
                          <p className="line-clamp-2 text-xs font-medium text-[#1A1A1A]">
                            {log.description || log.details || (log.action?.toLowerCase().includes('deal') ? 'Deal created and registered in workspace pipeline.' : 'System operation executed.')}
                          </p>
                        </td>

                        {/* Actor / Triggered By */}
                        <td className="px-6 py-4 font-semibold text-[#1A1A1A] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center font-bold text-[10px]">
                              {(log.user_id?.name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-none">{log.user_id?.name || 'System / Workspace'}</p>
                              <span className="text-[10px] text-[#706F6C] font-normal capitalize">
                                {log.user_id?.role || 'Service'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4 text-[#706F6C] whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1A1A1A] text-xs">
                              {getRelativeTime(log.createdAt)}
                            </span>
                            <span className="text-[10px] text-[#706F6C] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#706F6C]/70" />
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Tip 2: Inline Diff / Context Preview Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] transition-all">
                          <td colSpan={5} className="px-8 py-5">
                            <div className="bg-white rounded-2xl border border-[#E5E2DC] p-5 shadow-xs space-y-4 animate-scaleIn">
                              {/* Top Bar of Expanded View */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E2DC]/80 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                                  <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                                    Event Inspection & Field Context
                                  </h4>
                                  <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                                    ID: {log._id}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => handleCopyJSON(log, e)}
                                  className="text-xs font-bold text-[#2D3A2D] hover:bg-[#F5F3EF] px-3 py-1.5 rounded-xl border border-[#E5E2DC] transition flex items-center gap-1.5 shadow-2xs"
                                  title="Copy raw audit payload as JSON"
                                >
                                  {copiedId === log._id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700">Copied Payload!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-[#706F6C]" />
                                      <span>Copy JSON Diff</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* 3 Detail Metric Blocks */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Block 1: Event Classification */}
                                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2DC] space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C]">
                                    Operation Type
                                  </span>
                                  <p className="font-bold text-xs text-[#1A1A1A] flex items-center gap-1.5">
                                    {badge.icon}
                                    <span>{log.action}</span>
                                  </p>
                                  <p className="text-[11px] text-[#706F6C]">
                                    {badge.type === 'destructive'
                                      ? 'High-risk record deletion or deauthorization'
                                      : badge.type === 'creation'
                                      ? 'New CRM entity provisioned'
                                      : badge.type === 'update'
                                      ? 'Entity state transition or field modification'
                                      : 'General system audit entry'}
                                  </p>
                                </div>

                                {/* Block 2: Actor Accountability */}
                                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2DC] space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C]">
                                    Triggered By (Actor)
                                  </span>
                                  <p className="font-bold text-xs text-[#1A1A1A]">
                                    {log.user_id?.name || 'System / Workspace Auto-service'}
                                  </p>
                                  <p className="text-[11px] text-[#706F6C] font-mono">
                                    {log.user_id?.email || 'internal@veltrixcrm.local'} ({log.user_id?.role || 'system'})
                                  </p>
                                </div>

                                {/* Block 3: Exact Timestamp */}
                                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2DC] space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C]">
                                    Recorded Timestamp
                                  </span>
                                  <p className="font-bold text-xs text-[#1A1A1A]">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </p>
                                  <p className="text-[11px] text-emerald-700 font-semibold">
                                    {getRelativeTime(log.createdAt)} • Verified Audit Trail
                                  </p>
                                </div>
                              </div>

                              {/* Inline Details / Changes breakdown */}
                              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E2DC] space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C] flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[#2D3A2D]" />
                                  <span>Audit Description & Change Details</span>
                                </span>
                                <div className="p-3 rounded-lg bg-white border border-[#E5E2DC] text-xs font-mono text-[#1A1A1A] leading-relaxed">
                                  {log.description}
                                </div>
                              </div>

                              {/* Raw JSON Code Block for Technical Debugging */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C]">
                                  Raw Event Payload
                                </span>
                                <pre className="p-3 bg-[#1A1A1A] text-emerald-400 text-[11px] font-mono rounded-xl overflow-x-auto shadow-inner leading-relaxed">
                                  {JSON.stringify(
                                    {
                                      _id: log._id,
                                      action: log.action,
                                      description: log.description,
                                      actor: log.user_id || 'system',
                                      createdAt: log.createdAt,
                                    },
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#706F6C]">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handlePurgeLogs}
        title="Clear Activity Logs?"
        message="Are you sure you want to clear the activity log history? This will purge existing records."
        confirmText="Clear History"
      />
    </div>
  );
};

export default ActivityPage;
