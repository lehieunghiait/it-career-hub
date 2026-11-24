import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Skeleton, Table, Tooltip as AntTooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BankOutlined,
  CalendarFilled,
  RobotFilled,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  EyeFilled,
  FileDoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CountUp from 'react-countup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { callFetchDashboardInsights, callFetchDashboardOverview } from '@/config/api';
import { SKILLS_LIST, getLocationName } from '@/config/utils';
import { IDashboardInsights, IIDashboardOverview } from '@/types/backend';
import { useAppSelector } from '@/redux/hooks';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import s from '@/styles/dashboard.module.scss';

import i18next from 'i18next';

dayjs.extend(relativeTime);

// Validated categorical slots (dataviz reference palette) + chart chrome
const SERIES = { jobs: '#2a78d6', resumes: '#eb6834' };
const GRID = '#e1e0d9';
const AXIS_INK = '#898781';

// Status colors are reserved for state and always shown with an icon + label
const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { get label() { return i18next.t('app:pages.admin.dashboard.pending'); }, color: '#fab219', icon: <ClockCircleFilled /> },
  REVIEWING: { get label() { return i18next.t('app:pages.admin.dashboard.reviewing'); }, color: '#2a78d6', icon: <EyeFilled /> },
  AI_SCREENING: { get label() { return i18next.t('app:common.ai_interview'); }, color: '#0891b2', icon: <RobotFilled /> },
  INTERVIEW: { get label() { return i18next.t('app:common.interview'); }, color: '#7a5cc8', icon: <CalendarFilled /> },
  APPROVED: { get label() { return i18next.t('app:pages.admin.dashboard.approved'); }, color: '#0ca30c', icon: <CheckCircleFilled /> },
  REJECTED: { get label() { return i18next.t('app:pages.admin.dashboard.rejected'); }, color: '#d03b3b', icon: <CloseCircleFilled /> },
};
const LEVEL_ORDER = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];

const skillLabel = (value: string) => SKILLS_LIST.find(i => i.value === value)?.label ?? value;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return i18next.t('app:pages.admin.dashboard.good_morning');
  if (hour < 18) return i18next.t('app:pages.admin.dashboard.good_afternoon');
  return i18next.t('app:pages.admin.dashboard.good_evening');
};

const ChartTooltip = ({ active, payload, label, unit = 'jobs' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={s['tooltip']}>
      {label && <div className={s['tooltip-title']}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className={s['tooltip-row']}>
          <span className={s['swatch']} style={{ background: p.color || p.fill }} />
          <span>{p.name}</span>
          <b>
            {p.value} {payload.length === 1 ? unit : ''}
          </b>
        </div>
      ))}
    </div>
  );
};

const Panel = ({
  title,
  subtitle,
  extra,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`${s['panel']} ${className}`}>
    <div className={s['panel-head']}>
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {extra}
    </div>
    {children}
  </section>
);

