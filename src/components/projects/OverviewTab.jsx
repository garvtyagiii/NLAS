import React from 'react';
import { Card } from '../common/UI.jsx';
import { ProgressBar } from '../common/UI.jsx';
import { formatDate } from '../../utils/format.js';
import { getStatusLabel, getStatusColor, WORKFLOW_STAGES } from '../../utils/format.js';

export default function OverviewTab({ project }) {
  const stageIndex = WORKFLOW_STAGES.indexOf(project.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Description + status */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Project Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{project.description || 'No description provided.'}</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Workflow Progress</h3>
          {/* Stage pills */}
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_STAGES.map((stage, i) => {
              const isDone = i < stageIndex;
              const isCurrent = i === stageIndex;
              const isFuture = i > stageIndex;
              return (
                <div key={stage} className="flex items-center gap-1.5">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${isCurrent ? 'bg-navy-700 text-white border-navy-700' :
                        isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-400 border-slate-200'}`}
                  >
                    {isDone && '✓ '}{getStatusLabel(stage)}
                  </div>
                  {i < WORKFLOW_STAGES.length - 1 && (
                    <span className={`text-xs ${i < stageIndex ? 'text-emerald-400' : 'text-slate-300'}`}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Current Milestone</h3>
          <p className="text-sm text-slate-600">{project.currentMilestone || '—'}</p>
          {project.nextAction && (
            <>
              <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-1">Next Action</h3>
              <p className="text-sm text-navy-600">{project.nextAction}</p>
            </>
          )}
        </Card>
      </div>

      {/* Right: Details */}
      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Details</h3>
          <dl className="space-y-3">
            {[
              { label: 'Department', value: project.department },
              { label: 'State', value: project.state },
              { label: 'District', value: project.district },
              { label: 'Start Date', value: formatDate(project.startDate) },
              { label: 'Target Date', value: formatDate(project.targetDate) },
              { label: 'Created By', value: project.createdBy?.name },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
                <dd className="text-sm text-slate-700">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Land Acquisition</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-500">Required</span>
                <span className="text-xs font-semibold">{project.requiredArea} ha</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-500">Acquired</span>
                <span className="text-xs font-semibold text-emerald-600">{project.acquiredArea} ha</span>
              </div>
              <ProgressBar value={project.acquiredArea} max={project.requiredArea} colorClass="bg-emerald-500" />
              <p className="text-xs text-slate-400 mt-1">
                {Math.round((project.acquiredArea / project.requiredArea) * 100)}% complete
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
