import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { callFetchCompany, callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { ICompany, IJob } from '@/types/backend';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import JobSearchBar from '@/components/client/job/JobSearchBar';
import JobListItem, { skillLabel } from '@/components/client/job/JobListItem';
import styles from 'styles/client.module.scss';
import s from 'styles/job-board.module.scss';

import i18next from 'i18next';

const CITIES = [
  { value: 'HA_NOI', tone: 'c1' },
  { value: 'HO_CHI_MINH', tone: 'c2' },
  { value: 'DA_NANG', tone: 'c3' },
];

const SectionHeader = ({ title, to, label }: { title: string; to?: string; label?: string }) => (
  <div className={s['section-head']}>
    <h2>{title}</h2>
    {to && (
      <Link to={to} className={s['see-all']}>
        {label ?? i18next.t('app:pages.home.index.view_all')} <ArrowRightOutlined />
      </Link>
    )}
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [jobRes, companyRes] = await Promise.all([
        callFetchJob('current=1&pageSize=100&sort=-updatedAt'),
        callFetchCompany('current=1&pageSize=50&sort=-updatedAt'),
      ]);
      setJobs(jobRes?.data?.result ?? []);
      setTotalJobs(jobRes?.data?.meta?.total ?? 0);
      setCompanies(companyRes?.data?.result ?? []);
      setTotalCompanies(companyRes?.data?.meta?.total ?? 0);
      setIsLoading(false);
    };
    init();
  }, []);

  const jobsByCompany = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach(
      job => job.company?._id && map.set(job.company._id, (map.get(job.company._id) ?? 0) + 1)
    );
    return map;
  }, [jobs]);

  const topCompanies = useMemo(
    () =>
      [...companies]
        .sort((a, b) => (jobsByCompany.get(b._id!) ?? 0) - (jobsByCompany.get(a._id!) ?? 0))
        .slice(0, 8),
    [companies, jobsByCompany]
  );

  const topSkills = useMemo(() => {
    const count = new Map<string, number>();
    jobs.forEach(job =>
      job.skills?.forEach(skill => count.set(skill, (count.get(skill) ?? 0) + 1))
    );
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);
  }, [jobs]);

  const jobsByCity = useMemo(() => {
    const count = new Map<string, number>();
    jobs.forEach(job => count.set(job.location, (count.get(job.location) ?? 0) + 1));
    return count;
  }, [jobs]);

  const openings = jobs.reduce((sum, job) => sum + (job.quantity || 0), 0);

  return (
    <div className={s['board']}>
      {/* HERO */}
      <section className={s['hero']}>
        <div className={s['hero-glow']} />
        <div className={styles['container']}>
          <div className={s['hero-inner']}>
            <h1>
              <span className={s['accent']}>{totalJobs || '…'}</span> {i18next.t('app:pages.home.index.it_jobs_for_developers')}
              <br />
              {i18next.t('app:pages.home.index.who_want_to_grow')}
            </h1>
            <p>{i18next.t('app:pages.home.index.real_openings_from_top_tech_companies')}</p>
            <JobSearchBar />
            {topSkills.length > 0 && (
              <div className={s['hero-chips']}>
                <span>{i18next.t('app:pages.home.index.suggestions_for_you')}</span>
                {topSkills.slice(0, 7).map(([skill]) => (
                  <Link key={skill} to={`/job?skills=${encodeURIComponent(skill)}`}>
                    {skillLabel(skill)}
                  </Link>
                ))}
              </div>
            )}
            <div className={s['hero-stats']}>
              <div>
                <b>{totalJobs}</b>
                <span>{i18next.t('app:pages.home.index.active_jobs')}</span>
              </div>
              <div>
                <b>{totalCompanies}</b>
                <span>{i18next.t('app:pages.home.index.tech_companies')}</span>
              </div>
              <div>
                <b>{openings}</b>
                <span>{i18next.t('app:pages.home.index.open_headcount')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles['container']}>
        {/* TOP EMPLOYERS */}
        <section className={s['section']}>
          <SectionHeader title={i18next.t('app:pages.home.index.top_employers')} to='/company' label={i18next.t('app:pages.home.index.all_companies')} />
          <div className={s['employer-grid']}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={s['employer-card']}>
                    <Skeleton active avatar={{ shape: 'square', size: 64 }} paragraph={false} />
                  </div>
                ))
              : topCompanies.map(company => (
                  <Link
                    key={company._id}
                    to={`/company/${convertSlug(company.name ?? '')}?id=${company._id}`}
                    className={s['employer-card']}
                  >
                    <CompanyLogo
                      className={s['employer-logo']}
                      src={company.logo}
                      name={company.name}
                    />
                    <div className={s['employer-name']}>{company.name}</div>
                    <div className={s['employer-jobs']}>
                      <span className={s['dot']} /> {jobsByCompany.get(company._id!) ?? 0} job
                      {jobsByCompany.get(company._id!) === 1 ? '' : 's'}
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        {/* LATEST JOBS */}
        <section className={s['section']}>
          <SectionHeader title={i18next.t('app:pages.home.index.latest_it_jobs')} to='/job' label={i18next.t('app:pages.home.index.all_jobs')} />
          <div className={s['job-grid']}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={s['job-item']}>
                    <Skeleton
                      active
                      avatar={{ shape: 'square', size: 72 }}
                      paragraph={{ rows: 2 }}
                    />
                  </div>
                ))
              : jobs.slice(0, 8).map(job => <JobListItem key={job._id} job={job} />)}
          </div>
          <div className={s['center']}>
            <Button size='large' className={s['outline-btn']} onClick={() => navigate('/job')}>
              {i18next.t('app:pages.home.index.browse_all')}{' '}{totalJobs} jobs <ArrowRightOutlined />
            </Button>
          </div>
        </section>

        {/* CITIES */}
        <section className={s['section']}>
          <SectionHeader title={i18next.t('app:pages.home.index.jobs_by_city')} />
          <div className={s['city-grid']}>
            {CITIES.map(city => (
              <Link
                key={city.value}
                to={`/job?location=${city.value}`}
                className={`${s['city-card']} ${s[city.tone]}`}
              >
                <EnvironmentOutlined className={s['city-icon']} />
                <div>
                  <div className={s['city-name']}>{getLocationName(city.value)}</div>
                  <div className={s['city-count']}>
                    {jobsByCity.get(city.value) ?? 0} job
                    {jobsByCity.get(city.value) === 1 ? '' : 's'}
                  </div>
                </div>
                <ArrowRightOutlined className={s['city-arrow']} />
              </Link>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        {topSkills.length > 0 && (
          <section className={s['section']}>
            <SectionHeader title={i18next.t('app:pages.home.index.popular_skills')} />
            <div className={s['skill-cloud']}>
              {topSkills.map(([skill, count]) => (
                <Link key={skill} to={`/job?skills=${encodeURIComponent(skill)}`}>
                  {skillLabel(skill)} <span>{count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className={`${s['section']} ${s['cta-grid']}`}>
          <div className={`${s['cta-card']} ${s['cta-dark']}`}>
            <FileSearchOutlined className={s['cta-icon']} />
            <h3>{i18next.t('app:pages.home.index.is_your_cv_ready_for_ats')}</h3>
            <p>{i18next.t('app:pages.home.index.score_your_cv_against_real_job')}</p>
            <Button size='large' className={s['cta-btn']} onClick={() => navigate('/ats')}>
              <RocketOutlined /> {i18next.t('app:pages.home.index.check_my_cv')}
            </Button>
          </div>
          <div className={`${s['cta-card']} ${s['cta-light']}`}>
            <TeamOutlined className={s['cta-icon']} />
            <h3>{i18next.t('app:pages.home.index.hiring_it_talent')}</h3>
            <p>{i18next.t('app:pages.home.index.post_jobs_track_applicants_and_review')}</p>
            <Button size='large' className={s['outline-btn']} onClick={() => navigate('/admin')}>
              {i18next.t('app:pages.home.index.recruiter_dashboard')}{' '}<ArrowRightOutlined />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
