import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Empty, Segmented, Skeleton, Tabs } from 'antd';
import { HeartOutlined, SendOutlined } from '@ant-design/icons';
import { useUser } from '@clerk/react';
import { callFetchResumeByUser, callFetchSavedJobs } from '@/config/api';
import { IResume, ISavedJob } from '@/types/backend';
import { isClosedStatus } from '@/config/resume-status';
import { useAppSelector } from '@/redux/hooks';
import { useOpenResume } from '@/hooks/useOpenResume';
import ApplicationCard from '@/components/client/application/ApplicationCard';
import JobListItem from '@/components/client/job/JobListItem';
import styles from 'styles/client.module.scss';
import s from 'styles/my-jobs.module.scss';
import board from 'styles/job-board.module.scss';

import i18next from 'i18next';

type AppFilter = 'all' | 'active' | 'interview' | 'closed';

const FILTERS: { label: string; value: AppFilter; match: (status: string) => boolean }[] = [
  { get label() { return i18next.t('app:pages.my_jobs.index.all'); }, value: 'all', match: () => true },
  { get label() { return i18next.t('app:pages.my_jobs.index.in_progress'); }, value: 'active', match: status => !isClosedStatus(status) },
  {
    get label() { return i18next.t('app:common.interview'); },
    value: 'interview',
    match: status => status === 'INTERVIEW' || status === 'AI_SCREENING',
  },
  { get label() { return i18next.t('app:pages.my_jobs.index.closed'); }, value: 'closed', match: isClosedStatus },
];

const ListSkeleton = () => (
  <div className={s['list']}>
    {[0, 1, 2].map(i => (
      <div key={i} className={s['app-card']}>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    ))}
  </div>
);

/**
 * Candidate area: applications with their status timeline, and saved jobs
 */
const MyJobsPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const savedIds = useAppSelector(state => state.savedJob.ids);
  const { openResume, openingId } = useOpenResume();

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [savedJobs, setSavedJobs] = useState<ISavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AppFilter>('all');
  const tab = params.get('tab') === 'saved' ? 'saved' : 'applied';

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const load = async () => {
      setIsLoading(true);
      const [resumeRes, savedRes] = await Promise.all([
        callFetchResumeByUser(),
        callFetchSavedJobs(),
      ]);
      setResumes(resumeRes?.data ?? []);
      setSavedJobs(savedRes?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, [isLoaded, isSignedIn]);

  // Unsaving from a card removes it here right away
  const visibleSaved = savedJobs.filter(item => item.job._id && savedIds.includes(item.job._id));
  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(f => [f.value, resumes.filter(r => f.match(r.status)).length])
      ) as Record<AppFilter, number>,
    [resumes]
  );
  const activeFilter = FILTERS.find(f => f.value === filter) ?? FILTERS[0];
  const filteredResumes = resumes.filter(r => activeFilter.match(r.status));

  if (isLoaded && !isSignedIn) {
    return (
      <div className={board['board']}>
        <div className={styles['container']}>
          <div className={s['guest']}>
            <Empty description={i18next.t('app:pages.my_jobs.index.sign_in_to_track_your_applications')}>
              <Button
                type='primary'
                onClick={() => navigate(`/login?callback=${encodeURIComponent('/my-jobs')}`)}
              >
                {i18next.t('app:pages.my_jobs.index.sign_in')}
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  const applied = isLoading ? (
    <ListSkeleton />
  ) : resumes.length === 0 ? (
    <div className={board['empty-box']}>
      <Empty description={i18next.t('app:pages.my_jobs.index.you_haven_t_applied_to_any')}>
        <Link to='/job'>
          <Button type='primary' icon={<SendOutlined />}>
            {i18next.t('app:pages.my_jobs.index.find_jobs')}
          </Button>
        </Link>
      </Empty>
    </div>
  ) : (
    <>
      <div className={s['filter-row']}>
        <Segmented
          value={filter}
          onChange={value => setFilter(value as AppFilter)}
          options={FILTERS.map(f => ({ label: `${f.label} (${counts[f.value]})`, value: f.value }))}
        />
      </div>
      {filteredResumes.length === 0 ? (
        <div className={board['empty-box']}>
          <Empty description={i18next.t('app:pages.my_jobs.index.no_applications_in_this_group')} />
        </div>
      ) : (
        <div className={s['list']}>
          {filteredResumes.map(resume => (
            <ApplicationCard
              key={resume._id}
              resume={resume}
              onOpenCv={openResume}
              isOpeningCv={openingId === resume._id}
            />
          ))}
        </div>
      )}
    </>
  );

  const saved = isLoading ? (
    <ListSkeleton />
  ) : visibleSaved.length === 0 ? (
    <div className={board['empty-box']}>
      <Empty description={i18next.t('app:pages.my_jobs.index.no_saved_jobs_yet_tap_the')}>
        <Link to='/job'>
          <Button type='primary' icon={<HeartOutlined />}>
            {i18next.t('app:pages.my_jobs.index.browse_jobs')}
          </Button>
        </Link>
      </Empty>
    </div>
  ) : (
    <div className={board['job-list']}>
      {visibleSaved.map(item => (
        <JobListItem key={item._id} job={item.job} />
      ))}
    </div>
  );

  return (
    <div className={board['board']}>
      <div className={styles['container']}>
        <div className={s['page-head']}>
          <h1>{i18next.t('app:pages.my_jobs.index.my_jobs')}</h1>
          <p>{i18next.t('app:pages.my_jobs.index.follow_every_application_from_submission_to')}</p>
        </div>
        <Tabs
          className={s['tabs']}
          activeKey={tab}
          onChange={key => setParams(key === 'saved' ? { tab: 'saved' } : {}, { replace: true })}
          items={[
            {
              key: 'applied',
              label: i18next.t('app:pages.my_jobs.index.applied', { v0: isLoading ? '' : ` (${resumes.length})` }),
              children: applied,
            },
            {
              key: 'saved',
              label: i18next.t('app:pages.my_jobs.index.saved', { v0: isLoading ? '' : ` (${visibleSaved.length})` }),
              children: saved,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default MyJobsPage;
