import type { ResumeStatus } from './resume-status';

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
}[] = [
  { status: 'PENDING', title: 'New', color: '#64748b' },
  { status: 'REVIEWING', title: 'Screening', color: '#2563eb' },
  {
    status: 'INTERVIEW',
    title: 'Interview',
    color: '#7c3aed',
    askMessage: 'e.g. Tuesday 10:00, 18 Le Van Luong, ask for Ms. Lan at reception',
  },
  {
    status: 'APPROVED',
    title: 'Offer',
    color: '#16a34a',
    askMessage: 'e.g. Our HR team will send the offer letter within 2 days',
  },
  {
    status: 'REJECTED',
    title: 'Rejected',
    color: '#dc2626',
    askMessage: 'e.g. We decided to move forward with candidates with more React experience',
  },
];

export const stageOf = (status: string) =>
  PIPELINE_STAGES.find(stage => stage.status === status) ?? PIPELINE_STAGES[0];
