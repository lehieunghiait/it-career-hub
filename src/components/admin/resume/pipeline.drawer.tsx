import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Drawer,
  Empty,
  Input,
  Popconfirm,
  Rate,
  Select,
  Skeleton,
  Timeline,
  message,
} from 'antd';
import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  IPipelineDetail,
  IPipelineItem,
  callAddResumeNote,
  callDeleteResumeNote,
  callFetchPipelineDetail,
  callRateResume,
} from '@/config/api';
import { PIPELINE_STAGES, stageOf } from '@/config/pipeline';
import { useOpenResume } from '@/hooks/useOpenResume';
import { useAppSelector } from '@/redux/hooks';
import s from '@/styles/pipeline.module.scss';
import AiInterviewSection from './ai-interview.section';

import i18next from 'i18next';

dayjs.extend(relativeTime);

interface IProps {
  item: IPipelineItem | null;
  onClose: () => void;
  onMove: (item: IPipelineItem, status: string) => void;
  onChange: (id: string, patch: Partial<IPipelineItem>) => void;
}

const PipelineDrawer = ({ item, onClose, onMove, onChange }: IProps) => {
  const userId = useAppSelector(state => state.account.user._id);
  const { openResume, openingId } = useOpenResume();
  const [detail, setDetail] = useState<IPipelineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reload when another card opens or the card moved to another stage
  useEffect(() => {
    if (!item?._id) {
      setDetail(null);
      return;
    }
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      const res = await callFetchPipelineDetail(item._id);
      if (ignore) return;
      setDetail(res?.data ?? null);
      setIsLoading(false);
      if (!res?.data) message.error(res?.message ?? i18next.t('app:components.admin.resume.pipeline_drawer.cannot_load_this_application'));
    };
    load();
    return () => {
      ignore = true;
    };
  }, [item?._id, item?.status]);

  useEffect(() => setDraft(''), [item?._id]);

  const rate = async (value: number) => {
    if (!item) return;
    const previous = item.rating;
    onChange(item._id, { rating: value || undefined });
    const res = await callRateResume(item._id, value);
    if (!res?.data) {
      onChange(item._id, { rating: previous });
      message.error(res?.message ?? i18next.t('app:components.admin.resume.pipeline_drawer.cannot_save_the_rating'));
    }
  };

  const addNote = async () => {
    if (!item || !draft.trim()) return;
    setIsSaving(true);
    const res = await callAddResumeNote(item._id, draft);
    setIsSaving(false);
    if (res?.data) {
      const note = res.data;
      setDetail(current => (current ? { ...current, notes: [note, ...current.notes] } : current));
      onChange(item._id, { notesCount: item.notesCount + 1 });
      setDraft('');
    } else {
      message.error(res?.message ?? i18next.t('app:components.admin.resume.pipeline_drawer.cannot_add_the_note'));
    }
  };

  const removeNote = async (noteId: string) => {
    if (!item) return;
    const res = await callDeleteResumeNote(item._id, noteId);
    if (res?.data) {
      setDetail(current =>
        current ? { ...current, notes: current.notes.filter(note => note._id !== noteId) } : current
      );
      onChange(item._id, { notesCount: Math.max(0, item.notesCount - 1) });
    } else {
      message.error(res?.message ?? i18next.t('app:components.admin.resume.pipeline_drawer.cannot_delete_the_note'));
    }
  };

  const job = detail?.jobId;

  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      width={520}
      title={null}
      destroyOnClose
      className={s['drawer']}
    >
      {item && (
        <>
          <div className={s['d-head']}>
            <Avatar size={48} className={s['d-avatar']}>
              {item.candidateName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <h2>{item.candidateName}</h2>
              <a href={`mailto:${item.email}`}>{item.email}</a>
              <p>
                {item.jobId?.name ?? i18next.t('app:components.admin.resume.pipeline_drawer.job_removed')}
                {item.companyId?.name && ` · ${item.companyId.name}`}
              </p>
            </div>
          </div>

          <div className={s['d-actions']}>
            <Select
              value={item.status}
              onChange={status => onMove(item, status)}
              className={s['d-stage']}
              aria-label='Stage'
              options={PIPELINE_STAGES.map(stage => ({
                value: stage.status,
                label: (
                  <span className={s['stage-option']}>
                    <i style={{ background: stage.color }} />
                    {stage.title}
                  </span>
                ),
              }))}
            />
            <Button
              icon={<FileTextOutlined />}
              loading={openingId === item._id}
              onClick={() => openResume(item._id)}
            >
              {i18next.t('app:common.view_cv')}
            </Button>
          </div>

          <dl className={s['d-facts']}>
            <div>
              <dt>{i18next.t('app:common.applied')}</dt>
              <dd title={dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}>
                {dayjs(item.createdAt).format('DD MMM YYYY')}
              </dd>
            </div>
            <div>
              <dt>{i18next.t('app:components.admin.resume.pipeline_drawer.score')}</dt>
              <dd>
                <Rate value={item.rating ?? 0} onChange={rate} className={s['d-rate']} />
              </dd>
            </div>
            {job?.level && (
              <div>
                <dt>{i18next.t('app:common.level')}</dt>
                <dd>{job.level}</dd>
              </div>
            )}
          </dl>

          <AiInterviewSection resumeId={item._id} status={item.status} />

          <section className={s['d-section']}>
            <h3>
              {i18next.t('app:components.admin.resume.pipeline_drawer.notes')}{' '}<span>{i18next.t('app:components.admin.resume.pipeline_drawer.only_visible_to_your_team')}</span>
            </h3>
            <Input.TextArea
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder={i18next.t('app:components.admin.resume.pipeline_drawer.add_a_note_about_this_candidate')}
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={1000}
              onPressEnter={event => {
                if (event.metaKey || event.ctrlKey) addNote();
              }}
            />
            <div className={s['d-note-actions']}>
              <small>{i18next.t('app:components.admin.resume.pipeline_drawer.ctrl_enter_to_save')}</small>
              <Button
                type='primary'
                size='small'
                loading={isSaving}
                disabled={!draft.trim()}
                onClick={addNote}
              >
                {i18next.t('app:components.admin.resume.pipeline_drawer.add_note')}
              </Button>
            </div>

            {isLoading || !detail ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : detail?.notes.length ? (
              <ul className={s['notes']}>
                {detail.notes.map(note => (
                  <li key={note._id}>
                    <div className={s['note-meta']}>
                      <b>{note.createdBy?.name || note.createdBy?.email}</b>
                      <span title={dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')}>
                        {dayjs(note.createdAt).locale('en').fromNow()}
                      </span>
                      {note.createdBy?._id === userId && (
                        <Popconfirm
                          title={i18next.t('app:components.admin.resume.pipeline_drawer.delete_this_note')}
                          okText={i18next.t('app:components.admin.resume.pipeline_drawer.delete')}
                          okButtonProps={{ danger: true }}
                          onConfirm={() => removeNote(note._id)}
                        >
                          <Button
                            type='text'
                            size='small'
                            icon={<DeleteOutlined />}
                            aria-label='Delete note'
                          />
                        </Popconfirm>
                      )}
                    </div>
                    <p>{note.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18next.t('app:components.admin.resume.pipeline_drawer.no_notes_yet')} />
            )}
          </section>

          <section className={s['d-section']}>
            <h3>{i18next.t('app:components.admin.resume.pipeline_drawer.activity')}</h3>
            {isLoading || !detail ? (
              <Skeleton active title={false} paragraph={{ rows: 2 }} />
            ) : detail?.history?.length ? (
              <Timeline
                className={s['d-timeline']}
                items={[...detail.history].reverse().map(entry => ({
                  color: stageOf(entry.status).color,
                  children: (
                    <>
                      <b>{i18next.t('app:components.admin.resume.pipeline_drawer.moved_to')}{' '}{stageOf(entry.status).title}</b>
                      <span>
                        {dayjs(entry.updatedAt).format('DD/MM/YYYY HH:mm')}
                        {entry.updatedBy?.email && ` · ${entry.updatedBy.email}`}
                      </span>
                      {entry.note && <p>“{entry.note}”</p>}
                    </>
                  ),
                }))}
              />
            ) : (
              <p className={s['muted']}>{i18next.t('app:components.admin.resume.pipeline_drawer.no_activity_yet')}</p>
            )}
          </section>
        </>
      )}
    </Drawer>
  );
};

export default PipelineDrawer;
