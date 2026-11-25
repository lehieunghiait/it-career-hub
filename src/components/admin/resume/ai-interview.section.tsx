import { useEffect, useState } from 'react';
import { Button, Collapse, Progress, Skeleton, Tag, message } from 'antd';
import { ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  AiInterviewStatus,
  IAiInterview,
  IAiInterviewEvaluation,
  callFetchAiInterviews,
  callReevaluateAiInterview,
} from '@/config/api';
import s from '@/styles/pipeline.module.scss';

import i18next from 'i18next';

const STATUS: Record<AiInterviewStatus, { label: string; color: string }> = {
  INVITED: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.invite_sent'); }, color: 'blue' },
  IN_PROGRESS: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.in_progress'); }, color: 'processing' },
  COMPLETED: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.completed'); }, color: 'green' },
  EXPIRED: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.link_expired'); }, color: 'default' },
  CANCELLED: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.replaced'); }, color: 'default' },
};

const RECOMMENDATION: Record<
  NonNullable<IAiInterviewEvaluation['recommendation']>,
  { label: string; color: string }
> = {
  STRONG_YES: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.strong_yes'); }, color: 'green' },
  YES: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.yes'); }, color: 'lime' },
  MAYBE: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.maybe'); }, color: 'gold' },
  NO: { get label() { return i18next.t('app:components.admin.resume.ai_interview_section.no'); }, color: 'red' },
};

const EXTRACTED_LABELS: Record<string, string> = {
  yearsExperience: 'Years of experience',
  expectedSalary: 'Expected salary',
  noticePeriod: 'Notice period',
};

// Scoring runs in the background after the call, poll a little while it is pending
const POLL_MS = 5000;
const MAX_POLLS = 24;

const scoreColor = (score: number) =>
  score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

const formatDuration = (secs?: number) =>
  secs ? `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, '0')}s` : '';

interface IProps {
  resumeId: string;
  // Reload when the application changes stage (e.g. a new invite was sent)
  status: string;
}

/**
 * Latest AI screening interview of an application: status, suggested score and transcript
 */
