import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ICv } from './cv-model';
import CvLayout, { CV_FONT, CvPrimitives, flattenStyle } from './CvLayout';
import { CV_FONT_FILES } from './cv-fonts';
import s from 'styles/cv.module.scss';

import i18next from 'i18next';

// A4 in pt; the sheet is drawn at 1pt = 1px and scaled to the available width
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded || typeof FontFace === 'undefined') return;
  fontsLoaded = true;
  CV_FONT_FILES.forEach(file => {
    const face = new FontFace(CV_FONT, `url(${file.src})`, {
      weight: String(file.fontWeight),
      style: file.fontStyle ?? 'normal',
    });
    face.load().then(loaded => document.fonts.add(loaded));
  });
};

const box = {
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  minWidth: 0,
} as const;

const htmlPrimitives: CvPrimitives = {
  Page: ({ style, children }) => (
    <div className={s['sheet']} style={{ ...box, minHeight: A4_HEIGHT, ...flattenStyle(style) }}>
      {children}
    </div>
  ),
  View: ({ style, children }) => <div style={{ ...box, ...flattenStyle(style) }}>{children}</div>,
  Text: ({ style, children }) => (
    <div style={{ boxSizing: 'border-box', overflowWrap: 'anywhere', ...flattenStyle(style) }}>
      {children}
    </div>
  ),
  Image: ({ src, style }) => (
    <img src={src} alt='' style={{ display: 'block', ...flattenStyle(style) }} />
  ),
  Link: ({ src, style, children }) => (
    <a
      href={src}
      target='_blank'
      rel='noreferrer'
      style={{ display: 'block', ...flattenStyle(style) }}
    >
      {children}
    </a>
  ),
};

/**
 * Instant HTML preview of the CV, same layout as the exported PDF
 */
const CvHtmlPreview = ({ cv }: { cv: ICv }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(A4_HEIGHT);

  useEffect(loadFonts, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1.4, frame.clientWidth / A4_WIDTH))
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Track the page height so the scaled box (and the page-break guides) follow the content
  useLayoutEffect(() => {
    const page = sheetRef.current?.firstElementChild as HTMLElement | null;
    if (page && page.offsetHeight !== height) setHeight(page.offsetHeight);
  });

  const pages = Math.max(1, Math.ceil(height / A4_HEIGHT));

  return (
    <div ref={frameRef} className={s['html-preview']}>
      <div style={{ height: pages * A4_HEIGHT * scale, position: 'relative' }}>
        <div
          ref={sheetRef}
          className={s['sheet-wrap']}
          style={{ width: A4_WIDTH, minHeight: pages * A4_HEIGHT, transform: `scale(${scale})` }}
        >
          <CvLayout cv={cv} primitives={htmlPrimitives} />
          {Array.from({ length: pages - 1 }).map((_, i) => (
            <div key={i} className={s['page-break']} style={{ top: (i + 1) * A4_HEIGHT }}>
              <span>{i18next.t('app:components.cv.CvHtmlPreview.page')}{' '}{i + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CvHtmlPreview;
