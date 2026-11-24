import { useEffect, useRef, useState } from 'react';
import { Button, Col, Row } from 'antd';
import {
  ArrowRightOutlined,
  BulbOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CloudUploadOutlined,
  FileSearchOutlined,
  LineChartOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/client.module.scss';
import s from '@/styles/ats-landing.module.scss';

import i18next from 'i18next';

// Becomes true once the element scrolls into view (used for reveal + count-up)
const useInView = <T extends HTMLElement>(threshold = 0.2) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

const useCountUp = (target: number, start: boolean, duration = 1600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration]);

  return value;
};

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={`${s['reveal']} ${inView ? s['revealed'] : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const CountStat = ({
  value,
  decimals = 0,
  suffix = '',
  label,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const current = useCountUp(value, inView);
  return (
    <div ref={ref} className={s['stat-item']}>
      <div className={s['stat-number']}>
        {current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </div>
      <div className={s['stat-label']}>{label}</div>
    </div>
  );
};

const SCORE = 87;
const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const DEMO_KEYWORDS = [
  { get label() { return i18next.t('app:pages.ats.index.react'); }, matched: true },
  { get label() { return i18next.t('app:pages.ats.index.typescript'); }, matched: true },
  { get label() { return i18next.t('app:pages.ats.index.node_js'); }, matched: true },
  { get label() { return i18next.t('app:pages.ats.index.rest_api'); }, matched: true },
  { get label() { return i18next.t('app:pages.ats.index.docker'); }, matched: false },
  { label: 'AWS', matched: false },
];

const ScanCard = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const score = Math.round(useCountUp(SCORE, inView, 2200));

  return (
    <div ref={ref} className={`${s['scan-card']} ${inView ? s['is-active'] : ''}`}>
      <div className={s['scan-card-header']}>
        <div className={s['file-chip']}>
          <FileSearchOutlined /> nguyen-van-a_cv.pdf
        </div>
        <span className={s['live-dot']}>{i18next.t('app:pages.ats.index.analyzing')}</span>
      </div>

      <div className={s['scan-body']}>
        <div className={s['cv-preview']}>
          <div className={s['cv-avatar']} />
          <div className={`${s['cv-line']} ${s['w-70']}`} />
          <div className={`${s['cv-line']} ${s['w-45']}`} />
          <div className={s['cv-gap']} />
          {[90, 80, 95, 60, 85, 70, 75].map((w, i) => (
            <div key={i} className={s['cv-line']} style={{ width: `${w}%` }} />
          ))}
          <div className={s['scan-beam']} />
        </div>

        <div className={s['score-panel']}>
          <svg viewBox='0 0 120 120' className={s['score-ring']}>
            <defs>
              <linearGradient id='atsRing' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stopColor='#ff7a45' />
                <stop offset='100%' stopColor='#e14000' />
              </linearGradient>
            </defs>
            <circle cx='60' cy='60' r={RING_RADIUS} className={s['ring-track']} />
            <circle
              cx='60'
              cy='60'
              r={RING_RADIUS}
              className={s['ring-value']}
              stroke='url(#atsRing)'
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - score / 100)}
            />
          </svg>
          <div className={s['score-text']}>
            <span className={s['score-number']}>{score}</span>
            <span className={s['score-caption']}>{i18next.t('app:pages.ats.index.ats_score')}</span>
          </div>
        </div>
      </div>

      <div className={s['keyword-list']}>
        {DEMO_KEYWORDS.map((k, i) => (
          <span
            key={k.label}
            className={`${s['keyword']} ${k.matched ? s['matched'] : s['missing']}`}
            style={{ animationDelay: `${1.2 + i * 0.18}s` }}
          >
            {k.matched ? <CheckCircleFilled /> : <CloseCircleFilled />} {k.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const MARQUEE_WORDS = [
  'Java',
  'React.js',
  'Node.js',
  'Python',
  'Golang',
  'AWS',
  'Docker',
  'Kubernetes',
  'Spring Boot',
  'TypeScript',
  '.NET',
  'Microservices',
  'PostgreSQL',
  'CI/CD',
];

const BENEFITS = [
  {
    icon: <ThunderboltOutlined />,
    get title() { return i18next.t('app:pages.ats.index.get_past_the_first_filter'); },
    get description() { return i18next.t('app:pages.ats.index.optimize_your_cv_to_rank_higher'); },
    tone: 'orange',
  },
  {
    icon: <LineChartOutlined />,
    get title() { return i18next.t('app:pages.ats.index.increase_interview_chances'); },
    get description() { return i18next.t('app:pages.ats.index.ats_optimized_cvs_have_3x_higher'); },
    tone: 'green',
  },
  {
    icon: <BulbOutlined />,
    get title() { return i18next.t('app:pages.ats.index.know_what_to_improve'); },
    get description() { return i18next.t('app:pages.ats.index.get_actionable_insights_on_missing_keywords'); },
    tone: 'gold',
  },
  {
    icon: <TrophyOutlined />,
    get title() { return i18next.t('app:pages.ats.index.stand_out_from_competition'); },
    get description() { return i18next.t('app:pages.ats.index.beat_80_of_candidates_who_submit'); },
    tone: 'violet',
  },
];

const STEPS = [
  {
    icon: <CloudUploadOutlined />,
    get title() { return i18next.t('app:pages.ats.index.upload_your_cv'); },
    get description() { return i18next.t('app:pages.ats.index.upload_your_resume_in_pdf_or'); },
  },
  {
    icon: <FileSearchOutlined />,
    get title() { return i18next.t('app:pages.ats.index.select_target_job'); },
    get description() { return i18next.t('app:pages.ats.index.choose_the_job_position_you_want'); },
  },
  {
    icon: <ThunderboltOutlined />,
    get title() { return i18next.t('app:pages.ats.index.ai_analysis'); },
    get description() { return i18next.t('app:pages.ats.index.our_ai_scans_and_compares_your'); },
  },
  {
    icon: <TrophyOutlined />,
    get title() { return i18next.t('app:pages.ats.index.get_results'); },
    get description() { return i18next.t('app:pages.ats.index.receive_detailed_ats_score_and_improvement'); },
  },
];

const REPORT_BARS = [
  { get label() { return i18next.t('app:pages.ats.index.keyword_match'); }, value: 82 },
  { get label() { return i18next.t('app:pages.ats.index.skills_match'); }, value: 90 },
  { get label() { return i18next.t('app:pages.ats.index.experience_match'); }, value: 75 },
  { get label() { return i18next.t('app:pages.ats.index.format_quality'); }, value: 95 },
];

const TESTIMONIALS = [
  {
    name: 'Le Hieu Nghia',
    role: 'Senior Frontend Developer',
    avatar: '👨‍💻',
    comment:
      'This tool helped me identify missing keywords in my CV. After optimization, I got 3 interview calls in a week!',
  },
  {
    name: 'Le Hieu Nghia',
    role: 'Full Stack Developer',
    avatar: '👩‍💻',
    comment:
      'The skill gap analysis was eye-opening. I realized I needed to highlight my cloud experience more prominently.',
  },
  {
    name: 'Le Hieu Nghia',
    role: 'DevOps Engineer',
    avatar: '🧑‍💻',
    comment:
      'Quick, accurate, and actionable insights. My ATS score improved from 62 to 89 after following the recommendations.',
  },
];

const ReportPreview = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={`${s['report-card']} ${inView ? s['is-active'] : ''}`}>
      <div className={s['report-header']}>
        <span>{i18next.t('app:pages.ats.index.analysis_report')}</span>
        <span className={s['report-score']}>87 / 100</span>
      </div>
      {REPORT_BARS.map((bar, i) => (
        <div key={bar.label} className={s['bar-row']}>
          <div className={s['bar-label']}>
            <span>{bar.label}</span>
            <b>{bar.value}%</b>
          </div>
          <div className={s['bar-track']}>
            <div
              className={s['bar-fill']}
              style={{
                width: inView ? `${bar.value}%` : 0,
                transitionDelay: `${i * 150}ms`,
              }}
            />
          </div>
        </div>
      ))}
      <div className={s['report-tip']}>
        <BulbOutlined /> {i18next.t('app:pages.ats.index.add')}{' '}<b>{i18next.t('app:pages.ats.index.docker')}</b> and <b>AWS</b> {i18next.t('app:pages.ats.index.experience_to_raise_your_score_by')}
      </div>
    </div>
  );
};

const ATSLandingPage = () => {
  const navigate = useNavigate();
  const goAnalyze = () => navigate('/ats/analyzer');

  return (
    <div className={s['ats-landing']}>
      {/* HERO */}
      <section className={s['hero-section']}>
        <div className={s['blob-a']} />
        <div className={s['blob-b']} />
        <div className={s['grid-overlay']} />
        <div className={styles['container']}>
          <Row gutter={[{ xs: 0, lg: 30 }, 40]} align='middle'>
            <Col xs={24} lg={12}>
              <div className={s['hero-content']}>
                <div className={s['badge']}>
                  <span className={s['badge-dot']} /> {i18next.t('app:pages.ats.index.ai_powered_cv_analysis')}
                </div>
                <h1 className={s['hero-title']}>
                  {i18next.t('app:pages.ats.index.beat_the_ats_system')}
                  <br />
                  <span className={s['highlight']}>{i18next.t('app:pages.ats.index.land_your_dream_job')}</span>
                </h1>
                <p className={s['hero-description']}>
                  {i18next.t('app:pages.ats.index.t_75_of_resumes_are_rejected_by')}
                </p>
                <div className={s['hero-actions']}>
                  <Button
                    type='primary'
                    size='large'
                    icon={<RocketOutlined />}
                    onClick={goAnalyze}
                    className={s['cta-button']}
                  >
                    {i18next.t('app:pages.ats.index.analyze_your_cv_now')}
                  </Button>
                  <Button
                    size='large'
                    ghost
                    className={s['ghost-button']}
                    onClick={() =>
                      document
                        .getElementById('how-it-works')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    {i18next.t('app:pages.ats.index.how_it_works')}
                  </Button>
                </div>
                <div className={s['hero-stats']}>
                  <CountStat value={10000} suffix='+' label={i18next.t('app:pages.ats.index.cvs_analyzed')} />
                  <CountStat value={85} suffix='%' label={i18next.t('app:pages.ats.index.success_rate')} />
                  <CountStat value={4.8} decimals={1} suffix='/5' label={i18next.t('app:pages.ats.index.user_rating')} />
                </div>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <ScanCard />
            </Col>
          </Row>
        </div>
      </section>

      {/* KEYWORD MARQUEE */}
      <div className={s['marquee']} aria-hidden>
        <div className={s['marquee-track']}>
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className={s['marquee-item']}>
              <CheckCircleFilled /> {w}
            </span>
          ))}
        </div>
      </div>

      {/* WHAT IS ATS */}
      <section className={s['section']}>
        <div className={styles['container']}>
          <Reveal>
            <div className={s['section-header']}>
              <span className={s['eyebrow']}>{i18next.t('app:pages.ats.index.the_basics')}</span>
              <h2 className={s['section-title']}>{i18next.t('app:pages.ats.index.what_is_an_applicant_tracking_system')}</h2>
              <p className={s['section-subtitle']}>
                {i18next.t('app:pages.ats.index.understanding_the_technology_that_screens_your')}
              </p>
            </div>
          </Reveal>
          <Row gutter={[24, 24]} align='stretch'>
            <Col xs={24} md={12}>
              <Reveal>
                <div className={s['info-card']}>
                  <div className={`${s['icon-badge']} ${s['orange']}`}>
                    <SafetyCertificateOutlined />
                  </div>
                  <h3>{i18next.t('app:pages.ats.index.the_challenge')}</h3>
                  <p>
                    <strong>ATS</strong> {i18next.t('app:pages.ats.index.is_software_used_by_99_of')}
                  </p>
                  <ul className={s['check-list']}>
                    {[
                      'Keyword matching',
                      'Skills relevance',
                      'Experience level',
                      'Education requirements',
                      'Resume formatting',
                    ].map(item => (
                      <li key={item}>
                        <CheckCircleFilled /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </Col>
            <Col xs={24} md={12}>
              <Reveal delay={120}>
                <div className={`${s['info-card']} ${s['dark']}`}>
                  <div className={`${s['icon-badge']} ${s['violet']}`}>
                    <TrophyOutlined />
                  </div>
                  <h3>{i18next.t('app:pages.ats.index.the_reality')}</h3>
                  <div className={s['reality-grid']}>
                    {[
                      { big: '75%', text: i18next.t('app:pages.ats.index.of_resumes_never_reach_human_recruiters') },
                      { big: '6 sec', text: i18next.t('app:pages.ats.index.average_time_ats_spends_scanning_a') },
                      {
                        big: '43%',
                        text: i18next.t('app:pages.ats.index.of_qualified_candidates_are_rejected_due'),
                      },
                    ].map(item => (
                      <div key={item.big} className={s['reality-item']}>
                        <div className={s['reality-big']}>{item.big}</div>
                        <div className={s['reality-text']}>{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </Col>
          </Row>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={`${s['section']} ${s['tinted']}`}>
        <div className={styles['container']}>
          <Reveal>
            <div className={s['section-header']}>
              <span className={s['eyebrow']}>{i18next.t('app:pages.ats.index.why_it_matters')}</span>
              <h2 className={s['section-title']}>{i18next.t('app:pages.ats.index.why_your_cv_needs_ats_optimization')}</h2>
            </div>
          </Reveal>
          <Row gutter={[24, 24]}>
            {BENEFITS.map((item, i) => (
              <Col xs={24} sm={12} lg={6} key={item.title}>
                <Reveal delay={i * 100}>
                  <div className={s['benefit-card']}>
                    <div className={`${s['icon-badge']} ${s[item.tone]}`}>{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s['section']} id='how-it-works'>
        <div className={styles['container']}>
          <Reveal>
            <div className={s['section-header']}>
              <span className={s['eyebrow']}>{i18next.t('app:pages.ats.index.how_it_works_2')}</span>
              <h2 className={s['section-title']}>{i18next.t('app:pages.ats.index.from_upload_to_insights_in_4')}</h2>
              <p className={s['section-subtitle']}>{i18next.t('app:pages.ats.index.it_takes_about_10_seconds')}</p>
            </div>
          </Reveal>
          <div className={s['steps']}>
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className={s['step-card']}>
                  <div className={s['step-number']}>{i + 1}</div>
                  <div className={s['step-icon']}>{step.icon}</div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES / REPORT PREVIEW */}
      <section className={`${s['section']} ${s['tinted']}`}>
        <div className={styles['container']}>
          <Row gutter={[{ xs: 0, lg: 30 }, 40]} align='middle'>
            <Col xs={24} lg={11}>
              <Reveal>
                <span className={s['eyebrow']}>{i18next.t('app:pages.ats.index.what_you_get')}</span>
                <h2 className={s['section-title']} style={{ textAlign: 'left' }}>
                  {i18next.t('app:pages.ats.index.a_report_that_tells_you_exactly')}
                </h2>
                <ul className={s['feature-list']}>
                  {[
                    ['ATS Score (0-100)', 'Instant compatibility score against the job'],
                    ['Skills Gap Analysis', 'Which required skills you have and which are missing'],
                    ['Keyword Optimization', 'Important keywords missing from your CV'],
                    ['Actionable Recommendations', 'Prioritized suggestions for every section'],
                  ].map(([title, desc]) => (
                    <li key={title}>
                      <CheckCircleFilled className={s['feature-icon']} />
                      <div>
                        <h4>{title}</h4>
                        <p>{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Col>
            <Col xs={24} lg={13}>
              <ReportPreview />
            </Col>
          </Row>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={s['section']}>
        <div className={styles['container']}>
          <Reveal>
            <div className={s['section-header']}>
              <span className={s['eyebrow']}>{i18next.t('app:pages.ats.index.testimonials')}</span>
              <h2 className={s['section-title']}>{i18next.t('app:pages.ats.index.what_our_users_say')}</h2>
            </div>
          </Reveal>
          <Row gutter={[24, 24]}>
            {TESTIMONIALS.map((t, i) => (
              <Col xs={24} md={8} key={i}>
                <Reveal delay={i * 120}>
                  <div className={s['testimonial-card']}>
                    <div className={s['rating']}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <StarFilled key={k} />
                      ))}
                    </div>
                    <p className={s['comment']}>&ldquo;{t.comment}&rdquo;</p>
                    <div className={s['testimonial-author']}>
                      <div className={s['avatar']}>{t.avatar}</div>
                      <div>
                        <h4>{t.name}</h4>
                        <span>{t.role}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={s['final-cta']}>
        <div className={styles['container']}>
          <Reveal>
            <div className={s['cta-content']}>
              <h2>{i18next.t('app:pages.ats.index.ready_to_optimize_your_cv')}</h2>
              <p>{i18next.t('app:pages.ats.index.get_your_ats_score_and_a')}</p>
              <div className={s['hero-actions']} style={{ justifyContent: 'center' }}>
                <Button
                  size='large'
                  icon={<RocketOutlined />}
                  onClick={goAnalyze}
                  className={s['cta-light']}
                >
                  {i18next.t('app:pages.ats.index.analyze_your_cv_now')}
                </Button>
                <Button
                  size='large'
                  ghost
                  className={s['ghost-button']}
                  onClick={() => navigate('/job')}
                >
                  {i18next.t('app:pages.ats.index.browse_it_jobs')}{' '}<ArrowRightOutlined />
                </Button>
              </div>
              <div className={s['cta-note']}>
                <CheckCircleFilled /> {i18next.t('app:pages.ats.index.free_to_use_instant_results_powered')}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default ATSLandingPage;
