import i18next from 'i18next';
/**
 * Application pipeline shared by the candidate timeline and the admin screens:
 * Applied -> Reviewing (incl. AI screening) -> Interview -> Result (Offer / Not selected)
 */
export type ResumeStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'AI_SCREENING'
  | 'INTERVIEW'
  | 'APPROVED'
  | 'REJECTED';

export const RESUME_STATUS: Record<ResumeStatus, { label: string; color: string }> = {
  PENDING: { get label() { return i18next.t('app:common.applied'); }, color: 'gold' },
  REVIEWING: { get label() { return i18next.t('app:config.resume_status.cv_under_review'); }, color: 'blue' },
  AI_SCREENING: { get label() { return i18next.t('app:common.ai_interview'); }, color: 'cyan' },
  INTERVIEW: { get label() { return i18next.t('app:common.interview'); }, color: 'purple' },
  APPROVED: { get label() { return i18next.t('app:config.resume_status.offer'); }, color: 'green' },
  REJECTED: { get label() { return i18next.t('app:config.resume_status.not_selected'); }, color: 'red' },
};

export const RESUME_STATUS_OPTIONS = (Object.keys(RESUME_STATUS) as ResumeStatus[]).map(value => ({
  value,
  label: RESUME_STATUS[value].label,
}));

// Timeline steps; the last one shows the final result
export const RESUME_STEPS = [
  { key: 'PENDING', get title() { return i18next.t('app:common.applied'); } },
  { key: 'REVIEWING', get title() { return i18next.t('app:config.resume_status.reviewing'); } },
  { key: 'INTERVIEW', get title() { return i18next.t('app:common.interview'); } },
  { key: 'RESULT', get title() { return i18next.t('app:config.resume_status.result'); } },
] as const;

export const stepIndexOf = (status: string) => {
  if (status === 'APPROVED' || status === 'REJECTED') return 3;
  // The AI screening round belongs to the reviewing step on the timeline
  if (status === 'AI_SCREENING') return 1;
  const index = RESUME_STEPS.findIndex(step => step.key === status);
  return index < 0 ? 0 : index;
};

export const isClosedStatus = (status: string) => status === 'APPROVED' || status === 'REJECTED';
