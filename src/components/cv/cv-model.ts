import i18next from 'i18next';
/**
 * Content of an online CV (stored as `data` on the CV document)
 */
export interface ICvItem {
  title?: string; // company / school / project / certificate name
  subtitle?: string; // position / major / role / issuer
  start?: string;
  end?: string;
  link?: string;
  description?: string;
}

export interface ICvData {
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  birthday?: string;
  avatar?: string; // small JPEG data URL, resized in the browser
  summary?: string;
  skills?: string[];
  languages?: string[];
  experiences?: ICvItem[];
  educations?: ICvItem[];
  projects?: ICvItem[];
  certificates?: ICvItem[];
}

export type CvTemplate = 'classic' | 'modern' | 'minimal';

export interface ICv {
  _id?: string;
  title: string;
  template: CvTemplate;
  color: string;
  data: ICvData;
  createdAt?: string;
  updatedAt?: string;
}

export const CV_TEMPLATES: { key: CvTemplate; name: string; description: string }[] = [
  { key: 'classic', name: 'Professional', get description() { return i18next.t('app:components.cv.cv_model.accent_bar_timeline_and_skill_pills'); } },
  { key: 'modern', name: 'Creative', get description() { return i18next.t('app:components.cv.cv_model.soft_colored_sidebar_with_photo'); } },
  { key: 'minimal', name: 'Minimal', get description() { return i18next.t('app:components.cv.cv_model.big_name_airy_two_column_layout'); } },
];

export const CV_COLORS = ['#e14000', '#2563eb', '#0d9488', '#7c3aed', '#db2777', '#0f172a'];

export const emptyCvData = (fullName = '', email = ''): ICvData => ({
  fullName,
  headline: '',
  email,
  phone: '',
  address: '',
  website: '',
  summary: '',
  skills: [],
  languages: [],
  experiences: [{}],
  educations: [{}],
  projects: [],
  certificates: [],
});

// Used for template thumbnails and as a writing hint
export const SAMPLE_CV: ICvData = {
  fullName: 'Nguyễn Minh Anh',
  headline: 'Senior Backend Developer',
  email: 'minhanh.dev@gmail.com',
  phone: '0912 345 678',
  address: 'Quận 7, TP. Hồ Chí Minh',
  website: 'github.com/minhanh',
  summary:
    '6 năm kinh nghiệm xây dựng hệ thống backend cho fintech và thương mại điện tử. Thế mạnh về Node.js, thiết kế microservices và tối ưu hiệu năng cơ sở dữ liệu.',
  skills: ['Node.js', 'NestJS', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
  languages: ['Tiếng Anh (IELTS 7.0)', 'Tiếng Việt'],
  experiences: [
    {
      get title() { return i18next.t('app:components.cv.cv_model.cong_ty_co_phan_cong_nghe'); },
      get subtitle() { return i18next.t('app:components.cv.cv_model.senior_backend_developer'); },
      start: '03/2022',
      end: 'Hiện tại',
      get description() { return i18next.t('app:components.cv.cv_model.thiet_ke_lai_dich_vu_thanh'); },
    },
    {
      get title() { return i18next.t('app:components.cv.cv_model.xyz_software'); },
      get subtitle() { return i18next.t('app:components.cv.cv_model.backend_developer'); },
      start: '07/2019',
      end: '02/2022',
      get description() { return i18next.t('app:components.cv.cv_model.xay_dung_rest_api_cho_ung'); },
    },
  ],
  educations: [
    {
      get title() { return i18next.t('app:components.cv.cv_model.dai_hoc_bach_khoa_tp_hcm'); },
      get subtitle() { return i18next.t('app:components.cv.cv_model.ky_su_khoa_hoc_may_tinh'); },
      start: '2015',
      end: '2019',
      get description() { return i18next.t('app:components.cv.cv_model.gpa_3_4_4_0'); },
    },
  ],
  projects: [
    {
      get title() { return i18next.t('app:components.cv.cv_model.he_thong_dat_ve_su_kien'); },
      get subtitle() { return i18next.t('app:components.cv.cv_model.tech_lead'); },
      start: '2023',
      end: '2023',
      get description() { return i18next.t('app:components.cv.cv_model.nestjs_redis_rabbitmq_xu_ly_5'); },
    },
  ],
  certificates: [{ get title() { return i18next.t('app:components.cv.cv_model.aws_certified_developer_associate'); }, get subtitle() { return i18next.t('app:components.cv.cv_model.amazon'); }, end: '2023' }],
};

/**
 * Splits a description into paragraphs and bullet points ("- " or "• " at the start of a line)
 */
export const descriptionLines = (text = '') =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const bullet = /^[-•*]\s*/.test(line);
      return { bullet, text: bullet ? line.replace(/^[-•*]\s*/, '') : line };
    });

export const dateRange = (item: ICvItem) =>
  item.start && item.start === item.end
    ? item.start
    : [item.start, item.end].filter(Boolean).join(' – ');
