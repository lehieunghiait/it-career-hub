import { CvTemplate } from './cv-model';
import s from 'styles/cv.module.scss';

// Lightweight drawing of each template layout, used in the gallery and the template picker
const Lines = ({ count, short = false }: { count: number; short?: boolean }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <i
        key={i}
        className={s['t-line']}
        style={{ width: short && i === count - 1 ? '60%' : undefined }}
      />
    ))}
  </>
);

const TemplateThumb = ({ template, color }: { template: CvTemplate; color: string }) => {
  if (template === 'modern') {
    return (
      <div className={`${s['thumb']} ${s['thumb-modern']}`}>
        <div className={s['t-side']} style={{ background: color }}>
          <span className={s['t-avatar']} />
          <Lines count={6} />
        </div>
        <div className={s['t-main']}>
          <b className={s['t-name']} style={{ background: color }} />
          <Lines count={2} short />
          <b className={s['t-head']} style={{ background: color }} />
          <Lines count={4} short />
          <b className={s['t-head']} style={{ background: color }} />
          <Lines count={4} short />
        </div>
      </div>
    );
  }
  if (template === 'minimal') {
    return (
      <div className={`${s['thumb']} ${s['thumb-minimal']}`}>
        <div className={s['t-row']}>
          <span className={s['t-photo']} />
          <div style={{ flex: 1 }}>
            <b className={s['t-name']} />
            <i className={s['t-line']} style={{ width: '50%', background: color }} />
          </div>
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className={s['t-row']}>
            <b className={s['t-label']} style={{ background: color }} />
            <div style={{ flex: 1 }}>
              <Lines count={3} short />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`${s['thumb']} ${s['thumb-classic']}`}>
      <b className={s['t-name']} style={{ background: color, margin: '0 auto 6px' }} />
      <i className={s['t-line']} style={{ width: '60%', margin: '0 auto 10px' }} />
      {[0, 1, 2].map(i => (
        <div key={i}>
          <b className={s['t-head']} style={{ background: color }} />
          <Lines count={3} short />
        </div>
      ))}
    </div>
  );
};

export default TemplateThumb;
