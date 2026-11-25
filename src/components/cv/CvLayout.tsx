import type { CSSProperties, FC, ReactNode } from 'react';
import { ICv, ICvData, ICvItem, dateRange, descriptionLines } from './cv-model';

import i18next from 'i18next';

/**
 * CV templates written once against a few primitives (Page / View / Text / Image / Link).
 * The live preview renders them as HTML, the export renders them with react-pdf, so what you
 * see while typing is what ends up in the PDF. Sizes are in pt (1pt = 1px in the preview sheet).
 */
type Style = Record<string, string | number | undefined>;
type StyleProp = Style | (Style | false | null | undefined)[];

export interface CvPrimitives {
  Page: FC<{ style?: StyleProp; children?: ReactNode }>;
  View: FC<{ style?: StyleProp; fixed?: boolean; wrap?: boolean; children?: ReactNode }>;
  Text: FC<{ style?: StyleProp; minPresenceAhead?: number; children?: ReactNode }>;
  Image: FC<{ src: string; style?: StyleProp }>;
  Link: FC<{ src: string; style?: StyleProp; children?: ReactNode }>;
}

export const flattenStyle = (style?: StyleProp): CSSProperties =>
  (Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : (style ?? {})) as CSSProperties;

export const CV_FONT = 'BeVietnamPro';
const INK = '#111827';
const BODY = '#374151';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

// Mixes a hex color with white (amount 0..1), for soft backgrounds
export const tint = (hex: string, amount: number) => {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
  return `#${channels
    .map(c =>
      Math.round(c + (255 - c) * amount)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
};

const has = (list?: ICvItem[]) =>
  (list ?? []).filter(item => item.title || item.subtitle || item.description);

const contactItems = (data: ICvData) =>
  [data.email, data.phone, data.address, data.website, data.birthday].filter(Boolean) as string[];

const mainSections = (data: ICvData) =>
  [
    { key: 'summary', title: i18next.t('app:components.cv.CvLayout.about_me'), text: data.summary },
    { key: 'experiences', title: i18next.t('app:components.cv.CvLayout.experience'), items: has(data.experiences) },
    { key: 'projects', title: i18next.t('app:components.cv.CvLayout.projects'), items: has(data.projects) },
    { key: 'educations', title: i18next.t('app:components.cv.CvLayout.education'), items: has(data.educations) },
    { key: 'certificates', title: i18next.t('app:components.cv.CvLayout.certificates'), items: has(data.certificates) },
  ].filter(section => (section.items ? section.items.length > 0 : !!section.text?.trim()));

const base = {
  page: {
    fontFamily: CV_FONT,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: BODY,
    backgroundColor: '#ffffff',
  },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
  bulletText: { flex: 1 },
  paragraph: { marginBottom: 2 },
};

interface Ctx {
  p: CvPrimitives;
  data: ICvData;
  color: string;
}

const Description = ({ p, text }: { p: CvPrimitives; text?: string; color: string }) => (
  <>
    {descriptionLines(text).map((line, index) =>
      line.bullet ? (
        <p.View key={index} style={base.bulletRow} wrap={false}>
          <p.Text style={{ width: 10, color: MUTED }}>•</p.Text>
          <p.Text style={base.bulletText}>{line.text}</p.Text>
        </p.View>
      ) : (
        <p.Text key={index} style={base.paragraph}>
          {line.text}
        </p.Text>
      )
    )}
  </>
);

const linkHref = (link: string) => (/^https?:\/\//.test(link) ? link : `https://${link}`);

// Experience-like entry drawn on a vertical timeline
const TimelineItem = ({
  p,
  item,
  color,
  last,
}: {
  p: CvPrimitives;
  item: ICvItem;
  color: string;
  last: boolean;
}) => (
  <p.View
    style={{
      position: 'relative',
      paddingLeft: 14,
      paddingBottom: last ? 2 : 11,
      borderLeftWidth: 1.5,
      borderLeftStyle: 'solid',
      borderLeftColor: tint(color, 0.7),
      marginLeft: 3,
    }}
  >
    <p.View
      style={{
        position: 'absolute',
        left: -4.75,
        top: 3,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: color,
      }}
    />
    <p.View style={{ flexDirection: 'row', justifyContent: 'space-between' }} wrap={false}>
      <p.Text style={{ flex: 1, paddingRight: 8, fontSize: 10.5, fontWeight: 700, color: INK }}>
        {item.title}
      </p.Text>
      {dateRange(item) ? (
        <p.Text
          style={{
            fontSize: 8,
            fontWeight: 600,
            color,
            backgroundColor: tint(color, 0.9),
            borderRadius: 8,
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          {dateRange(item)}
        </p.Text>
      ) : null}
    </p.View>
    {item.subtitle ? (
      <p.Text style={{ fontWeight: 600, color, marginBottom: 2 }}>{item.subtitle}</p.Text>
    ) : null}
    {item.link ? (
      <p.Link
        src={linkHref(item.link)}
        style={{ color: MUTED, textDecoration: 'none', fontSize: 8.5 }}
      >
        {item.link}
      </p.Link>
    ) : null}
    <Description p={p} text={item.description} color={color} />
  </p.View>
);

const Pills = ({
  p,
  list,
  color,
  onDark = false,
}: {
  p: CvPrimitives;
  list: string[];
  color: string;
  onDark?: boolean;
}) => (
  <p.View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {list.map(text => (
      <p.Text
        key={text}
        style={{
          marginRight: 4,
          marginBottom: 4,
          paddingTop: 2,
          paddingBottom: 2,
          paddingLeft: 7,
          paddingRight: 7,
          borderRadius: 9,
          fontSize: 8.5,
          fontWeight: 600,
          color: onDark ? color : INK,
          backgroundColor: onDark ? '#ffffff' : tint(color, 0.88),
        }}
      >
        {text}
      </p.Text>
    ))}
  </p.View>
);

/* ---------------- Professional: accent bar, pills, timeline ---------------- */
const SectionTitle = ({ p, title, color }: { p: CvPrimitives; title: string; color: string }) => (
  <p.View
    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}
    wrap={false}
  >
    <p.View
      style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color, marginRight: 7 }}
    />
    <p.Text
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        color: INK,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
      }}
      minPresenceAhead={40}
    >
      {title}
    </p.Text>
    <p.View style={{ flex: 1, height: 1, backgroundColor: LINE, marginLeft: 10 }} />
  </p.View>
);

