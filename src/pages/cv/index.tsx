import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popconfirm, Skeleton, Tooltip, message } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  CloudSyncOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileSearchOutlined,
  FontSizeOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useUser } from '@clerk/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { callCreateCv, callDeleteCv, callFetchCvById, callFetchMyCvs } from '@/config/api';
import {
  CV_COLORS,
  CV_TEMPLATES,
  CvTemplate,
  ICv,
  SAMPLE_CV,
  emptyCvData,
} from '@/components/cv/cv-model';
import { downloadCvPdf } from '@/components/cv/cv-pdf';
import CvHtmlPreview from '@/components/cv/CvHtmlPreview';
import styles from 'styles/client.module.scss';
import s from 'styles/cv-landing.module.scss';

dayjs.extend(relativeTime);

const sampleCv = (template: CvTemplate, color: string): ICv => ({
  title: 'Sample',
  template,
  color,
  data: SAMPLE_CV,
});

const STEPS = [
  {
    title: 'Pick a template',
    text: 'Three modern layouts designed for IT profiles. Switch any time, your content stays.',
  },
  {
    title: 'Fill in your story',
    text: 'Type on the left, see the CV update instantly on the right. Saved automatically.',
  },
  {
    title: 'Download or apply',
    text: 'Export a clean PDF, or apply to any job on IT Career Hub with one click.',
  },
];

const FEATURES = [
  {
    icon: <FileSearchOutlined />,
    title: 'ATS friendly',
    text: 'Real text PDF that recruiters’ screening tools can read, not a flat image.',
  },
  {
    icon: <FontSizeOutlined />,
    title: 'Perfect Vietnamese',
    text: 'Be Vietnam Pro font embedded, every accent renders exactly as typed.',
  },
  {
    icon: <SendOutlined />,
    title: 'One-click apply',
    text: 'Choose your online CV in the apply form, we attach the latest PDF for you.',
  },
  {
    icon: <CloudSyncOutlined />,
    title: 'Always up to date',
    text: 'Edit once, every new application uses the newest version of your CV.',
  },
];

/**
 * CV builder home: showcase, the user's CVs and the template gallery
 */
