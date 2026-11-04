import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import DealModal from '../components/DealModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  Briefcase,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  FileCheck,
  Building,
  Sparkles,
  ArrowRight,
  Receipt,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  GripVertical,
  AlertTriangle,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'qualified',
    label: 'Qualified Leads',
    prob: '25%',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    dotBg: 'bg-blue-500',
  },
  {
    id: 'proposal',
    label: 'Proposal & Review',
    prob: '65%',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    dotBg: 'bg-amber-500',
  },
  {
    id: 'closed_won',
    label: 'Closed Won',
    prob: '100%',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotBg: 'bg-emerald-500',
  },
  {
    id: 'closed_lost',
    label: 'Closed Lost',
    prob: '0%',
    badgeBg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    dotBg: 'bg-neutral-400',
  },
];

const PipelinePage = () => {
  const { user, isAdmin } = useAuth();
  const { addEventListener } = useRealtime();

  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table'
  const boardScrollRef = useRef(null);

  const [deals, setDeals] = useState([]);
  const [metrics, setMetrics] = useState({
    totalDeals: 0,
    totalPipelineValue: 0,
    weightedForecast: 0,
    wonValue: 0,
    winRate: 0,
  });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Deal modal state
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState('');
  const [generatingDealId, setGeneratingDealId] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [deleteDealTarget, setDeleteDealTarget] = useState(null);

  const handleDeleteDeal = async () => {
    if (!deleteDealTarget) return;
    try {
      await api.delete(`/deals/${deleteDealTarget.id}`);
      fetchDeals();
    } catch (err) {
      console.error('Failed to delete deal:', err);
    } finally {
      setDeleteDealTarget(null);
    }
  };

  // Drag and Drop state
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const dealId = draggedDealId || e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    // Instant optimistic update (0ms lag)
    setDeals((prev) =>
      prev.map((d) => (d._id === dealId ? { ...d, stage: targetStage } : d))
    );
    setDraggedDealId(null);

    try {
      await api.put(`/deals/${dealId}`, { stage: targetStage });
      fetchDeals();
    } catch (err) {
      console.error('Failed to move deal:', err);
      fetchDeals(); // Revert on failure
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data?.staff || []);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStaff) params.assigned_to = selectedStaff;

      const res = await api.get('/deals', { params });
      setDeals(res.data?.deals || []);
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchDeals();
  }, [selectedStaff]);

  // Real-time synchronization
  useEffect(() => {
    const unsub1 = addEventListener('DEAL_CREATED', () => fetchDeals());
    const unsub2 = addEventListener('DEAL_UPDATED', () => fetchDeals());
    const unsub3 = addEventListener('DEAL_DELETED', () => fetchDeals());
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
      unsub3 && unsub3();
    };
  }, [addEventListener]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDeals();
  };

  const scrollBoard = (offset) => {
    if (boardScrollRef.current) {
      boardScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleStageShift = async (deal, direction) => {
    const stageIds = COLUMNS.map((c) => c.id);
    const currentIndex = stageIds.indexOf(deal.stage);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < stageIds.length) {
      const newStage = stageIds[newIndex];
      // Optimistic update
      setDeals((prev) =>
        prev.map((d) => (d._id === deal._id ? { ...d, stage: newStage } : d))
      );
      try {
        await api.put(`/deals/${deal._id}`, { stage: newStage });
        fetchDeals();
      } catch (err) {
        console.error('Failed to move deal:', err);
        fetchDeals();
      }
    }
  };

  const handleDirectStageChange = async (dealId, newStage) => {
    // Instant optimistic update
    setDeals((prev) =>
      prev.map((d) => (d._id === dealId ? { ...d, stage: newStage } : d))
    );
    try {
      await api.put(`/deals/${dealId}`, { stage: newStage });
      fetchDeals();
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchDeals();
    }
  };

  const handleConvertToInvoice = async (dealId) => {
    try {
      setGeneratingDealId(dealId);
      const res = await api.post(`/invoices/from-deal/${dealId}`);
      const inv = res.data?.invoice;
      setCreatedInvoice(inv);
      setInvoiceSuccessMsg(
        `Invoice ${inv?.invoice_number || 'INV-Generated'} was created successfully for ₹${Number(inv?.grand_total || 0).toLocaleString('en-IN')}!`
      );
      fetchDeals();
    } catch (err) {
      console.error('Invoice conversion error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setGeneratingDealId(null);
    }
  };

  // Group deals into 4 spacious stages
  const dealsByStage = useMemo(() => {
    const map = {
      qualified: [],
      proposal: [],
      closed_won: [],
      closed_lost: [],
    };
    deals.forEach((deal) => {
      if (deal.stage === 'lead' || deal.stage === 'qualified') {
        map.qualified.push(deal);
      } else if (deal.stage === 'proposal' || deal.stage === 'negotiation') {
        map.proposal.push(deal);
      } else if (deal.stage === 'closed_won') {
        map.closed_won.push(deal);
      } else if (deal.stage === 'closed_lost') {
        map.closed_lost.push(deal);
      } else {
        map.qualified.push(deal);
      }
    });
    return map;
  }, [deals]);

  const getStageMeta = (stageId) => {
    return COLUMNS.find((c) => c.id === stageId) || COLUMNS[0];
  };

  return (
    <div className="space-y-6 pb-28 w-full max-w-full min-w-0">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1A1A1A] flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-[#2D3A2D] shrink-0" />
            <span>Deals Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#706F6C] mt-0.5">
            See all your customer deals here. Drag cards or click arrows to move them to the next step.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDeal(null);
            setIsDealModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deal</span>
        </button>
      </div>

      {invoiceSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{invoiceSuccessMsg}</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={isAdmin ? '/admin/invoices' : '/staff/invoices'}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Open Invoices Tab
            </Link>
            <button
              onClick={() => setInvoiceSuccessMsg('')}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards: Responsive 4-card grid that fits any laptop/desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E2DC] shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider truncate">
              Total Deal Value
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#1A1A1A] mt-0.5 truncate">
              ₹{Number(metrics.totalPipelineValue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#706F6C] mt-0.5 truncate">{metrics.totalDeals} active deals</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            ₹
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E2DC] shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider truncate">
              Expected Revenue
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#2D3A2D] mt-0.5 truncate">
              ₹{Number(metrics.weightedForecast || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#706F6C] mt-0.5 truncate">Based on win chances</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E2DC] shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider truncate">
              Won Revenue
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-700 mt-0.5 truncate">
              ₹{Number(metrics.wonValue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 font-medium truncate">Closed deals</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E2DC] shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-[#706F6C] uppercase tracking-wider truncate">
              Win Rate
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#1A1A1A] mt-0.5 truncate">
              {metrics.winRate}%
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#706F6C] mt-0.5 truncate">Deals won ratio</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            %
          </div>
        </div>
      </div>

      {/* Filter, View Switcher & Search Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5E2DC] shadow-xs flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[240px]">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#F5F3EF] rounded-xl border border-[#E5E2DC] shrink-0">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#706F6C] hover:text-[#1A1A1A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#706F6C] hover:text-[#1A1A1A]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[160px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#706F6C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deals or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E2DC] focus:border-[#2D3A2D] text-xs outline-none bg-[#FBFBF9]"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DC] text-xs font-semibold outline-none bg-white text-[#1A1A1A] cursor-pointer"
          >
            <option value="">All Deal Owners</option>
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>

          {viewMode === 'board' && (
            <div className="flex items-center gap-1 pl-2 border-l border-[#E5E2DC]">
              <button
                onClick={() => scrollBoard(-280)}
                className="w-8 h-8 rounded-lg border border-[#E5E2DC] hover:bg-[#F5F3EF] flex items-center justify-center text-[#706F6C] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollBoard(280)}
                className="w-8 h-8 rounded-lg border border-[#E5E2DC] hover:bg-[#F5F3EF] flex items-center justify-center text-[#706F6C] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div
            ref={boardScrollRef}
            className="w-full max-w-full overflow-x-auto pb-2 pt-1 scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-stretch min-w-[1040px] xl:min-w-0">
              {COLUMNS.map((col) => {
                const colDeals = dealsByStage[col.id] || [];
                const colTotal = colDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
                const isDragTarget = dragOverCol === col.id;

                // Group & highlight deals missing client assignments
                const unassignedDeals = colDeals.filter((d) => !d.customer_id || !d.customer_id.name);
                const assignedDeals = colDeals.filter((d) => d.customer_id && d.customer_id.name);

                const renderCard = (deal) => {
                  const isDragging = draggedDealId === deal._id;
                  const isUnassigned = !deal.customer_id || !deal.customer_id.name;

                  return (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal._id)}
                      onDragEnd={() => {
                        setDraggedDealId(null);
                        setDragOverCol(null);
                      }}
                      className={`bg-white rounded-xl p-2.5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing group ${
                        isDragging
                          ? 'opacity-40 scale-95 border-dashed border-[#2D3A2D]'
                          : isUnassigned
                          ? 'border-amber-300 bg-amber-50/15 hover:border-amber-400'
                          : 'border-[#E5E2DC] hover:border-[#2D3A2D]/40'
                      }`}
                    >
                      {/* Top Bar: Grip handle + Status tag + Deal Amount + Action Pill */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <GripVertical className="w-3 h-3 text-[#E5E2DC] group-hover:text-[#706F6C] shrink-0 transition-colors" />
                            {isUnassigned ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                Needs Client
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#706F6C] font-mono">
                                #{deal._id.slice(-4).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-black text-[#2D3A2D] whitespace-nowrap font-mono">
                              ₹{Number(deal.amount || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="flex items-center gap-0.5 bg-[#FAF9F5] border border-[#E5E2DC] p-0.5 rounded-lg shadow-3xs">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingDeal(deal);
                                  setIsDealModalOpen(true);
                                }}
                                className="p-0.5 rounded text-[#706F6C] hover:text-[#1A1A1A] hover:bg-white transition"
                                title="Edit Deal"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDealTarget({ id: deal._id, title: deal.title });
                                }}
                                className="p-0.5 rounded text-[#706F6C] hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Deal Title */}
                        <h4
                          onClick={() => {
                            setEditingDeal(deal);
                            setIsDealModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#1A1A1A] hover:text-[#2D3A2D] cursor-pointer line-clamp-1 leading-snug break-words mb-1"
                          title={deal.title}
                        >
                          {deal.title}
                        </h4>

                        {/* Client / Account */}
                        <div className="text-[10px] text-[#706F6C] flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <Building className="w-3 h-3 shrink-0 text-[#706F6C]" />
                            {deal.customer_id?.name ? (
                              <span className="truncate font-semibold text-[#1A1A1A]">
                                {deal.customer_id.name}
                                {deal.customer_id.company ? ` • ${deal.customer_id.company}` : ''}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1 py-0.2 rounded border border-amber-300">
                                  Unassigned Client
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDeal(deal);
                                    setIsDealModalOpen(true);
                                  }}
                                  className="text-[9px] font-bold text-[#2D3A2D] hover:underline"
                                >
                                  Assign →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Probability Bar */}
                        <div className="w-full bg-[#E5E2DC]/60 h-1 rounded-full overflow-hidden mb-1.5">
                          <div
                            className={`h-full transition-all duration-300 ${
                              deal.stage === 'closed_won'
                                ? 'bg-emerald-500'
                                : deal.stage === 'closed_lost'
                                ? 'bg-neutral-400'
                                : 'bg-[#2D3A2D]'
                            }`}
                            style={{ width: `${deal.win_probability || 10}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Card Controls & Footer */}
                      <div className="pt-1.5 border-t border-[#E5E2DC]/60 flex flex-col gap-1.5">
                        {/* Stage Selector */}
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            disabled={deal.stage === COLUMNS[0].id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageShift(deal, -1);
                            }}
                            className="w-5 h-5 rounded border border-[#E5E2DC] hover:border-[#2D3A2D] hover:bg-[#F5F3EF] disabled:opacity-20 flex items-center justify-center text-[#1A1A1A] transition cursor-pointer shrink-0 disabled:cursor-not-allowed"
                            title="Move to previous stage"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>

                          <select
                            value={deal.stage}
                            onChange={(e) => handleDirectStageChange(deal._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-[10px] font-bold rounded border border-[#E5E2DC] bg-[#FAF9F5] text-[#2D3A2D] py-0.5 px-1 outline-none hover:border-[#2D3A2D] transition cursor-pointer text-center"
                            title="Pick stage"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} ({c.prob})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={deal.stage === COLUMNS[COLUMNS.length - 1].id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageShift(deal, 1);
                            }}
                            className="w-5 h-5 rounded border border-[#E5E2DC] hover:border-[#2D3A2D] hover:bg-[#F5F3EF] disabled:opacity-20 flex items-center justify-center text-[#1A1A1A] transition cursor-pointer shrink-0 disabled:cursor-not-allowed"
                            title="Move to next stage"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Invoice Pill if linked OR if Closed Won */}
                        {deal.invoice ? (
                          <Link
                            to={isAdmin ? '/admin/invoices' : '/staff/invoices'}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between w-full py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-[9px] font-bold transition shadow-3xs"
                            title="View linked Tax Invoice in Billing"
                          >
                            <span className="flex items-center gap-1 font-mono">
                              <Receipt className="w-2.5 h-2.5 text-emerald-700" />
                              #{deal.invoice.invoice_number}
                            </span>
                            <span className="uppercase text-[8px] px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-extrabold">
                              {deal.invoice.status} • ₹{Number(deal.invoice.grand_total || 0).toLocaleString('en-IN')}
                            </span>
                          </Link>
                        ) : deal.stage === 'closed_won' ? (
                          <button
                            type="button"
                            disabled={generatingDealId === deal._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvertToInvoice(deal._id);
                            }}
                            title="Generate GST Invoice"
                            className="flex items-center justify-between w-full py-1 px-2 rounded-md bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-[9px] font-bold transition shadow-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-1">
                              <Receipt className="w-2.5 h-2.5" />
                              <span>{generatingDealId === deal._id ? 'Generating...' : '+ Generate Invoice'}</span>
                            </span>
                            <span className="text-[8px] bg-white/20 px-1 py-0.2 rounded uppercase font-bold">Won</span>
                          </button>
                        ) : null}

                        {/* Footer: Owner & Win Probability */}
                        <div className="flex items-center justify-between text-[10px] text-[#706F6C]">
                          <span className="font-medium text-[9px]">{deal.win_probability}% win</span>
                          <div className="flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-[#706F6C]" />
                            <span className="truncate max-w-[85px] font-semibold text-[#1A1A1A] text-[9px]">
                              {deal.assigned_to?.name || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={(e) => handleDragLeave(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`rounded-2xl border p-3 flex flex-col shadow-xs transition-all duration-200 h-[calc(100vh-270px)] min-h-[460px] ${
                      isDragTarget
                        ? 'bg-emerald-50/70 border-emerald-500 border-2 border-dashed shadow-md scale-[1.01]'
                        : 'bg-[#F8F8F6] border-[#E5E2DC]'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-1.5 px-1 shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dotBg}`}></span>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] truncate">
                          {col.label}
                        </h3>
                        <span className="text-[10px] font-bold text-[#706F6C] px-1.5 py-0.2 rounded-md bg-white border border-[#E5E2DC] shrink-0">
                          {col.prob}
                        </span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-white border border-[#E5E2DC] text-[#1A1A1A] font-bold text-[10px] flex items-center justify-center shrink-0 ml-1">
                        {colDeals.length}
                      </span>
                    </div>

                    {/* Subtotal & Unassigned Counter */}
                    <div className="px-1 mb-2 text-[10px] font-bold text-[#706F6C] flex items-center justify-between pb-1.5 border-b border-[#E5E2DC]/80 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span>Value:</span>
                        <span className="text-[#1A1A1A] font-mono font-bold">₹{Number(colTotal || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {unassignedDeals.length > 0 && (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-full">
                          {unassignedDeals.length} unassigned
                        </span>
                      )}
                    </div>

                    {/* Cards List with INDEPENDENT SCROLL */}
                    <div className="space-y-2 overflow-y-auto flex-1 pr-1 pb-1">
                      {/* Render unassigned deals at the top of the column */}
                      {unassignedDeals.map((deal) => renderCard(deal))}

                      {/* Divider between unassigned queue and active deals */}
                      {unassignedDeals.length > 0 && assignedDeals.length > 0 && (
                        <div className="flex items-center gap-2 py-0.5">
                          <div className="h-px bg-[#E5E2DC] flex-1"></div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#706F6C]">
                            Active Deals ({assignedDeals.length})
                          </span>
                          <div className="h-px bg-[#E5E2DC] flex-1"></div>
                        </div>
                      )}

                      {/* Render verified deals */}
                      {assignedDeals.map((deal) => renderCard(deal))}

                      {colDeals.length === 0 && (
                        <div
                          className={`h-28 rounded-xl border border-dashed flex items-center justify-center text-xs text-[#706F6C] transition-all ${
                            isDragTarget
                              ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800 font-bold'
                              : 'border-[#E5E2DC] bg-white/40'
                          }`}
                        >
                          {isDragTarget ? 'Drop Deal Here' : `No deals in ${col.label}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPACT FULL-WIDTH TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#706F6C] uppercase tracking-wider">
                  <th className="px-6 py-3.5">Deal Opportunity</th>
                  <th className="px-6 py-3.5">Customer & Company</th>
                  <th className="px-6 py-3.5">Value (₹)</th>
                  <th className="px-6 py-3.5">Pipeline Stage</th>
                  <th className="px-6 py-3.5">Win Probability</th>
                  <th className="px-6 py-3.5">Deal Owner</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC]/60">
                {deals.map((deal) => {
                  const meta = getStageMeta(deal.stage);
                  return (
                    <tr key={deal._id} className="hover:bg-[#FBFBF9] transition-colors">
                      <td className="px-6 py-3.5 font-bold text-[#1A1A1A]">
                        <span
                          onClick={() => {
                            setEditingDeal(deal);
                            setIsDealModalOpen(true);
                          }}
                          className="hover:text-[#2D3A2D] cursor-pointer"
                        >
                          {deal.title}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-[#1A1A1A]">{deal.customer_id?.name || 'N/A'}</p>
                        {deal.customer_id?.company && (
                          <p className="text-[10px] text-[#706F6C]">{deal.customer_id.company}</p>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-[#1A1A1A]">
                        ₹{Number(deal.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5">
                        <select
                          value={deal.stage}
                          onChange={(e) => handleDirectStageChange(deal._id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border outline-none bg-white cursor-pointer ${meta.badgeBg}`}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label} ({c.prob})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-[#1A1A1A]">
                        {deal.win_probability}%
                      </td>
                      <td className="px-6 py-3.5 text-[#706F6C]">
                        {deal.assigned_to?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2">
                        {deal.invoice ? (
                          <Link
                            to={isAdmin ? '/admin/invoices' : '/staff/invoices'}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold transition"
                            title={`Tax Invoice: ${deal.invoice.invoice_number} (${deal.invoice.status})`}
                          >
                            <Receipt className="w-3 h-3 text-emerald-600" />
                            <span>#{deal.invoice.invoice_number}</span>
                          </Link>
                        ) : deal.stage === 'closed_won' ? (
                          <button
                            onClick={() => handleConvertToInvoice(deal._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                          >
                            Invoice
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            setEditingDeal(deal);
                            setIsDealModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-[#706F6C] hover:text-[#1A1A1A] hover:bg-neutral-100 transition"
                          title="Edit Deal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteDealTarget({ id: deal._id, title: deal.title })}
                          className="p-1 rounded-lg text-[#706F6C] hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => {
          setIsDealModalOpen(false);
          setEditingDeal(null);
        }}
        onSave={fetchDeals}
        deal={editingDeal}
      />

      {/* Delete Deal Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteDealTarget)}
        onClose={() => setDeleteDealTarget(null)}
        onConfirm={handleDeleteDeal}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deleteDealTarget?.title}"? All associated pipeline values, revenue forecasts, and stage progress will be permanently deleted.`}
        confirmText="Delete Deal"
        isDestructive={true}
      />
    </div>
  );
};

export default PipelinePage;
