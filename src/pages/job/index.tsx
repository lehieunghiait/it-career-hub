import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Drawer,
  Empty,
  InputNumber,
  Pagination,
  Radio,
  Select,
  Skeleton,
} from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { callFetchJob } from '@/config/api';
import { SKILLS_LIST, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { useIsMobile } from '@/hooks/useIsMobile';
import JobSearchBar from '@/components/client/job/JobSearchBar';
import JobListItem from '@/components/client/job/JobListItem';
import styles from 'styles/client.module.scss';
import s from 'styles/job-board.module.scss';

import i18next from 'i18next';

const PAGE_SIZE = 10;
const LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];
const CITIES = ['', 'HA_NOI', 'HO_CHI_MINH', 'DA_NANG'];
const MILLION = 1_000_000;
// Ranges in million VND: [min, max], empty = open-ended
const SALARY_RANGES: { label: string; min?: number; max?: number }[] = [
  { get label() { return i18next.t('app:pages.job.index.any_salary'); } },
  { get label() { return i18next.t('app:pages.job.index.under_10m'); }, max: 10 },
  { get label() { return i18next.t('app:pages.job.index.t_10m_20m'); }, min: 10, max: 20 },
  { get label() { return i18next.t('app:pages.job.index.t_20m_30m'); }, min: 20, max: 30 },
  { get label() { return i18next.t('app:pages.job.index.t_30m_50m'); }, min: 30, max: 50 },
  { get label() { return i18next.t('app:pages.job.index.over_50m'); }, min: 50 },
];
const rangeKey = (min?: number, max?: number) => `${min ?? ''}-${max ?? ''}`;

const formatMillions = (value: number) => `${value / MILLION}M`;
const SORTS = [
  { get label() { return i18next.t('app:pages.job.index.newest'); }, value: '-updatedAt' },
  { get label() { return i18next.t('app:pages.job.index.salary_high_to_low'); }, value: '-salary' },
  { get label() { return i18next.t('app:pages.job.index.salary_low_to_high'); }, value: 'salary' },
];

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// URL params -> api-query-params query understood by GET /jobs
const buildQuery = (params: URLSearchParams) => {
  const query = new URLSearchParams();
  query.set('current', params.get('page') || '1');
  query.set('pageSize', String(PAGE_SIZE));
  query.set('sort', params.get('sort') || '-updatedAt');
  const q = params.get('q');
  if (q) query.set('name', `/${escapeRegex(q)}/i`);
  ['location', 'level', 'skills'].forEach(key => {
    const value = params.get(key);
    if (value) query.set(key, value);
  });
  let result = query.toString();
  const salaryMin = params.get('salary');
  const salaryMax = params.get('salaryMax');
  if (salaryMin) result += `&salary>=${salaryMin}`;
  if (salaryMax) result += `&salary<=${salaryMax}`;
  return result;
};