// Horizontal single-series bar list, rendered with recharts
const HBarChart = ({
  data,
  height,
}: {
  data: { label: string; count: number }[];
  height?: number;
}) =>
  data.length ? (
    <ResponsiveContainer width='100%' height={height ?? Math.max(160, data.length * 34)}>
      <BarChart data={data} layout='vertical' margin={{ top: 0, right: 28, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis
          type='number'
          allowDecimals={false}
          tick={{ fill: AXIS_INK, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type='category'
          dataKey='label'
          width={120}
          tick={{ fill: '#52514e', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(42,120,214,0.06)' }} />
        <Bar
          dataKey='count'
          name='Jobs'
          fill={SERIES.jobs}
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
          label={{ position: 'right', fill: '#52514e', fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18next.t('app:pages.admin.dashboard.no_data_yet')} />
  );

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.account.user);
  const [overview, setOverview] = useState<IIDashboardOverview | null>(null);
  const [insights, setInsights] = useState<IDashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [overviewRes, insightsRes] = await Promise.all([
      callFetchDashboardOverview(),
      callFetchDashboardInsights(),
    ]);
    setOverview(overviewRes?.data ?? null);
    setInsights(insightsRes?.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const statusCounts = useMemo(() => {
    const map = new Map(insights?.resumesByStatus.map(r => [r.key, r.count]) ?? []);
    return Object.keys(STATUS).map(key => ({ key, count: map.get(key) ?? 0 }));
  }, [insights]);
  const pending = statusCounts.find(r => r.key === 'PENDING')?.count ?? 0;
  const totalResumes = overview?.totalResumes ?? 0;

  const activity = useMemo(
    () => insights?.activity.map(d => ({ ...d, label: dayjs(d.date).format('DD/MM') })) ?? [],
    [insights]
  );
  const activityTotals = activity.reduce(
    (acc, d) => ({ jobs: acc.jobs + d.jobs, resumes: acc.resumes + d.resumes }),
    { jobs: 0, resumes: 0 }
  );

  const levels = useMemo(() => {
    const map = new Map(insights?.jobsByLevel.map(r => [r.key, r.count]) ?? []);
    return LEVEL_ORDER.map(level => ({ label: level, count: map.get(level) ?? 0 }));
  }, [insights]);

  const kpis = [
    {
      label: i18next.t('app:pages.admin.dashboard.active_jobs'),
      value: overview?.activeJobs ?? 0,
      note: `${overview?.totalJobs ?? 0} total · ${overview?.inactiveJobs ?? 0} inactive`,
      icon: <ScheduleOutlined />,
      tone: 'blue',
      to: '/admin/job',
    },
    {
      label: i18next.t('app:pages.admin.dashboard.applications'),
      value: totalResumes,
      note: `${pending} waiting for review`,
      icon: <FileDoneOutlined />,
      tone: 'orange',
      to: '/admin/resume',
    },
    {
      label: i18next.t('app:common.companies'),
      value: overview?.totalCompanies ?? 0,
      note: `${insights?.topCompanies.filter(c => c.jobs > 0).length ?? 0} hiring now`,
      icon: <BankOutlined />,
      tone: 'violet',
      to: '/admin/company',
    },
    {
      label: i18next.t('app:pages.admin.dashboard.users'),
      value: overview?.totalUsers ?? 0,
      note: 'Candidates & recruiters',
      icon: <TeamOutlined />,
      tone: 'green',
      to: '/admin/user',
    },
  ];

  const recentColumns: ColumnsType<IDashboardInsights['recentResumes'][number]> = [
    {
      title: i18next.t('app:pages.admin.dashboard.candidate'),
      dataIndex: 'email',
      ellipsis: true,
      render: (email: string) => <span className={s['strong']}>{email}</span>,
    },
    {
      title: i18next.t('app:pages.admin.dashboard.job'),
      ellipsis: true,
      render: (_, r) => (
        <div className={s['job-cell']}>
          <CompanyLogo
            className={s['mini-logo']}
            src={r.companyId?.logo}
            name={r.companyId?.name}
          />
          <div>
            <div className={s['strong']}>{r.jobId?.name ?? '—'}</div>
            <small>{r.companyId?.name}</small>
          </div>
        </div>
      ),
    },
    {
      title: i18next.t('app:common.status'),
      dataIndex: 'status',
      width: 130,
      render: (status: string) => {
        const meta = STATUS[status];
        return meta ? (
          <span className={s['status']} style={{ background: `${meta.color}1f` }}>
            <span style={{ color: meta.color }}>{meta.icon}</span> {meta.label}
          </span>
        ) : (
          status
        );
      },
    },
    {
      title: i18next.t('app:common.applied'),
      dataIndex: 'createdAt',
      width: 130,
      render: (date: string) => dayjs(date).locale('en').fromNow(),
    },
  ];

  if (loading && !insights) {
    return (
      <div className={s['dashboard']}>
        <Skeleton active paragraph={{ rows: 1 }} />
        <div className={s['kpi-grid']}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s['kpi']}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
        <div className={s['panel']}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={s['dashboard']}>
      {/* WELCOME */}
      <div className={s['welcome']}>
        <div>
          <h2>
            {greeting()}, {user?.name || 'there'} 👋
          </h2>
          <p>
            {dayjs().locale('en').format('dddd, D MMMM YYYY')} · {pending} application
            {pending === 1 ? '' : 's'} {i18next.t('app:pages.admin.dashboard.waiting_for_review')}
          </p>
        </div>
        <div className={s['actions']}>
          <AntTooltip title={i18next.t('app:pages.admin.dashboard.refresh_data')}>
            <Button icon={<ReloadOutlined spin={loading} />} onClick={load} aria-label='Refresh' />
          </AntTooltip>
          <Button onClick={() => navigate('/admin/resume')}>{i18next.t('app:pages.admin.dashboard.review_applications')}</Button>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/job/upsert')}
          >
            {i18next.t('app:pages.admin.dashboard.post_a_job')}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className={s['kpi-grid']}>
        {kpis.map(kpi => (
          <button key={kpi.label} className={s['kpi']} onClick={() => navigate(kpi.to)}>
            <span className={`${s['kpi-icon']} ${s[kpi.tone]}`}>{kpi.icon}</span>
            <span className={s['kpi-label']}>{kpi.label}</span>
            <span className={s['kpi-value']}>
              <CountUp end={kpi.value} separator=',' duration={1.2} />
            </span>
            <span className={s['kpi-note']}>{kpi.note}</span>
          </button>
        ))}
      </div>

      {/* ACTIVITY + PIPELINE */}
      <div className={s['grid-2-1']}>
        <Panel
          title={i18next.t('app:pages.admin.dashboard.hiring_activity')}
          subtitle={i18next.t('app:pages.admin.dashboard.jobs_posted_and_applications_received_last')}
          extra={
            <div className={s['legend']}>
              <span>
                <i style={{ background: SERIES.jobs }} /> {i18next.t('app:pages.admin.dashboard.jobs_posted')}{' '}<b>{activityTotals.jobs}</b>
              </span>
              <span>
                <i style={{ background: SERIES.resumes }} /> {i18next.t('app:pages.admin.dashboard.applications')}{' '}
                <b>{activityTotals.resumes}</b>
              </span>
            </div>
          }
        >
          <ResponsiveContainer width='100%' height={280}>
            <AreaChart data={activity} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id='fillJobs' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={SERIES.jobs} stopOpacity={0.22} />
                  <stop offset='100%' stopColor={SERIES.jobs} stopOpacity={0} />
                </linearGradient>
                <linearGradient id='fillResumes' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={SERIES.resumes} stopOpacity={0.22} />
                  <stop offset='100%' stopColor={SERIES.resumes} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey='label'
                tick={{ fill: AXIS_INK, fontSize: 12 }}
                axisLine={{ stroke: '#c3c2b7' }}
                tickLine={false}
                interval='preserveStartEnd'
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: AXIS_INK, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: AXIS_INK, strokeDasharray: '3 3' }}
              />
              <Area
                type='monotone'
                dataKey='jobs'
                name='Jobs posted'
                stroke={SERIES.jobs}
                strokeWidth={2}
                fill='url(#fillJobs)'
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type='monotone'
                dataKey='resumes'
                name='Applications'
                stroke={SERIES.resumes}
                strokeWidth={2}
                fill='url(#fillResumes)'
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={i18next.t('app:pages.admin.dashboard.application_pipeline')} subtitle={i18next.t('app:pages.admin.dashboard.applications_in_total', { v0: totalResumes })}>
          <div className={s['pipeline']}>
            {statusCounts.map(({ key, count }) => {
              const meta = STATUS[key];
              const pct = totalResumes ? Math.round((count / totalResumes) * 100) : 0;
              return (
                <div key={key} className={s['pipeline-row']}>
                  <div className={s['pipeline-head']}>
                    <span className={s['pipeline-label']} style={{ color: meta.color }}>
                      {meta.icon} <span className={s['pipeline-text']}>{meta.label}</span>
                    </span>
                    <span>
                      <b>{count}</b> <small>{pct}%</small>
                    </span>
                  </div>
                  <div className={s['meter']}>
                    <div style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
            {totalResumes === 0 && (
              <p className={s['hint']}>
                {i18next.t('app:pages.admin.dashboard.no_applications_yet_they_will_show')}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {/* DISTRIBUTIONS */}
      <div className={s['grid-3']}>
        <Panel title={i18next.t('app:pages.admin.dashboard.jobs_by_level')} subtitle={i18next.t('app:pages.admin.dashboard.seniority_of_open_roles')}>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={levels} margin={{ top: 18, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey='label'
                tick={{ fill: AXIS_INK, fontSize: 11 }}
                axisLine={{ stroke: '#c3c2b7' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: AXIS_INK, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(42,120,214,0.06)' }} />
              <Bar
                dataKey='count'
                name='Jobs'
                fill={SERIES.jobs}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                label={{ position: 'top', fill: '#52514e', fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={i18next.t('app:pages.admin.dashboard.jobs_by_city')} subtitle={i18next.t('app:pages.admin.dashboard.where_the_openings_are')}>
          <HBarChart
            height={220}
            data={(insights?.jobsByLocation ?? []).map(r => ({
              label: getLocationName(r.key),
              count: r.count,
            }))}
          />
        </Panel>

        <Panel title={i18next.t('app:pages.admin.dashboard.most_wanted_skills')} subtitle={i18next.t('app:pages.admin.dashboard.across_all_job_posts')}>
          <HBarChart
            height={220}
            data={(insights?.topSkills ?? [])
              .slice(0, 6)
              .map(r => ({ label: skillLabel(r.key), count: r.count }))}
          />
        </Panel>
      </div>

      {/* COMPANIES + EXPIRING */}
      <div className={s['grid-2']}>
        <Panel
          title={i18next.t('app:pages.admin.dashboard.top_hiring_companies')}
          subtitle={i18next.t('app:pages.admin.dashboard.by_number_of_job_posts')}
          extra={
            <Button type='link' onClick={() => navigate('/admin/company')}>
              {i18next.t('app:pages.admin.dashboard.manage')}
            </Button>
          }
        >
          <div className={s['company-list']}>
            {(insights?.topCompanies ?? []).slice(0, 6).map((c, i, arr) => (
              <div key={c.name} className={s['company-row']}>
                <span className={s['rank']}>{i + 1}</span>
                <CompanyLogo className={s['mini-logo']} src={c.logo} name={c.name} />
                <div className={s['company-info']}>
                  <div className={s['strong']}>{c.name}</div>
                  <div className={s['meter']}>
                    <div
                      style={{
                        width: `${(c.jobs / (arr[0]?.jobs || 1)) * 100}%`,
                        background: SERIES.jobs,
                      }}
                    />
                  </div>
                </div>
                <span className={s['company-count']}>
                  <b>{c.jobs}</b> {i18next.t('app:pages.admin.dashboard.jobs')}{' '}{c.openings} seats
                </span>
              </div>
            ))}
            {!insights?.topCompanies.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </div>
        </Panel>

        <Panel
          title={i18next.t('app:pages.admin.dashboard.closing_soon')}
          subtitle={i18next.t('app:pages.admin.dashboard.active_jobs_ending_in_the_next')}
          extra={
            <Button type='link' onClick={() => navigate('/admin/job')}>
              {i18next.t('app:pages.admin.dashboard.all_jobs')}
            </Button>
          }
        >
          <div className={s['company-list']}>
            {(insights?.expiringJobs ?? []).map(job => {
              const days = Math.max(0, dayjs(job.endDate).diff(dayjs(), 'day'));
              return (
                <button
                  key={job._id}
                  className={`${s['company-row']} ${s['clickable']}`}
                  onClick={() => navigate(`/admin/job/upsert?id=${job._id}`)}
                >
                  <CompanyLogo
                    className={s['mini-logo']}
                    src={job.company?.logo}
                    name={job.company?.name}
                  />
                  <div className={s['company-info']}>
                    <div className={s['strong']}>{job.name}</div>
                    <small>{job.company?.name}</small>
                  </div>
                  <span className={`${s['days']} ${days <= 3 ? s['urgent'] : ''}`}>
                    <ClockCircleFilled />{' '}
                    {days === 0 ? i18next.t('app:pages.admin.dashboard.today') : i18next.t('app:pages.admin.dashboard.day_left', { v0: days, v1: days === 1 ? '' : 's' })}
                  </span>
                </button>
              );
            })}
            {!insights?.expiringJobs.length && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18next.t('app:pages.admin.dashboard.nothing_closes_in_the_next_2')}
              />
            )}
          </div>
        </Panel>
      </div>

      {/* RECENT APPLICATIONS */}
      <Panel
        title={i18next.t('app:pages.admin.dashboard.latest_applications')}
        extra={
          <Button type='link' onClick={() => navigate('/admin/resume')}>
            {i18next.t('app:pages.admin.dashboard.view_all')}
          </Button>
        }
      >
        <Table
          rowKey='_id'
          size='middle'
          columns={recentColumns}
          dataSource={insights?.recentResumes ?? []}
          pagination={false}
          scroll={{ x: 640 }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18next.t('app:pages.admin.dashboard.no_applications_yet')} />
            ),
          }}
        />
      </Panel>
    </div>
  );
};

export default DashboardPage;
