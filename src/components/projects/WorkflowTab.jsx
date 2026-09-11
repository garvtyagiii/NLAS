import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, ChevronRight } from 'lucide-react';
import { workflowApi } from '../../services/workflowApi.js';
import { Card, Skeleton, ErrorState } from '../common/UI.jsx';
import { Modal } from '../common/Modal.jsx';
import { getStatusLabel, WORKFLOW_STAGES, WORKFLOW_NEXT, WORKFLOW_NEXT_LABEL, formatDateTime } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { can } from '../../utils/permissions.js';

export default function WorkflowTab({ project, onRefresh }) {
  const { user } = useAuth();
  const toast = useToast();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [comment, setComment] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workflowApi.getWorkflow(project.id);
      setWorkflow(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [project.id]);

  const currentStatus = workflow?.currentStatus || project.status;
  const nextStatus = WORKFLOW_NEXT[currentStatus];
  const nextLabel = WORKFLOW_NEXT_LABEL[currentStatus];
  const canTransition = can(user?.role, 'WORKFLOW_TRANSITION') && nextStatus;

  const handleTransition = async () => {
    setTransitioning(true);
    try {
      await workflowApi.transition({ projectId: project.id, nextStatus, comment });
      toast(`Status updated to "${getStatusLabel(nextStatus)}"`, 'success');
      setModalOpen(false);
      setComment('');
      await load();
      onRefresh?.();
    } catch (err) {
      if (err?.code === 'INVALID_WORKFLOW_TRANSITION') {
        toast('This workflow transition is not allowed at this stage.', 'error');
      } else {
        toast(err?.message || 'Transition failed. Please try again.', 'error');
      }
    } finally {
      setTransitioning(false);
    }
  };

  const currentStageIndex = WORKFLOW_STAGES.indexOf(currentStatus);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      {/* Next action button */}
      {canTransition && (
        <Card className="border-navy-200 bg-navy-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-800">Ready for Next Step</p>
              <p className="text-xs text-navy-600 mt-0.5">
                {nextLabel} — moves project to <strong>{getStatusLabel(nextStatus)}</strong>
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary btn shrink-0"
            >
              {nextLabel} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-700 mb-5">Workflow Timeline</h3>
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-0">
              {WORKFLOW_STAGES.map((stage, i) => {
                const isDone = i < currentStageIndex;
                const isCurrent = i === currentStageIndex;
                const isFuture = i > currentStageIndex;
                const transition = workflow?.transitions?.find(t => t.status === stage);

                return (
                  <div key={stage} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    {/* Icon */}
                    <div className={`
                      relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-white
                      ${isCurrent ? 'border-navy-700 shadow-md shadow-navy-100' :
                        isDone ? 'border-emerald-500' : 'border-slate-200'}
                    `}>
                      {isDone
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : isCurrent
                          ? <div className="w-2.5 h-2.5 rounded-full bg-navy-700" />
                          : <Circle className="w-4 h-4 text-slate-300" />
                      }
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pt-1 pb-1 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold ${isCurrent ? 'text-navy-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                          {getStatusLabel(stage)}
                        </p>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-navy-100 text-navy-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                            Current
                          </span>
                        )}
                      </div>
                      {transition && (
                        <div className="mt-1 text-xs text-slate-400 space-y-0.5">
                          <p>{formatDateTime(transition.timestamp)} · {transition.officer}</p>
                          {transition.comment && (
                            <p className="text-slate-500 italic">"{transition.comment}"</p>
                          )}
                        </div>
                      )}
                      {isFuture && !transition && (
                        <p className="text-xs text-slate-300 mt-0.5">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Transition modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setComment(''); }}
        title={nextLabel || 'Workflow Transition'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            This will transition the project from{' '}
            <strong className="text-slate-800">{getStatusLabel(currentStatus)}</strong> to{' '}
            <strong className="text-navy-700">{getStatusLabel(nextStatus)}</strong>.
            This action will be logged in the audit trail.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Comment <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Add a note about this transition..."
              className="form-input resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={() => { setModalOpen(false); setComment(''); }} className="btn-secondary btn">
              Cancel
            </button>
            <button onClick={handleTransition} disabled={transitioning} className="btn-primary btn">
              {transitioning && <Loader2 className="w-4 h-4 animate-spin" />}
              {transitioning ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
