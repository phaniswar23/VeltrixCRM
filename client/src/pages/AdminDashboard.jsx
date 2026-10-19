import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CustomerDetailsModal from '../components/CustomerDetailsModal.jsx';
import CustomerFormModal from '../components/CustomerFormModal.jsx';
import {
  Users,
  UserCheck,
  CheckSquare,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowUpRight,
  MessageSquare,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);

  const fetchStats = async () => {
    try {
      const [statsRes, staffRes] = await Promise.all([
        api.get('/staff/stats'),
        api.get('/staff'),
      ]);
      setStats(statsRes.data?.stats);
      setStaffList(staffRes.data?.staff || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">
            {t('admin_dashboard')}
          </h1>
          <p className="text-xs text-[#706F6C] mt-1">
            Real-time pipeline metrics and synchronized enterprise activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refresh_data')}</span>
          </button>
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="btn-primary-veltrix !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_customer')}</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Customers */}
        <div className="card-veltrix bg-white p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('total_customers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#2D3A2D]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalCustomers || 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stats?.customerGrowth || 0}%
            </span>
          </div>
          <p className="text-[10px] text-[#706F6C]">vs previous 30 days cycle</p>
        </div>

        {/* Card 2: Total Staff */}
        <div className="card-veltrix bg-white p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('total_staff')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#2D3A2D]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalStaff || 0}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              {stats?.onlineStaffCount || 1} {t('online')}
            </span>
          </div>
          <p className="text-[10px] text-[#706F6C]">active team operators</p>
        </div>

        {/* Card 3: Total Tasks */}
        <div className="card-veltrix bg-white p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('total_tasks')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#2D3A2D]">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.totalTasks || 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stats?.taskGrowth || 0}%
            </span>
          </div>
          <p className="text-[10px] text-[#706F6C]">operational deliverables</p>
        </div>

        {/* Card 4: Task Efficiency */}
        <div className="card-veltrix bg-white p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C]">
              {t('completed_tasks')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#9B5A46]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A]">
              {stats?.completedTasks || 0}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D3A2D]/10 text-[#2D3A2D]">
              {stats?.taskEfficiency || 0}% Efficiency
            </span>
          </div>
          <p className="text-[10px] text-[#706F6C]">resolution completion rate</p>
        </div>
      </div>

      {/* Main Grid: Recent Customers & Activity Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Customers Table */}
        <div className="lg:col-span-7 card-veltrix bg-white !p-0 overflow-hidden">
          <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
            <div>
              <h3 className="heading-editorial text-lg">{t('recent_customers')}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C] mt-0.5">
                {t('newly_onboarded_entities')}
              </p>
            </div>
            <Link
              to="/admin/customers"
              className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
            >
              <span>{t('view_all')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DC] bg-[#FBFBF9] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                  <th className="px-6 py-4">{t('customer_name')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4">{t('assigned_to')}</th>
                  <th className="px-6 py-4 text-center">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
                {stats?.recentCustomers?.length > 0 ? (
                  stats.recentCustomers.map((cust) => {
                    const statusClass =
                      cust.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : cust.status === 'lead'
                        ? 'bg-orange-50 text-orange-800'
                        : 'bg-slate-100 text-slate-600';
                    const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <tr key={cust._id} className="hover:bg-[#FBFBF9] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#1A1A1A]">{cust.name}</div>
                          <div className="text-[10px] text-[#706F6C]">{cust.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#706F6C]">
                          {cust.assigned_to?.name || t('unassigned')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="WhatsApp DM"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="p-1.5 text-[#706F6C] hover:text-[#2D3A2D] hover:bg-[#F5F3EF] rounded-lg transition"
                              title={t('inspect')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#706F6C]">
                      No customers registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time System Pulse Activity Feed */}
        <div className="lg:col-span-5 card-veltrix bg-white !p-0 overflow-hidden">
          <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2D3A2D]" />
              <h3 className="heading-editorial text-lg">{t('system_pulse')}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-[#706F6C] uppercase tracking-wider">
                {t('live_sync')}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto divide-y divide-[#E5E2DC]/40">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act._id} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-[#1A1A1A]">{act.action}</span>
                    <span className="text-[9px] text-[#706F6C]">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#706F6C] leading-relaxed">{act.description}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-[#706F6C]">
                {t('sequence_empty')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Performance Breakdown Table */}
      <div className="card-veltrix bg-white !p-0 overflow-hidden">
        <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
          <div>
            <h3 className="heading-editorial text-lg">{t('staff_performance_flow')}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#706F6C] mt-0.5">
              Workforce distribution metrics
            </p>
          </div>
          <Link
            to="/admin/staff"
            className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1"
          >
            <span>{t('manage_staff')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#FBFBF9] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4">Personnel Member</th>
                <th className="px-6 py-4">Assigned Customers</th>
                <th className="px-6 py-4">Assigned Tasks</th>
                <th className="px-6 py-4">Operational Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {stats?.staffPerformance?.length > 0 ? (
                stats.staffPerformance.map((staff) => {
                  const ratio =
                    staff.tasksCount > 0
                      ? Math.min(100, Math.round((staff.customersCount / staff.tasksCount) * 100))
                      : 100;
                  return (
                    <tr key={staff._id} className="hover:bg-[#FBFBF9] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#1A1A1A] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center text-xs font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        <span>{staff.name}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#706F6C]">
                        {staff.customersCount} active accounts
                      </td>
                      <td className="px-6 py-4 font-medium text-[#706F6C]">
                        {staff.tasksCount} deliverables
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 bg-[#F5F3EF] h-2 rounded-full overflow-hidden border border-[#E5E2DC]">
                          <div
                            className="bg-[#2D3A2D] h-full rounded-full"
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#706F6C]">
                    No personnel data recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        staffList={staffList}
        onSaved={fetchStats}
      />
    </div>
  );
};

export default AdminDashboard;