const ClientJobPage = () => {
  const [params, setParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      const res = await callFetchJob(buildQuery(params));
      setJobs(res?.data?.result ?? []);
      setTotal(res?.data?.meta?.total ?? 0);
      setIsLoading(false);
    };
    fetchJobs();
  }, [params]);

  // Any filter change resets to page 1
  const update = (key: string, value?: string) => updateMany({ [key]: value });

  const updateMany = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in values)) next.delete('page');
    setParams(next);
  };

  // Salary range lives in the URL as VND: salary (min) and salaryMax
  const salaryMin = Number(params.get('salary')) || undefined;
  const salaryMax = Number(params.get('salaryMax')) || undefined;
  const [customMin, setCustomMin] = useState<number | null>(null);
  const [customMax, setCustomMax] = useState<number | null>(null);

  useEffect(() => {
    setCustomMin(salaryMin ? salaryMin / MILLION : null);
    setCustomMax(salaryMax ? salaryMax / MILLION : null);
  }, [salaryMin, salaryMax]);

  const setSalaryRange = (min?: number | null, max?: number | null) =>
    updateMany({
      salary: min ? String(min * MILLION) : undefined,
      salaryMax: max ? String(max * MILLION) : undefined,
    });

  const currentRangeKey = rangeKey(
    salaryMin ? salaryMin / MILLION : undefined,
    salaryMax ? salaryMax / MILLION : undefined
  );
  const isPresetRange = SALARY_RANGES.some(r => rangeKey(r.min, r.max) === currentRangeKey);
  const customInvalid = !!customMin && !!customMax && customMin > customMax;

  const levels = params.get('level')?.split(',').filter(Boolean) ?? [];
  const skills = params.get('skills')?.split(',').filter(Boolean) ?? [];
  const activeCount =
    ['level', 'location', 'skills'].filter(k => params.get(k)).length +
    (salaryMin || salaryMax ? 1 : 0);

  const filters = (
    <div className={s['filters']}>
      <div className={s['filter-head']}>
        <h3>{i18next.t('app:pages.job.index.filters')}</h3>
        {activeCount > 0 && (
          <button
            className={s['clear-btn']}
            onClick={() => {
              const next = new URLSearchParams();
              if (params.get('q')) next.set('q', params.get('q')!);
              setParams(next);
            }}
          >
            {i18next.t('app:pages.job.index.clear_all')}
          </button>
        )}
      </div>

      <div className={s['filter-group']}>
        <h4>{i18next.t('app:common.level')}</h4>
        <Checkbox.Group
          value={levels}
          onChange={values => update('level', (values as string[]).join(','))}
          options={LEVELS.map(level => ({ label: level, value: level }))}
          className={s['check-list']}
        />
      </div>

      <div className={s['filter-group']}>
        <h4>{i18next.t('app:pages.job.index.city')}</h4>
        <Radio.Group
          value={params.get('location') ?? ''}
          onChange={e => update('location', e.target.value)}
          className={s['check-list']}
        >
          {CITIES.map(city => (
            <Radio key={city} value={city}>
              {city ? getLocationName(city) : i18next.t('app:common.all_cities')}
            </Radio>
          ))}
        </Radio.Group>
      </div>

      <div className={s['filter-group']}>
        <h4>{i18next.t('app:pages.job.index.salary_vnd_month')}</h4>
        <Radio.Group
          value={isPresetRange ? currentRangeKey : 'custom'}
          onChange={e => {
            const range = SALARY_RANGES.find(r => rangeKey(r.min, r.max) === e.target.value);
            if (range) setSalaryRange(range.min, range.max);
          }}
          className={s['check-list']}
        >
          {SALARY_RANGES.map(range => (
            <Radio key={range.label} value={rangeKey(range.min, range.max)}>
              {range.label}
            </Radio>
          ))}
          {!isPresetRange && (
            <Radio value='custom'>
              {salaryMin ? formatMillions(salaryMin) : '0'} –{' '}
              {salaryMax ? formatMillions(salaryMax) : i18next.t('app:pages.job.index.no_limit')}
            </Radio>
          )}
        </Radio.Group>

        <div className={s['salary-custom']}>
          <InputNumber
            min={0}
            max={1000}
            value={customMin}
            onChange={setCustomMin}
            placeholder={i18next.t('app:pages.job.index.min')}
            suffix='M'
            controls={false}
          />
          <span>–</span>
          <InputNumber
            min={0}
            max={1000}
            value={customMax}
            onChange={setCustomMax}
            placeholder={i18next.t('app:pages.job.index.max')}
            suffix='M'
            controls={false}
            status={customInvalid ? 'error' : undefined}
          />
          <Button
            type='primary'
            ghost
            disabled={customInvalid || (!customMin && !customMax)}
            onClick={() => setSalaryRange(customMin, customMax)}
          >
            {i18next.t('app:pages.job.index.apply')}
          </Button>
        </div>
        {customInvalid && <div className={s['salary-error']}>{i18next.t('app:pages.job.index.min_must_be_lower_than_max')}</div>}
      </div>

      <div className={s['filter-group']}>
        <h4>{i18next.t('app:common.skills')}</h4>
        <Select
          mode='multiple'
          allowClear
          value={skills}
          onChange={(values: string[]) => update('skills', values.join(','))}
          options={SKILLS_LIST}
          optionFilterProp='label'
          placeholder={i18next.t('app:pages.job.index.e_g_java_react_js')}
          style={{ width: '100%' }}
          maxTagCount='responsive'
        />
      </div>
    </div>
  );

  return (
    <div className={s['board']}>
      <section className={`${s['hero']} ${s['hero-compact']}`}>
        <div className={s['hero-glow']} />
        <div className={styles['container']}>
          <div className={s['hero-inner']}>
            {/* key remounts the bar so it picks up keyword/city changes from the URL */}
            <JobSearchBar
              key={`${params.get('q')}|${params.get('location')}`}
              defaultKeyword={params.get('q') ?? ''}
              defaultLocation={params.get('location') ?? ''}
            />
          </div>
        </div>
      </section>

      <div className={styles['container']}>
        <div className={s['list-layout']}>
          {isMobile ? (
            <Drawer
              title={i18next.t('app:pages.job.index.filters')}
              placement='left'
              open={openFilters}
              onClose={() => setOpenFilters(false)}
              width={320}
            >
              {filters}
            </Drawer>
          ) : (
            <aside className={s['filters-card']}>{filters}</aside>
          )}

          <main className={s['results']}>
            <div className={s['results-head']}>
              <h1>
                {total} {i18next.t('app:pages.job.index.it_job')}{total === 1 ? '' : 's'}
                {params.get('q') && <span> {i18next.t('app:pages.job.index.for')}{params.get('q')}”</span>}
              </h1>
              <div className={s['results-tools']}>
                {isMobile && (
                  <Button icon={<FilterOutlined />} onClick={() => setOpenFilters(true)}>
                    {i18next.t('app:pages.job.index.filters')}{activeCount ? ` (${activeCount})` : ''}
                  </Button>
                )}
                <Select
                  value={params.get('sort') ?? '-updatedAt'}
                  onChange={value => update('sort', value)}
                  options={SORTS}
                  style={{ width: 190 }}
                />
              </div>
            </div>

            <div className={s['job-list']}>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={s['job-item']}>
                    <Skeleton
                      active
                      avatar={{ shape: 'square', size: 72 }}
                      paragraph={{ rows: 2 }}
                    />
                  </div>
                ))
              ) : jobs.length ? (
                jobs.map(job => <JobListItem key={job._id} job={job} />)
              ) : (
                <div className={s['empty-box']}>
                  <Empty description={i18next.t('app:pages.job.index.no_jobs_match_your_filters')} />
                </div>
              )}
            </div>

            {total > PAGE_SIZE && (
              <div className={s['center']}>
                <Pagination
                  current={Number(params.get('page') || 1)}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showSizeChanger={false}
                  onChange={page => {
                    update('page', String(page));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClientJobPage;
