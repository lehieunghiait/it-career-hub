import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Segmented, Select, Skeleton } from 'antd';
import { DollarOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { callFetchSalaryInsights, ISalaryInsights, ISalaryStats } from '@/config/api';
import { LOCATION_LIST, SKILLS_LIST, getLocationName } from '@/config/utils';
import SalaryRangeChart, { formatM } from '@/components/client/salary/SalaryRangeChart';
import styles from 'styles/client.module.scss';
import s from 'styles/salary.module.scss';

const CITY_OPTIONS = [
  { label: 'All cities', value: '' },
  ...LOCATION_LIST.filter(item => item.value !== 'ALL'),
];
const levelName = (level: string) => level.charAt(0) + level.slice(1).toLowerCase();
const skillName = (value: string) =>
  SKILLS_LIST.find(item => item.value.toUpperCase() === value)?.label ?? value;

type Breakdown = 'role' | 'skill' | 'location';

/**
 * Salary explorer built from the job postings on the platform
 */
const SalaryPage = () => {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<ISalaryInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [breakdown, setBreakdown] = useState<Breakdown>('role');

  const q = params.get('q') ?? '';
  const role = params.get('role') ?? '';
  const location = params.get('location') ?? '';

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (q) query.set('q', q);
      if (role) query.set('role', role);
      if (location) query.set('location', location);
      const res = await callFetchSalaryInsights(query.toString());
      setData(res?.data ?? null);
      setIsLoading(false);
    };
    load();
  }, [q, role, location]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // One axis for every chart so the bars can be compared across sections
  const domain = useMemo<[number, number]>(() => {
    const all = [data?.byLevel, data?.byRole, data?.bySkill, data?.byLocation]
      .flat()
      .filter(Boolean) as ISalaryStats[];
    if (!all.length) return [0, 1];
    const min = Math.min(...all.map(r => r.min));
    const max = Math.max(...all.map(r => r.max));
    const step = 5_000_000;
    return [Math.max(0, Math.floor(min / step) * step), Math.ceil(max / step) * step];
  }, [data]);

  const jobsLink = (extra: Record<string, string>) => {
    const next = new URLSearchParams(extra);
    if (location) next.set('location', location);
    if (q) next.set('q', q);
    return `/job?${next}`;
  };

  const levelRows = (data?.byLevel ?? []).map(row => ({
    ...row,
    name: levelName(row.key),
    to: jobsLink({ level: row.key }),
  }));
  const breakdownRows = {
    role: (data?.byRole ?? []).map(row => ({ ...row, name: row.label ?? row.key })),
    skill: (data?.bySkill ?? []).map(row => ({
      ...row,
      name: skillName(row.key),
      to: jobsLink({ skills: row.key }),
    })),
    location: (data?.byLocation ?? []).map(row => ({
      ...row,
      name: getLocationName(row.key),
      to: `/job?location=${row.key}`,
    })),
  }[breakdown];

  const overall = data?.overall;

  return (
    <div className={s['page']}>
      <section className={s['hero']}>
        <div className={styles['container']}>
          <span className={s['eyebrow']}>
            <DollarOutlined /> Salary explorer
          </span>
          <h1>How much do IT jobs pay in Vietnam?</h1>
          <p>
            Monthly gross salaries by position, level, skill and city, calculated from job postings
            on IT Career Hub.
          </p>
          <div className={s['filters']}>
            <Input
              size='large'
              allowClear
              prefix={<SearchOutlined />}
              placeholder='Job title or skill, e.g. Java, React…'
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value);
                if (!e.target.value) update('q', '');
              }}
              onPressEnter={() => update('q', keyword.trim())}
              className={s['filter-input']}
            />
            <Select
              size='large'
              value={role}
              onChange={value => update('role', value)}
              options={[
                { label: 'All positions', value: '' },
                ...(data?.roles ?? []).map(r => ({ label: r.label, value: r.key })),
              ]}
              className={s['filter-select']}
              popupMatchSelectWidth={false}
            />
            <Select
              size='large'
              value={location}
              onChange={value => update('location', value)}
              options={CITY_OPTIONS}
              className={s['filter-select']}
            />
          </div>
        </div>
      </section>

      <div className={styles['container']}>
        {isLoading ? (
          <div className={s['card']}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : !overall?.count ? (
          <div className={`${s['card']} ${s['no-data']}`}>
            No job posting matches this search yet. Try a broader keyword or another city.
          </div>
        ) : (
          <>
            <div className={s['kpis']}>
              <div className={s['kpi']}>
                <span>Median salary</span>
                <strong>{formatM(overall.median)}</strong>
                <small>VND / month</small>
              </div>
              <div className={s['kpi']}>
                <span>Typical range</span>
                <strong>
                  {formatM(overall.p25)} – {formatM(overall.p75)}
                </strong>
                <small>middle 50% of postings</small>
              </div>
              <div className={s['kpi']}>
                <span>Highest offer</span>
                <strong>{formatM(overall.max)}</strong>
                <small>VND / month</small>
              </div>
              <div className={s['kpi']}>
                <span>Job postings</span>
                <strong>{overall.count}</strong>
                <small>
                  {data?.lastUpdated
                    ? `updated ${dayjs(data.lastUpdated).format('DD/MM/YYYY')}`
                    : ''}
                </small>
              </div>
            </div>

            <section className={s['card']}>
              <div className={s['card-head']}>
                <div>
                  <h2>Salary by level</h2>
                  <p>Click a level to see matching jobs.</p>
                </div>
                <Legend />
              </div>
              <SalaryRangeChart rows={levelRows} domain={domain} />
            </section>

            <section className={s['card']}>
              <div className={s['card-head']}>
                <div>
                  <h2>
                    Salary by{' '}
                    {breakdown === 'role' ? 'position' : breakdown === 'skill' ? 'skill' : 'city'}
                  </h2>
                  <p>
                    Sorted by median salary
                    {breakdown === 'skill' ? ', skills with at least 2 postings' : ''}.
                  </p>
                </div>
                <Segmented
                  value={breakdown}
                  onChange={value => setBreakdown(value as Breakdown)}
                  options={[
                    { label: 'Position', value: 'role' },
                    { label: 'Skill', value: 'skill' },
                    { label: 'City', value: 'location' },
                  ]}
                />
              </div>
              <SalaryRangeChart rows={breakdownRows} domain={domain} />
            </section>

            <p className={s['method']}>
              <InfoCircleOutlined /> Figures come from the salary shown on each job posting (monthly
              gross, VND), not from individual payslips. Groups with fewer than 3 postings are
              marked as limited data.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Legend = () => (
  <div className={s['legend']} aria-label='Legend'>
    <span>
      <i className={s['legend-whisker']} /> Full range
    </span>
    <span>
      <i className={s['legend-box']} /> Typical (P25–P75)
    </span>
    <span>
      <i className={s['legend-median']} /> Median
    </span>
  </div>
);

export default SalaryPage;
