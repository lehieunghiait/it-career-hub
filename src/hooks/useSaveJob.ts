import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useUser } from '@clerk/react';
import { callSaveJob, callUnsaveJob } from '@/config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setJobSaved } from '@/redux/slice/savedJobSlide';

import i18next from 'i18next';

/**
 * Save / unsave a job for the signed-in candidate. The heart flips right away and is rolled
 * back if the API call fails; guests are sent to the login page.
 */
export const useSaveJob = (jobId?: string) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const isSaved = useAppSelector(state => !!jobId && state.savedJob.ids.includes(jobId));
  const [isPending, setIsPending] = useState(false);

  const toggle = async () => {
    if (!jobId || isPending) return;
    if (!isSignedIn) {
      navigate(`/login?callback=${encodeURIComponent(window.location.href)}`);
      return;
    }

    const next = !isSaved;
    dispatch(setJobSaved({ jobId, saved: next }));
    setIsPending(true);
    const res = next ? await callSaveJob(jobId) : await callUnsaveJob(jobId);
    setIsPending(false);

    if (res?.data) {
      message.success(next ? i18next.t('app:hooks.useSaveJob.job_saved') : i18next.t('app:hooks.useSaveJob.removed_from_saved_jobs'));
    } else {
      dispatch(setJobSaved({ jobId, saved: !next }));
      message.error(res?.message ?? i18next.t('app:hooks.useSaveJob.something_went_wrong_please_try_again'));
    }
  };

  return { isSaved, isPending, toggle };
};
