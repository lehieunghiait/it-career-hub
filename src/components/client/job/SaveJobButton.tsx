import { Button, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useSaveJob } from '@/hooks/useSaveJob';
import s from 'styles/job-board.module.scss';

import i18next from 'i18next';

interface SaveJobButtonProps {
  jobId?: string;
  // icon: round heart on job cards; button: labelled button on the job detail page
  variant?: 'icon' | 'button';
  className?: string;
}

const SaveJobButton = ({ jobId, variant = 'icon', className }: SaveJobButtonProps) => {
  const { isSaved, isPending, toggle } = useSaveJob(jobId);
  const icon = isSaved ? <HeartFilled /> : <HeartOutlined />;

  if (variant === 'button') {
    return (
      <Button
        icon={icon}
        className={`${className ?? ''} ${isSaved ? s['save-on'] : ''}`}
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isSaved}
      >
        {isSaved ? i18next.t('app:components.client.job.SaveJobButton.saved') : i18next.t('app:components.client.job.SaveJobButton.save')}
      </Button>
    );
  }

  return (
    <Tooltip title={isSaved ? i18next.t('app:components.client.job.SaveJobButton.remove_from_saved_jobs') : i18next.t('app:components.client.job.SaveJobButton.save_job')}>
      <button
        type='button'
        className={`${s['save-btn']} ${isSaved ? s['save-on'] : ''} ${className ?? ''}`}
        aria-label={isSaved ? i18next.t('app:components.client.job.SaveJobButton.remove_from_saved_jobs') : i18next.t('app:components.client.job.SaveJobButton.save_job')}
        aria-pressed={isSaved}
        disabled={isPending}
        onClick={e => {
          // The whole card is a link to the job
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={e => e.stopPropagation()}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

export default SaveJobButton;
