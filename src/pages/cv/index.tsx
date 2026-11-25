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

import i18next from 'i18next';

dayjs.extend(relativeTime);

const sampleCv = (template: CvTemplate, color: string): ICv => ({
  title: i18next.t('app:pages.cv.index.sample'),
  template,
  color,
  data: SAMPLE_CV,
});

const STEPS = [
  {
    get title() { return i18next.t('app:pages.cv.index.pick_a_template'); },
    get text() { return i18next.t('app:pages.cv.index.three_modern_layouts_designed_for_it'); },
  },
  {
    get title() { return i18next.t('app:pages.cv.index.fill_in_your_story'); },
    get text() { return i18next.t('app:pages.cv.index.type_on_the_left_see_the'); },
  },
  {
    get title() { return i18next.t('app:pages.cv.index.download_or_apply'); },
    get text() { return i18next.t('app:pages.cv.index.export_a_clean_pdf_or_apply'); },
  },
];

const FEATURES = [
  {
    icon: <FileSearchOutlined />,
    get title() { return i18next.t('app:pages.cv.index.ats_friendly'); },
    get text() { return i18next.t('app:pages.cv.index.real_text_pdf_that_recruiters_screening'); },
  },
  {
    icon: <FontSizeOutlined />,
    get title() { return i18next.t('app:pages.cv.index.perfect_vietnamese'); },
    get text() { return i18next.t('app:pages.cv.index.be_vietnam_pro_font_embedded_every'); },
  },
  {
    icon: <SendOutlined />,
    get title() { return i18next.t('app:pages.cv.index.one_click_apply'); },
    get text() { return i18next.t('app:pages.cv.index.choose_your_online_cv_in_the'); },
  },
  {
    icon: <CloudSyncOutlined />,
    get title() { return i18next.t('app:pages.cv.index.always_up_to_date'); },
    get text() { return i18next.t('app:pages.cv.index.edit_once_every_new_application_uses'); },
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
      title: i18next.t('app:pages.cv.index.cv', { v0: name || 'My', v1: CV_TEMPLATES.find(t => t.key === template)?.name }),
      template,
      color,
      data: emptyCvData(name, user?.primaryEmailAddress?.emailAddress ?? ''),
    });
    setCreating(null);
    if (res?.data?._id) {
      navigate(`/cv/${res.data._id}`);
    } else {
      message.error(res?.message ?? i18next.t('app:pages.cv.index.cannot_create_the_cv'));
    }
  };

  const download = async (id: string) => {
    setDownloadingId(id);
    try {
      const res = await callFetchCvById(id);
      if (res?.data) await downloadCvPdf(res.data);
    } catch {
      message.error(i18next.t('app:pages.cv.index.cannot_export_the_pdf_please_try'));
    } finally {
      setDownloadingId(null);
    }
  };

  const remove = async (id: string) => {
    const res = await callDeleteCv(id);
    if (res?.data) {
      setCvs(list => list.filter(cv => cv._id !== id));
      message.success(i18next.t('app:pages.cv.index.cv_deleted'));
    } else {
      message.error(res?.message ?? i18next.t('app:pages.cv.index.cannot_delete_the_cv'));
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
            <span className={s['eyebrow']}>{i18next.t('app:pages.cv.index.free_cv_builder_for_it_talent')}</span>
            <h1>
              {i18next.t('app:pages.cv.index.your_next_it_job_starts_with')}{' '}<span>{i18next.t('app:pages.cv.index.great_cv')}</span>
            </h1>
            <p className={s['lead']}>
              {i18next.t('app:pages.cv.index.build_a_modern_ats_friendly_cv')}
            </p>
            <div className={s['hero-actions']}>
              <Button
                type='primary'
                size='large'
                className={s['cta']}
                loading={creating === 'modern'}
                onClick={() => createFrom('modern', CV_COLORS[0])}
              >
                {i18next.t('app:pages.cv.index.create_my_cv')}{' '}<ArrowRightOutlined />
              </Button>
              <Button size='large' ghost className={s['ghost']} onClick={scrollToTemplates}>
                {i18next.t('app:pages.cv.index.browse_templates')}
              </Button>
            </div>
            <ul className={s['hero-points']}>
              <li>
                <CheckCircleFilled /> {i18next.t('app:pages.cv.index.t_100_free')}
              </li>
              <li>
                <CheckCircleFilled /> {i18next.t('app:pages.cv.index.pdf_download')}
              </li>
              <li>
                <CheckCircleFilled /> {i18next.t('app:pages.cv.index.vietnamese_ready')}
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
              <CheckCircleFilled /> {i18next.t('app:pages.cv.index.ats_ready_pdf')}
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
                <h2>{i18next.t('app:pages.cv.index.my_cvs')}</h2>
                <p>{i18next.t('app:pages.cv.index.keep_one_cv_per_role_you')}</p>
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
                      aria-label={i18next.t('app:pages.cv.index.edit', { v0: cv.title })}
                    >
                      <span style={{ background: cv.color }}>
                        {(cv.data?.fullName || cv.title).trim().charAt(0).toUpperCase()}
                      </span>
                    </button>
                    <div className={s['my-body']}>
                      <h3 title={cv.title}>{cv.title}</h3>
                      <p>
                        {CV_TEMPLATES.find(t => t.key === cv.template)?.name} {i18next.t('app:pages.cv.index.edited')}{' '}
                        {dayjs(cv.updatedAt).locale('en').fromNow()}
                      </p>
                      <div className={s['my-actions']}>
                        <Button
                          size='small'
                          type='primary'
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/cv/${cv._id}`)}
                        >
                          {i18next.t('app:pages.cv.index.edit_2')}
                        </Button>
                        <Tooltip title={i18next.t('app:pages.cv.index.download_pdf')}>
                          <Button
                            size='small'
                            icon={<DownloadOutlined />}
                            loading={downloadingId === cv._id}
                            onClick={() => download(cv._id!)}
                            aria-label='Download PDF'
                          />
                        </Tooltip>
                        <Popconfirm
                          title={i18next.t('app:pages.cv.index.delete_this_cv')}
                          description={i18next.t('app:pages.cv.index.applications_already_sent_keep_their_pdf')}
                          okText={i18next.t('app:pages.cv.index.delete')}
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
                  <span>{i18next.t('app:pages.cv.index.new_cv')}</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===== Templates ===== */}
        <section id='cv-templates' className={s['section']}>
          <div className={s['section-head']}>
            <div>
              <h2>{i18next.t('app:pages.cv.index.choose_your_template')}</h2>
              <p>{i18next.t('app:pages.cv.index.designed_with_recruiters_pick_a_color')}</p>
            </div>
            <div className={s['colors']} role='radiogroup' aria-label='Template color'>
              {CV_COLORS.map(color => (
                <button
                  key={color}
                  type='button'
                  role='radio'
                  aria-checked={galleryColor === color}
                  aria-label={i18next.t('app:pages.cv.index.color', { v0: color })}
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
                      {i18next.t('app:pages.cv.index.use_this_template')}
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
                    {i18next.t('app:pages.cv.index.use')}
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
              <h2>{i18next.t('app:pages.cv.index.ready_in_3_steps')}</h2>
              <p>{i18next.t('app:pages.cv.index.most_candidates_finish_their_first_cv')}</p>
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
            <h2>{i18next.t('app:pages.cv.index.stand_out_to_it_recruiters_today')}</h2>
            <p>{i18next.t('app:pages.cv.index.create_your_cv_for_free_and')}</p>
          </div>
          <Button
            size='large'
            className={s['cta-light']}
            loading={creating === 'classic'}
            onClick={() => createFrom('classic')}
          >
            {i18next.t('app:pages.cv.index.start_building')}{' '}<ArrowRightOutlined />
          </Button>
        </section>
      </div>
    </div>
  );
};

export default CvListPage;