const ProfessionalTemplate = ({ p, data, color }: Ctx) => (
  <p.Page
    style={[base.page, { paddingTop: 0, paddingBottom: 34, paddingLeft: 0, paddingRight: 0 }]}
  >
    <p.View style={{ height: 6, backgroundColor: color }} />
    <p.View style={{ paddingTop: 26, paddingLeft: 40, paddingRight: 40 }}>
      <p.View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {data.avatar ? (
          <p.Image
            src={data.avatar}
            style={{ width: 64, height: 64, borderRadius: 32, marginRight: 16, objectFit: 'cover' }}
          />
        ) : null}
        <p.View style={{ flex: 1 }}>
          <p.Text style={{ fontSize: 26, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            {data.fullName}
          </p.Text>
          {data.headline ? (
            <p.Text style={{ fontSize: 12, fontWeight: 600, color, marginTop: 3 }}>
              {data.headline}
            </p.Text>
          ) : null}
        </p.View>
      </p.View>
      <p.View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {contactItems(data).map(text => (
          <p.Text
            key={text}
            style={{
              marginRight: 5,
              marginBottom: 5,
              paddingTop: 2,
              paddingBottom: 2,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 9,
              fontSize: 8.5,
              color: BODY,
              backgroundColor: '#f3f4f6',
            }}
          >
            {text}
          </p.Text>
        ))}
      </p.View>

      {mainSections(data).map(section => (
        <p.View key={section.key}>
          <SectionTitle p={p} title={section.title} color={color} />
          {section.items ? (
            section.items.map((item, index) => (
              <TimelineItem
                key={index}
                p={p}
                item={item}
                color={color}
                last={index === section.items!.length - 1}
              />
            ))
          ) : (
            <Description p={p} text={section.text} color={color} />
          )}
        </p.View>
      ))}
      {[
        { title: i18next.t('app:common.skills'), list: data.skills },
        { title: i18next.t('app:components.cv.CvLayout.languages'), list: data.languages },
      ]
        .filter(group => group.list?.length)
        .map(group => (
          <p.View key={group.title} wrap={false}>
            <SectionTitle p={p} title={group.title} color={color} />
            <Pills p={p} list={group.list!} color={color} />
          </p.View>
        ))}
    </p.View>
  </p.Page>
);

/* ---------------- Creative: soft tinted sidebar ---------------- */
const SIDEBAR_WIDTH = 190;

const SideTitle = ({ p, title, color }: { p: CvPrimitives; title: string; color: string }) => (
  <p.Text
    style={{
      fontSize: 9,
      fontWeight: 700,
      color,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      marginTop: 16,
      marginBottom: 7,
    }}
  >
    {title}
  </p.Text>
);

const MainTitle = ({ p, title, color }: { p: CvPrimitives; title: string; color: string }) => (
  <p.View
    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 9 }}
    wrap={false}
  >
    <p.View
      style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: color, marginRight: 8 }}
    />
    <p.Text style={{ fontSize: 12, fontWeight: 700, color: INK }} minPresenceAhead={40}>
      {title}
    </p.Text>
  </p.View>
);

