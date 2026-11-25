import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Checkbox, Result, Skeleton } from 'antd';
import { AudioOutlined, CheckCircleFilled, PhoneOutlined } from '@ant-design/icons';
import { useUser } from '@clerk/react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import dayjs from 'dayjs';
import {
  IAiInterviewInvite,
  callBindAiInterviewConversation,
  callFetchAiInterviewInvite,
  callStartAiInterview,
} from '@/config/api';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import styles from 'styles/client.module.scss';
import s from 'styles/interview.module.scss';

import i18next from 'i18next';

type Phase = 'intro' | 'connecting' | 'live' | 'ended' | 'dropped';

const formatClock = (secs: number) =>
  `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

/**
 * Voice interview with the ElevenLabs agent. The backend hands out a signed URL per attempt,
 * the transcript reaches the recruiter through the post-call webhook.
 */
const InterviewRoom = ({ token, invite }: { token: string; invite: IAiInterviewInvite }) => {
  const conversation = useConversation();
  const [phase, setPhase] = useState<Phase>('intro');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(invite.attemptsLeft);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number>(0);
  // Set when the server refuses the call, so the hang-up is not shown as a finished interview
  const rejected = useRef(false);
  const vi = invite.language === 'vi';
  const limitSecs = invite.durationMinutes * 60;

  const start = useCallback(async () => {
    setError('');
    rejected.current = false;
    setPhase('connecting');
    try {
      // Ask for the microphone first so a blocked permission does not use up an attempt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch {
      setPhase('intro');
      setError(
        vi
          ? i18next.t('app:pages.interview.index.khong_truy_cap_duoc_micro_hay')
          : i18next.t('app:pages.interview.index.microphone_access_was_blocked_allow_the')
      );
      return;
    }

    const res = await callStartAiInterview(token);
    if (!res?.data) {
      setPhase('intro');
      setError(res?.message ?? i18next.t('app:pages.interview.index.cannot_start_the_interview'));
      return;
    }
    setAttemptsLeft(res.data.attemptsLeft);

    conversation.startSession({
      signedUrl: res.data.signedUrl,
      dynamicVariables: res.data.dynamicVariables,
      onConnect: async ({ conversationId }) => {
        startedAt.current = Date.now();
        setElapsed(0);
        setPhase('live');
        // The attempt is counted here, once the call is really connected
        const bind = await callBindAiInterviewConversation(token, conversationId);
        if (bind?.data) {
          setAttemptsLeft(bind.data.attemptsLeft);
        } else {
          rejected.current = true;
          setError(bind?.message ?? i18next.t('app:pages.interview.index.cannot_start_the_interview'));
          conversation.endSession();
        }
      },
      onDisconnect: details => {
        if (rejected.current) {
          setPhase('intro');
          return;
        }
        // Ended by the agent or the candidate counts as finished, an error lets them retry
        setPhase(details.reason === 'error' ? 'dropped' : 'ended');
      },
      onError: errorMessage => {
        setError(errorMessage);
      },
    });
  }, [conversation, token, vi]);

  // Clock, and a hard stop shortly after the planned duration
  useEffect(() => {
    if (phase !== 'live') return;
    const timer = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(secs);
      if (secs >= limitSecs + 120) conversation.endSession();
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, limitSecs, conversation]);

  // Leaving the page would cut the call
  useEffect(() => {
    if (phase !== 'live') return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);

  if (phase === 'ended') {
    return (
      <Result
        icon={<CheckCircleFilled className={s['done-icon']} />}
        title={
          vi ? i18next.t('app:pages.interview.index.cam_on_ban_da_hoan_thanh') : i18next.t('app:pages.interview.index.thank_you_for_completing_the_interview')
        }
        subTitle={
          vi
            ? i18next.t('app:pages.interview.index.nha_tuyen_dung_se_xem_lai')
            : i18next.t('app:pages.interview.index.the_recruiter_will_review_the_conversation')
        }
        extra={
          <Button type='primary' href='/my-jobs'>
            {vi ? i18next.t('app:pages.interview.index.theo_doi_ho_so') : i18next.t('app:pages.interview.index.track_your_application')}
          </Button>
        }
      />
    );
  }

  if (phase === 'live' || phase === 'connecting') {
    const speaking = conversation.isSpeaking;
    return (
      <div className={s['room']}>
        <div
          className={`${s['orb']} ${phase === 'live' ? (speaking ? s['speaking'] : s['listening']) : ''}`}
          aria-hidden
        >
          <AudioOutlined />
        </div>
        <p className={s['room-state']} aria-live='polite'>
          {phase === 'connecting'
            ? vi
              ? i18next.t('app:pages.interview.index.dang_ket_noi')
              : i18next.t('app:pages.interview.index.connecting')
            : speaking
              ? vi
                ? i18next.t('app:pages.interview.index.ai_dang_noi')
                : i18next.t('app:pages.interview.index.the_ai_interviewer_is_speaking')
              : vi
                ? i18next.t('app:pages.interview.index.dang_nghe_ban')
                : i18next.t('app:pages.interview.index.listening')}
        </p>
        {phase === 'live' && (
          <p className={s['clock']}>
            {formatClock(elapsed)} <span>/ ~{formatClock(limitSecs)}</span>
          </p>
        )}
        <Button
          danger
          size='large'
          icon={<PhoneOutlined rotate={225} />}
          disabled={phase !== 'live'}
          onClick={() => conversation.endSession()}
        >
          {vi ? i18next.t('app:pages.interview.index.ket_thuc_phong_van') : i18next.t('app:pages.interview.index.end_interview')}
        </Button>
      </div>
    );
  }

  const job = invite.job;
  return (
    <div className={s['intro']}>
      {job && (
        <div className={s['job']}>
          <CompanyLogo className={s['logo']} src={job.companyLogo} name={job.companyName} />
          <div>
            <h1>{job.name}</h1>
            <p>
              {job.companyName}
              {job.level && ` · ${job.level}`}
            </p>
          </div>
        </div>
      )}

      {phase === 'dropped' && (
        <Alert
          type='warning'
          showIcon
          message={vi ? i18next.t('app:pages.interview.index.cuoc_goi_bi_gian_doan') : i18next.t('app:pages.interview.index.the_call_was_interrupted')}
          description={
            attemptsLeft > 0
              ? vi
                ? i18next.t('app:pages.interview.index.ban_co_the_bat_dau_lai', { v0: attemptsLeft })
                : i18next.t('app:pages.interview.index.you_can_start_again_attempt_left', { v0: attemptsLeft })
              : vi
                ? i18next.t('app:pages.interview.index.ban_da_dung_het_luot_nha')
                : i18next.t('app:pages.interview.index.no_attempts_left_the_recruiter_still')
          }
        />
      )}

      <h2>{vi ? i18next.t('app:pages.interview.index.vong_phong_van_so_loai_voi') : i18next.t('app:pages.interview.index.ai_screening_interview')}</h2>
      <ul className={s['rules']}>
        <li>
          {vi
            ? i18next.t('app:pages.interview.index.khoang_phut_tro_chuyen_bang_giong', { v0: invite.durationMinutes })
            : i18next.t('app:pages.interview.index.about_minutes_a_voice_conversation_with', { v0: invite.durationMinutes })}
        </li>
        <li>
          {vi
            ? i18next.t('app:pages.interview.index.hay_ngoi_o_noi_yen_tinh')
            : i18next.t('app:pages.interview.index.find_a_quiet_place_use_headphones')}
        </li>
        <li>
          {vi
            ? i18next.t('app:pages.interview.index.neu_mat_ket_noi_ban_co', { v0: attemptsLeft })
            : i18next.t('app:pages.interview.index.if_the_connection_drops_you_can', { v0: attemptsLeft })}
        </li>
        <li>
          {vi
            ? i18next.t('app:pages.interview.index.link_het_han_luc', { v0: dayjs(invite.expiresAt).format('HH:mm DD/MM/YYYY') })
            : i18next.t('app:pages.interview.index.the_link_expires_at', { v0: dayjs(invite.expiresAt).format('HH:mm DD/MM/YYYY') })}
        </li>
      </ul>

      <Checkbox
        checked={consent}
        onChange={event => setConsent(event.target.checked)}
        className={s['consent']}
      >
        {vi
          ? i18next.t('app:pages.interview.index.toi_dong_y_cho_ghi_am')
          : i18next.t('app:pages.interview.index.i_agree_that_the_interview_is')}
      </Checkbox>

      {error && <Alert type='error' showIcon message={error} className={s['error']} />}

      <Button
        type='primary'
        size='large'
        icon={<AudioOutlined />}
        disabled={!consent || attemptsLeft <= 0}
        onClick={start}
      >
        {vi ? i18next.t('app:pages.interview.index.bat_dau_phong_van') : i18next.t('app:pages.interview.index.start_the_interview')}
      </Button>
    </div>
  );
};

const InterviewPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const [invite, setInvite] = useState<IAiInterviewInvite | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const load = async () => {
      const res = await callFetchAiInterviewInvite(token);
      if (res?.data) setInvite(res.data);
      else setLoadError(res?.message ?? i18next.t('app:pages.interview.index.interview_link_is_not_valid'));
    };
    load();
  }, [isLoaded, isSignedIn, token]);

  let content: React.ReactNode;
  if (isLoaded && !isSignedIn) {
    content = (
      <Result
        status='info'
        title={i18next.t('app:pages.interview.index.sign_in_to_start_your_interview')}
        subTitle={i18next.t('app:pages.interview.index.use_the_account_you_applied_with')}
        extra={
          <Button
            type='primary'
            onClick={() => navigate(`/login?callback=${encodeURIComponent(`/interview/${token}`)}`)}
          >
            {i18next.t('app:pages.interview.index.sign_in')}
          </Button>
        }
      />
    );
  } else if (loadError) {
    content = <Result status='warning' title={loadError} />;
  } else if (!invite) {
    content = <Skeleton active avatar paragraph={{ rows: 6 }} />;
  } else if (invite.status === 'COMPLETED') {
    content = (
      <Result
        status='success'
        title={i18next.t('app:pages.interview.index.you_already_completed_this_interview')}
        subTitle={i18next.t('app:pages.interview.index.the_recruiter_will_contact_you_by')}
      />
    );
  } else {
    content = (
      <ConversationProvider>
        <InterviewRoom token={token} invite={invite} />
      </ConversationProvider>
    );
  }

  return (
    <div className={styles['container']}>
      <div className={s['page']}>{content}</div>
    </div>
  );
};

export default InterviewPage;
