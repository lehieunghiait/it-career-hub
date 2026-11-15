import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useUser } from '@clerk/react';
import { callSaveJob, callUnsaveJob } from '@/config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setJobSaved } from '@/redux/slice/savedJobSlide';

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
      message.success(next ? 'Job saved' : 'Removed from saved jobs');
    } else {
      dispatch(setJobSaved({ jobId, saved: !next }));
      message.error(res?.message ?? 'Something went wrong, please try again');
    }
  };

  return { isSaved, isPending, toggle };
};
