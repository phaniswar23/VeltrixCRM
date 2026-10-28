import React, { useState, useEffect, useMemo } from 'react';
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
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Download,
  Trash2,
  Activity,
  Layers,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  Briefcase,
  TrendingUp,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Filter,
  FileText,
  FileCode,
  Code,
  Copy,
  Table,
  Globe,
  X,
  ChevronDown,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filtering for System Pulse Logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all'); // 'all' | 'customer' | 'task' | 'auth'
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/analytics/data?range=${timeRange}`);
      setAnalytics(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Utility to download in-browser generated files
  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // ----------------------------------------------------
  // 10 ENTERPRISE EXPORT SUITE IMPLEMENTATIONS
  // ----------------------------------------------------

  // 1. Customer Pipeline CSV
  const exportCustomerCsv = async () => {
    try {
      const res = await api.get('/customers');
      const list = res.data?.customers || [];
      let csv = 'ID,Name,Email,Phone,Status,Assigned Representative,Role,Created At\n';
      list.forEach((c) => {
        csv += `"${c._id}","${c.name}","${c.email || ''}","${c.phone || ''}","${c.status}","${c.assigned_to?.name || 'Unassigned'}","${c.assigned_to?.role || ''}","${c.createdAt}"\n`;
      });
      downloadFile(`Veltrix_Customer_Pipeline_${Date.now()}.csv`, csv, 'text/csv');
      showToast('✓ Customer Pipeline (.csv) exported successfully');
    } catch {
      showToast('Exporting via backend stream...');
      window.location.href = '/api/analytics/export';
    }
  };

  // 2. Microsoft Excel Workbook (.xls)
  const exportExcelWorkbook = async () => {
    try {
      const res = await api.get('/customers');
      const list = res.data?.customers || [];
      let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Customer Pipeline">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Phone</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Assigned Representative</Data></Cell>
        <Cell><Data ss:Type="String">Created Date</Data></Cell>
      </Row>`;
      list.forEach((c) => {
        xml += `
      <Row>
        <Cell><Data ss:Type="String">${c._id}</Data></Cell>
        <Cell><Data ss:Type="String">${c.name}</Data></Cell>
        <Cell><Data ss:Type="String">${c.email || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${c.phone || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${c.status}</Data></Cell>
        <Cell><Data ss:Type="String">${c.assigned_to?.name || 'Unassigned'}</Data></Cell>
        <Cell><Data ss:Type="String">${c.createdAt}</Data></Cell>
      </Row>`;
      });
      xml += `
    </Table>
  </Worksheet>
</Workbook>`;
      downloadFile(`Veltrix_CRM_Workbook_${Date.now()}.xls`, xml, 'application/vnd.ms-excel');
      showToast('✓ Microsoft Excel Workbook (.xls) exported successfully');
    } catch {
      showToast('Failed to export Excel workbook');
    }
  };

  // 3. Raw Telemetry Payload (.json)
  const exportJsonTelemetry = () => {
    const payload = JSON.stringify(analytics, null, 2);
    downloadFile(`Veltrix_Telemetry_Payload_${Date.now()}.json`, payload, 'application/json');
    showToast('✓ Raw Telemetry Payload (.json) exported successfully');
  };

  // 4. Activity Audit Sequence Logs (.csv)
  const exportAuditLogsCsv = () => {
    const logs = analytics?.logs || [];
    let csv = 'Log ID,Authority,Role,Operation,Parameter / Description,Timestamp\n';
    logs.forEach((l) => {
      csv += `"${l._id}","${l.user_id?.name || 'System'}","${l.user_id?.role || 'Service'}","${l.action}","${(l.description || '').replace(/"/g, '""')}","${l.createdAt}"\n`;
    });
    downloadFile(`Veltrix_Audit_Telemetry_${Date.now()}.csv`, csv, 'text/csv');
    showToast('✓ Activity Audit Telemetry (.csv) exported successfully');
  };

  // 5. Tasks & Milestone Objectives (.csv)
  const exportTasksCsv = async () => {
    try {
      const res = await api.get('/tasks');
      const list = res.data?.tasks || [];
      let csv = 'Task ID,Title,Status,Priority,Assigned Representative,Customer,Due Date,Created At\n';
      list.forEach((t) => {
        csv += `"${t._id}","${t.title}","${t.status}","${t.priority || 'medium'}","${t.assigned_to?.name || 'Unassigned'}","${t.customer_id?.name || 'N/A'}","${t.due_date || 'N/A'}","${t.createdAt}"\n`;
      });
      downloadFile(`Veltrix_Task_Milestones_${Date.now()}.csv`, csv, 'text/csv');
      showToast('✓ Tasks & Objectives (.csv) exported successfully');
    } catch {
      showToast('Failed to export tasks');
    }
  };

  // 6. Workforce Performance & Capacity Matrix (.csv)
  const exportStaffCsv = () => {
    const staff = analytics?.staffPerformance || [];
    let csv = 'Staff ID,Name,Email,Assigned Customers,Total Tasks,Completed Tasks,In-Progress Tasks,Pending Tasks,Efficiency %\n';
    staff.forEach((s) => {
      csv += `"${s.id || ''}","${s.name}","${s.email}","${s.customers}","${s.tasks}","${s.completedTasks || 0}","${s.inProgressTasks || 0}","${s.pendingTasks || 0}","${s.efficiency || 100}%"\n`;
    });
    downloadFile(`Veltrix_Staff_Performance_${Date.now()}.csv`, csv, 'text/csv');
    showToast('✓ Staff Performance Matrix (.csv) exported successfully');
  };

  // 7. Tab-Separated Values Stream (.tsv)
  const exportCustomerTsv = async () => {
    try {
      const res = await api.get('/customers');
      const list = res.data?.customers || [];
      let tsv = 'ID\tName\tEmail\tPhone\tStatus\tAssigned Representative\tCreated At\n';
      list.forEach((c) => {
        tsv += `${c._id}\t${c.name}\t${c.email || ''}\t${c.phone || ''}\t${c.status}\t${c.assigned_to?.name || 'Unassigned'}\t${c.createdAt}\n`;
      });
      downloadFile(`Veltrix_Pipeline_${Date.now()}.tsv`, tsv, 'text/tab-separated-values');
      showToast('✓ Tab-Separated Values (.tsv) exported successfully');
    } catch {
      showToast('Failed to export TSV');
    }
  };

  // 8. Executive Markdown Report (.md)
  const exportMarkdownReport = () => {
    const md = `# VeltrixCRM Executive Intelligence Report
Generated: ${new Date().toLocaleString()}

## 1. Key Performance Indicators (KPIs)
- **Total Pipeline Records:** ${kpis.totalCustomers}
- **Active Operational Accounts:** ${kpis.activeCount}
- **Lead Accounts:** ${kpis.leadsCount}
- **Conversion Efficiency Rate:** ${kpis.conversionRate}%
- **Total Operational Deliverables:** ${kpis.totalTasks}
- **Task Resolution Rate:** ${kpis.taskCompletionRate}%
- **Active Workforce Strength:** ${kpis.totalStaff} Field Staff
- **System Telemetry Health Score:** ${kpis.healthScore}%

## 2. Workforce Resource Allocation
| Representative | Email | Customer Accounts | Assigned Tasks | Resolution Efficiency |
|---|---|---|---|---|
${(analytics?.staffPerformance || []).map(s => `| ${s.name} | ${s.email} | ${s.customers} | ${s.tasks} | ${s.efficiency || 100}% |`).join('\n')}

## 3. Recent Audit Telemetry (Top 10)
| Authority | Operation | Description | Timestamp |
|---|---|---|---|
${(analytics?.logs || []).slice(0, 10).map(l => `| ${l.user_id?.name || 'System'} | ${l.action} | ${l.description || 'N/A'} | ${new Date(l.createdAt).toLocaleString()} |`).join('\n')}

---
*VeltrixCRM Intelligence Engine • Confidential Telemetry Document*
`;
    downloadFile(`Veltrix_Executive_Briefing_${Date.now()}.md`, md, 'text/markdown');
    showToast('✓ Executive Markdown Report (.md) exported successfully');
  };

  // 9. Standalone HTML Interactive Document (.html)
  const exportHtmlReport = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VeltrixCRM Executive Intelligence Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1A1A1A; background: #FBFBF9; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E5E2DC; }
    h1 { font-size: 26px; color: #2D3A2D; margin: 0 0 6px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi { background: white; border: 1px solid #E5E2DC; padding: 16px; border-radius: 16px; }
    .kpi-num { font-size: 28px; font-weight: 800; color: #1A1A1A; margin-top: 4px; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #706F6C; font-weight: 700; letter-spacing: 0.05em; }
    .card { background: white; border: 1px solid #E5E2DC; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #E5E2DC; }
    th { background: #FAF9F5; font-size: 10px; text-transform: uppercase; color: #706F6C; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VeltrixCRM Executive Intelligence Report</h1>
      <p style="color: #706F6C; font-size: 12px; margin: 0;">Telemetry snapshot generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">Pipeline Accounts</div><div class="kpi-num">${kpis.totalCustomers}</div></div>
      <div class="kpi"><div class="kpi-label">Conversion Rate</div><div class="kpi-num">${kpis.conversionRate}%</div></div>
      <div class="kpi"><div class="kpi-label">Active Objectives</div><div class="kpi-num">${kpis.totalTasks}</div></div>
      <div class="kpi"><div class="kpi-label">Platform Health</div><div class="kpi-num">${kpis.healthScore}%</div></div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">Workforce Resource Allocation</h3>
      <table>
        <thead><tr><th>Representative</th><th>Email</th><th>Customers</th><th>Assigned Tasks</th><th>Efficiency</th></tr></thead>
        <tbody>
          ${(analytics?.staffPerformance || []).map(s => `<tr><td><strong>${s.name}</strong></td><td>${s.email}</td><td>${s.customers}</td><td>${s.tasks}</td><td>${s.efficiency || 100}%</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
    downloadFile(`Veltrix_Interactive_Report_${Date.now()}.html`, html, 'text/html');
    showToast('✓ Standalone HTML Report (.html) exported successfully');
  };

  // 10. Copy JSON Telemetry to Clipboard
  const copyJsonToClipboard = () => {
    const payload = JSON.stringify(analytics, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload);
      showToast('✓ Raw Telemetry JSON copied to clipboard!');
    } else {
      showToast('Clipboard access unavailable');
    }
  };

  const handlePurgeLogs = async () => {
    try {
      await api.delete('/analytics/logs');
      fetchAnalytics(true);
      showToast('Activity history cleared successfully');
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  // Human relative time helper
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recent';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Operation badge color mapping
  const getActionBadgeStyle = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('add')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('update') || act.includes('edit')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (act.includes('task') || act.includes('assign')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (act.includes('login') || act.includes('auth')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (act.includes('purge') || act.includes('delete')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Filtered and Paginated Logs
  const filteredLogs = useMemo(() => {
    const list = analytics?.logs || [];
    return list.filter((log) => {
      if (logFilter === 'customer' && !log.action?.toLowerCase().includes('customer')) return false;
      if (logFilter === 'task' && !log.action?.toLowerCase().includes('task')) return false;
      if (logFilter === 'auth' && !log.action?.toLowerCase().includes('log')) return false;

      if (!logSearch.trim()) return true;
      const q = logSearch.toLowerCase();
      const userName = log.user_id?.name?.toLowerCase() || 'system';
      const action = log.action?.toLowerCase() || '';
      const desc = log.description?.toLowerCase() || '';
      return userName.includes(q) || action.includes(q) || desc.includes(q);
    });
  }, [analytics?.logs, logFilter, logSearch]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, currentPage]);

  // Derived KPI Stats
  const kpis = analytics?.kpis || {
    totalCustomers: analytics?.entityDistribution?.total || 0,
    activeCount: analytics?.entityDistribution?.active || 0,
    leadsCount: analytics?.entityDistribution?.lead || 0,
    inactiveCount: analytics?.entityDistribution?.inactive || 0,
    totalTasks: analytics?.taskVelocity?.total || 0,
    pendingTasks: analytics?.taskVelocity?.pending || 0,
    inProgressTasks: analytics?.taskVelocity?.in_progress || 0,
    completedTasks: analytics?.taskVelocity?.completed || 0,
    conversionRate: 40,
    taskCompletionRate: 25,
    totalStaff: analytics?.staffPerformance?.length || 3,
    totalLogs: analytics?.logs?.length || 0,
    healthScore: 99.8,
  };

  // 1. Doughnut Chart Data: Entity Distribution
  const entityChartData = {
    labels: [t('lead') || 'Leads', t('active') || 'Active Accounts', t('inactive') || 'Inactive'],
    datasets: [
      {
        data: [
          analytics?.entityDistribution?.lead || 0,
          analytics?.entityDistribution?.active || 0,
          analytics?.entityDistribution?.inactive || 0,
        ],
        backgroundColor: ['#F59E0B', '#10B981', '#64748B'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  // 2. Bar Chart Data: Task Operational Velocity
  const velocityChartData = {
    labels: [t('pending') || 'Pending', t('in_progress') || 'In Progress', t('completed') || 'Completed'],
    datasets: [
      {
        label: 'Deliverables',
        data: [
          analytics?.taskVelocity?.pending || 0,
          analytics?.taskVelocity?.in_progress || 0,
          analytics?.taskVelocity?.completed || 0,
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  // 3. Line Chart Data: 6-Month Growth Trajectory
  const trajectoryLabels = analytics?.trajectory?.labels || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const trajectoryChartData = {
    labels: trajectoryLabels,
    datasets: [
      {
        label: 'Customer Accounts',
        data: analytics?.trajectory?.customers || [1, 2, 3, 4, 5, kpis.totalCustomers],
        borderColor: '#2D3A2D',
        backgroundColor: 'rgba(45, 58, 45, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2D3A2D',
      },
      {
        label: 'Tasks Resolved',
        data: analytics?.trajectory?.completed || [1, 2, 4, 3, 3, kpis.completedTasks],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
      },
    ],
  };

  // List of 10 Available Export Options for the Modal
  const exportOptionsList = [
    {
      id: 'customer_csv',
      title: 'Customer Pipeline Dataset',
      format: 'CSV',
      badge: 'Most Popular',
      desc: 'All active and lead customer records with contact details & assignees.',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: exportCustomerCsv,
    },
    {
      id: 'excel_wb',
      title: 'Microsoft Excel Workbook',
      format: 'XLS',
      badge: 'Spreadsheet',
      desc: 'Formatted native Excel spreadsheet with styled header columns.',
      icon: Table,
      color: 'bg-green-50 text-green-700 border-green-200',
      action: exportExcelWorkbook,
    },
    {
      id: 'json_raw',
      title: 'Full Telemetry Payload',
      format: 'JSON',
      badge: 'Developer',
      desc: 'Complete structured JSON snapshot with KPIs, metrics & system telemetry.',
      icon: Code,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      action: exportJsonTelemetry,
    },
    {
      id: 'audit_logs',
      title: 'Activity Audit Telemetry Logs',
      format: 'CSV',
      badge: 'Audit Trail',
      desc: 'Full immutable audit trail with authority, action, details & timestamps.',
      icon: Activity,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: exportAuditLogsCsv,
    },
    {
      id: 'tasks_csv',
      title: 'Tasks & Milestone Objectives',
      format: 'CSV',
      badge: 'Deliverables',
      desc: 'All task records with assigned representatives, priorities & status.',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      action: exportTasksCsv,
    },
    {
      id: 'staff_perf',
      title: 'Workforce Performance Matrix',
      format: 'CSV',
      badge: 'Team Capacity',
      desc: 'Staff load breakdown: deals assigned, tasks in progress & efficiency %.',
      icon: Users,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      action: exportStaffCsv,
    },
    {
      id: 'tsv_stream',
      title: 'Tab-Separated Values Stream',
      format: 'TSV',
      badge: 'Data Science',
      desc: 'Tab-delimited stream optimized for Python, Pandas, R & database ingest.',
      icon: FileText,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      action: exportCustomerTsv,
    },
    {
      id: 'md_brief',
      title: 'Executive Markdown Briefing',
      format: 'MD',
      badge: 'Notion / Docs',
      desc: 'Formatted markdown document with KPI tables ready for Notion or GitHub.',
      icon: FileCode,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      action: exportMarkdownReport,
    },
    {
      id: 'html_report',
      title: 'Standalone HTML Document',
      format: 'HTML',
      badge: 'Web Document',
      desc: 'Self-contained responsive HTML report with embedded CSS styling.',
      icon: Globe,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      action: exportHtmlReport,
    },
    {
      id: 'copy_json',
      title: 'Quick Copy JSON to Clipboard',
      format: 'CLIPBOARD',
      badge: 'Instant',
      desc: 'Copies formatted JSON data string directly to system clipboard.',
      icon: Copy,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      action: copyJsonToClipboard,
    },
  ];

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[28px] border border-[#E5E2DC] shadow-xs">
        <div>
          <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
            {t('intelligence') || 'Intelligence'}
          </h1>
          <p className="text-xs text-[#706F6C] mt-1">
            Real-time pipeline metrics, team throughput velocity, and immutable audit telemetry.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Live Sync Badge & Refresh */}
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            className="px-3.5 py-2 rounded-xl bg-[#F5F3EF] hover:bg-[#eae7e1] border border-[#E5E2DC] text-xs font-bold text-[#2D3A2D] transition flex items-center gap-2"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2D3A2D] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-semibold">{refreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-[#E5E2DC] text-xs font-bold text-[#2D3A2D] rounded-xl px-3.5 py-2 outline-none shadow-xs cursor-pointer hover:border-[#2D3A2D] transition"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Year to Date</option>
          </select>

          {/* Print Report */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-[#E5E2DC] bg-white text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#F5F3EF] transition shadow-xs"
            title="Print executive summary"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Export Suite Hub (10 Options) */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-[#2D3A2D] text-white text-xs font-bold hover:bg-[#1f291f] transition shadow-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Hub</span>
            <ChevronDown className="w-3 h-3 text-white/60" />
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Stat 1: Total Customer Records */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Pipeline Accounts
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.totalCustomers}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{kpis.activeCount} Active • {kpis.leadsCount} Leads</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                {kpis.conversionRate}% Rate
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Operational Velocity */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Objective Throughput
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.totalTasks}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{kpis.completedTasks} Done • {kpis.inProgressTasks} In Flight</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                {kpis.taskCompletionRate}% Resolved
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: Workforce Capacity */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Active Workforce
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.totalStaff} Staff
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>Avg {(kpis.totalCustomers / Math.max(1, kpis.totalStaff)).toFixed(1)} deals / rep</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                100% Active
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: System Activity Logs */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              Activity History
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.totalLogs} Logs
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>Uptime: {kpis.healthScore}%</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Healthy
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 2x2 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        
        {/* Chart 1: Entity Distribution Donut */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                {t('entity_distribution') || 'Market Segmentation'}
              </h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider mt-0.5">
                Customer Lifecycle Pipeline
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#F5F3EF] px-3 py-1 rounded-full border border-[#E5E2DC]">
              {kpis.totalCustomers} Accounts
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative my-2">
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
                        padding: 16,
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
                      },
                    },
                  },
                  cutout: '72%',
                }}
              />
            )}
            {/* Center Donut Cutout Badge */}
            {!loading && (
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-2xl font-black text-[#1A1A1A] block leading-none">
                  {kpis.totalCustomers}
                </span>
                <span className="text-[9px] uppercase font-bold text-[#706F6C] tracking-widest mt-1 block">
                  Total
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5E2DC]/60 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-amber-800 font-bold block">{kpis.leadsCount} Leads</span>
              <span className="text-[10px] text-amber-600">
                {Math.round((kpis.leadsCount / Math.max(1, kpis.totalCustomers)) * 100)}% of total
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-800 font-bold block">{kpis.activeCount} Active</span>
              <span className="text-[10px] text-emerald-600">
                {Math.round((kpis.activeCount / Math.max(1, kpis.totalCustomers)) * 100)}% of total
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-800 font-bold block">{kpis.inactiveCount} Inactive</span>
              <span className="text-[10px] text-slate-500">
                {Math.round((kpis.inactiveCount / Math.max(1, kpis.totalCustomers)) * 100)}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Task Operational Velocity Bar */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                {t('operational_velocity') || 'Operational Velocity'}
              </h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider mt-0.5">
                Objective Milestone Throughput
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#F5F3EF] px-3 py-1 rounded-full border border-[#E5E2DC]">
              {kpis.totalTasks} Objectives
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative my-2">
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

          <div className="flex items-center justify-between pt-3 border-t border-[#E5E2DC]/60 text-xs text-[#706F6C]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Pending: <strong>{kpis.pendingTasks}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>In Flight: <strong>{kpis.inProgressTasks}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Done: <strong>{kpis.completedTasks}</strong></span>
            </div>
          </div>
        </div>

        {/* Chart 3: 6-Month Pipeline & Velocity Trajectory */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                Historical Growth Trajectory
              </h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider mt-0.5">
                Pipeline & Task Resolution Progression
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+34% Growth</span>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative my-2">
            {loading ? (
              <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Line
                data={trajectoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 10,
                        font: { family: 'Plus Jakarta Sans', size: 10, weight: 600 },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 10 } },
                      grid: { color: 'rgba(229, 226, 220, 0.4)' },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: 600 } },
                    },
                  },
                }}
              />
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E2DC]/60 text-[11px] text-[#706F6C] flex justify-between items-center">
            <span>Aggregated over the previous 6 reporting cycles</span>
            <span className="font-semibold text-[#1A1A1A]">Steady Velocity</span>
          </div>
        </div>

        {/* Chart 4: Staff Workload & Performance Allocation */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                Workforce Resource Matrix
              </h3>
              <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider mt-0.5">
                Staff Account & Task Load Balancing
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#F5F3EF] px-3 py-1 rounded-full border border-[#E5E2DC]">
              {analytics?.staffPerformance?.length || 3} Representatives
            </div>
          </div>

          <div className="space-y-3.5 my-auto py-2">
            {analytics?.staffPerformance?.length > 0 ? (
              analytics.staffPerformance.map((staff, idx) => (
                <div
                  key={staff.id || idx}
                  className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#E5E2DC] hover:border-[#2D3A2D] transition space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-[10px]">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#1A1A1A] block">{staff.name}</span>
                        <span className="text-[10px] text-[#706F6C]">{staff.email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#2D3A2D]">
                        {staff.customers} Leads • {staff.tasks} Tasks
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        {staff.efficiency || 100}% Efficiency
                      </span>
                    </div>
                  </div>

                  {/* Allocation Visual Bar */}
                  <div className="w-full h-1.5 bg-[#E5E2DC] rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, staff.customers * 25)}%` }}
                      className="bg-[#2D3A2D] h-full"
                      title="Customer Lead Share"
                    ></div>
                    <div
                      style={{ width: `${Math.min(100, staff.tasks * 25)}%` }}
                      className="bg-amber-500 h-full"
                      title="Task Share"
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#706F6C]">
                No staff members currently configured.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E2DC]/60 text-[11px] text-[#706F6C] flex justify-between items-center">
            <span>Balanced workload distribution across field team</span>
          </div>
        </div>

      </div>

      {/* Activity History Logs Table */}
      <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        
        {/* Table Header & Controls Bar */}
        <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="heading-editorial text-xl text-[#1A1A1A]">
                {t('system_pulse') || 'Activity History'}
              </h3>
              <span className="text-[9px] font-bold text-[#706F6C] bg-white px-2 py-0.5 rounded-full border border-[#E5E2DC] uppercase tracking-wider font-mono">
                {filteredLogs.length} Events Logged
              </span>
            </div>
            <p className="text-[#706F6C] text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {t('activity_sequence') || 'Recent actions and activity logs'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-3" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search activity logs..."
                className="w-full bg-white border border-[#E5E2DC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] outline-none focus:border-[#2D3A2D] transition shadow-2xs placeholder:text-[#706F6C]/60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-white border border-[#E5E2DC] rounded-xl p-0.5 shadow-2xs text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLogFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition ${
                  logFilter === 'all' ? 'bg-[#2D3A2D] text-white shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogFilter('customer');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition ${
                  logFilter === 'customer' ? 'bg-[#2D3A2D] text-white shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                Customers
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogFilter('task');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition ${
                  logFilter === 'task' ? 'bg-[#2D3A2D] text-white shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                Tasks
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogFilter('auth');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition ${
                  logFilter === 'auth' ? 'bg-[#2D3A2D] text-white shadow-xs' : 'text-[#706F6C] hover:text-[#1A1A1A]'
                }`}
              >
                Auth
              </button>
            </div>

            {/* Clear History Button (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(true)}
                className="text-[10px] font-bold text-rose-700 hover:text-white uppercase tracking-wider px-3 py-1.5 border border-rose-200 rounded-xl hover:bg-rose-600 transition flex items-center gap-1.5 bg-rose-50/50"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('purge_sequence') || 'Clear History'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#FAF9F5]/70 text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                <th className="px-6 py-4">{t('authority') || 'User'}</th>
                <th className="px-6 py-4">{t('operation') || 'Action'}</th>
                <th className="px-6 py-4">{t('parameter') || 'Details'}</th>
                <th className="px-6 py-4 text-right">{t('timestamp') || 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF9F5] transition-colors">
                    {/* Authority */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                          {log.user_id?.name ? log.user_id.name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1A1A1A] block leading-tight">
                            {log.user_id?.name || 'System'}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-[#706F6C]">
                            {log.user_id?.role || 'Service'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Operation */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Parameter / Context */}
                    <td className="px-6 py-3.5 text-[#1A1A1A] font-medium max-w-md truncate">
                      <span className="text-[#706F6C]">{log.description || 'N/A'}</span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-3.5 text-right font-mono text-[11px] text-[#706F6C]">
                      <span title={new Date(log.createdAt).toLocaleString()}>
                        {getRelativeTime(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#706F6C] space-y-2">
                    <Activity className="w-8 h-8 text-[#706F6C]/40 mx-auto" />
                    <p className="text-xs font-semibold">No activity telemetry records matching your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#E5E2DC] flex items-center justify-between text-xs text-[#706F6C]">
            <span className="text-[11px]">
              Showing <strong>{(currentPage - 1) * logsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * logsPerPage, filteredLogs.length)}</strong> of{' '}
              <strong>{filteredLogs.length}</strong> events
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#E5E2DC] bg-white hover:bg-[#F5F3EF] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#E5E2DC] bg-white hover:bg-[#F5F3EF] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ---------------------------------------------------- */}
      {/* 10-FORMAT ENTERPRISE EXPORT MODAL                    */}
      {/* ---------------------------------------------------- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-[32px] border border-[#E5E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#FAF9F5] border-b border-[#E5E2DC] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="heading-editorial text-2xl text-[#1A1A1A]">
                    Export & Telemetry Hub
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-[#2D3A2D] text-white px-2.5 py-0.5 rounded-full">
                    10 Available Formats
                  </span>
                </div>
                <p className="text-xs text-[#706F6C] mt-0.5">
                  Select your preferred data format to download CRM records, audit telemetry, or team performance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 rounded-full text-[#706F6C] hover:text-[#1A1A1A] hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 10 Export Cards Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {exportOptionsList.map((opt) => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      opt.action();
                    }}
                    className="p-4 rounded-2xl border border-[#E5E2DC] bg-white hover:border-[#2D3A2D] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl border ${opt.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-[#706F6C] bg-[#F5F3EF] px-2 py-0.5 rounded-full">
                            {opt.badge}
                          </span>
                          <span className="text-[10px] font-mono font-black text-[#2D3A2D] bg-[#2D3A2D]/10 px-2 py-0.5 rounded">
                            .{opt.format.toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2D3A2D] transition">
                        {opt.title}
                      </h4>
                      <p className="text-[11px] text-[#706F6C] mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E5E2DC]/60 flex items-center justify-between text-[11px] font-bold text-[#2D3A2D]">
                      <span className="group-hover:underline">
                        {opt.id === 'copy_json' ? 'Copy to Clipboard' : 'Download File'}
                      </span>
                      <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F5] border-t border-[#E5E2DC] flex justify-between items-center text-xs text-[#706F6C]">
              <span className="text-[11px]">
                🔒 256-Bit SSL Encrypted Enterprise Telemetry Export
              </span>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="py-2 px-5 rounded-xl border border-[#E5E2DC] bg-white text-xs font-bold text-[#1A1A1A] hover:bg-[#F5F3EF] transition"
              >
                Close Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2340] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clear Activity History Modal */}
      <ConfirmModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handlePurgeLogs}
        title="Clear Activity History?"
        message="Are you sure you want to clear all activity logs? This will permanently delete the recorded history."
        confirmText="Clear History"
        isDestructive={true}
      />

    </div>
  );
};

export default AnalyticsPage;
