/**
 * Application pipeline shared by the candidate timeline and the admin screens:
 * Applied -> Reviewing -> Interview -> Result (Offer / Not selected)
 */
export type ResumeStatus = 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED';

export const RESUME_STATUS: Record<ResumeStatus, { label: string; color: string }> = {
  PENDING: { label: 'Applied', color: 'gold' },
  REVIEWING: { label: 'CV under review', color: 'blue' },
  INTERVIEW: { label: 'Interview', color: 'purple' },
  APPROVED: { label: 'Offer', color: 'green' },
  REJECTED: { label: 'Not selected', color: 'red' },
};

export const RESUME_STATUS_OPTIONS = (Object.keys(RESUME_STATUS) as ResumeStatus[]).map(value => ({
  value,
  label: RESUME_STATUS[value].label,
}));

// Timeline steps; the last one shows the final result
export const RESUME_STEPS = [
  { key: 'PENDING', title: 'Applied' },
  { key: 'REVIEWING', title: 'Reviewing' },
  { key: 'INTERVIEW', title: 'Interview' },
  { key: 'RESULT', title: 'Result' },
] as const;

export const stepIndexOf = (status: string) => {
  if (status === 'APPROVED' || status === 'REJECTED') return 3;
  const index = RESUME_STEPS.findIndex(step => step.key === status);
  return index < 0 ? 0 : index;
};

export const isClosedStatus = (status: string) => status === 'APPROVED' || status === 'REJECTED';
