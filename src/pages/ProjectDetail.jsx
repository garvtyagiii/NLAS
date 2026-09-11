import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, AlertCircle, Layers } from 'lucide-react';
import { projectApi } from '../services/projectApi.js';
import { Card, Badge, Skeleton, ErrorState, ProgressBar, StatCard } from '../components/common/UI.jsx';
import { getStatusLabel, getStatusColor, formatArea, formatDate, formatCurrencyCompact } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

// Tab components
import OverviewTab from '../components/projects/OverviewTab.jsx';
import WorkflowTab from '../components/projects/WorkflowTab.jsx';
import GISTab from '../components/gis/GISTab.jsx';
import CompensationTab from '../components/compensation/CompensationTab.jsx';
import RnRTab from '../components/rnr/RnRTab.jsx';
import DocumentsTab from '../components/documents/DocumentsTab.jsx';
import ObjectionsTab from '../components/objections/ObjectionsTab.jsx';
import AuditTab from '../components/audit/AuditTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'gis', label: 'GIS Map' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'rnr', label: 'R&R' },
  { id: 'documents', label: 'Documents' },
  { id: 'objections', label: 'Objections' },
  { id: 'audit', label: 'Audit' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.getProject(id);
      setProject(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProject(); }, [loadProject]);

  if (error) return (
    <div className="max-w-screen-xl mx-auto">
      <button onClick={() => navigate('/projects')} className="btn btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>
      <ErrorState message={error} onRetry={loadProject} />
    </div>
  );

  return (
    <div className="space-y-4 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/projects')} className="btn btn-ghost btn-sm text-slate-500">
        <ArrowLeft className="w-4 h-4" /> Projects
      </button>

      {/* Project Header */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ) : project && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-400 font-mono text-xs">{project.code}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{project.type}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" /> {project.district}, {project.state}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" /> Target: {formatDate(project.targetDate)}
                  </span>
                </div>
              </div>
              {/* Progress */}
              <div className="sm:w-48 shrink-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">Overall Progress</span>
                  <span className="text-xs font-bold text-slate-700">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} max={100} className="h-2.5" />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
              {[
                { label: 'Required Area', value: formatArea(project.requiredArea) },
                { label: 'Acquired Area', value: formatArea(project.acquiredArea) },
                { label: 'Total Parcels', value: project.parcelCount?.toLocaleString('en-IN') || '—' },
                { label: 'Affected Families', value: project.affectedFamilies?.toLocaleString('en-IN') || '—' },
                { label: 'Open Objections', value: project.openObjections || 0, warn: project.openObjections > 0 },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className={`text-lg font-bold ${stat.warn ? 'text-red-600' : 'text-slate-800'}`}>{stat.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl -mb-1 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              {tab.id === 'objections' && project?.openObjections > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full">
                  {project.openObjections}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {loading ? (
          <Card><Skeleton className="h-48 w-full" /></Card>
        ) : project && (
          <>
            {activeTab === 'overview' && <OverviewTab project={project} onRefresh={loadProject} />}
            {activeTab === 'workflow' && <WorkflowTab project={project} onRefresh={loadProject} />}
            {activeTab === 'gis' && <GISTab projectId={project.id} />}
            {activeTab === 'compensation' && <CompensationTab projectId={project.id} onRefresh={loadProject} />}
            {activeTab === 'rnr' && <RnRTab projectId={project.id} />}
            {activeTab === 'documents' && <DocumentsTab projectId={project.id} />}
            {activeTab === 'objections' && <ObjectionsTab projectId={project.id} onRefresh={loadProject} />}
            {activeTab === 'audit' && <AuditTab projectId={project.id} />}
          </>
        )}
      </div>
    </div>
  );
}
