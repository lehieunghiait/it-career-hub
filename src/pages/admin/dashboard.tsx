import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Skeleton, Table, Tooltip as AntTooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BankOutlined,
  CalendarFilled,
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

dayjs.extend(relativeTime);

// Validated categorical slots (dataviz reference palette) + chart chrome
const SERIES = { jobs: '#2a78d6', resumes: '#eb6834' };
const GRID = '#e1e0d9';
const AXIS_INK = '#898781';

// Status colors are reserved for state and always shown with an icon + label
const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: '#fab219', icon: <ClockCircleFilled /> },
  REVIEWING: { label: 'Reviewing', color: '#2a78d6', icon: <EyeFilled /> },
  INTERVIEW: { label: 'Interview', color: '#7a5cc8', icon: <CalendarFilled /> },
  APPROVED: { label: 'Approved', color: '#0ca30c', icon: <CheckCircleFilled /> },
  REJECTED: { label: 'Rejected', color: '#d03b3b', icon: <CloseCircleFilled /> },
};
const LEVEL_ORDER = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];

const skillLabel = (value: string) => SKILLS_LIST.find(i => i.value === value)?.label ?? value;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No data yet' />
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
      label: 'Active jobs',
      value: overview?.activeJobs ?? 0,
      note: `${overview?.totalJobs ?? 0} total · ${overview?.inactiveJobs ?? 0} inactive`,
      icon: <ScheduleOutlined />,
      tone: 'blue',
      to: '/admin/job',
    },
    {
      label: 'Applications',
      value: totalResumes,
      note: `${pending} waiting for review`,
      icon: <FileDoneOutlined />,
      tone: 'orange',
      to: '/admin/resume',
    },
    {
      label: 'Companies',
      value: overview?.totalCompanies ?? 0,
      note: `${insights?.topCompanies.filter(c => c.jobs > 0).length ?? 0} hiring now`,
      icon: <BankOutlined />,
      tone: 'violet',
      to: '/admin/company',
    },
    {
      label: 'Users',
      value: overview?.totalUsers ?? 0,
      note: 'Candidates & recruiters',
      icon: <TeamOutlined />,
      tone: 'green',
      to: '/admin/user',
    },
  ];

  const recentColumns: ColumnsType<IDashboardInsights['recentResumes'][number]> = [
    {
      title: 'Candidate',
      dataIndex: 'email',
      ellipsis: true,
      render: (email: string) => <span className={s['strong']}>{email}</span>,
    },
    {
      title: 'Job',
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
      title: 'Status',
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
      title: 'Applied',
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
            {pending === 1 ? '' : 's'} waiting for review
          </p>
        </div>
        <div className={s['actions']}>
          <AntTooltip title='Refresh data'>
            <Button icon={<ReloadOutlined spin={loading} />} onClick={load} aria-label='Refresh' />
          </AntTooltip>
          <Button onClick={() => navigate('/admin/resume')}>Review applications</Button>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/job/upsert')}
          >
            Post a job
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
          title='Hiring activity'
          subtitle='Jobs posted and applications received · last 30 days'
          extra={
            <div className={s['legend']}>
              <span>
                <i style={{ background: SERIES.jobs }} /> Jobs posted <b>{activityTotals.jobs}</b>
              </span>
              <span>
                <i style={{ background: SERIES.resumes }} /> Applications{' '}
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

        <Panel title='Application pipeline' subtitle={`${totalResumes} applications in total`}>
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
                No applications yet. They will show up here as candidates apply.
              </p>
            )}
          </div>
        </Panel>
      </div>

      {/* DISTRIBUTIONS */}
      <div className={s['grid-3']}>
        <Panel title='Jobs by level' subtitle='Seniority of open roles'>
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

        <Panel title='Jobs by city' subtitle='Where the openings are'>
          <HBarChart
            height={220}
            data={(insights?.jobsByLocation ?? []).map(r => ({
              label: getLocationName(r.key),
              count: r.count,
            }))}
          />
        </Panel>

        <Panel title='Most wanted skills' subtitle='Across all job posts'>
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
          title='Top hiring companies'
          subtitle='By number of job posts'
          extra={
            <Button type='link' onClick={() => navigate('/admin/company')}>
              Manage
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
                  <b>{c.jobs}</b> jobs · {c.openings} seats
                </span>
              </div>
            ))}
            {!insights?.topCompanies.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </div>
        </Panel>

        <Panel
          title='Closing soon'
          subtitle='Active jobs ending in the next 14 days'
          extra={
            <Button type='link' onClick={() => navigate('/admin/job')}>
              All jobs
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
                    {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} left`}
                  </span>
                </button>
              );
            })}
            {!insights?.expiringJobs.length && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='Nothing closes in the next 2 weeks'
              />
            )}
          </div>
        </Panel>
      </div>

      {/* RECENT APPLICATIONS */}
      <Panel
        title='Latest applications'
        extra={
          <Button type='link' onClick={() => navigate('/admin/resume')}>
            View all
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No applications yet' />
            ),
          }}
        />
      </Panel>
    </div>
  );
};

export default DashboardPage;
