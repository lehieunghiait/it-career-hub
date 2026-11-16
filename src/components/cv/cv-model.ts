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
  { key: 'classic', name: 'Professional', description: 'Accent bar, timeline and skill pills' },
  { key: 'modern', name: 'Creative', description: 'Soft colored sidebar with photo' },
  { key: 'minimal', name: 'Minimal', description: 'Big name, airy two-column layout' },
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
      title: 'Công ty Cổ phần Công nghệ ABC',
      subtitle: 'Senior Backend Developer',
      start: '03/2022',
      end: 'Hiện tại',
      description:
        '- Thiết kế lại dịch vụ thanh toán, giảm 40% thời gian xử lý\n- Dẫn dắt nhóm 5 kỹ sư, review code và mentoring\n- Triển khai CI/CD với GitHub Actions và AWS ECS',
    },
    {
      title: 'XYZ Software',
      subtitle: 'Backend Developer',
      start: '07/2019',
      end: '02/2022',
      description:
        '- Xây dựng REST API cho ứng dụng giao hàng 1 triệu người dùng\n- Viết unit test, độ phủ 85%',
    },
  ],
  educations: [
    {
      title: 'Đại học Bách khoa TP.HCM',
      subtitle: 'Kỹ sư Khoa học Máy tính',
      start: '2015',
      end: '2019',
      description: 'GPA 3.4/4.0',
    },
  ],
  projects: [
    {
      title: 'Hệ thống đặt vé sự kiện',
      subtitle: 'Tech lead',
      start: '2023',
      end: '2023',
      description: 'NestJS, Redis, RabbitMQ — xử lý 5.000 đơn/phút giờ cao điểm',
    },
  ],
  certificates: [{ title: 'AWS Certified Developer – Associate', subtitle: 'Amazon', end: '2023' }],
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
