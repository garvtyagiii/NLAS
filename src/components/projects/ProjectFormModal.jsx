import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { projectApi } from '../../services/projectApi.js';
import { useToast } from '../../context/ToastContext.jsx';

const schema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  type: z.string().min(1, 'Project type is required'),
  department: z.string().min(1, 'Department is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  requiredArea: z.coerce.number().positive('Area must be greater than 0'),
  targetDate: z.string().min(1, 'Target date is required'),
});

const PROJECT_TYPES = ['HIGHWAY', 'RAILWAY', 'INDUSTRIAL', 'POWER', 'PORT', 'IRRIGATION', 'URBAN', 'OTHER'];
const STATES = ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Bihar', 'Haryana', 'Madhya Pradesh'];

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ProjectFormModal({ isOpen, onClose, onSaved, project }) {
  const toast = useToast();
  const isEdit = !!project;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: project ? {
      name: project.name,
      type: project.type,
      department: project.department,
      state: project.state,
      district: project.district,
      requiredArea: project.requiredArea,
      targetDate: project.targetDate?.slice(0, 10),
    } : {},
  });

  const onSubmit = async (data) => {
    try {
      let res;
      if (isEdit) {
        res = await projectApi.updateProject(project.id, data);
        toast('Project updated successfully', 'success');
      } else {
        res = await projectApi.createProject(data);
        toast('Project created successfully', 'success');
      }
      onSaved(res.data?.data);
    } catch (err) {
      toast(err?.message || 'Failed to save project. Please try again.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'New Project'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Project Name *" error={errors.name?.message}>
              <input {...register('name')} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g., Delhi-Meerut Expressway Expansion" />
            </Field>
          </div>
          <Field label="Project Type *" error={errors.type?.message}>
            <select {...register('type')} className={`form-input ${errors.type ? 'error' : ''}`}>
              <option value="">Select type</option>
              {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Department *" error={errors.department?.message}>
            <input {...register('department')} className={`form-input ${errors.department ? 'error' : ''}`} placeholder="Ministry of..." />
          </Field>
          <Field label="State *" error={errors.state?.message}>
            <select {...register('state')} className={`form-input ${errors.state ? 'error' : ''}`}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="District *" error={errors.district?.message}>
            <input {...register('district')} className={`form-input ${errors.district ? 'error' : ''}`} placeholder="District name" />
          </Field>
          <Field label="Required Area (ha) *" error={errors.requiredArea?.message}>
            <input type="number" step="0.01" {...register('requiredArea')} className={`form-input ${errors.requiredArea ? 'error' : ''}`} placeholder="0.00" />
          </Field>
          <Field label="Target Completion Date *" error={errors.targetDate?.message}>
            <input type="date" {...register('targetDate')} className={`form-input ${errors.targetDate ? 'error' : ''}`} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary btn">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary btn">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
