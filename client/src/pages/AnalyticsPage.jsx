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
  Clock,
  ArrowUpRight,
  FileText,
  FileCode,
  Code,
  Copy,
  Table,
  Globe,
  X,
  ChevronDown,
  Sparkles,
  Check,
  AlertCircle,
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
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filtering for Activity Logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all'); // 'all' | 'customer' | 'task' | 'auth'
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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
      if (isManual) setTimeout(() => setRefreshing(false), 400);
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
  // EXPORT HANDLERS
  // ----------------------------------------------------

  // 1. Customer CSV
  const exportCustomerCsv = async () => {
    try {
      const params = {};
      if (!isAdmin && user?._id) params.staff_id = user._id;
      const res = await api.get('/customers', { params });
      const list = res.data?.customers || [];
      let csv = 'ID,Name,Email,Phone,Status,Assigned To,Created At\n';
      list.forEach((c) => {
        csv += `"${c._id}","${c.name}","${c.email || ''}","${c.phone || ''}","${c.status}","${c.assigned_to?.name || 'Unassigned'}","${c.createdAt}"\n`;
      });
      const filename = isAdmin ? `Veltrix_Customers_${Date.now()}.csv` : `My_Customers_${Date.now()}.csv`;
      downloadFile(filename, csv, 'text/csv');
      showToast('Customers (.csv) downloaded successfully');
    } catch {
      showToast('Failed to export customers');
    }
  };

  // 2. Microsoft Excel (.xls)
  const exportExcelWorkbook = async () => {
    try {
      const params = {};
      if (!isAdmin && user?._id) params.staff_id = user._id;
      const res = await api.get('/customers', { params });
      const list = res.data?.customers || [];
      let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Customers">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Phone</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Assigned To</Data></Cell>
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
      const filename = isAdmin ? `Veltrix_Customers_${Date.now()}.xls` : `My_Customers_${Date.now()}.xls`;
      downloadFile(filename, xml, 'application/vnd.ms-excel');
      showToast('Excel workbook (.xls) downloaded successfully');
    } catch {
      showToast('Failed to export Excel workbook');
    }
  };

  // 3. Tasks CSV
  const exportTasksCsv = async () => {
    try {
      const params = {};
      if (!isAdmin && user?._id) params.staff_id = user._id;
      const res = await api.get('/tasks', { params });
      const list = res.data?.tasks || [];
      let csv = 'Task ID,Title,Status,Priority,Assigned To,Customer,Due Date,Created At\n';
      list.forEach((t) => {
        csv += `"${t._id}","${t.title}","${t.status}","${t.priority || 'medium'}","${t.assigned_to?.name || 'Unassigned'}","${t.customer_id?.name || 'Internal'}","${t.due_date || ''}","${t.createdAt}"\n`;
      });
      const filename = isAdmin ? `Veltrix_Tasks_${Date.now()}.csv` : `My_Tasks_${Date.now()}.csv`;
      downloadFile(filename, csv, 'text/csv');
      showToast('Tasks (.csv) downloaded successfully');
    } catch {
      showToast('Failed to export tasks');
    }
  };

  // 4. Activity Logs CSV
  const exportAuditLogsCsv = () => {
    const logs = analytics?.logs || [];
    let csv = 'Log ID,User,Role,Action,Details,Time\n';
    logs.forEach((l) => {
      csv += `"${l._id}","${l.user_id?.name || 'System'}","${l.user_id?.role || 'Service'}","${l.action}","${(l.description || '').replace(/"/g, '""')}","${l.createdAt}"\n`;
    });
    const filename = isAdmin ? `Veltrix_Activity_Logs_${Date.now()}.csv` : `My_Activity_Logs_${Date.now()}.csv`;
    downloadFile(filename, csv, 'text/csv');
    showToast('Activity logs (.csv) downloaded successfully');
  };

  // 5. Staff Performance CSV (Admin only)
  const exportStaffCsv = () => {
    const staff = analytics?.staffPerformance || [];
    let csv = 'Staff ID,Name,Email,Assigned Customers,Total Tasks,Completed Tasks,In-Progress Tasks,Pending Tasks,Efficiency %\n';
    staff.forEach((s) => {
      csv += `"${s.id || ''}","${s.name}","${s.email}","${s.customers}","${s.tasks}","${s.completedTasks || 0}","${s.inProgressTasks || 0}","${s.pendingTasks || 0}","${s.efficiency || 100}%"\n`;
    });
    downloadFile(`Veltrix_Staff_Performance_${Date.now()}.csv`, csv, 'text/csv');
    showToast('Staff performance (.csv) downloaded successfully');
  };

  // 6. JSON Snapshot
  const exportJsonTelemetry = () => {
    const payload = JSON.stringify(analytics, null, 2);
    downloadFile(`Veltrix_Analytics_Data_${Date.now()}.json`, payload, 'application/json');
    showToast('JSON snapshot downloaded successfully');
  };

  // 7. Markdown Report (Admin only)
  const exportMarkdownReport = () => {
    const md = `# VeltrixCRM Analytics Report
Generated: ${new Date().toLocaleString()}

## Key Metrics
- Total Customers: ${kpis.totalCustomers}
- Active Accounts: ${kpis.activeCount}
- Leads: ${kpis.leadsCount}
- Active Rate: ${kpis.conversionRate}%
- Total Tasks: ${kpis.totalTasks}
- Task Completion Rate: ${kpis.taskCompletionRate}%
- Team Members: ${kpis.totalStaff}

## Staff Breakdown
| Staff Member | Email | Customers | Tasks | Efficiency |
|---|---|---|---|---|
${(analytics?.staffPerformance || []).map((s) => `| ${s.name} | ${s.email} | ${s.customers} | ${s.tasks} | ${s.efficiency || 100}% |`).join('\n')}

## Recent Activity (Top 10)
| User | Action | Details | Time |
|---|---|---|---|
${(analytics?.logs || []).slice(0, 10).map((l) => `| ${l.user_id?.name || 'System'} | ${l.action} | ${l.description || 'N/A'} | ${new Date(l.createdAt).toLocaleString()} |`).join('\n')}
`;
    downloadFile(`Veltrix_Summary_${Date.now()}.md`, md, 'text/markdown');
    showToast('Markdown report (.md) downloaded successfully');
  };

  // 8. HTML Document
  const exportHtmlReport = () => {
    const titleText = isAdmin ? 'VeltrixCRM Team Analytics Report' : 'VeltrixCRM Personal Analytics Report';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${titleText}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1A1A1A; background: #FBFBF9; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E5E2DC; }
    h1 { font-size: 24px; color: #2D3A2D; margin: 0 0 6px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi { background: white; border: 1px solid #E5E2DC; padding: 16px; border-radius: 16px; }
    .kpi-num { font-size: 26px; font-weight: 800; color: #1A1A1A; margin-top: 4px; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #706F6C; font-weight: 700; }
    .card { background: white; border: 1px solid #E5E2DC; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #E5E2DC; }
    th { background: #FAF9F5; font-size: 10px; text-transform: uppercase; color: #706F6C; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${titleText}</h1>
      <p style="color: #706F6C; font-size: 12px; margin: 0;">Report generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">${isAdmin ? 'Customers' : 'My Customers'}</div><div class="kpi-num">${kpis.totalCustomers}</div></div>
      <div class="kpi"><div class="kpi-label">Active Rate</div><div class="kpi-num">${kpis.conversionRate}%</div></div>
      <div class="kpi"><div class="kpi-label">${isAdmin ? 'Total Tasks' : 'My Tasks'}</div><div class="kpi-num">${kpis.totalTasks}</div></div>
      <div class="kpi"><div class="kpi-label">Completion Rate</div><div class="kpi-num">${kpis.taskCompletionRate}%</div></div>
    </div>

    ${
      isAdmin && (analytics?.staffPerformance || []).length > 0
        ? `<div class="card">
      <h3 style="margin: 0 0 12px 0; font-size: 15px;">Team Performance</h3>
      <table>
        <thead><tr><th>Staff Member</th><th>Email</th><th>Customers</th><th>Tasks</th><th>Efficiency</th></tr></thead>
        <tbody>
          ${(analytics?.staffPerformance || [])
            .map(
              (s) =>
                `<tr><td><strong>${s.name}</strong></td><td>${s.email}</td><td>${s.customers}</td><td>${s.tasks}</td><td>${s.efficiency || 100}%</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
        : ''
    }
  </div>
</body>
</html>`;
    downloadFile(`Veltrix_Report_${Date.now()}.html`, html, 'text/html');
    showToast('HTML report (.html) downloaded successfully');
  };

  // 9. Copy JSON
  const copyJsonToClipboard = () => {
    const payload = JSON.stringify(analytics, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload);
      showToast('JSON data copied to clipboard');
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
    totalCustomers: 0,
    activeCount: 0,
    leadsCount: 0,
    inactiveCount: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    conversionRate: 0,
    taskCompletionRate: 0,
    totalStaff: 1,
    totalLogs: 0,
    highPriorityTasks: 0,
    mediumPriorityTasks: 0,
    lowPriorityTasks: 0,
    healthScore: 99.8,
  };

  // Chart 1: Customer Distribution Donut
  const entityChartData = {
    labels: ['Leads', 'Active Customers', 'Inactive'],
    datasets: [
      {
        data: [
          analytics?.entityDistribution?.lead || 0,
          analytics?.entityDistribution?.active || 0,
          analytics?.entityDistribution?.inactive || 0,
        ],
        backgroundColor: ['#F59E0B', '#10B981', '#94A3B8'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  // Chart 2: Task Status Bar
  const velocityChartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          analytics?.taskVelocity?.pending || 0,
          analytics?.taskVelocity?.in_progress || 0,
          analytics?.taskVelocity?.completed || 0,
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Chart 3: 6-Month Trajectory
  const trajectoryLabels = analytics?.trajectory?.labels || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const trajectoryChartData = {
    labels: trajectoryLabels,
    datasets: [
      {
        label: isAdmin ? 'New Customers' : 'Assigned Customers',
        data: analytics?.trajectory?.customers || [0, 0, 0, 0, 0, kpis.totalCustomers],
        borderColor: '#2D3A2D',
        backgroundColor: 'rgba(45, 58, 45, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2D3A2D',
      },
      {
        label: 'Tasks Completed',
        data: analytics?.trajectory?.completed || [0, 0, 0, 0, 0, kpis.completedTasks],
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

  // Chart 4 for Staff: Priority Breakdown Doughnut
  const priorityChartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [
          analytics?.taskPriority?.high || 0,
          analytics?.taskPriority?.medium || 0,
          analytics?.taskPriority?.low || 0,
        ],
        backgroundColor: ['#F43F5E', '#F59E0B', '#64748B'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  // Available Export Options
  const exportOptionsList = isAdmin
    ? [
        {
          id: 'customer_csv',
          title: 'Customer List',
          format: 'CSV',
          desc: 'All customer and lead records with contact details and assignees.',
          icon: FileSpreadsheet,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          action: exportCustomerCsv,
        },
        {
          id: 'excel_wb',
          title: 'Excel Workbook',
          format: 'XLS',
          desc: 'Formatted Excel spreadsheet of all customer accounts.',
          icon: Table,
          color: 'bg-green-50 text-green-700 border-green-200',
          action: exportExcelWorkbook,
        },
        {
          id: 'tasks_csv',
          title: 'Tasks List',
          format: 'CSV',
          desc: 'All team tasks with status, priority, and assignees.',
          icon: CheckCircle2,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          action: exportTasksCsv,
        },
        {
          id: 'staff_perf',
          title: 'Staff Performance',
          format: 'CSV',
          desc: 'Team performance breakdown: customers, tasks, and efficiency.',
          icon: Users,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          action: exportStaffCsv,
        },
        {
          id: 'audit_logs',
          title: 'Activity Logs',
          format: 'CSV',
          desc: 'All recorded activity logs with user, action, and timestamps.',
          icon: Activity,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          action: exportAuditLogsCsv,
        },
        {
          id: 'md_brief',
          title: 'Markdown Summary',
          format: 'MD',
          desc: 'Formatted markdown document with KPI metrics and staff table.',
          icon: FileCode,
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          action: exportMarkdownReport,
        },
        {
          id: 'html_report',
          title: 'HTML Report',
          format: 'HTML',
          desc: 'Print-ready HTML document with styling.',
          icon: Globe,
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          action: exportHtmlReport,
        },
        {
          id: 'copy_json',
          title: 'Copy JSON Summary',
          format: 'CLIPBOARD',
          desc: 'Copies structured analytics data directly to clipboard.',
          icon: Copy,
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          action: copyJsonToClipboard,
        },
      ]
    : [
        {
          id: 'customer_csv',
          title: 'My Customers',
          format: 'CSV',
          desc: 'CSV file containing all customers currently assigned to you.',
          icon: FileSpreadsheet,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          action: exportCustomerCsv,
        },
        {
          id: 'excel_wb',
          title: 'My Customers (Excel)',
          format: 'XLS',
          desc: 'Excel spreadsheet of your assigned customer accounts.',
          icon: Table,
          color: 'bg-green-50 text-green-700 border-green-200',
          action: exportExcelWorkbook,
        },
        {
          id: 'tasks_csv',
          title: 'My Tasks',
          format: 'CSV',
          desc: 'CSV file of all tasks assigned to you with due dates and status.',
          icon: CheckCircle2,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          action: exportTasksCsv,
        },
        {
          id: 'audit_logs',
          title: 'My Activity History',
          format: 'CSV',
          desc: 'Log of your recent actions and updates in the workspace.',
          icon: Activity,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          action: exportAuditLogsCsv,
        },
        {
          id: 'html_report',
          title: 'Personal HTML Summary',
          format: 'HTML',
          desc: 'Printable HTML document of your personal performance.',
          icon: Globe,
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          action: exportHtmlReport,
        },
        {
          id: 'copy_json',
          title: 'Copy JSON Data',
          format: 'CLIPBOARD',
          desc: 'Copies your personal stats snapshot to your clipboard.',
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
          <div className="flex items-center gap-3">
            <h1 className="heading-editorial text-2xl sm:text-3xl text-[#1A1A1A]">
              {isAdmin ? 'Team Analytics' : 'My Analytics'}
            </h1>
            <span className="text-[11px] font-bold text-[#2D3A2D] bg-[#2D3A2D]/10 px-3 py-1 rounded-full border border-[#2D3A2D]/20">
              {isAdmin ? 'Company Scope' : 'Personal Scope'}
            </span>
          </div>
          <p className="text-xs text-[#706F6C] mt-1.5">
            {isAdmin
              ? 'Overview of all customer accounts, team tasks, and staff performance.'
              : 'Overview of your assigned customers, task progress, and work stats.'}
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#eae7e1] border border-[#E5E2DC] text-xs font-bold text-[#2D3A2D] transition flex items-center gap-2"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-semibold">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
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
            className="p-2 rounded-xl border border-[#E5E2DC] bg-white text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#FAF9F5] transition shadow-xs"
            title="Print report"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Export Hub Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-[#2D3A2D] text-white text-xs font-bold hover:bg-[#1f291f] transition shadow-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Data</span>
            <ChevronDown className="w-3 h-3 text-white/60" />
          </button>
        </div>
      </div>

      {/* Highlights / Quick Summary Box */}
      {analytics?.aiInsights?.length > 0 && (
        <div className="bg-[#FAF9F5] rounded-[24px] p-5 border border-[#E5E2DC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#1A1A1A]">
                {isAdmin ? 'Team Summary' : 'Your Progress Highlights'}
              </h4>
              <ul className="text-xs text-[#706F6C] space-y-0.5">
                {analytics.aiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D3A2D] shrink-0"></span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Customers */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              {isAdmin ? 'Total Customers' : 'My Customers'}
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
                {kpis.conversionRate}% Active
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Tasks */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              {isAdmin ? 'Total Tasks' : 'My Tasks'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.totalTasks}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{kpis.completedTasks} Done • {kpis.inProgressTasks} In Progress</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                {kpis.pendingTasks} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: Completion Rate */}
        <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
              {isAdmin ? 'Team Completion Rate' : 'My Completion Rate'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {kpis.taskCompletionRate}%
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
              <span>{kpis.completedTasks} of {kpis.totalTasks} finished</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                {kpis.taskCompletionRate >= 70 ? 'High' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Role-specific stat */}
        {isAdmin ? (
          <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                Active Staff
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                {kpis.totalStaff} Staff
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
                <span>Avg {(kpis.totalCustomers / Math.max(1, kpis.totalStaff)).toFixed(1)} customers/rep</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                  Team Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-5 border border-[#E5E2DC] shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                Pending Work
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                {kpis.pendingTasks} Tasks
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#706F6C] mt-2 pt-2 border-t border-[#E5E2DC]/60">
                <span>{kpis.highPriorityTasks || 0} high priority</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                  Needs Focus
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2x2 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        
        {/* Chart 1: Customer Status Donut */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                {isAdmin ? 'Customer Status Breakdown' : 'My Customers by Status'}
              </h3>
              <p className="text-[11px] text-[#706F6C] mt-0.5">
                {isAdmin ? 'All company leads and active accounts.' : 'Your assigned leads and active accounts.'}
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E5E2DC]">
              {kpis.totalCustomers} Total
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
                  cutout: '70%',
                }}
              />
            )}
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
                {Math.round((kpis.leadsCount / Math.max(1, kpis.totalCustomers)) * 100)}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-800 font-bold block">{kpis.activeCount} Active</span>
              <span className="text-[10px] text-emerald-600">
                {Math.round((kpis.activeCount / Math.max(1, kpis.totalCustomers)) * 100)}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-800 font-bold block">{kpis.inactiveCount} Inactive</span>
              <span className="text-[10px] text-slate-500">
                {Math.round((kpis.inactiveCount / Math.max(1, kpis.totalCustomers)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Task Status Bar */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                {isAdmin ? 'Task Progress' : 'My Task Progress'}
              </h3>
              <p className="text-[11px] text-[#706F6C] mt-0.5">
                {isAdmin ? 'Tasks across pending, in-progress, and completed states.' : 'Your tasks by current status.'}
              </p>
            </div>
            <div className="text-xs font-bold text-[#2D3A2D] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E5E2DC]">
              {kpis.totalTasks} Tasks
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
              <span>In Progress: <strong>{kpis.inProgressTasks}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Done: <strong>{kpis.completedTasks}</strong></span>
            </div>
          </div>
        </div>

        {/* Chart 3: 6-Month Monthly Trend */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                {isAdmin ? 'Monthly Growth' : 'My Monthly Progress'}
              </h3>
              <p className="text-[11px] text-[#706F6C] mt-0.5">
                {isAdmin ? 'Customers and completed tasks over the last 6 months.' : 'Customers assigned and tasks resolved over 6 months.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Steady</span>
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
            <span>Recorded over the previous 6 months</span>
            <span className="font-semibold text-[#1A1A1A]">{kpis.completedTasks} tasks resolved</span>
          </div>
        </div>

        {/* Chart 4: Role-specific (Admin: Staff Performance / Staff: Task Priority Breakdown) */}
        {isAdmin ? (
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                  Staff Performance
                </h3>
                <p className="text-[11px] text-[#706F6C] mt-0.5">
                  Customers and tasks assigned to each staff member.
                </p>
              </div>
              <div className="text-xs font-bold text-[#2D3A2D] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E5E2DC]">
                {analytics?.staffPerformance?.length || 0} Staff
              </div>
            </div>

            <div className="space-y-3 my-auto py-2 overflow-y-auto max-h-64">
              {analytics?.staffPerformance?.length > 0 ? (
                analytics.staffPerformance.map((staff, idx) => (
                  <div
                    key={staff.id || idx}
                    className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E2DC] hover:border-[#2D3A2D] transition space-y-2"
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
                          {staff.customers} Customers • {staff.tasks} Tasks
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {staff.efficiency || 100}% Efficiency
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#E5E2DC] rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.min(100, staff.customers * 20)}%` }}
                        className="bg-[#2D3A2D] h-full"
                        title="Customers"
                      ></div>
                      <div
                        style={{ width: `${Math.min(100, staff.tasks * 20)}%` }}
                        className="bg-amber-500 h-full"
                        title="Tasks"
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#706F6C]">
                  No staff members currently registered.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5E2DC]/60 text-[11px] text-[#706F6C] flex justify-between items-center">
              <span>Workload distribution across team members</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5E2DC] shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="heading-editorial text-lg sm:text-xl text-[#1A1A1A]">
                  Task Priority Breakdown
                </h3>
                <p className="text-[11px] text-[#706F6C] mt-0.5">
                  High, medium, and low priority tasks in your queue.
                </p>
              </div>
              <div className="text-xs font-bold text-[#2D3A2D] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E5E2DC]">
                Priority View
              </div>
            </div>

            <div className="h-64 flex items-center justify-center relative my-2">
              {loading ? (
                <div className="w-8 h-8 border-3 border-[#2D3A2D] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Doughnut
                  data={priorityChartData}
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
                    cutout: '70%',
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5E2DC]/60 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-rose-800 font-bold block">{kpis.highPriorityTasks || 0} High</span>
                <span className="text-[10px] text-rose-600">Urgent attention</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-amber-800 font-bold block">{kpis.mediumPriorityTasks || 0} Medium</span>
                <span className="text-[10px] text-amber-600">Standard priority</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-800 font-bold block">{kpis.lowPriorityTasks || 0} Low</span>
                <span className="text-[10px] text-slate-500">Normal queue</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Activity History Logs Table */}
      <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-xs overflow-hidden">
        
        {/* Table Header & Controls Bar */}
        <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="heading-editorial text-xl text-[#1A1A1A]">
                {isAdmin ? 'Activity History' : 'My Recent Activity'}
              </h3>
              <span className="text-[9px] font-bold text-[#706F6C] bg-white px-2 py-0.5 rounded-full border border-[#E5E2DC] font-mono">
                {filteredLogs.length} Events
              </span>
            </div>
            <p className="text-[#706F6C] text-[11px] mt-0.5">
              {isAdmin
                ? 'Recent actions performed across the workspace.'
                : 'Actions and updates you performed recently.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-3" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search activity..."
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
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#FAF9F5]/70 text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                {isAdmin && <th className="px-6 py-4">User</th>}
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]/60 text-xs">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF9F5] transition-colors">
                    {/* User column (Admin view) */}
                    {isAdmin && (
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
                    )}

                    {/* Action */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Details */}
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
                  <td colSpan={isAdmin ? 4 : 3} className="p-12 text-center text-[#706F6C] space-y-2">
                    <Activity className="w-8 h-8 text-[#706F6C]/40 mx-auto" />
                    <p className="text-xs font-semibold">No activity records matching your search.</p>
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
                className="p-1.5 rounded-lg border border-[#E5E2DC] bg-white hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                className="p-1.5 rounded-lg border border-[#E5E2DC] bg-white hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[32px] border border-[#E5E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#FAF9F5] border-b border-[#E5E2DC] flex items-center justify-between">
              <div>
                <h3 className="heading-editorial text-2xl text-[#1A1A1A]">
                  {isAdmin ? 'Export Analytics Data' : 'Export My Data'}
                </h3>
                <p className="text-xs text-[#706F6C] mt-0.5">
                  Choose a format to download your CRM records and reports.
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

            {/* Modal Body: Grid of Options */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <span className="text-[10px] font-mono font-bold text-[#2D3A2D] bg-[#2D3A2D]/10 px-2 py-0.5 rounded">
                          .{opt.format.toLowerCase()}
                        </span>
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
                        {opt.id === 'copy_json' ? 'Copy Data' : 'Download File'}
                      </span>
                      <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F5] border-t border-[#E5E2DC] flex justify-end items-center">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="py-2 px-5 rounded-xl border border-[#E5E2DC] bg-white text-xs font-bold text-[#1A1A1A] hover:bg-[#FAF9F5] transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D3A2D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
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
        message="Are you sure you want to clear all activity logs? This will delete the recorded history."
        confirmText="Clear History"
        isDestructive={true}
      />

    </div>
  );
};

export default AnalyticsPage;