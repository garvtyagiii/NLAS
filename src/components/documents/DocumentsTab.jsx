import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye } from 'lucide-react';
import { documentApi } from '../../services/documentApi.js';
import { Card, Skeleton, ErrorState, EmptyState } from '../common/UI.jsx';
import { formatDateTime, formatDate } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { can } from '../../utils/permissions.js';
import { useToast } from '../../context/ToastContext.jsx';

const DOC_TYPES = {
  SIA_REPORT: 'SIA Report',
  NOTIFICATION: 'Notification',
  AWARD_ORDER: 'Award Order',
  COMPENSATION_MATRIX: 'Compensation Matrix',
  RNR_PLAN: 'R&R Plan',
  OTHER: 'Other',
};

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1000).toFixed(0)} KB`;
}

export default function DocumentsTab({ projectId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentApi.getDocuments(projectId);
      setDocs(res.data.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', projectId);
      await documentApi.uploadDocument(fd);
      toast('Document uploaded successfully', 'success');
      load();
    } catch (err) {
      toast(err?.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{docs.length} document{docs.length !== 1 ? 's' : ''}</h3>
        {can(user?.role, 'UPLOAD_DOCUMENT') && (
          <label className="btn-primary btn btn-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xlsx,.jpg,.png" disabled={uploading} />
          </label>
        )}
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : docs.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded" description="Upload project documents, notifications, awards, and R&R plans." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Type</th>
                  <th className="hidden md:table-cell">Uploaded By</th>
                  <th className="hidden sm:table-cell">Date</th>
                  <th className="hidden lg:table-cell">Version</th>
                  <th className="hidden lg:table-cell">Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{doc.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {DOC_TYPES[doc.type] || doc.type}
                      </span>
                    </td>
                    <td className="hidden md:table-cell text-xs text-slate-500">{doc.uploadedBy}</td>
                    <td className="hidden sm:table-cell text-xs text-slate-500">{formatDate(doc.timestamp)}</td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">v{doc.version}</td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">{formatSize(doc.size)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-sm" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
