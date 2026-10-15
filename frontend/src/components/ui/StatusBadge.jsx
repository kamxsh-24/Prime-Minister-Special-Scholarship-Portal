import React from 'react';

const STATUS_CONFIG = {
  draft:                   { label: 'Draft',        className: 'badge-draft' },
  submitted:               { label: 'Submitted',    className: 'badge-submitted' },
  under_verification:      { label: 'Under Verification', className: 'badge-under_review' },
  institution_verified:    { label: 'Verified by College', className: 'badge-verified' },
  under_review:            { label: 'Under Review', className: 'badge-under_review' },
  correction_required:     { label: 'Correction Required', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  returned_for_correction: { label: 'Correction Required', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  on_hold:                 { label: 'On Hold',      className: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' },
  verified:                { label: 'Verified',     className: 'badge-verified' },
  approved:                { label: 'Approved',     className: 'badge-approved' },
  rejected:                { label: 'Rejected',     className: 'badge-rejected' },
  disbursed:               { label: 'Disbursed',    className: 'badge-approved' },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-draft' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
