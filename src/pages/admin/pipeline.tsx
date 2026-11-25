import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Empty,
  Input,
  Modal,
  Radio,
  Rate,
  Select,
  Skeleton,
  Typography,
  message,
} from 'antd';
import { MessageOutlined, MoreOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  AiInterviewLanguage,
  IPipelineItem,
  IPipelineJob,
  callFetchPipeline,
  callInviteAiInterview,
  callUpdateResumeStatus,
} from '@/config/api';
import { PIPELINE_STAGES, stageOf } from '@/config/pipeline';
import { nonAccentVietnamese } from '@/config/utils';
import PipelineDrawer from '@/components/admin/resume/pipeline.drawer';
import s from '@/styles/pipeline.module.scss';

import i18next from 'i18next';

dayjs.extend(relativeTime);

interface IPendingMove {
  item: IPipelineItem;
  status: string;
}

const PipelinePage = () => {
  const [items, setItems] = useState<IPipelineItem[]>([]);
  const [jobs, setJobs] = useState<IPipelineJob[]>([]);
  const [jobId, setJobId] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<IPendingMove | null>(null);
  const [moveMessage, setMoveMessage] = useState('');
  const [interviewLanguage, setInterviewLanguage] = useState<AiInterviewLanguage>('vi');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await callFetchPipeline(jobId);
    if (res?.data) {
      setItems(res.data.items);
      setJobs(res.data.jobs);
    } else {
      message.error(res?.message ?? i18next.t('app:pages.admin.pipeline.cannot_load_the_pipeline'));
    }
    setIsLoading(false);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const patchItem = (id: string, patch: Partial<IPipelineItem>) =>
    setItems(list => list.map(item => (item._id === id ? { ...item, ...patch } : item)));

  const commitMove = async (item: IPipelineItem, status: string, note?: string) => {
    const previous = { status: item.status, updatedAt: item.updatedAt };
    patchItem(item._id, { status, updatedAt: new Date().toISOString() });
    if (stageOf(status).aiInvite) {
      const res = await callInviteAiInterview(item._id, { language: interviewLanguage, note });
      if (res?.data) {
        const { inviteUrl } = res.data;
        // The link is only shown once (the server keeps a hash), so offer it for manual sharing
        Modal.success({
          title: i18next.t('app:pages.admin.pipeline.ai_interview_invite_sent_to', { v0: item.candidateName }),
          width: 520,
          content: (
            <>
              <p className={s['modal-help']}>
                {i18next.t('app:pages.admin.pipeline.the_candidate_received_the_link_by')}
              </p>
              <Typography.Paragraph copyable={{ text: inviteUrl }} ellipsis>
                {inviteUrl}
              </Typography.Paragraph>
            </>
          ),
        });
      } else {
        patchItem(item._id, previous);
        message.error(res?.message ?? i18next.t('app:pages.admin.pipeline.cannot_send_the_ai_interview_invite'));
      }
      return;
    }
    const res = await callUpdateResumeStatus(item._id, status, note);
    if (res?.data) {
      message.success(i18next.t('app:pages.admin.pipeline.moved_to', { v0: item.candidateName, v1: stageOf(status).title }));
    } else {
      patchItem(item._id, previous);
      message.error(res?.message ?? i18next.t('app:pages.admin.pipeline.cannot_move_this_candidate'));
    }
  };

  // Stages that change the outcome ask for an optional message for the candidate email
  const requestMove = (item: IPipelineItem, status: string) => {
    if (item.status === status) return;
    if (stageOf(status).askMessage) {
      setMoveMessage('');
      setPendingMove({ item, status });
    } else {
      commitMove(item, status);
    }
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    commitMove(pendingMove.item, pendingMove.status, moveMessage.trim() || undefined);
    setPendingMove(null);
  };

  const visible = useMemo(() => {
    const term = nonAccentVietnamese(keyword.trim()).toLowerCase();
    if (!term) return items;
    return items.filter(item =>
      nonAccentVietnamese(`${item.candidateName} ${item.email}`).toLowerCase().includes(term)
    );
  }, [items, keyword]);

  const columns = useMemo(
    () =>
      PIPELINE_STAGES.map(stage => ({
        ...stage,
        items: visible
          .filter(item => stageOf(item.status).status === stage.status)
          .sort(
            (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.updatedAt.localeCompare(a.updatedAt)
          ),
      })),
    [visible]
  );

  const selected = items.find(item => item._id === selectedId) ?? null;
  const total = jobs.reduce((sum, job) => sum + job.count, 0);

  // The id comes from the drag event itself so a stale drag state can never move a card
  const onDrop = (status: string, id: string) => {
    const item = id ? items.find(entry => entry._id === id) : undefined;
    setDraggingId(null);
    setOverStage(null);
    if (item) requestMove(item, status);
  };

  return (
    <div className={s['page']}>
      <div className={s['toolbar']}>
        <div className={s['heading']}>
          <h1>{i18next.t('app:pages.admin.pipeline.candidate_pipeline')}</h1>
          <p>{i18next.t('app:pages.admin.pipeline.drag_a_card_to_change_its')}</p>
        </div>
        <div className={s['filters']}>
          <Select
            allowClear
            showSearch
            optionFilterProp='label'
            placeholder={i18next.t('app:pages.admin.pipeline.all_jobs', { v0: total })}
            value={jobId}
            onChange={setJobId}
            className={s['job-select']}
            aria-label='Filter by job'
            options={jobs.map(job => ({
              value: job._id,
              label: `${job.name} (${job.count})`,
            }))}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={i18next.t('app:pages.admin.pipeline.search_candidate')}
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            className={s['search']}
            aria-label='Search candidate'
          />
          <Button icon={<ReloadOutlined />} onClick={load} aria-label='Reload' />
        </div>
      </div>

      <div className={s['board']}>
        {columns.map(column => (
          <section
            key={column.status}
            className={`${s['column']} ${overStage === column.status ? s['over'] : ''}`}
            aria-label={i18next.t('app:pages.admin.pipeline.column', { v0: column.title })}
            onDragOver={event => {
              if (!draggingId) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (overStage !== column.status) setOverStage(column.status);
            }}
            onDragLeave={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setOverStage(null);
            }}
            onDrop={event => {
              event.preventDefault();
              onDrop(column.status, event.dataTransfer.getData('text/plain'));
            }}
          >
            <header className={s['column-head']}>
              <i style={{ background: column.color }} />
              <h2>{column.title}</h2>
              <span>{column.items.length}</span>
            </header>

            <div className={s['column-body']}>
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              ) : column.items.length ? (
                column.items.map(item => (
                  <article
                    key={item._id}
                    className={`${s['card']} ${draggingId === item._id ? s['dragging'] : ''}`}
                    draggable
                    tabIndex={0}
                    onDragStart={event => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', item._id);
                      setDraggingId(item._id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStage(null);
                    }}
                    onClick={() => setSelectedId(item._id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') setSelectedId(item._id);
                    }}
                  >
                    <div className={s['card-top']}>
                      <h3 title={item.candidateName}>{item.candidateName}</h3>
                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: PIPELINE_STAGES.filter(
                            stage => stage.status !== column.status
                          ).map(stage => ({ key: stage.status, label: i18next.t('app:pages.admin.pipeline.move_to', { v0: stage.title }) })),
                          onClick: ({ key, domEvent }) => {
                            domEvent.stopPropagation();
                            requestMove(item, key);
                          },
                        }}
                      >
                        <Button
                          type='text'
                          size='small'
                          icon={<MoreOutlined />}
                          aria-label='Move candidate'
                          onClick={event => event.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                    <p className={s['card-email']}>{item.email}</p>
                    {!jobId && item.jobId?.name && (
                      <p className={s['card-job']} title={item.jobId.name}>
                        {item.jobId.name}
                      </p>
                    )}
                    <div className={s['card-foot']}>
                      {item.rating ? (
                        <Rate disabled value={item.rating} className={s['card-rate']} />
                      ) : (
                        <span className={s['muted']}>{i18next.t('app:pages.admin.pipeline.not_scored')}</span>
                      )}
                      <span className={s['card-meta']}>
                        {!!item.notesCount && (
                          <span title={i18next.t('app:pages.admin.pipeline.notes', { v0: item.notesCount })}>
                            <MessageOutlined /> {item.notesCount}
                          </span>
                        )}
                        <span title={i18next.t('app:pages.admin.pipeline.applied', { v0: dayjs(item.createdAt).format('DD/MM/YYYY') })}>
                          {dayjs(item.createdAt).locale('en').fromNow(true)}
                        </span>
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className={s['column-empty']}>
                  {keyword ? i18next.t('app:pages.admin.pipeline.no_match') : i18next.t('app:pages.admin.pipeline.drop_candidates_here')}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {!isLoading && !items.length && (
        <Empty className={s['empty']} description={i18next.t('app:pages.admin.pipeline.no_applications_yet')} />
      )}

      <Modal
        open={!!pendingMove}
        title={
          pendingMove &&
          `Move ${pendingMove.item.candidateName} to ${stageOf(pendingMove.status).title}?`
        }
        okText={
          pendingMove && stageOf(pendingMove.status).aiInvite ? i18next.t('app:pages.admin.pipeline.send_invite') : i18next.t('app:pages.admin.pipeline.move_and_notify')
        }
        okButtonProps={{ danger: pendingMove?.status === 'REJECTED' }}
        onOk={confirmMove}
        onCancel={() => setPendingMove(null)}
        destroyOnClose
      >
        {pendingMove && stageOf(pendingMove.status).aiInvite ? (
          <>
            <p className={s['modal-help']}>
              {i18next.t('app:pages.admin.pipeline.the_candidate_gets_a_one_time')}
            </p>
            <div className={s['modal-field']}>
              <span>{i18next.t('app:pages.admin.pipeline.interview_language')}</span>
              <Radio.Group
                value={interviewLanguage}
                onChange={event => setInterviewLanguage(event.target.value)}
                optionType='button'
                options={[
                  { label: i18next.t('app:pages.admin.pipeline.tieng_viet'), value: 'vi' },
                  { label: i18next.t('app:pages.admin.pipeline.english'), value: 'en' },
                ]}
              />
            </div>
          </>
        ) : (
          <p className={s['modal-help']}>
            {i18next.t('app:pages.admin.pipeline.the_candidate_gets_an_email_about')}
          </p>
        )}
        <Input.TextArea
          autoFocus
          value={moveMessage}
          onChange={event => setMoveMessage(event.target.value)}
          placeholder={pendingMove ? stageOf(pendingMove.status).askMessage : ''}
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={500}
          showCount
        />
      </Modal>

      <PipelineDrawer
        item={selected}
        onClose={() => setSelectedId(null)}
        onMove={requestMove}
        onChange={patchItem}
      />
    </div>
  );
};

export default PipelinePage;
