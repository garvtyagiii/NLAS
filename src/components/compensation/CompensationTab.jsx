import React, { useState, useEffect } from 'react';
import { Plus, Loader2, IndianRupee } from 'lucide-react';
import { compensationApi } from '../../services/compensationApi.js';
import { Card, Skeleton, ErrorState, ProgressBar } from '../common/UI.jsx';
import { Modal } from '../common/Modal.jsx';
import { formatCurrency, formatCurrencyCompact, getStatusColor, getStatusLabel } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { can } from '../../utils/permissions.js';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const paymentSchema = z.object({
  parcelId: z.string().min(1, 'Parcel is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentReference: z.string().min(1, 'Payment reference is required'),
});

function PaymentModal({ isOpen, onClose, onSuccess, records }) {
  const toast = useToast();
  const pendingRecords = records?.filter(r => r.pending > 0) || [];

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(paymentSchema),
  });

  const selectedParcelId = watch('parcelId');
  const selectedRecord = pendingRecords.find(r => r.parcelId === selectedParcelId);

  const onSubmit = async (data) => {
    if (selectedRecord && data.amount > selectedRecord.pending) {
      toast('Amount cannot exceed pending amount.', 'error');
      return;
    }
    try {
      await compensationApi.recordPayment(data);
      toast('Payment recorded successfully', 'success');
      onSuccess();
    } catch (err) {
      toast(err?.message || 'Failed to record payment.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Compensation Payment" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Parcel *</label>
          <select {...register('parcelId')} className={`form-input ${errors.parcelId ? 'error' : ''}`}>
            <option value="">Select parcel with pending payment</option>
            {pendingRecords.map(r => (
              <option key={r.parcelId} value={r.parcelId}>
                {r.khasraNo} — {r.village} (Pending: {formatCurrencyCompact(r.pending)})
              </option>
            ))}
          </select>
          {errors.parcelId && <p className="text-red-500 text-xs mt-1">{errors.parcelId.message}</p>}
        </div>

        {selectedRecord && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            Max payable: <strong>{formatCurrency(selectedRecord.pending)}</strong>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Amount (₹) *</label>
          <input
            type="number" step="0.01"
            {...register('amount')}
            className={`form-input ${errors.amount ? 'error' : ''}`}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Date *</label>
          <input type="date" {...register('paymentDate')} className={`form-input ${errors.paymentDate ? 'error' : ''}`} />
          {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Reference *</label>
          <input
            {...register('paymentReference')}
            className={`form-input ${errors.paymentReference ? 'error' : ''}`}
            placeholder="e.g., NEFT/2026/08/28/112233"
          />
          {errors.paymentReference && <p className="text-red-500 text-xs mt-1">{errors.paymentReference.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary btn">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary btn">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CompensationTab({ projectId, onRefresh }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await compensationApi.getCompensation(projectId);
      setData(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load compensation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const s = data?.summary;
  const disbPct = s ? Math.round((s.disbursed / s.assessed) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : s && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Assessed', value: formatCurrencyCompact(s.assessed), color: 'text-slate-800' },
              { label: 'Approved', value: formatCurrencyCompact(s.approved), color: 'text-blue-700' },
              { label: 'Disbursed', value: formatCurrencyCompact(s.disbursed), color: 'text-emerald-700' },
              { label: 'Pending', value: formatCurrencyCompact(s.pending), color: 'text-amber-700' },
            ].map(card => (
              <Card key={card.label}>
                <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </Card>
            ))}
          </div>

          {/* Disbursement progress */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Disbursement Progress</span>
              <span className="text-xs font-bold text-emerald-600">{disbPct}%</span>
            </div>
            <ProgressBar value={s.disbursed} max={s.assessed} colorClass="bg-emerald-500" className="h-3" />
          </Card>
        </>
      )}

      {/* Table header + action */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Parcel-wise Compensation</h3>
        {can(user?.role, 'RECORD_PAYMENT') && (
          <button onClick={() => setPaymentModalOpen(true)} className="btn-primary btn btn-sm">
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </button>
        )}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khasra No.</th>
                <th>Village</th>
                <th className="hidden sm:table-cell">Families</th>
                <th>Assessed</th>
                <th className="hidden md:table-cell">Disbursed</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i) => (
                  <tr key={i}><td colSpan={7}><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : data?.records?.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">No compensation records found</td></tr>
              ) : data?.records?.map(rec => (
                <tr key={rec.parcelId}>
                  <td className="font-medium">{rec.khasraNo}</td>
                  <td>{rec.village}</td>
                  <td className="hidden sm:table-cell">{rec.families}</td>
                  <td>{formatCurrencyCompact(rec.assessed)}</td>
                  <td className="hidden md:table-cell text-emerald-700">{formatCurrencyCompact(rec.disbursed)}</td>
                  <td className={rec.pending > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}>
                    {rec.pending > 0 ? formatCurrencyCompact(rec.pending) : '—'}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rec.status)}`}>
                      {getStatusLabel(rec.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        records={data?.records}
        onSuccess={() => { setPaymentModalOpen(false); load(); onRefresh?.(); }}
      />
    </div>
  );
}
