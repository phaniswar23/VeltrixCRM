import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Download,
  Trash2,
  Activity,
  Layers,
  BarChart3,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/data');
      setAnalytics(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Veltrix_CRM_Intelligence_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const handlePurgeLogs = async () => {
    try {
      await api.delete('/analytics/logs');
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to purge logs', err);
    }
  };

  // Doughnut Chart Data for Customer Entities
  const entityChartData = {
    labels: [t('lead'), t('active'), t('inactive')],
    datasets: [
      {
        data: [
          analytics?.entityDistribution?.lead || 0,
          analytics?.entityDistribution?.active || 0,
          analytics?.entityDistribution?.inactive || 0,
        ],
        backgroundColor: ['#F97316', '#2D3A2D', '#706F6C'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  // Bar Chart Data for Operational Velocity
  const velocityChartData = {
    labels: [t('pending'), t('in_progress'), t('completed')],
    datasets: [
      {
        label: 'Deliverables',
        data: [
          analytics?.taskVelocity?.pending || 0,
          analytics?.taskVelocity?.in_progress || 0,
          analytics?.taskVelocity?.completed || 0,
        ],
        backgroundColor: ['#EA580C', '#4A5D4E', '#16A34A'],
        borderRadius: 12,
      },
    ],
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="heading-editorial text-3xl sm:text-4xl">{t('intelligence')}</h1>
          <p className="text-xs text-[#706F6C] mt-1">{t('intelligence_subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-[#E5E2DC] text-[10px] font-bold uppercase tracking-widest text-[#706F6C] rounded-2xl px-4 py-2.5 outline-none shadow-sm cursor-pointer"
          >
            <option value="30d">{t('last_30_days')}</option>
            <option value="quarter">{t('last_quarter')}</option>
            <option value="year">{t('this_year')}</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="btn-primary-veltrix !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Report (.csv)</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Entity Distribution Donut Chart */}
        <div className="card-veltrix bg-white p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="heading-editorial text-xl">{t('entity_distribution')}</h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mt-0.5">
                {t('market_segmentation')}
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#F5F3EF] px-3 py-1 rounded-full">
              {analytics?.entityDistribution?.total || 0} Total
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            {loading ? (
              <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Doughnut
                data={entityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
                      },
                    },
                  },
                  cutout: '72%',
                }}
              />
            )}
          </div>
        </div>

        {/* Operational Velocity Bar Chart */}
        <div className="card-veltrix bg-white p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="heading-editorial text-xl">{t('operational_velocity')}</h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mt-0.5">
                {t('objective_throughput')}
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#F5F3EF] px-3 py-1 rounded-full">
              {analytics?.taskVelocity?.total || 0} Objectives
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            {loading ? (
              <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bar
                data={velocityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 10 } },
                      grid: { color: 'rgba(229, 226, 220, 0.5)' },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* System Pulse Immutable Activity Sequence Table */}
      <div className="card-veltrix bg-white !p-0 overflow-hidden">
        <div className="p-6 border-b border-[#E5E2DC] flex justify-between items-center bg-[#F5F3EF]/60">
          <div>
            <h3 className="heading-editorial text-xl">{t('system_pulse')}</h3>
            <p className="text-[#706F6C] text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {t('activity_sequence')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={() => setIsPurgeModalOpen(true)}
                className="text-[9px] font-bold text-[#9B5A46] hover:text-white uppercase tracking-widest px-3 py-1.5 border border-[#9B5A46]/30 rounded-xl hover:bg-[#9B5A46] transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('purge_sequence')}</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-[#706F6C] tracking-[0.2em] uppercase">
                {t('live_sync')}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#FBFBF9] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-8 py-5">{t('authority')}</th>
                <th className="px-8 py-5">{t('operation')}</th>
                <th className="px-8 py-5">{t('parameter')}</th>
                <th className="px-8 py-5">{t('timestamp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {analytics?.logs?.length > 0 ? (
                analytics.logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-[10px]">
                          {log.user_id?.name ? log.user_id.name.charAt(0) : 'S'}
                        </div>
                        <span className="font-semibold text-[#1A1A1A]">
                          {log.user_id?.name || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#1A1A1A]">{log.action}</td>
                    <td className="px-8 py-5 text-[#706F6C]">{log.description || 'N/A'}</td>
                    <td className="px-8 py-5 text-[#706F6C] font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#706F6C]">
                    {t('sequence_empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purge Modal */}
      <ConfirmModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handlePurgeLogs}
        title="Purge Activity Sequence?"
        message="Are you sure you want to purge all historical system pulse activity logs? This action is permanent."
        confirmText="Purge Logs"
      />
    </div>
  );
};

export default AnalyticsPage;
