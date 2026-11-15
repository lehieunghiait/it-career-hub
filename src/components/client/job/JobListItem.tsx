import { Link, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { ClockCircleOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SKILLS_LIST, convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import SaveJobButton from './SaveJobButton';
import { useAppSelector } from '@/redux/hooks';
import s from 'styles/job-board.module.scss';

dayjs.extend(relativeTime);

export const skillLabel = (value: string) =>
  SKILLS_LIST.find(item => item.value === value)?.label ?? value;

const HOT_SALARY = 35_000_000;

/**
 * Job card used on the home page and the IT Jobs list
 */
const JobListItem = ({ job }: { job: IJob }) => {
  const navigate = useNavigate();
  const isApplied = useAppSelector(state => !!job._id && !!state.appliedJob.byJob[job._id]);
  const isNew = dayjs().diff(dayjs(job.updatedAt), 'hour') < 48;
  const isHot = job.salary >= HOT_SALARY;
  const goToJob = () => navigate(`/job/${convertSlug(job.name)}?id=${job._id}`);

  return (
    <article
      className={s['job-item']}
      role='link'
      tabIndex={0}
      onClick={goToJob}
      onKeyDown={e => e.key === 'Enter' && goToJob()}
    >
      <CompanyLogo className={s['job-logo']} src={job.company?.logo} name={job.company?.name} />
      <div className={s['job-body']}>
        <div className={s['job-badges']}>
          {isHot && <span className={`${s['badge']} ${s['hot']}`}>HOT</span>}
          {isNew && <span className={`${s['badge']} ${s['new']}`}>NEW</span>}
          {isApplied && <span className={`${s['badge']} ${s['applied']}`}>APPLIED</span>}
        </div>
        <h3 className={s['job-title']}>{job.name}</h3>
        {job.company?._id && (
          <Link
            to={`/company/${convertSlug(job.company.name ?? '')}?id=${job.company._id}`}
            className={s['job-company']}
            onClick={e => e.stopPropagation()}
          >
            {job.company.name}
          </Link>
        )}
        <div className={s['job-salary']}>
          <DollarOutlined /> {(job.salary ?? 0).toLocaleString('en-US')} đ
        </div>
        <div className={s['job-meta']}>
          <span>
            <EnvironmentOutlined /> {getLocationName(job.location)}
          </span>
          <span>
            <ClockCircleOutlined /> {dayjs(job.updatedAt).locale('en').fromNow()}
          </span>
        </div>
        <div className={s['job-tags']}>
          <Tag className={s['level-tag']}>{job.level}</Tag>
          {job.skills?.slice(0, 3).map(skill => (
            <Tag key={skill} className={s['skill-tag']}>
              {skillLabel(skill)}
            </Tag>
          ))}
        </div>
      </div>
      <SaveJobButton jobId={job._id} className={s['job-save']} />
    </article>
  );
};

export default JobListItem;
