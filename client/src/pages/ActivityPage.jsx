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
} from 'lucide-react';

const ActivityPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'customer' | 'task' | 'staff' | 'auth'
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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
      if (categoryFilter === 'staff' && !action.includes('staff') && !desc.includes('staff') && !desc.includes('member')) {
        return false;
      }
      if (categoryFilter === 'auth' && !action.includes('logged') && !action.includes('workspace')) {
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
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 border border-[#E5E2DC] text-xs font-bold text-red-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5F3EF] p-1 rounded-2xl border border-[#E5E2DC] self-start overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-white text-[#2D3A2D] shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('customer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              categoryFilter === 'customer'
                ? 'bg-white text-[#2D3A2D] shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Customers
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('task')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              categoryFilter === 'task'
                ? 'bg-white text-[#2D3A2D] shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('staff')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              categoryFilter === 'staff'
                ? 'bg-white text-[#2D3A2D] shadow-xs'
                : 'text-[#706F6C] hover:text-[#1A1A1A]'
            }`}
          >
            Staff
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by keyword..."
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

      {/* Audit Log Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4">Event Operation</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Triggered By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#706F6C]">
                    <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1A1A1A] text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#706F6C] leading-relaxed">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1A1A1A]">
                      {log.user_id?.name || 'System / Workspace'}
                    </td>
                    <td className="px-6 py-4 text-[#706F6C]">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-[#706F6C]/70" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#706F6C]">
                    No activity logs found.
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

