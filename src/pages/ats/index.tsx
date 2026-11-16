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
  { label: 'React', matched: true },
  { label: 'TypeScript', matched: true },
  { label: 'Node.js', matched: true },
  { label: 'REST API', matched: true },
  { label: 'Docker', matched: false },
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
        <span className={s['live-dot']}>Analyzing</span>
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
            <span className={s['score-caption']}>ATS Score</span>
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
    title: 'Get Past the First Filter',
    description:
      'Optimize your CV to rank higher in ATS scoring algorithms and reach human recruiters.',
    tone: 'orange',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Increase Interview Chances',
    description: 'ATS-optimized CVs have 3x higher chance of getting interview callbacks.',
    tone: 'green',
  },
  {
    icon: <BulbOutlined />,
    title: 'Know What to Improve',
    description: 'Get actionable insights on missing keywords, skills, and formatting issues.',
    tone: 'gold',
  },
  {
    icon: <TrophyOutlined />,
    title: 'Stand Out from Competition',
    description: 'Beat 80% of candidates who submit non-optimized resumes.',
    tone: 'violet',
  },
];

const STEPS = [
  {
    icon: <CloudUploadOutlined />,
    title: 'Upload Your CV',
    description: 'Upload your resume in PDF or DOC format',
  },
  {
    icon: <FileSearchOutlined />,
    title: 'Select Target Job',
    description: 'Choose the job position you want to apply for',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'AI Analysis',
    description: 'Our AI scans and compares your CV with job requirements',
  },
  {
    icon: <TrophyOutlined />,
    title: 'Get Results',
    description: 'Receive detailed ATS score and improvement recommendations',
  },
];

const REPORT_BARS = [
  { label: 'Keyword match', value: 82 },
  { label: 'Skills match', value: 90 },
  { label: 'Experience match', value: 75 },
  { label: 'Format quality', value: 95 },
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
        <span>Analysis report</span>
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
        <BulbOutlined /> Add <b>Docker</b> and <b>AWS</b> experience to raise your score by ~9
        points.
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
                  <span className={s['badge-dot']} /> AI-Powered CV Analysis
                </div>
                <h1 className={s['hero-title']}>
                  Beat the ATS System,
                  <br />
                  <span className={s['highlight']}>Land Your Dream Job</span>
                </h1>
                <p className={s['hero-description']}>
                  75% of resumes are rejected by ATS before reaching human recruiters. Our
                  AI-powered analyzer scores your CV against real job requirements and shows you
                  exactly what to fix.
                </p>
                <div className={s['hero-actions']}>
                  <Button
                    type='primary'
                    size='large'
                    icon={<RocketOutlined />}
                    onClick={goAnalyze}
                    className={s['cta-button']}
                  >
                    Analyze Your CV Now
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
                    How It Works
                  </Button>
                </div>
                <div className={s['hero-stats']}>
                  <CountStat value={10000} suffix='+' label='CVs Analyzed' />
                  <CountStat value={85} suffix='%' label='Success Rate' />
                  <CountStat value={4.8} decimals={1} suffix='/5' label='User Rating' />
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
              <span className={s['eyebrow']}>The basics</span>
              <h2 className={s['section-title']}>What is an Applicant Tracking System?</h2>
              <p className={s['section-subtitle']}>
                Understanding the technology that screens your resume
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
                  <h3>The Challenge</h3>
                  <p>
                    <strong>ATS</strong> is software used by 99% of Fortune 500 companies to
                    automatically screen resumes. It scans, parses, and ranks candidates based on:
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
                  <h3>The Reality</h3>
                  <div className={s['reality-grid']}>
                    {[
                      { big: '75%', text: 'of resumes never reach human recruiters' },
                      { big: '6 sec', text: 'average time ATS spends scanning a resume' },
                      {
                        big: '43%',
                        text: 'of qualified candidates are rejected due to poor CV formatting',
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
              <span className={s['eyebrow']}>Why it matters</span>
              <h2 className={s['section-title']}>Why Your CV Needs ATS Optimization</h2>
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
              <span className={s['eyebrow']}>How it works</span>
              <h2 className={s['section-title']}>From upload to insights in 4 steps</h2>
              <p className={s['section-subtitle']}>It takes about 10 seconds</p>
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
                <span className={s['eyebrow']}>What you get</span>
                <h2 className={s['section-title']} style={{ textAlign: 'left' }}>
                  A report that tells you exactly what to fix
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
              <span className={s['eyebrow']}>Testimonials</span>
              <h2 className={s['section-title']}>What Our Users Say</h2>
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
              <h2>Ready to optimize your CV?</h2>
              <p>Get your ATS score and a personalized improvement plan in seconds.</p>
              <div className={s['hero-actions']} style={{ justifyContent: 'center' }}>
                <Button
                  size='large'
                  icon={<RocketOutlined />}
                  onClick={goAnalyze}
                  className={s['cta-light']}
                >
                  Analyze Your CV Now
                </Button>
                <Button
                  size='large'
                  ghost
                  className={s['ghost-button']}
                  onClick={() => navigate('/job')}
                >
                  Browse IT Jobs <ArrowRightOutlined />
                </Button>
              </div>
              <div className={s['cta-note']}>
                <CheckCircleFilled /> Free to use · Instant results · Powered by AI
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default ATSLandingPage;
