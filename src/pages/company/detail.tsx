import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Empty, Skeleton, Tag, message } from 'antd';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  RightOutlined,
  ShopOutlined,
  StarFilled,
  TeamOutlined,
} from '@ant-design/icons';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IReviewSummary, callFetchCompanyById, callFetchJob } from '@/config/api';
import CompanyReviews from '@/components/client/company/CompanyReviews';
import { SKILLS_LIST, convertSlug, getLocationName } from '@/config/utils';
import { ICompanyDetail, IJob } from '@/types/backend';
import styles from 'styles/client.module.scss';
import s from 'styles/company-detail.module.scss';

import i18next from 'i18next';

dayjs.extend(relativeTime);

const skillLabel = (value: string) =>
  SKILLS_LIST.find(item => item.value === value)?.label ?? value;

const DESCRIPTION_CLAMP = 320; // keep in sync with .description.clamped max-height

const initials = (name = '') =>
  name
    .replace(/công ty|cổ phần|tnhh|co\.,?|ltd\.?/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

// Logo with a lettermark fallback when the remote image can't be loaded
const CompanyLogo = ({ src, name }: { src?: string; name?: string }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className={s['logo-box']}>
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} />
      ) : (
        <span className={s['logo-fallback']}>{initials(name)}</span>
      )}
    </div>
  );
};

const JobRow = ({ job, logo }: { job: IJob; logo?: string }) => {
  const navigate = useNavigate();
  return (
    <div
      className={s['job-row']}
      role='link'
      tabIndex={0}
      onClick={() => navigate(`/job/${convertSlug(job.name)}?id=${job._id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/job/${convertSlug(job.name)}?id=${job._id}`)}
    >
      <div className={s['job-logo']}>
        <CompanyLogo src={logo} name={job.company?.name} />
      </div>
      <div className={s['job-main']}>
        <div className={s['job-title']}>{job.name}</div>
        <div className={s['job-meta']}>
          <span className={s['salary']}>
            <DollarOutlined /> {(job.salary ?? 0).toLocaleString('en-US')} {i18next.t('app:common.d')}
          </span>
          <span>
            <EnvironmentOutlined /> {getLocationName(job.location)}
          </span>
          <span>
            <ClockCircleOutlined /> {dayjs(job.updatedAt).locale('en').fromNow()}
          </span>
        </div>
        <div className={s['job-tags']}>
          <Tag className={s['level-tag']}>{job.level}</Tag>
          {job.skills?.slice(0, 4).map(skill => (
            <Tag key={skill} className={s['skill-tag']}>
              {skillLabel(skill)}
            </Tag>
          ))}
        </div>
      </div>
      <RightOutlined className={s['job-arrow']} />
    </div>
  );
};

const DetailSkeleton = () => (
  <div className={styles['container']}>
    <div className={s['header-card']}>
      <Skeleton avatar={{ size: 112, shape: 'square' }} active paragraph={{ rows: 2 }} />
    </div>
    <div className={s['layout']}>
      <div className={s['card']}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
      <div className={s['card']}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    </div>
  </div>
);

/**
 *
 * @returns Client Company Detail Page
 */
