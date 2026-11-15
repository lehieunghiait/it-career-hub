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
      if (!res?.data) message.error(res?.message ?? 'Cannot load this application');
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
      message.error(res?.message ?? 'Cannot save the rating');
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
      message.error(res?.message ?? 'Cannot add the note');
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
      message.error(res?.message ?? 'Cannot delete the note');
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
                {item.jobId?.name ?? 'Job removed'}
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
              View CV
            </Button>
          </div>

          <dl className={s['d-facts']}>
            <div>
              <dt>Applied</dt>
              <dd title={dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}>
                {dayjs(item.createdAt).format('DD MMM YYYY')}
              </dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>
                <Rate value={item.rating ?? 0} onChange={rate} className={s['d-rate']} />
              </dd>
            </div>
            {job?.level && (
              <div>
                <dt>Level</dt>
                <dd>{job.level}</dd>
              </div>
            )}
          </dl>

          <section className={s['d-section']}>
            <h3>
              Notes <span>Only visible to your team</span>
            </h3>
            <Input.TextArea
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder='Add a note about this candidate…'
              autoSize={{ minRows: 2, maxRows: 6 }}
              maxLength={1000}
              onPressEnter={event => {
                if (event.metaKey || event.ctrlKey) addNote();
              }}
            />
            <div className={s['d-note-actions']}>
              <small>⌘/Ctrl + Enter to save</small>
              <Button
                type='primary'
                size='small'
                loading={isSaving}
                disabled={!draft.trim()}
                onClick={addNote}
              >
                Add note
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
                          title='Delete this note?'
                          okText='Delete'
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No notes yet' />
            )}
          </section>

          <section className={s['d-section']}>
            <h3>Activity</h3>
            {isLoading || !detail ? (
              <Skeleton active title={false} paragraph={{ rows: 2 }} />
            ) : detail?.history?.length ? (
              <Timeline
                className={s['d-timeline']}
                items={[...detail.history].reverse().map(entry => ({
                  color: stageOf(entry.status).color,
                  children: (
                    <>
                      <b>Moved to {stageOf(entry.status).title}</b>
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
              <p className={s['muted']}>No activity yet</p>
            )}
          </section>
        </>
      )}
    </Drawer>
  );
};

export default PipelineDrawer;
