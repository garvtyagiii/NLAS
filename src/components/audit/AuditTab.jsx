import React, { useState, useEffect } from 'react';
import { auditApi } from '../../services/auditApi.js';
import { Card, Skeleton, ErrorState, EmptyState } from '../common/UI.jsx';
import { formatDateTime } from '../../utils/format.js';
import { Clock, User, ArrowRight } from 'lucide-react';

const ACTION_LABELS = {
  STATUS_TRANSITION: 'Status Transition',
  COMPENSATION_RECORDED: 'Compensation Recorded',
  DOCUMENT_UPLOADED: 'Document Uploaded',
  OBJECTION_FILED: 'Objection Filed',
  OBJECTION_RESOLVED: 'Objection Resolved',
  RNR_UPDATED: 'R&R Updated',
  PROJECT_CREATED: 'Project Created',
  PROJECT_UPDATED: 'Project Updated',
};

const ACTION_COLORS = {
  STATUS_TRANSITION: 'bg-navy-100 text-navy-700',
  COMPENSATION_RECORDED: 'bg-emerald-100 text-emerald-700',
  DOCUMENT_UPLOADED: 'bg-blue-100 text-blue-700',
  OBJECTION_FILED: 'bg-red-100 text-red-700',
  OBJECTION_RESOLVED: 'bg-teal-100 text-teal-700',
  RNR_UPDATED: 'bg-purple-100 text-purple-700',
  PROJECT_CREATED: 'bg-slate-100 text-slate-700',
  PROJECT_UPDATED: 'bg-slate-100 text-slate-700',
};

function formatValue(val) {
  if (!val) return '—';
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  return String(val);
}

export default function AuditTab({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditApi.getAuditLogs({ projectId });
      setLogs(res.data.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Audit Trail</h3>
        <span className="text-xs text-slate-400">Read-only · {logs.length} entries</span>
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="p-5 space-y-4">
            {Array.from({length:5}).map((_,i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={Clock} title="No audit logs" description="Actions on this project will appear here." />
        ) : (
          <div className="p-5">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-6">
                {logs.map((log, i) => (
                  <div key={log.id} className="relative flex gap-4">
                    {/* Dot */}
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.officer}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDateTime(log.timestamp)}
                        </span>
                      </div>

                      {/* Old → New */}
                      {(log.oldValue || log.newValue) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                          {log.oldValue && (
                            <span className="bg-red-50 border border-red-100 px-2 py-0.5 rounded font-mono">
                              {formatValue(log.oldValue)}
                            </span>
                          )}
                          {log.oldValue && log.newValue && <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />}
                          {log.newValue && (
                            <span className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono">
                              {formatValue(log.newValue)}
                            </span>
                          )}
                        </div>
                      )}

                      {log.comment && (
                        <p className="text-xs text-slate-500 italic">"{log.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