const ClientCompanyDetailPage = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('id');

  const [company, setCompany] = useState<ICompanyDetail | null>(null);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'reviews'>('about');
  const [reviewSummary, setReviewSummary] = useState<IReviewSummary | null>(null);
  const descRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      setIsLoading(true);
      const [companyRes, jobsRes] = await Promise.all([
        callFetchCompanyById(id),
        callFetchJob(`current=1&pageSize=50&company._id=${id}&sort=-updatedAt`),
      ]);
      setCompany(companyRes?.data ?? null);
      setJobs(jobsRes?.data?.result ?? []);
      setIsLoading(false);
    };
    init();
  }, [id]);

  // Only offer "Read more" (and clamp) when the description is taller than the clamp height
  useEffect(() => {
    const el = descRef.current;
    if (el) setCanExpand(el.scrollHeight > DESCRIPTION_CLAMP + 40);
  }, [company]);

  const techStack = useMemo(() => [...new Set(jobs.flatMap(job => job.skills ?? []))], [jobs]);
  const jobLocations = useMemo(
    () => [...new Set(jobs.map(job => getLocationName(job.location)))],
    [jobs]
  );

  const scrollTo = (tab: 'about' | 'jobs' | 'reviews') => {
    setActiveTab(tab);
    document.getElementById(`company-${tab}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success(i18next.t('app:pages.company.detail.link_copied'));
    } catch {
      message.error(i18next.t('app:pages.company.detail.could_not_copy_the_link'));
    }
  };

  if (isLoading) {
    return (
      <div className={s['page']}>
        <div className={s['cover']} />
        <DetailSkeleton />
      </div>
    );
  }

  if (!company?._id) {
    return (
      <div className={styles['container']} style={{ padding: '80px 15px' }}>
        <Empty description={i18next.t('app:pages.company.detail.company_not_found')}>
          <Link to='/company'>{i18next.t('app:pages.company.detail.back_to_companies')}</Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className={s['page']}>
      <div className={s['cover']}>
        <div className={s['cover-pattern']} />
      </div>

      <div className={styles['container']}>
        {/* HEADER */}
        <div className={s['header-card']}>
          <CompanyLogo src={company.logo} name={company.name} />
          <div className={s['header-info']}>
            <nav className={s['breadcrumb']}>
              <Link to='/'>{i18next.t('app:common.home')}</Link>
              <RightOutlined />
              <Link to='/company'>{i18next.t('app:common.companies')}</Link>
            </nav>
            <h1 className={s['company-name']}>{company.name}</h1>
            <div className={s['header-meta']}>
              {company.address && (
                <span>
                  <EnvironmentOutlined /> {company.address}
                </span>
              )}
              {!!reviewSummary?.reviews.count && (
                <button className={s['rating-badge']} onClick={() => scrollTo('reviews')}>
                  <StarFilled /> {reviewSummary.reviews.rating.toFixed(1)}
                  <span>({reviewSummary.reviews.count} {i18next.t('app:pages.company.detail.reviews')}</span>
                </button>
              )}
              <span className={s['hiring-badge']}>
                <span className={s['pulse']} /> {jobs.length} {i18next.t('app:pages.company.detail.open_position')}
                {jobs.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className={s['header-actions']}>
            <Button
              type='primary'
              size='large'
              className={s['primary-btn']}
              onClick={() => scrollTo('jobs')}
            >
              {i18next.t('app:pages.company.detail.view_jobs')}{' '}<ArrowRightOutlined />
            </Button>
            {company.website && (
              <Button
                size='large'
                icon={<GlobalOutlined />}
                href={company.website}
                target='_blank'
                rel='noopener nofollow noreferrer'
              >
                {i18next.t('app:common.website')}
              </Button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className={s['tabs']}>
          <button
            className={activeTab === 'about' ? s['active'] : ''}
            onClick={() => scrollTo('about')}
          >
            {i18next.t('app:pages.company.detail.about')}
          </button>
          <button
            className={activeTab === 'jobs' ? s['active'] : ''}
            onClick={() => scrollTo('jobs')}
          >
            {i18next.t('app:pages.company.detail.jobs')}{' '}<span className={s['count']}>{jobs.length}</span>
          </button>
          <button
            className={activeTab === 'reviews' ? s['active'] : ''}
            onClick={() => scrollTo('reviews')}
          >
            {i18next.t('app:pages.company.detail.reviews_2')}{' '}<span className={s['count']}>{reviewSummary?.reviews.count ?? 0}</span>
          </button>
        </div>

        <div className={s['layout']}>
          {/* MAIN */}
          <main className={s['main']}>
            <section className={s['card']} id='company-about'>
              <h2 className={s['card-title']}>{i18next.t('app:pages.company.detail.about')}{' '}{company.name}</h2>
              <div
                ref={descRef}
                className={`${s['description']} ${canExpand && !expanded ? s['clamped'] : ''}`}
              >
                {company.description ? parse(company.description) : <p>{i18next.t('app:pages.company.detail.no_description_yet')}</p>}
              </div>
              {canExpand && (
                <button className={s['read-more']} onClick={() => setExpanded(v => !v)}>
                  {expanded ? i18next.t('app:pages.company.detail.show_less') : i18next.t('app:pages.company.detail.read_more')}
                </button>
              )}
            </section>

            {techStack.length > 0 && (
              <section className={s['card']}>
                <h2 className={s['card-title']}>{i18next.t('app:pages.company.detail.tech_stack')}</h2>
                <div className={s['stack']}>
                  {techStack.map(skill => (
                    <span key={skill} className={s['stack-item']}>
                      {skillLabel(skill)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className={s['card']} id='company-jobs'>
              <h2 className={s['card-title']}>
                {i18next.t('app:pages.company.detail.open_positions')}{' '}<span className={s['count']}>{jobs.length}</span>
              </h2>
              {jobs.length ? (
                <div className={s['job-list']}>
                  {jobs.map(job => (
                    <JobRow key={job._id} job={job} logo={company.logo} />
                  ))}
                </div>
              ) : (
                <Empty description={i18next.t('app:pages.company.detail.this_company_has_no_open_positions')} />
              )}
            </section>

            <CompanyReviews
              companyId={company._id}
              companyName={company.name ?? ''}
              onSummary={setReviewSummary}
            />
          </main>

          {/* SIDEBAR */}
          <aside className={s['sidebar']}>
            <section className={s['card']}>
              <h2 className={s['card-title']}>{i18next.t('app:pages.company.detail.general_information')}</h2>
              <ul className={s['info-list']}>
                {company.address && (
                  <li>
                    <EnvironmentOutlined />
                    <div>
                      <span className={s['info-label']}>{i18next.t('app:common.address')}</span>
                      <span>{company.address}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          company.address
                        )}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {i18next.t('app:pages.company.detail.view_on_map')}
                      </a>
                    </div>
                  </li>
                )}
                {jobLocations.length > 0 && (
                  <li>
                    <ShopOutlined />
                    <div>
                      <span className={s['info-label']}>{i18next.t('app:pages.company.detail.working_locations')}</span>
                      <span>{jobLocations.join(', ')}</span>
                    </div>
                  </li>
                )}
                <li>
                  <TeamOutlined />
                  <div>
                    <span className={s['info-label']}>{i18next.t('app:pages.company.detail.hiring_now')}</span>
                    <span>
                      {jobs.reduce((sum, job) => sum + (job.quantity || 0), 0)} {i18next.t('app:pages.company.detail.openings_across')}{' '}
                      {jobs.length} jobs
                    </span>
                  </div>
                </li>
                {company.website && (
                  <li>
                    <GlobalOutlined />
                    <div>
                      <span className={s['info-label']}>{i18next.t('app:common.website')}</span>
                      <a href={company.website} target='_blank' rel='noopener nofollow noreferrer'>
                        {company.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </div>
                  </li>
                )}
                {company.phone && (
                  <li>
                    <PhoneOutlined />
                    <div>
                      <span className={s['info-label']}>{i18next.t('app:common.phone')}</span>
                      <a href={`tel:${company.phone}`}>{company.phone}</a>
                    </div>
                  </li>
                )}
                {company.email && (
                  <li>
                    <MailOutlined />
                    <div>
                      <span className={s['info-label']}>{i18next.t('app:common.email')}</span>
                      <a href={`mailto:${company.email}`}>{company.email}</a>
                    </div>
                  </li>
                )}
              </ul>
            </section>

            <section className={`${s['card']} ${s['share-card']}`}>
              <h2 className={s['card-title']}>{i18next.t('app:pages.company.detail.share_this_company')}</h2>
              <Button block icon={<CopyOutlined />} onClick={copyLink}>
                {i18next.t('app:pages.company.detail.copy_link')}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientCompanyDetailPage;