const CvListPage = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [cvs, setCvs] = useState<ICv[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState<CvTemplate | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [galleryColor, setGalleryColor] = useState(CV_COLORS[0]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const load = async () => {
      setIsLoading(true);
      const res = await callFetchMyCvs();
      setCvs(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, [isLoaded, isSignedIn]);

  const createFrom = async (template: CvTemplate, color = galleryColor) => {
    if (!isSignedIn) {
      navigate(`/login?callback=${encodeURIComponent('/cv')}`);
      return;
    }
    setCreating(template);
    const name = user?.fullName ?? '';
    const res = await callCreateCv({
      title: `${name || 'My'} CV - ${CV_TEMPLATES.find(t => t.key === template)?.name}`,
      template,
      color,
      data: emptyCvData(name, user?.primaryEmailAddress?.emailAddress ?? ''),
    });
    setCreating(null);
    if (res?.data?._id) {
      navigate(`/cv/${res.data._id}`);
    } else {
      message.error(res?.message ?? 'Cannot create the CV');
    }
  };

  const download = async (id: string) => {
    setDownloadingId(id);
    try {
      const res = await callFetchCvById(id);
      if (res?.data) await downloadCvPdf(res.data);
    } catch {
      message.error('Cannot export the PDF, please try again');
    } finally {
      setDownloadingId(null);
    }
  };

  const remove = async (id: string) => {
    const res = await callDeleteCv(id);
    if (res?.data) {
      setCvs(list => list.filter(cv => cv._id !== id));
      message.success('CV deleted');
    } else {
      message.error(res?.message ?? 'Cannot delete the CV');
    }
  };

  const scrollToTemplates = () =>
    document.getElementById('cv-templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className={s['page']}>
      {/* ===== Hero ===== */}
      <section className={s['hero']}>
        <div className={s['hero-glow']} />
        <div className={`${styles['container']} ${s['hero-grid']}`}>
          <div className={s['hero-copy']}>
            <span className={s['eyebrow']}>Free CV builder for IT talent</span>
            <h1>
              Your next IT job starts with a <span>great CV</span>
            </h1>
            <p className={s['lead']}>
              Build a modern, ATS-friendly CV in minutes, see every change live, and apply to top
              tech companies with one click.
            </p>
            <div className={s['hero-actions']}>
              <Button
                type='primary'
                size='large'
                className={s['cta']}
                loading={creating === 'modern'}
                onClick={() => createFrom('modern', CV_COLORS[0])}
              >
                Create my CV <ArrowRightOutlined />
              </Button>
              <Button size='large' ghost className={s['ghost']} onClick={scrollToTemplates}>
                Browse templates
              </Button>
            </div>
            <ul className={s['hero-points']}>
              <li>
                <CheckCircleFilled /> 100% free
              </li>
              <li>
                <CheckCircleFilled /> PDF download
              </li>
              <li>
                <CheckCircleFilled /> Vietnamese ready
              </li>
            </ul>
          </div>
          <div className={s['hero-visual']} aria-hidden>
            <div className={`${s['paper']} ${s['paper-back']}`}>
              <CvHtmlPreview cv={sampleCv('minimal', CV_COLORS[2])} />
            </div>
            <div className={`${s['paper']} ${s['paper-front']}`}>
              <CvHtmlPreview cv={sampleCv('modern', CV_COLORS[0])} />
            </div>
            <div className={s['float-badge']}>
              <CheckCircleFilled /> ATS-ready PDF
            </div>
          </div>
        </div>
      </section>

      <div className={styles['container']}>
        {/* ===== My CVs ===== */}
        {isSignedIn && (isLoading || cvs.length > 0) && (
          <section className={s['section']}>
            <div className={s['section-head']}>
              <div>
                <h2>My CVs</h2>
                <p>Keep one CV per role you target, each application uses the latest version.</p>
              </div>
            </div>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <div className={s['my-grid']}>
                {cvs.map(cv => (
                  <article key={cv._id} className={s['my-card']}>
                    <button
                      type='button'
                      className={s['my-thumb']}
                      style={{
                        background: `linear-gradient(135deg, ${cv.color}22, ${cv.color}0d)`,
                      }}
                      onClick={() => navigate(`/cv/${cv._id}`)}
                      aria-label={`Edit ${cv.title}`}
                    >
                      <span style={{ background: cv.color }}>
                        {(cv.data?.fullName || cv.title).trim().charAt(0).toUpperCase()}
                      </span>
                    </button>
                    <div className={s['my-body']}>
                      <h3 title={cv.title}>{cv.title}</h3>
                      <p>
                        {CV_TEMPLATES.find(t => t.key === cv.template)?.name} · edited{' '}
                        {dayjs(cv.updatedAt).locale('en').fromNow()}
                      </p>
                      <div className={s['my-actions']}>
                        <Button
                          size='small'
                          type='primary'
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/cv/${cv._id}`)}
                        >
                          Edit
                        </Button>
                        <Tooltip title='Download PDF'>
                          <Button
                            size='small'
                            icon={<DownloadOutlined />}
                            loading={downloadingId === cv._id}
                            onClick={() => download(cv._id!)}
                            aria-label='Download PDF'
                          />
                        </Tooltip>
                        <Popconfirm
                          title='Delete this CV?'
                          description='Applications already sent keep their PDF.'
                          okText='Delete'
                          okButtonProps={{ danger: true }}
                          onConfirm={() => remove(cv._id!)}
                        >
                          <Button
                            size='small'
                            danger
                            icon={<DeleteOutlined />}
                            aria-label='Delete CV'
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </article>
                ))}
                <button type='button' className={s['my-new']} onClick={scrollToTemplates}>
                  <PlusOutlined />
                  <span>New CV</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===== Templates ===== */}
        <section id='cv-templates' className={s['section']}>
          <div className={s['section-head']}>
            <div>
              <h2>Choose your template</h2>
              <p>Designed with recruiters. Pick a color, you can change everything later.</p>
            </div>
            <div className={s['colors']} role='radiogroup' aria-label='Template color'>
              {CV_COLORS.map(color => (
                <button
                  key={color}
                  type='button'
                  role='radio'
                  aria-checked={galleryColor === color}
                  aria-label={`Color ${color}`}
                  className={`${s['swatch']} ${galleryColor === color ? s['active'] : ''}`}
                  style={{ background: color }}
                  onClick={() => setGalleryColor(color)}
                />
              ))}
            </div>
          </div>
          <div className={s['gallery']}>
            {CV_TEMPLATES.map(template => (
              <article key={template.key} className={s['template-card']}>
                <div className={s['template-stage']}>
                  <div className={s['template-paper']}>
                    <CvHtmlPreview cv={sampleCv(template.key, galleryColor)} />
                  </div>
                  <div className={s['template-overlay']}>
                    <Button
                      type='primary'
                      size='large'
                      loading={creating === template.key}
                      onClick={() => createFrom(template.key)}
                    >
                      Use this template
                    </Button>
                  </div>
                </div>
                <div className={s['template-info']}>
                  <div>
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                  </div>
                  <Button
                    className={s['template-btn']}
                    loading={creating === template.key}
                    disabled={!!creating && creating !== template.key}
                    onClick={() => createFrom(template.key)}
                  >
                    Use
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section className={s['section']}>
          <div className={s['section-head']}>
            <div>
              <h2>Ready in 3 steps</h2>
              <p>Most candidates finish their first CV in under 15 minutes.</p>
            </div>
          </div>
          <ol className={s['steps']}>
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className={s['step-no']}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== Features ===== */}
        <section className={s['section']}>
          <div className={s['features']}>
            {FEATURES.map(feature => (
              <div key={feature.title} className={s['feature']}>
                <span className={s['feature-icon']}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className={s['cta-band']}>
          <div>
            <h2>Stand out to IT recruiters today</h2>
            <p>Create your CV for free and apply to hundreds of tech jobs.</p>
          </div>
          <Button
            size='large'
            className={s['cta-light']}
            loading={creating === 'classic'}
            onClick={() => createFrom('classic')}
          >
            Start building <ArrowRightOutlined />
          </Button>
        </section>
      </div>
    </div>
  );
};

export default CvListPage;
