import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { alertApi } from '../services/alertApi.js';
import { Card, Skeleton, ErrorState, EmptyState } from '../components/common/UI.jsx';
import { formatRelativeTime, ALERT_SEVERITY_DOT } from '../utils/format.js';

const SEVERITY_BG = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-amber-400',
  LOW: 'border-l-blue-400',
};

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertApi.getAlerts();
      setAlerts(res.data.data.alerts || []);
      setUnread(res.data.data.unreadCount || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Alerts</h1>
        <p className="text-sm text-slate-500 mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" description="You have no active alerts at this time." />
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => alert.projectId && navigate(`/projects/${alert.projectId}`)}
              className={`
                w-full text-left bg-white border border-slate-200 border-l-4
                ${SEVERITY_BG[alert.severity] || 'border-l-slate-300'}
                rounded-xl shadow-sm px-5 py-4 hover:shadow-md transition-shadow
                ${!alert.read ? 'bg-slate-50/80' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${ALERT_SEVERITY_DOT[alert.severity] || 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold text-slate-800 ${!alert.read ? 'font-bold' : ''}`}>{alert.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0
                      ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug">{alert.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">{formatRelativeTime(alert.timestamp)}</span>
                    {alert.projectId && (
                      <span className="text-xs text-navy-600 font-medium flex items-center gap-1">
                        View project <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
