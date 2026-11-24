import { useState } from 'react';
import { message } from 'antd';
import { callFetchResumeFileUrl } from '@/config/api';

import i18next from 'i18next';

/**
 * Opens a CV through a short-lived presigned link (the bucket is private).
 * The tab is opened synchronously on click so popup blockers allow it, then pointed at the link.
 */
export const useOpenResume = () => {
  const [openingId, setOpeningId] = useState<string | null>(null);

  const openResume = async (resumeId?: string) => {
    if (!resumeId) return;
    const tab = window.open('', '_blank');
    setOpeningId(resumeId);
    try {
      const res = await callFetchResumeFileUrl(resumeId);
      if (res?.data?.url) {
        if (tab) tab.location.href = res.data.url;
        else window.location.href = res.data.url;
        return;
      }
      tab?.close();
      message.error(res?.message ?? i18next.t('app:hooks.useOpenResume.cannot_open_this_cv'));
    } finally {
      setOpeningId(null);
    }
  };

  return { openResume, openingId };
};
