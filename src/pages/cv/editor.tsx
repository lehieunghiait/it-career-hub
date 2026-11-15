import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Collapse,
  Col,
  Form,
  Input,
  Result,
  Row,
  Segmented,
  Select,
  Skeleton,
  Tooltip,
  Upload,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloudSyncOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { callFetchCvById, callUpdateCv } from '@/config/api';
import { CV_COLORS, CV_TEMPLATES, ICv, ICvData, SAMPLE_CV } from '@/components/cv/cv-model';
import { downloadCvPdf, resizePhoto } from '@/components/cv/cv-pdf';
import CvHtmlPreview from '@/components/cv/CvHtmlPreview';
import TemplateThumb from '@/components/cv/TemplateThumb';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useUser } from '@clerk/react';
import s from 'styles/cv.module.scss';

const SAVE_DELAY = 1500;

type SaveState = 'saved' | 'pending' | 'saving' | 'error';

// Labels for the repeatable sections (experience, education...)
const LIST_SECTIONS: {
  name: keyof ICvData;
  header: string;
  title: string;
  subtitle: string;
  withLink?: boolean;
  noDescription?: boolean;
}[] = [
  { name: 'experiences', header: 'Work experience', title: 'Company', subtitle: 'Position' },
  {
    name: 'projects',
    header: 'Projects',
    title: 'Project name',
    subtitle: 'Your role',
    withLink: true,
  },
  { name: 'educations', header: 'Education', title: 'School', subtitle: 'Major / degree' },
  {
    name: 'certificates',
    header: 'Certificates & awards',
    title: 'Certificate',
    subtitle: 'Issued by',
    noDescription: true,
  },
];

const ItemList = ({ section }: { section: (typeof LIST_SECTIONS)[number] }) => {
  const sample = (SAMPLE_CV[section.name] as ICv['data']['experiences'])?.[0];
  return (
    <Form.List name={section.name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(field => (
            <div key={field.key} className={s['item-block']}>
              <Tooltip title='Remove'>
                <Button
                  className={s['item-remove']}
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                  aria-label='Remove item'
                />
              </Tooltip>
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name={[field.name, 'title']} label={section.title}>
                    <Input placeholder={sample?.title} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={[field.name, 'subtitle']} label={section.subtitle}>
                    <Input placeholder={sample?.subtitle} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={[field.name, 'start']} label='From'>
                    <Input placeholder='MM/YYYY' />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={[field.name, 'end']} label='To'>
                    <Input placeholder='Hiện tại' />
                  </Form.Item>
                </Col>
                {section.withLink && (
                  <Col xs={24} md={12}>
                    <Form.Item name={[field.name, 'link']} label='Link'>
                      <Input placeholder='github.com/you/project' />
                    </Form.Item>
                  </Col>
                )}
                {!section.noDescription && (
                  <Col span={24}>
                    <Form.Item
                      name={[field.name, 'description']}
                      label='Description'
                      extra='Start a line with "-" to make a bullet point.'
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 10 }}
                        placeholder={sample?.description}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>
          ))}
          <Button block type='dashed' icon={<PlusOutlined />} onClick={() => add({})}>
            Add {section.header.toLowerCase()}
          </Button>
        </>
      )}
    </Form.List>
  );
};

/**
 * CV editor: form on the left, instant preview on the right, saved automatically
 */
const CvEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile('lg');
  const [form] = Form.useForm<ICvData>();

  const [cv, setCv] = useState<ICv | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const pendingRef = useRef<ICv | null>(null);

  const { isLoaded, isSignedIn } = useUser();

  // Wait for the Clerk session, otherwise the request goes out without a token
  useEffect(() => {
    if (!id || !isLoaded) return;
    if (!isSignedIn) {
      navigate(`/login?callback=${encodeURIComponent(`/cv/${id}`)}`);
      return;
    }
    const load = async () => {
      const res = await callFetchCvById(id);
      if (res?.data) {
        setCv(res.data);
        form.setFieldsValue(res.data.data);
      } else {
        setNotFound(true);
      }
    };
    load();
  }, [id, isLoaded, isSignedIn]);

  // Debounced autosave
  useEffect(() => {
    if (!cv || saveState !== 'pending') return;
    const timer = setTimeout(async () => {
      pendingRef.current = null;
      setSaveState('saving');
      const res = await callUpdateCv(cv._id!, {
        title: cv.title,
        template: cv.template,
        color: cv.color,
        data: cv.data,
      });
      setSaveState(res?.data ? 'saved' : 'error');
      if (!res?.data) message.error(res?.message ?? 'Cannot save your CV');
    }, SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [cv, saveState]);

  // Save what is left when leaving the page
  useEffect(
    () => () => {
      const pending = pendingRef.current;
      if (pending?._id) {
        callUpdateCv(pending._id, {
          title: pending.title,
          template: pending.template,
          color: pending.color,
          data: pending.data,
        });
      }
    },
    []
  );

  const update = (patch: Partial<ICv>) => {
    setCv(current => {
      if (!current) return current;
      const next = { ...current, ...patch };
      pendingRef.current = next;
      return next;
    });
    setSaveState('pending');
  };

  const onValuesChange = (_: unknown, values: ICvData) =>
    update({ data: { ...cv?.data, ...values } });

  const onPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('Please choose an image');
      return Upload.LIST_IGNORE;
    }
    try {
      const avatar = await resizePhoto(file);
      form.setFieldValue('avatar', avatar);
      update({ data: { ...form.getFieldsValue(true), avatar } });
    } catch {
      message.error('Cannot read this image');
    }
    return Upload.LIST_IGNORE;
  };

  const fillSample = () => {
    const data = { ...SAMPLE_CV, avatar: cv?.data.avatar };
    form.setFieldsValue(data);
    update({ data });
  };

  const download = async () => {
    if (!cv) return;
    setIsDownloading(true);
    try {
      await downloadCvPdf(cv);
    } catch {
      message.error('Cannot export the PDF, please try again');
    } finally {
      setIsDownloading(false);
    }
  };

  if (notFound) {
    return (
      <Result
        status='404'
        title='CV not found'
        subTitle='This CV does not exist or belongs to another account.'
        extra={
          <Button type='primary' onClick={() => navigate('/cv')}>
            Back to my CVs
          </Button>
        }
      />
    );
  }

  if (!cv) {
    return (
      <div className={s['editor']}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  const avatar = cv.data.avatar;
  const isEmpty = !cv.data.summary && !cv.data.experiences?.some(item => item.title);

  const saveLabel = {
    saved: (
      <>
        <CheckCircleFilled style={{ color: '#16a34a' }} /> Saved
      </>
    ),
    pending: (
      <>
        <CloudSyncOutlined /> Unsaved changes
      </>
    ),
    saving: (
      <>
        <CloudSyncOutlined spin /> Saving…
      </>
    ),
    error: <span style={{ color: '#dc2626' }}>Not saved</span>,
  }[saveState];

  const editor = (
    <div className={s['form-pane']}>
      <div className={s['design']}>
        <div className={s['design-row']}>
          {CV_TEMPLATES.map(template => (
            <button
              key={template.key}
              type='button'
              className={`${s['template-pick']} ${cv.template === template.key ? s['active'] : ''}`}
              onClick={() => update({ template: template.key })}
              aria-pressed={cv.template === template.key}
            >
              <TemplateThumb template={template.key} color={cv.color} />
              <span>{template.name}</span>
            </button>
          ))}
        </div>
        <div className={s['colors']}>
          {CV_COLORS.map(color => (
            <button
              key={color}
              type='button'
              className={`${s['swatch']} ${cv.color === color ? s['active'] : ''}`}
              style={{ background: color }}
              onClick={() => update({ color })}
              aria-label={`Color ${color}`}
              aria-pressed={cv.color === color}
            />
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className={s['sample-hint']}>
          Not sure what to write?{' '}
          <Button type='link' size='small' onClick={fillSample}>
            Fill with sample content
          </Button>
        </div>
      )}

      <Form form={form} layout='vertical' onValuesChange={onValuesChange} requiredMark={false}>
        <Collapse
          defaultActiveKey={['profile', 'experiences']}
          className={s['sections']}
          items={[
            {
              key: 'profile',
              label: 'Personal information',
              children: (
                <>
                  <div className={s['photo-row']}>
                    <Avatar size={72} src={avatar} icon={<UserOutlined />} />
                    <div>
                      <Upload accept='image/*' showUploadList={false} beforeUpload={onPhoto}>
                        <Button size='small'>{avatar ? 'Change photo' : 'Add photo'}</Button>
                      </Upload>
                      {avatar && (
                        <Button
                          size='small'
                          type='link'
                          danger
                          onClick={() => {
                            form.setFieldValue('avatar', undefined);
                            update({ data: { ...form.getFieldsValue(true), avatar: undefined } });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                      <div className={s['hint']}>Optional, shown on every template</div>
                    </div>
                  </div>
                  <Form.Item name='avatar' hidden>
                    <Input />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item name='fullName' label='Full name'>
                        <Input placeholder={SAMPLE_CV.fullName} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='headline' label='Job title'>
                        <Input placeholder={SAMPLE_CV.headline} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='email' label='Email'>
                        <Input placeholder={SAMPLE_CV.email} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='phone' label='Phone'>
                        <Input placeholder={SAMPLE_CV.phone} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='address' label='Address'>
                        <Input placeholder={SAMPLE_CV.address} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='website' label='Website / GitHub / LinkedIn'>
                        <Input placeholder={SAMPLE_CV.website} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name='birthday' label='Date of birth'>
                        <Input placeholder='DD/MM/YYYY' />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ),
            },
            {
              key: 'summary',
              label: 'Summary',
              children: (
                <Form.Item name='summary' style={{ marginBottom: 0 }}>
                  <Input.TextArea
                    autoSize={{ minRows: 4, maxRows: 10 }}
                    placeholder={SAMPLE_CV.summary}
                  />
                </Form.Item>
              ),
            },
            {
              key: 'skills',
              label: 'Skills & languages',
              children: (
                <>
                  <Form.Item name='skills' label='Skills' extra='Type a skill and press Enter.'>
                    <Select
                      mode='tags'
                      tokenSeparators={[',']}
                      placeholder='Node.js, React, Docker…'
                      open={false}
                    />
                  </Form.Item>
                  <Form.Item name='languages' label='Languages' style={{ marginBottom: 0 }}>
                    <Select
                      mode='tags'
                      tokenSeparators={[',']}
                      placeholder='Tiếng Anh (IELTS 7.0)…'
                      open={false}
                    />
                  </Form.Item>
                </>
              ),
            },
            ...LIST_SECTIONS.map(section => ({
              key: section.name,
              label: section.header,
              children: <ItemList section={section} />,
            })),
          ]}
        />
      </Form>
    </div>
  );

  // Re-renders on every keystroke: the HTML preview uses the same layout as the PDF
  const preview = (
    <div className={s['preview-pane']}>
      <CvHtmlPreview cv={cv} />
    </div>
  );

  return (
    <div className={s['editor']}>
      <div className={s['toolbar']}>
        <Link to='/cv' className={s['back']} aria-label='Back to my CVs'>
          <ArrowLeftOutlined />
        </Link>
        <Input
          className={s['title-input']}
          value={cv.title}
          maxLength={100}
          onChange={e => update({ title: e.target.value })}
          variant='borderless'
          aria-label='CV name'
        />
        <span className={s['save-state']}>{saveLabel}</span>
        <div className={s['toolbar-actions']}>
          <Button icon={<DownloadOutlined />} loading={isDownloading} onClick={download}>
            PDF
          </Button>
          <Button
            type='primary'
            icon={<SendOutlined />}
            onClick={() => {
              message.info('Open a job and choose this CV in the apply form');
              navigate('/job');
            }}
          >
            Apply with this CV
          </Button>
        </div>
      </div>

      {isMobile ? (
        <>
          <Segmented
            block
            value={mobileView}
            onChange={value => setMobileView(value as 'edit' | 'preview')}
            options={[
              { label: 'Edit', value: 'edit' },
              { label: 'Preview', value: 'preview' },
            ]}
            className={s['mobile-switch']}
          />
          {/* Keep the form mounted so typed values survive switching views */}
          <div style={{ display: mobileView === 'edit' ? 'block' : 'none' }}>{editor}</div>
          {mobileView === 'preview' && preview}
        </>
      ) : (
        <div className={s['workspace']}>
          {editor}
          {preview}
        </div>
      )}
    </div>
  );
};

export default CvEditorPage;
