import React, { useState, useEffect } from 'react';
import { rnrApi } from '../../services/rnrApi.js';
import { Card, Skeleton, ErrorState, ProgressBar } from '../common/UI.jsx';
import { getStatusColor, getStatusLabel } from '../../utils/format.js';
import { Users } from 'lucide-react';

const STATUS_COLORS_RNR = {
  PAID: 'text-emerald-700',
  PENDING: 'text-amber-700',
  PENDING_PAYMENT: 'text-amber-700',
  COMPLETED: 'text-emerald-700',
  IN_PROGRESS: 'text-blue-700',
  FULL: 'text-red-600',
  PARTIAL: 'text-amber-600',
};

function FamilyBadge({ status }) {
  const colors = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default function RnRTab({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rnrApi.getRnR(projectId);
      setData(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load R&R data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const s = data?.summary;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Families', value: s.totalFamilies, color: 'text-slate-800' },
            { label: 'Rehabilitation', value: s.rehabilitationCompleted, color: 'text-emerald-700', sub: `${Math.round(s.rehabilitationCompleted/s.totalFamilies*100)}%` },
            { label: 'Resettlement', value: s.resettlementCompleted, color: 'text-teal-700', sub: `${Math.round(s.resettlementCompleted/s.totalFamilies*100)}%` },
            { label: 'Pending', value: s.pending, color: 'text-amber-700' },
          ].map(card => (
            <Card key={card.label}>
              <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value?.toLocaleString('en-IN')}</p>
              {card.sub && <p className="text-xs text-slate-400 mt-0.5">{card.sub} complete</p>}
            </Card>
          ))}
        </div>
      )}

      {/* Progress bars */}
      {!loading && s && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">R&R Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Rehabilitation</span>
                <span className="text-xs font-semibold">{s.rehabilitationCompleted} / {s.totalFamilies}</span>
              </div>
              <ProgressBar value={s.rehabilitationCompleted} max={s.totalFamilies} colorClass="bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Resettlement</span>
                <span className="text-xs font-semibold">{s.resettlementCompleted} / {s.totalFamilies}</span>
              </div>
              <ProgressBar value={s.resettlementCompleted} max={s.totalFamilies} colorClass="bg-teal-500" />
            </div>
          </div>
        </Card>
      )}

      {/* Family table */}
      <h3 className="text-sm font-semibold text-slate-700">Affected Families</h3>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Village</th>
                <th className="hidden md:table-cell">Displacement</th>
                <th>Compensation</th>
                <th>Rehabilitation</th>
                <th className="hidden lg:table-cell">Resettlement</th>
                <th className="hidden lg:table-cell">Benefits</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i) => (
                  <tr key={i}><td colSpan={7}><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : data?.families?.map(fam => (
                <tr key={fam.id}>
                  <td>
                    <p className="font-medium text-sm text-slate-800">{fam.headName}</p>
                    <p className="text-xs text-slate-400">{fam.id}</p>
                  </td>
                  <td>{fam.village}</td>
                  <td className="hidden md:table-cell">
                    <span className={`text-xs font-medium ${fam.displacement === 'FULL' ? 'text-red-600' : 'text-amber-600'}`}>
                      {fam.displacement}
                    </span>
                  </td>
                  <td><FamilyBadge status={fam.compensationStatus} /></td>
                  <td><FamilyBadge status={fam.rehabilitationStatus} /></td>
                  <td className="hidden lg:table-cell"><FamilyBadge status={fam.resettlementStatus} /></td>
                  <td className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {fam.benefits?.map(b => (
                        <span key={b} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{b}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