const AiInterviewSection = ({ resumeId, status }: IProps) => {
  const [interviews, setInterviews] = useState<IAiInterview[] | null>(null);
  const [polls, setPolls] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      const res = await callFetchAiInterviews(resumeId);
      if (!ignore) setInterviews(res?.data ?? []);
    };
    load();
    return () => {
      ignore = true;
    };
  }, [resumeId, status, polls]);

  const latest = interviews?.[0];
  const isScoring = latest?.status === 'COMPLETED' && latest.evaluation?.status === 'PENDING';

  useEffect(() => {
    if (!isScoring || polls >= MAX_POLLS) return;
    const timer = setTimeout(() => setPolls(count => count + 1), POLL_MS);
    return () => clearTimeout(timer);
  }, [isScoring, polls]);

  const reevaluate = async () => {
    if (!latest) return;
    setIsRetrying(true);
    const res = await callReevaluateAiInterview(latest._id);
    setIsRetrying(false);
    if (res?.data) {
      setPolls(0);
      setInterviews(
        list =>
          list?.map((item, index) =>
            index === 0 ? { ...item, evaluation: { status: 'PENDING' } } : item
          ) ?? list
      );
    } else {
      message.error(res?.message ?? i18next.t('app:components.admin.resume.ai_interview_section.cannot_evaluate_the_interview_again'));
    }
  };

  if (interviews === null) {
    return (
      <section className={s['d-section']}>
        <Skeleton active title={false} paragraph={{ rows: 2 }} />
      </section>
    );
  }
  if (!latest) return null;

  const evaluation = latest.evaluation;
  const statusMeta = STATUS[latest.status];
  const extracted = Object.entries(evaluation?.extracted ?? {}).filter(
    ([, value]) => value !== null && value !== ''
  );

  return (
    <section className={s['d-section']}>
      <h3>
        <RobotOutlined /> {i18next.t('app:common.ai_interview')}
        {interviews.length > 1 && <span>{interviews.length} invites</span>}
      </h3>

      <div className={s['ai-meta']}>
        <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
        <span>{latest.language === 'en' ? i18next.t('app:components.admin.resume.ai_interview_section.english') : i18next.t('app:components.admin.resume.ai_interview_section.tieng_viet')}</span>
        {latest.status === 'COMPLETED' ? (
          <span>
            {dayjs(latest.completedAt).format('DD/MM/YYYY HH:mm')}
            {latest.durationSecs ? ` · ${formatDuration(latest.durationSecs)}` : ''}
          </span>
        ) : latest.status === 'INVITED' || latest.status === 'IN_PROGRESS' ? (
          <span>{i18next.t('app:components.admin.resume.ai_interview_section.expires')}{' '}{dayjs(latest.expiresAt).format('DD/MM/YYYY HH:mm')}</span>
        ) : null}
        {latest.attempts > 1 && <span>{latest.attempts} attempts</span>}
      </div>

      {latest.status === 'COMPLETED' && (
        <>
          {isScoring ? (
            <p className={s['muted']}>{i18next.t('app:components.admin.resume.ai_interview_section.scoring_the_interview')}</p>
          ) : evaluation?.status === 'FAILED' ? (
            <div className={s['ai-error']}>
              <span>{i18next.t('app:components.admin.resume.ai_interview_section.scoring_failed')}</span>
              <Button
                size='small'
                icon={<ReloadOutlined />}
                loading={isRetrying}
                onClick={reevaluate}
              >
                {i18next.t('app:components.admin.resume.ai_interview_section.try_again')}
              </Button>
            </div>
          ) : evaluation?.status === 'COMPLETED' ? (
            <div className={s['ai-result']}>
              <div className={s['ai-score']}>
                <Progress
                  type='circle'
                  size={64}
                  percent={evaluation.overallScore ?? 0}
                  strokeColor={scoreColor(evaluation.overallScore ?? 0)}
                  format={value => value}
                />
                <div>
                  {evaluation.recommendation && (
                    <Tag color={RECOMMENDATION[evaluation.recommendation].color}>
                      {RECOMMENDATION[evaluation.recommendation].label}
                    </Tag>
                  )}
                  <small>{i18next.t('app:components.admin.resume.ai_interview_section.suggested_by_ai_from_the_transcript')}</small>
                </div>
              </div>

              {evaluation.summary && <p className={s['ai-summary']}>{evaluation.summary}</p>}

              {!!evaluation.criteria?.length && (
                <ul className={s['ai-criteria']}>
                  {evaluation.criteria.map(item => (
                    <li key={item.name}>
                      <div>
                        <b>{item.name}</b>
                        <span>{item.score}</span>
                      </div>
                      <Progress
                        percent={item.score}
                        showInfo={false}
                        size='small'
                        strokeColor={scoreColor(item.score)}
                      />
                      {item.evidence && <q>{item.evidence}</q>}
                    </li>
                  ))}
                </ul>
              )}

              {!!evaluation.strengths?.length && (
                <div className={s['ai-list']}>
                  <b>{i18next.t('app:components.admin.resume.ai_interview_section.strengths')}</b>
                  <ul>
                    {evaluation.strengths.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!evaluation.concerns?.length && (
                <div className={s['ai-list']}>
                  <b>{i18next.t('app:components.admin.resume.ai_interview_section.concerns')}</b>
                  <ul>
                    {evaluation.concerns.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!evaluation.flags?.length && (
                <div className={s['ai-flags']}>
                  {evaluation.flags.map(flag => (
                    <Tag key={flag} color='orange'>
                      {flag}
                    </Tag>
                  ))}
                </div>
              )}
              {!!extracted.length && (
                <dl className={s['ai-extracted']}>
                  {extracted.map(([key, value]) => (
                    <div key={key}>
                      <dt>{EXTRACTED_LABELS[key] ?? key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ) : null}

          {!!latest.transcript?.length && (
            <Collapse
              ghost
              size='small'
              className={s['ai-transcript']}
              items={[
                {
                  key: 'transcript',
                  label: i18next.t('app:components.admin.resume.ai_interview_section.transcript_turns', { v0: latest.transcript.length }),
                  children: (
                    <ol>
                      {latest.transcript.map((line, index) => (
                        <li key={index} className={line.role === 'agent' ? s['agent'] : undefined}>
                          <b>{line.role === 'agent' ? 'AI' : i18next.t('app:components.admin.resume.ai_interview_section.candidate')}</b>
                          <p>{line.message}</p>
                        </li>
                      ))}
                    </ol>
                  ),
                },
              ]}
            />
          )}
        </>
      )}
    </section>
  );
};

export default AiInterviewSection;
