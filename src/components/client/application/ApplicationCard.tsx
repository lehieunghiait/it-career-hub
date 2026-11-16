import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Steps, Tag, Timeline } from 'antd';
import type { StepsProps } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { IResume } from '@/types/backend';
import { convertSlug, getLocationName } from '@/config/utils';
import {
  RESUME_STATUS,
  RESUME_STEPS,
  ResumeStatus,
  isClosedStatus,
  stepIndexOf,
} from '@/config/resume-status';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import { useIsMobile } from '@/hooks/useIsMobile';
import s from 'styles/my-jobs.module.scss';

type Job = Exclude<IResume['jobId'], string>;
type Company = Exclude<IResume['companyId'], string>;

interface ApplicationCardProps {
  resume: IResume;
  onOpenCv: (id?: string) => void;
  isOpeningCv: boolean;
}

const formatDate = (value?: Date | string) => (value ? dayjs(value).format('DD/MM/YYYY') : '');

/**
 * One application with its progress: Applied -> Reviewing -> Interview -> Result
 */
const ApplicationCard = ({ resume, onOpenCv, isOpeningCv }: ApplicationCardProps) => {
  const isMobile = useIsMobile('md');
  const [showHistory, setShowHistory] = useState(false);

  const job = typeof resume.jobId === 'object' ? (resume.jobId as Job) : undefined;
  const company = typeof resume.companyId === 'object' ? (resume.companyId as Company) : undefined;
  const status = resume.status as ResumeStatus;
  const statusMeta = RESUME_STATUS[status] ?? { label: resume.status, color: 'default' };
  const history = [...(resume.history ?? [])].sort(
    (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf()
  );

  // First time each step was reached (approved / rejected both count as the result step)
  const reachedAt = new Map<string, Date>();
  history.forEach(item => {
    const key = isClosedStatus(item.status) ? 'RESULT' : item.status;
    if (!reachedAt.has(key)) reachedAt.set(key, item.updatedAt);
  });
  if (!reachedAt.has('PENDING') && resume.createdAt)
    reachedAt.set('PENDING', resume.createdAt as any);

  const current = stepIndexOf(status);
  const closed = isClosedStatus(status);
  const steps: StepsProps['items'] = RESUME_STEPS.map((step, index) => {
    let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
    if (index < current) {
      // After a final decision, stages the application skipped stay grey
      stepStatus = closed && !reachedAt.has(step.key) ? 'wait' : 'finish';
    } else if (index === current) {
      stepStatus = status === 'REJECTED' ? 'error' : closed ? 'finish' : 'process';
    }
    const title = step.key === 'RESULT' && closed ? statusMeta.label : step.title;
    return {
      title,
      status: stepStatus,
      description: formatDate(reachedAt.get(step.key)),
    };
  });

  // Latest message from the recruiter, e.g. interview schedule
  const latestNote = [...history].reverse().find(item => item.note);

  const jobLink = job?._id ? `/job/${convertSlug(job.name)}?id=${job._id}` : undefined;
  const companyLogo = company?.logo || job?.company?.logo;
  const companyName = company?.name || job?.company?.name;

  return (
    <article className={s['app-card']}>
      <header className={s['app-head']}>
        <CompanyLogo className={s['app-logo']} src={companyLogo} name={companyName} />
        <div className={s['app-info']}>
          <h3 className={s['app-title']}>
            {jobLink ? <Link to={jobLink}>{job?.name}</Link> : 'Job no longer available'}
          </h3>
          <div className={s['app-company']}>{companyName}</div>
          <div className={s['app-meta']}>
            <span>
              <CalendarOutlined /> Applied {formatDate(resume.createdAt)}
            </span>
            {job?.location && (
              <span>
                <EnvironmentOutlined /> {getLocationName(job.location)}
              </span>
            )}
            {job && job.isActive === false && !closed && <Tag>Job closed</Tag>}
          </div>
        </div>
        <Tag color={statusMeta.color} className={s['app-status']}>
          {statusMeta.label}
        </Tag>
      </header>

      <Steps
        className={s['app-steps']}
        size='small'
        current={current}
        items={steps}
        direction={isMobile ? 'vertical' : 'horizontal'}
        labelPlacement={isMobile ? undefined : 'vertical'}
      />

      {latestNote && (
        <div className={s['app-note']}>
          <MessageOutlined />
          <div>
            <strong>
              {RESUME_STATUS[latestNote.status as ResumeStatus]?.label ?? latestNote.status} ·{' '}
              {dayjs(latestNote.updatedAt).format('DD/MM/YYYY HH:mm')}
            </strong>
            <p>{latestNote.note}</p>
          </div>
        </div>
      )}

      {showHistory && (
        <Timeline
          className={s['app-history']}
          items={[...history].reverse().map(item => ({
            color: RESUME_STATUS[item.status as ResumeStatus]?.color ?? 'gray',
            children: (
              <>
                <strong>{RESUME_STATUS[item.status as ResumeStatus]?.label ?? item.status}</strong>
                <span className={s['app-history-date']}>
                  {dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')}
                </span>
                {item.note && <p>{item.note}</p>}
              </>
            ),
          }))}
        />
      )}

      <footer className={s['app-actions']}>
        <Button
          size='small'
          icon={<FileTextOutlined />}
          loading={isOpeningCv}
          onClick={() => onOpenCv(resume._id)}
        >
          View CV
        </Button>
        {history.length > 0 && (
          <Button size='small' type='link' onClick={() => setShowHistory(v => !v)}>
            {showHistory ? 'Hide history' : `History (${history.length})`}
          </Button>
        )}
      </footer>
    </article>
  );
};

export default ApplicationCard;