const CreativeTemplate = ({ p, data, color }: Ctx) => (
  <p.Page style={[base.page, { flexDirection: 'row' }]}>
    {/* Background band repeated on every page; content flows in the row below */}
    <p.View
      fixed
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: tint(color, 0.9),
      }}
    />
    <p.View
      style={{
        position: 'relative',
        width: SIDEBAR_WIDTH,
        paddingTop: 34,
        paddingBottom: 30,
        paddingLeft: 22,
        paddingRight: 18,
      }}
    >
      {data.avatar ? (
        <p.Image
          src={data.avatar}
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            alignSelf: 'center',
            marginBottom: 6,
            objectFit: 'cover',
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: '#ffffff',
          }}
        />
      ) : null}
      <SideTitle p={p} title={i18next.t('app:components.cv.CvLayout.contact')} color={color} />
      {contactItems(data).map(text => (
        <p.Text key={text} style={{ fontSize: 8.5, color: INK, marginBottom: 5 }}>
          {text}
        </p.Text>
      ))}
      {data.skills?.length ? (
        <>
          <SideTitle p={p} title={i18next.t('app:common.skills')} color={color} />
          <Pills p={p} list={data.skills} color={color} onDark />
        </>
      ) : null}
      {data.languages?.length ? (
        <>
          <SideTitle p={p} title={i18next.t('app:components.cv.CvLayout.languages')} color={color} />
          {data.languages.map(text => (
            <p.Text key={text} style={{ fontSize: 8.5, color: INK, marginBottom: 4 }}>
              {text}
            </p.Text>
          ))}
        </>
      ) : null}
    </p.View>
    <p.View
      style={{
        position: 'relative',
        flex: 1,
        paddingTop: 34,
        paddingBottom: 30,
        paddingLeft: 26,
        paddingRight: 30,
      }}
    >
      <p.Text style={{ fontSize: 26, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
        {data.fullName}
      </p.Text>
      {data.headline ? (
        <p.Text style={{ fontSize: 12, fontWeight: 600, color, marginTop: 3, marginBottom: 4 }}>
          {data.headline}
        </p.Text>
      ) : null}
      {mainSections(data).map(section => (
        <p.View key={section.key}>
          <MainTitle p={p} title={section.title} color={color} />
          {section.items ? (
            section.items.map((item, index) => (
              <TimelineItem
                key={index}
                p={p}
                item={item}
                color={color}
                last={index === section.items!.length - 1}
              />
            ))
          ) : (
            <Description p={p} text={section.text} color={color} />
          )}
        </p.View>
      ))}
    </p.View>
  </p.Page>
);

/* ---------------- Minimal: big name, labels on the left ---------------- */
const MinimalTemplate = ({ p, data, color }: Ctx) => {
  const rowStyle = {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: LINE,
    paddingTop: 12,
    paddingBottom: 4,
  };
  const labelStyle = {
    width: 110,
    paddingRight: 10,
    fontSize: 8.5,
    fontWeight: 700,
    color,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  };
  const entry = (item: ICvItem, index: number) => (
    <p.View key={index} style={{ marginBottom: 10 }}>
      <p.View style={{ flexDirection: 'row', justifyContent: 'space-between' }} wrap={false}>
        <p.Text style={{ flex: 1, paddingRight: 8, fontSize: 10.5, fontWeight: 700, color: INK }}>
          {item.title}
        </p.Text>
        <p.Text style={{ fontSize: 8.5, color: MUTED }}>{dateRange(item)}</p.Text>
      </p.View>
      {item.subtitle ? (
        <p.Text style={{ fontWeight: 600, color: INK, marginBottom: 2 }}>{item.subtitle}</p.Text>
      ) : null}
      {item.link ? (
        <p.Link
          src={linkHref(item.link)}
          style={{ color: MUTED, textDecoration: 'none', fontSize: 8.5 }}
        >
          {item.link}
        </p.Link>
      ) : null}
      <Description p={p} text={item.description} color={color} />
    </p.View>
  );
  return (
    <p.Page
      style={[base.page, { paddingTop: 44, paddingBottom: 36, paddingLeft: 46, paddingRight: 46 }]}
    >
      <p.View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
        <p.View style={{ flex: 1 }}>
          <p.Text
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            {data.fullName}
          </p.Text>
          {data.headline ? (
            <p.Text style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{data.headline}</p.Text>
          ) : null}
          <p.View
            style={{
              width: 36,
              height: 3,
              borderRadius: 2,
              backgroundColor: color,
              marginTop: 10,
              marginBottom: 10,
            }}
          />
          <p.View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {contactItems(data).map(text => (
              <p.Text key={text} style={{ fontSize: 8.5, color: MUTED, marginRight: 14 }}>
                {text}
              </p.Text>
            ))}
          </p.View>
        </p.View>
        {data.avatar ? (
          <p.Image
            src={data.avatar}
            style={{ width: 76, height: 76, borderRadius: 10, marginLeft: 16, objectFit: 'cover' }}
          />
        ) : null}
      </p.View>
      {mainSections(data).map(section => (
        <p.View key={section.key} style={rowStyle}>
          <p.Text style={labelStyle}>{section.title}</p.Text>
          <p.View style={{ flex: 1 }}>
            {section.items ? (
              section.items.map(entry)
            ) : (
              <p.View style={{ marginBottom: 8 }}>
                <Description p={p} text={section.text} color={color} />
              </p.View>
            )}
          </p.View>
        </p.View>
      ))}
      {[
        { key: 'skills', title: i18next.t('app:common.skills'), list: data.skills },
        { key: 'languages', title: i18next.t('app:components.cv.CvLayout.languages'), list: data.languages },
      ]
        .filter(row => row.list?.length)
        .map(row => (
          <p.View key={row.key} style={rowStyle} wrap={false}>
            <p.Text style={labelStyle}>{row.title}</p.Text>
            <p.View style={{ flex: 1 }}>
              <Pills p={p} list={row.list!} color={color} />
            </p.View>
          </p.View>
        ))}
    </p.Page>
  );
};

const TEMPLATES = {
  classic: ProfessionalTemplate,
  modern: CreativeTemplate,
  minimal: MinimalTemplate,
};

const CvLayout = ({ cv, primitives }: { cv: ICv; primitives: CvPrimitives }) => {
  const Template = TEMPLATES[cv.template] ?? ProfessionalTemplate;
  return <Template p={primitives} data={cv.data} color={cv.color || '#e14000'} />;
};

export default CvLayout;
