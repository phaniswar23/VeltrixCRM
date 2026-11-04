import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Sparkles,
  GripVertical,
  ArrowRight,
  Briefcase,
  Calendar,
} from 'lucide-react';

const ReassignTaskModal = ({
  isOpen,
  onClose,
  staffMember,
  staffList = [],
  onReassigned,
}) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverRepId, setDragOverRepId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Available destination reps (excluding the source staff member)
  const availableReps = staffList.filter((s) => s._id !== staffMember?._id);

  useEffect(() => {
    if (isOpen && staffMember?._id) {
      setError('');
      setSuccessMsg('');
      fetchStaffTasks();
    }
  }, [isOpen, staffMember]);

  const fetchStaffTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.get('/tasks', {
        params: { staff_id: staffMember._id },
      });
      const allTasks = res.data?.tasks || [];
      // Prefer pending or in_progress tasks
      const activeTasks = allTasks.filter((t) => t.status !== 'completed');
      setTasks(activeTasks.length > 0 ? activeTasks : allTasks);
    } catch (err) {
      console.error('Failed to load tasks for reassignment:', err);
      setError('Could not load tasks for this staff member.');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleTransferTask = async (taskId, targetRepId) => {
    if (!taskId || !targetRepId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    const targetRep = availableReps.find((r) => r._id === targetRepId);

    try {
      setSubmittingTaskId(taskId);
      setError('');

      // Optimistic local state update
      setTasks((prev) => prev.filter((t) => t._id !== taskId));

      await api.put(`/tasks/${taskId}`, {
        assigned_to: targetRepId,
      });

      setSuccessMsg(
        `Transferred "${taskToMove?.title || 'Task'}" to ${targetRep?.name || 'team member'}!`
      );

      if (onReassigned) {
        onReassigned();
      }
    } catch (err) {
      console.error('Error reassigning task:', err);
      setError(err.response?.data?.message || 'Failed to reassign task.');
      // Revert tasks on error
      fetchStaffTasks();
    } finally {
      setSubmittingTaskId(null);
      setDraggedTaskId(null);
      setDragOverRepId(null);
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnRep = (e, repId) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (taskId && repId) {
      handleTransferTask(taskId, repId);
    }
  };

  if (!isOpen || !staffMember) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[28px] border border-[#E5E2DC] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-2xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="heading-editorial text-lg text-[#1A1A1A]">
                Workload Rebalance Queue
              </h3>
              <p className="text-xs text-[#706F6C] mt-0.5">
                Drag or click to transfer deliverables from{' '}
                <span className="font-bold text-[#1A1A1A]">{staffMember.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E5E2DC] flex items-center justify-center text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#F5F3EF] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Current Source Staff Status Banner */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-900 font-semibold">
                {staffMember.name} currently holds {tasks.length} active tasks
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase">
              {tasks.length >= 3 ? 'Overloaded' : 'Active Load'}
            </span>
          </div>

          {/* Interactive Split View: Tasks Queue on Left, Target Rep Drop Zones on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Draggable Tasks from Overloaded Rep */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#706F6C] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#2D3A2D]" />
                  <span>Tasks Queue ({tasks.length})</span>
                </span>
                <span className="text-[10px] text-[#706F6C]/70 lowercase font-normal">
                  drag or use transfer button
                </span>
              </label>

              {loadingTasks ? (
                <div className="p-6 text-center text-xs text-[#706F6C] bg-[#FAF9F5] rounded-2xl border border-[#E5E2DC]">
                  Loading deliverables...
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-800 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold">Queue Balanced!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    All tasks have been redistributed evenly.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={`p-3 rounded-2xl border bg-white shadow-2xs hover:shadow-xs transition cursor-grab active:cursor-grabbing border-[#E5E2DC] hover:border-[#2D3A2D] space-y-2 ${
                        draggedTaskId === task._id ? 'opacity-40 border-dashed border-[#2D3A2D]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-[#706F6C] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-[#1A1A1A] text-xs truncate">
                              {task.title}
                            </h4>
                            {task.customer_id && (
                              <p className="text-[10px] text-[#706F6C] truncate mt-0.5">
                                Client: {task.customer_id.name || 'Account'}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            task.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* 1-Click Quick Transfer Actions directly on task card */}
                      <div className="pt-2 border-t border-[#E5E2DC]/60 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-[#706F6C]">Quick Move:</span>
                        <div className="flex items-center gap-1">
                          {availableReps.slice(0, 2).map((rep) => (
                            <button
                              key={rep._id}
                              type="button"
                              disabled={submittingTaskId === task._id}
                              onClick={() => handleTransferTask(task._id, rep._id)}
                              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#2D3A2D] text-[#1A1A1A] hover:text-white border border-[#E5E2DC] text-[10px] font-bold transition shadow-2xs disabled:opacity-50"
                              title={`Transfer to ${rep.name}`}
                            >
                              → {rep.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Available Team Member Drop Targets */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#706F6C] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Available Team Reps</span>
                </span>
                <span className="text-[10px] text-[#706F6C]/70 lowercase font-normal">
                  drop target zones
                </span>
              </label>

              {availableReps.length === 0 ? (
                <p className="text-xs text-[#706F6C]">No other staff members available.</p>
              ) : (
                <div className="space-y-2.5">
                  {availableReps.map((rep) => {
                    const repTaskCount = rep.tasks_count ?? rep.tasksCount ?? 0;
                    const isLowest =
                      repTaskCount ===
                      Math.min(
                        ...availableReps.map((r) => r.tasks_count ?? r.tasksCount ?? 0)
                      );
                    const isDragTarget = dragOverRepId === rep._id;

                    return (
                      <div
                        key={rep._id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverRepId(rep._id);
                        }}
                        onDragLeave={() => {
                          if (dragOverRepId === rep._id) setDragOverRepId(null);
                        }}
                        onDrop={(e) => handleDropOnRep(e, rep._id)}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isDragTarget
                            ? 'bg-emerald-50/80 border-emerald-500 border-2 border-dashed shadow-md scale-[1.01]'
                            : 'bg-[#FAF9F5] border-[#E5E2DC] hover:border-[#2D3A2D]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {rep.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#1A1A1A] text-xs truncate">
                                {rep.name}
                              </p>
                              <p className="text-[10px] text-[#706F6C] truncate">
                                {rep.email}
                              </p>
                            </div>
                          </div>

                          {isLowest && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold flex items-center gap-1 shrink-0">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              Open Capacity
                            </span>
                          )}
                        </div>

                        {/* Drop instruction area */}
                        <div
                          className={`mt-1 py-2 px-3 rounded-xl border text-center transition ${
                            isDragTarget
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold text-xs'
                              : 'bg-white border-dashed border-[#E5E2DC] text-[11px] text-[#706F6C]'
                          }`}
                        >
                          {isDragTarget ? (
                            'Drop task here to assign'
                          ) : (
                            <div className="flex items-center justify-between text-xs">
                              <span>Current Load:</span>
                              <span className="font-bold text-[#1A1A1A]">
                                {repTaskCount} active deliverables
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E2DC] bg-[#FAF9F5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-veltrix !py-2 !px-4 text-xs font-bold"
          >
            Done Rebalancing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignTaskModal;
