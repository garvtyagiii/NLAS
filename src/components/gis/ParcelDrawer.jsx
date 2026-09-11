import React, { useState, useEffect } from 'react';
import { Drawer } from '../common/Modal.jsx';
import { Skeleton, Badge, ProgressBar } from '../common/UI.jsx';
import { parcelApi } from '../../services/parcelApi.js';
import { getStatusLabel, getStatusColor, formatArea, formatCurrency, formatCurrencyCompact } from '../../utils/format.js';
import { MapPin, Users, IndianRupee, FileText, AlertCircle } from 'lucide-react';

export default function ParcelDrawer({ isOpen, onClose, parcelId }) {
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!isOpen || !parcelId) return;
    setLoading(true);
    setError(null);
    setActiveSection('overview');
    parcelApi.getParcel(parcelId)
      .then(res => setParcel(res.data.data))
      .catch(err => setError(err?.message || 'Failed to load parcel.'))
      .finally(() => setLoading(false));
  }, [isOpen, parcelId]);

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'objections', label: 'Objections' },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={loading ? 'Loading...' : `Parcel ${parcel?.khasraNo || parcelId || ''}`} width="w-[420px]">
      {loading ? (
        <div className="p-5 space-y-3">
          {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : error ? (
        <div className="p-5 text-center text-sm text-red-500">{error}</div>
      ) : parcel ? (
        <>
          {/* Status banner */}
          <div className={`px-5 py-3 ${getStatusColor(parcel.status)} border-b border-opacity-20`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{getStatusLabel(parcel.status)}</span>
              <span className="text-xs opacity-75">{parcel.id}</span>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`tab-btn text-xs ${activeSection === s.id ? 'active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeSection === 'overview' && (
              <div className="space-y-4">
                <dl className="space-y-3">
                  {[
                    { label: 'Khasra / Survey No.', value: parcel.khasraNo },
                    { label: 'Village', value: parcel.village },
                    { label: 'District', value: parcel.district },
                    { label: 'State', value: parcel.state },
                    { label: 'Land Type', value: parcel.landType || 'Agricultural' },
                    { label: 'Area', value: formatArea(parcel.area) },
                    { label: 'Owners', value: parcel.ownersCount },
                    { label: 'Affected Families', value: parcel.affectedFamilies },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <dt className="text-xs text-slate-500">{label}</dt>
                      <dd className="text-xs font-semibold text-slate-800">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>

                {parcel.owners && parcel.owners.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Owners</p>
                    <div className="space-y-1.5">
                      {parcel.owners.map(owner => (
                        <div key={owner.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{owner.name}</span>
                          <span className="text-slate-400">{Math.round(owner.share * 100)}% share</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'compensation' && parcel.compensation && (
              <div className="space-y-4">
                <div className={`p-3 rounded-lg text-xs font-semibold ${getStatusColor(parcel.compensation.status)}`}>
                  Payment Status: {getStatusLabel(parcel.compensation.status)}
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Assessed', value: parcel.compensation.assessed, color: 'text-slate-700' },
                    { label: 'Approved', value: parcel.compensation.approved, color: 'text-blue-700' },
                    { label: 'Disbursed', value: parcel.compensation.disbursed, color: 'text-emerald-700' },
                    { label: 'Pending', value: parcel.compensation.pending ?? (parcel.compensation.assessed - parcel.compensation.disbursed), color: 'text-amber-700' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className={`text-xs font-bold ${color}`}>{formatCurrencyCompact(value)}</span>
                    </div>
                  ))}
                </div>
                {parcel.compensation.assessed > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-500">Disbursement progress</span>
                      <span className="text-xs font-semibold">{Math.round(parcel.compensation.disbursed / parcel.compensation.assessed * 100)}%</span>
                    </div>
                    <ProgressBar value={parcel.compensation.disbursed} max={parcel.compensation.assessed} colorClass="bg-emerald-500" />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'objections' && (
              <div>
                {parcel.objections?.length > 0 ? (
                  <div className="space-y-3">
                    {parcel.objections.map(obj => (
                      <div key={obj.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-slate-700">{obj.raisedBy}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(obj.status)}`}>
                            {obj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{obj.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{obj.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No objections filed</p>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
