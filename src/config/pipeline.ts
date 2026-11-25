import type { ResumeStatus } from './resume-status';

import i18next from 'i18next';

/**
 * Recruiter kanban stages, mapped onto the application statuses the candidate sees
 * (New = Applied, Screening = CV under review, Offer = Approved)
 */
export const PIPELINE_STAGES: {
  status: ResumeStatus;
  title: string;
  color: string;
  // Moving here asks for an optional message that goes into the candidate email
  askMessage?: string;
  // Moving here sends an AI interview invite instead of a plain status change
  aiInvite?: boolean;
}[] = [
  { status: 'PENDING', get title() { return i18next.t('app:config.pipeline.new'); }, color: '#64748b' },
  { status: 'REVIEWING', get title() { return i18next.t('app:config.pipeline.screening'); }, color: '#2563eb' },
  {
    status: 'AI_SCREENING',
    get title() { return i18next.t('app:common.ai_interview'); },
    color: '#0891b2',
    askMessage: 'e.g. Please take the interview before Friday, it takes about 15 minutes',
    aiInvite: true,
  },
  {
    status: 'INTERVIEW',
    get title() { return i18next.t('app:common.interview'); },
    color: '#7c3aed',
    askMessage: 'e.g. Tuesday 10:00, 18 Le Van Luong, ask for Ms. Lan at reception',
  },
  {
    status: 'APPROVED',
    get title() { return i18next.t('app:config.pipeline.offer'); },
    color: '#16a34a',
    askMessage: 'e.g. Our HR team will send the offer letter within 2 days',
  },
  {
    status: 'REJECTED',
    get title() { return i18next.t('app:config.pipeline.rejected'); },
    color: '#dc2626',
    askMessage: 'e.g. We decided to move forward with candidates with more React experience',
  },
];

export const stageOf = (status: string) =>
  PIPELINE_STAGES.find(stage => stage.status === status) ?? PIPELINE_STAGES[0];
