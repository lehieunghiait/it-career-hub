import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Drawer, Empty, Skeleton, Tag } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FileDoneOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import { callFetchJobById, callFetchResume } from '@/config/api';
import { SKILLS_LIST, convertSlug, getLocationName } from '@/config/utils';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { IJob } from '@/types/backend';
import Access from '@/components/share/access';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import { useIsMobile } from '@/hooks/useIsMobile';
import s from '@/styles/job-detail-drawer.module.scss';

import i18next from 'i18next';

interface IProps {
  jobId: string | null;
  open: boolean;
  onClose: () => void;
}

type Audit = { email?: string } | undefined;

const skillLabel = (value: string) => SKILLS_LIST.find(i => i.value === value)?.label ?? value;

/**
 * Admin drawer showing everything about one job post
 */
const ViewDetailJob = ({ jobId, open, onClose }: IProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile('md');
  const [job, setJob] = useState<IJob | null>(null);
  const [applications, setApplications] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !jobId) return;
    const load = async () => {
      setLoading(true);
      setJob(null);
      const [jobRes, resumeRes] = await Promise.all([
        callFetchJobById(jobId),
        callFetchResume(`current=1&pageSize=1&jobId=${jobId}`),
      ]);
      setJob(jobRes?.data ?? null);
      setApplications(resumeRes?.data?.meta?.total ?? null);
      setLoading(false);
    };
    load();
  }, [jobId, open]);

  const daysLeft = job?.endDate ? dayjs(job.endDate).diff(dayjs(), 'day') : null;
  const createdBy = (job as unknown as { createdBy?: Audit })?.createdBy;
  const updatedBy = (job as unknown as { updatedBy?: Audit })?.updatedBy;

  const facts = job
    ? [
        {
          icon: <DollarOutlined />,
          label: i18next.t('app:common.salary'),
          value: `${(job.salary ?? 0).toLocaleString('en-US')} đ`,
        },
        { icon: <RiseOutlined />, label: i18next.t('app:common.level'), value: job.level },
        { icon: <EnvironmentOutlined />, label: i18next.t('app:common.location'), value: getLocationName(job.location) },
        { icon: <TeamOutlined />, label: i18next.t('app:components.admin.job.view_detail_job.openings'), value: `${job.quantity ?? 0} people` },
        {
          icon: <CalendarOutlined />,
          label: i18next.t('app:components.admin.job.view_detail_job.posting_period'),
          value: `${dayjs(job.startDate).format('DD/MM/YYYY')} → ${dayjs(job.endDate).format('DD/MM/YYYY')}`,
        },
        {
          icon: <FileDoneOutlined />,
          label: i18next.t('app:components.admin.job.view_detail_job.applications'),
          value: applications === null ? '—' : i18next.t('app:components.admin.job.view_detail_job.received', { v0: applications }),
        },
      ]
    : [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={isMobile ? '100%' : 720}
      title={i18next.t('app:components.admin.job.view_detail_job.job_details')}
      destroyOnClose
      footer={
        job && (
          <div className={s['footer']}>
            <Button
              icon={<ExportOutlined />}
              href={`/job/${convertSlug(job.name)}?id=${job._id}`}
              target='_blank'
            >
              {i18next.t('app:components.admin.job.view_detail_job.view_public_page')}
            </Button>
            <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/job/upsert?id=${job._id}`)}
              >
                {i18next.t('app:components.admin.job.view_detail_job.edit_job')}
              </Button>
            </Access>
          </div>
        )
      }
    >
      {loading ? (
        <Skeleton active avatar={{ shape: 'square', size: 64 }} paragraph={{ rows: 10 }} />
      ) : !job ? (
        <Empty description={i18next.t('app:components.admin.job.view_detail_job.job_not_found')} />
      ) : (
        <div className={s['wrap']}>
          <div className={s['header']}>
            <CompanyLogo className={s['logo']} src={job.company?.logo} name={job.company?.name} />
            <div className={s['header-info']}>
              <h2>{job.name}</h2>
              <div className={s['company']}>{job.company?.name}</div>
              <div className={s['badges']}>
                <Tag color={job.isActive ? 'green' : 'default'}>
                  {job.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
                {daysLeft !== null && (
                  <Tag
                    icon={<ClockCircleOutlined />}
                    color={daysLeft < 0 ? 'red' : daysLeft <= 3 ? 'orange' : 'default'}
                  >
                    {daysLeft < 0
                      ? i18next.t('app:components.admin.job.view_detail_job.expired')
                      : daysLeft === 0
                        ? i18next.t('app:components.admin.job.view_detail_job.ends_today')
                        : i18next.t('app:components.admin.job.view_detail_job.days_left', { v0: daysLeft })}
                  </Tag>
                )}
              </div>
            </div>
          </div>

          <div className={s['facts']}>
            {facts.map(fact => (
              <div key={fact.label} className={s['fact']}>
                <span className={s['fact-icon']}>{fact.icon}</span>
                <div>
                  <span className={s['fact-label']}>{fact.label}</span>
                  <span className={s['fact-value']}>{fact.value}</span>
                </div>
              </div>
            ))}
          </div>

          <section>
            <h3 className={s['title']}>{i18next.t('app:common.skills')}</h3>
            <div className={s['skills']}>
              {job.skills?.length ? (
                job.skills.map(skill => <Tag key={skill}>{skillLabel(skill)}</Tag>)
              ) : (
                <span className={s['muted']}>{i18next.t('app:components.admin.job.view_detail_job.no_skills_listed')}</span>
              )}
            </div>
          </section>

          <section>
            <h3 className={s['title']}>{i18next.t('app:common.description')}</h3>
            <div className={s['description']}>
              {job.description ? (
                parse(job.description)
              ) : (
                <span className={s['muted']}>{i18next.t('app:components.admin.job.view_detail_job.no_description')}</span>
              )}
            </div>
          </section>

          <section className={s['audit']}>
            <div>
              <UserOutlined /> {i18next.t('app:components.admin.job.view_detail_job.created_by')}{' '}<b>{createdBy?.email ?? '—'}</b> ·{' '}
              {dayjs(job.createdAt).format('DD/MM/YYYY HH:mm')}
            </div>
            <div>
              <EditOutlined /> {i18next.t('app:components.admin.job.view_detail_job.last_updated_by')}{' '}<b>{updatedBy?.email ?? createdBy?.email ?? '—'}</b>{' '}
              · {dayjs(job.updatedAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
};

export default ViewDetailJob;
