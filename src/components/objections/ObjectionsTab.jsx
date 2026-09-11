import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { objectionApi } from '../../services/objectionApi.js';
import { Card, Skeleton, ErrorState, EmptyState } from '../common/UI.jsx';
import { Modal } from '../common/Modal.jsx';
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { can } from '../../utils/permissions.js';

function ResolveModal({ isOpen, onClose, objection, onResolved }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [noteError, setNoteError] = useState('');

  const handleSubmit = async () => {
    if (!note.trim()) { setNoteError('Resolution note is required.'); return; }
    setSubmitting(true);
    try {
      await objectionApi.resolveObjection(objection.id, { status: 'RESOLVED', resolutionNote: note });
      toast('Objection resolved successfully', 'success');
      onResolved();
    } catch (err) {
      toast(err?.message || 'Failed to resolve objection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Objection" size="sm">
      <div className="space-y-4">
        {objection && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-slate-700 mb-1">{objection.raisedBy}</p>
            <p className="text-slate-600 text-xs">{objection.reason}</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Resolution Note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setNoteError(''); }}
            rows={4}
            placeholder="Describe how this objection was resolved..."
            className={`form-input resize-none ${noteError ? 'error' : ''}`}
          />
          {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
          <button onClick={onClose} className="btn-secondary btn">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Resolving...' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ObjectionsTab({ projectId, onRefresh }) {
  const { user } = useAuth();
  const [objections, setObjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await objectionApi.getObjections({ projectId });
      setObjections(res.data.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load objections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const openCount = objections.filter(o => o.status === 'OPEN').length;

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Objections</h3>
        {openCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {openCount} open
          </span>
        )}
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : objections.length === 0 ? (
          <EmptyState icon={CheckCircle} title="No objections filed" description="No objections have been raised for this project." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Parcel</th>
                  <th>Raised By</th>
                  <th>Reason</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th>Status</th>
                  {can(user?.role, 'RESOLVE_OBJECTION') && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {objections.map(obj => (
                  <tr key={obj.id}>
                    <td className="font-mono text-xs text-slate-500">{obj.id}</td>
                    <td className="text-xs font-medium">{obj.khasraNo}</td>
                    <td className="text-sm">{obj.raisedBy}</td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">{obj.reason}</td>
                    <td className="hidden sm:table-cell text-xs text-slate-500">{formatDate(obj.date)}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${obj.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {obj.status}
                      </span>
                    </td>
                    {can(user?.role, 'RESOLVE_OBJECTION') && (
                      <td>
                        {obj.status === 'OPEN' ? (
                          <button
                            onClick={() => setResolveTarget(obj)}
                            className="btn btn-ghost btn-sm text-navy-600"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 px-2">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ResolveModal
        isOpen={!!resolveTarget}
        objection={resolveTarget}
        onClose={() => setResolveTarget(null)}
        onResolved={() => { setResolveTarget(null); load(); onRefresh?.(); }}
      />
    </div>
  );
}
