import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  FolderOpen, Map, Users, TrendingUp, IndianRupee, AlertTriangle,
  ArrowRight, Clock, ChevronRight,
} from 'lucide-react';
import { dashboardApi } from '../services/dashboardApi.js';
import { StatCard, Card, Badge, Skeleton, SkeletonCard, ErrorState, SectionHeader, ProgressBar } from '../components/common/UI.jsx';
import { formatCurrencyCompact, formatArea, formatPercent, getStatusColor, getStatusLabel, formatRelativeTime, ALERT_SEVERITY_DOT } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const CHART_COLORS = ['#1d24d9', '#3b4ff7', '#6078fb', '#93aafd', '#c0d1fe', '#0d9488', '#f59e0b', '#ef4444'];
const COMP_COLORS = { assessed: '#1d24d9', approved: '#6078fb', disbursed: '#0d9488', pending: '#f59e0b' };

function AlertDot({ severity }) {
  return <span className={`w-2 h-2 rounded-full shrink-0 ${ALERT_SEVERITY_DOT[severity] || 'bg-slate-300'}`} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const s = data?.summary;

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {user?.role === 'CENTRAL_OFFICER' ? 'National Overview' :
           user?.role === 'STATE_OFFICER' ? `${user.state} Dashboard` :
           'Project Dashboard'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Land acquisition status across all active projects</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({length:8}).map((_,i) => <SkeletonCard key={i} />) : <>
          <StatCard label="Total Projects" value={s?.totalProjects ?? '—'} icon={FolderOpen} />
          <StatCard label="Land Proposed" value={s ? formatArea(s.landProposed) : '—'} sub="total area" icon={Map} />
          <StatCard label="Land Acquired" value={s ? formatArea(s.landAcquired) : '—'} sub={`${s?.acquisitionPercent?.toFixed(1)}% complete`} icon={TrendingUp} colorClass="text-emerald-600" />
          <StatCard label="Acquisition %" value={s ? `${s.acquisitionPercent?.toFixed(1)}%` : '—'} icon={TrendingUp} colorClass="text-navy-700" />
          <StatCard label="Compensation Assessed" value={s ? formatCurrencyCompact(s.compensationAssessed) : '—'} icon={IndianRupee} />
          <StatCard label="Compensation Disbursed" value={s ? formatCurrencyCompact(s.compensationDisbursed) : '—'} colorClass="text-emerald-600" icon={IndianRupee} />
          <StatCard label="Affected Families" value={s?.affectedFamilies?.toLocaleString('en-IN') ?? '—'} icon={Users} />
          <StatCard label="R&R Progress" value={s ? `${s.rnrProgress?.toFixed(1)}%` : '—'} icon={Users} colorClass="text-teal-600" />
        </>}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* State-wise acquisition */}
        <Card>
          <SectionHeader title="State-wise Acquisition (ha)" />
          {loading ? <Skeleton className="h-52 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.stateWiseAcquisition} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="state" tick={{ fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v, n) => [v.toLocaleString('en-IN') + ' ha', n === 'acquired' ? 'Acquired' : 'Proposed']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="proposed" fill="#c0d1fe" radius={[2,2,0,0]} name="Proposed" />
                <Bar dataKey="acquired" fill="#1d24d9" radius={[2,2,0,0]} name="Acquired" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Project progress by status */}
        <Card>
          <SectionHeader title="Projects by Workflow Stage" />
          {loading ? <Skeleton className="h-52 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.projectProgress} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={60} tickFormatter={v => getStatusLabel(v)} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" radius={[0,2,2,0]} name="Projects">
                  {data?.projectProgress?.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Compensation breakdown */}
        <Card>
          <SectionHeader title="Compensation Overview" />
          {loading ? <Skeleton className="h-52 w-full" /> : (() => {
            const cs = data?.compensationSummary;
            if (!cs) return null;
            const chartData = [
              { name: 'Assessed', value: cs.assessed },
              { name: 'Approved', value: cs.approved },
              { name: 'Disbursed', value: cs.disbursed },
              { name: 'Pending', value: cs.pending },
            ];
            return (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={Object.values(COMP_COLORS)[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrencyCompact(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {chartData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: Object.values(COMP_COLORS)[i] }} />
                        <span className="text-xs text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{formatCurrencyCompact(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </Card>

        {/* R&R Summary */}
        <Card>
          <SectionHeader title="R&R Progress" />
          {loading ? <Skeleton className="h-52 w-full" /> : (() => {
            const rs = data?.rnrSummary;
            if (!rs) return null;
            return (
              <div className="space-y-4">
                {[
                  { label: 'Total Families', value: rs.total, pct: 100, color: 'bg-slate-200' },
                  { label: 'Rehabilitation', value: rs.rehabilitation, pct: Math.round(rs.rehabilitation / rs.total * 100), color: 'bg-navy-600' },
                  { label: 'Resettlement', value: rs.resettlement, pct: Math.round(rs.resettlement / rs.total * 100), color: 'bg-teal-500' },
                  { label: 'Pending', value: rs.pending, pct: Math.round(rs.pending / rs.total * 100), color: 'bg-amber-400' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-600">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{item.value.toLocaleString('en-IN')} <span className="text-slate-400 font-normal">({item.pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      </div>

      {/* Bottom row — critical projects + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Critical Projects */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Critical & High-Risk Projects" action={
              <button onClick={() => navigate('/projects')} className="text-xs text-navy-600 hover:text-navy-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            } />
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? Array.from({length:3}).map((_,i) => (
              <div key={i} className="px-5 py-4"><Skeleton className="h-8 w-full" /></div>
            )) : data?.criticalProjects?.map(proj => (
              <button
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-800 truncate">{proj.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${proj.risk === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {proj.risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(proj.status)}`}>
                      {getStatusLabel(proj.status)}
                    </span>
                    <span className="text-xs text-slate-400">{proj.state}</span>
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {proj.daysDelayed}d delayed
                    </span>
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-xs font-semibold text-slate-700">{proj.progress}%</span>
                  </div>
                  <ProgressBar value={proj.progress} max={100} />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Recent Alerts" action={
              <button onClick={() => navigate('/alerts')} className="text-xs text-navy-600 hover:text-navy-700 font-medium">
                All alerts
              </button>
            } />
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? Array.from({length:3}).map((_,i) => (
              <div key={i} className="px-5 py-4"><Skeleton className="h-10 w-full" /></div>
            )) : data?.recentAlerts?.map(alert => (
              <button
                key={alert.id}
                onClick={() => navigate(alert.projectId ? `/projects/${alert.projectId}` : '/alerts')}
                className="w-full px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <AlertDot severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{alert.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(alert.timestamp)}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Delayed Projects */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100">
          <SectionHeader title="Delayed Projects" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Days Delayed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i}><td colSpan={4}><Skeleton className="h-8 w-full" /></td></tr>
              )) : data?.delayedProjects?.map(proj => (
                <tr key={proj.id}>
                  <td className="font-medium text-slate-800">{proj.name}</td>
                  <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(proj.status)}`}>{getStatusLabel(proj.status)}</span></td>
                  <td><span className="text-red-600 font-semibold">{proj.daysDelayed}d</span></td>
                  <td>
                    <button onClick={() => navigate(`/projects/${proj.id}`)} className="text-navy-600 hover:text-navy-700 text-xs font-medium">
                      View →
                    </button>
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
