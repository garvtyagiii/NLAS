import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { projectApi } from '../services/projectApi.js';
import { Card, Badge, Skeleton, SkeletonTable, EmptyState, ErrorState, ProgressBar } from '../components/common/UI.jsx';
import { getStatusLabel, getStatusColor, formatArea, formatDate } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { can } from '../utils/permissions.js';
import ProjectFormModal from '../components/projects/ProjectFormModal.jsx';

const PROJECT_TYPES = ['HIGHWAY', 'RAILWAY', 'INDUSTRIAL', 'POWER', 'PORT', 'IRRIGATION', 'URBAN', 'OTHER'];
const STATES = ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Bihar', 'Haryana', 'Madhya Pradesh'];
const DISTRICTS_BY_STATE = {
  'Uttar Pradesh': ['Ghaziabad', 'Agra', 'Hapur', 'Meerut'],
  Maharashtra: ['Mumbai', 'Pune', 'Nashik'],
  Rajasthan: ['Jaisalmer', 'Jaipur', 'Udaipur'],
  Karnataka: ['Bengaluru Urban', 'Mysuru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
  Gujarat: ['Ahmedabad', 'Surat'],
  Bihar: ['Patna', 'Gaya'],
  Haryana: ['Gurugram', 'Faridabad'],
  'Madhya Pradesh': ['Bhopal', 'Indore'],
};
const STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'APPROVED', 'NOTIFICATION', 'AWARD', 'COMPENSATION', 'POSSESSION', 'R&R', 'CLOSED'];

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const districtOptions = state ? DISTRICTS_BY_STATE[state] || [] : [];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.getProjects({ search, state, district, status, type, page, limit: 20 });
      setProjects(res.data.data.projects);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [search, state, district, status, type, page]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleProjectSaved = (newProject) => {
    setShowCreateModal(false);
    setEditProject(null);
    if (newProject?.id) navigate(`/projects/${newProject.id}`);
    else load();
  };

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? '—' : `${pagination.total} project${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        {can(user?.role, 'CREATE_PROJECT') && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary btn shrink-0">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8"
            />
          </div>
          <select value={state} onChange={e => { setState(e.target.value); setDistrict(''); setPage(1); }} className="form-input">
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={district} onChange={e => { setDistrict(e.target.value); setPage(1); }} className="form-input" disabled={!state}>
            <option value="">All Districts</option>
            {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-input">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="form-input">
            <option value="">All Types</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {error ? (
          <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th className="hidden md:table-cell">Type</th>
                    <th>State / District</th>
                    <th>Status</th>
                    <th className="hidden lg:table-cell">Progress</th>
                    <th className="hidden lg:table-cell">Required Area</th>
                    <th className="hidden xl:table-cell">Target Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j}><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <p className="text-sm text-slate-400">No projects found matching the filters.</p>
                      </td>
                    </tr>
                  ) : projects.map(proj => (
                    <tr key={proj.id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{proj.name}</p>
                          <p className="text-xs text-slate-400">{proj.code}</p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{proj.type}</span>
                      </td>
                      <td>
                        <p className="text-sm text-slate-700">{proj.state}</p>
                        <p className="text-xs text-slate-400">{proj.district}</p>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(proj.status)}`}>
                          {getStatusLabel(proj.status)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell w-32">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={proj.progress} max={100} className="flex-1" />
                          <span className="text-xs text-slate-500 shrink-0">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">{formatArea(proj.requiredArea)}</td>
                      <td className="hidden xl:table-cell text-slate-500 text-xs">{formatDate(proj.targetDate)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/projects/${proj.id}`)}
                            className="btn btn-ghost btn-sm"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {can(user?.role, 'EDIT_PROJECT') && (
                            <button
                              onClick={() => setEditProject(proj)}
                              className="btn btn-ghost btn-sm"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn btn-ghost btn-sm disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-ghost btn-sm disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <ProjectFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={handleProjectSaved}
        />
      )}
      {/* Edit Modal */}
      {editProject && (
        <ProjectFormModal
          isOpen={!!editProject}
          project={editProject}
          onClose={() => setEditProject(null)}
          onSaved={handleProjectSaved}
        />
      )}
    </div>
  );
}
