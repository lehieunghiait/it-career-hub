import { FaqItemType } from './faq.item';

import i18next from 'i18next';

// Danh sách các danh mục câu hỏi
export const faqCategories: string[] = [
  'Tất cả',
  'Tài khoản',
  'Tìm việc',
  'Nhà tuyển dụng',
  'Thanh toán',
  'Bảo mật',
];

// Danh sách các câu hỏi thường gặp
export const faqItems: FaqItemType[] = [
  {
    id: 1,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_tao_tai'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.de_tao_tai_khoan_tren_it'); },
    category: 'Tài khoản',
  },
  {
    id: 2,
    get question() { return i18next.t('app:components.client.faq.faq_data.toi_quen_mat_khau_lam_the'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.neu_ban_quen_mat_khau_ban'); },
    category: 'Tài khoản',
  },
  {
    id: 3,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_cap_nhat'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.de_cap_nhat_ho_so_ca'); },
    category: 'Tài khoản',
  },
  {
    id: 4,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_tim_viec'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.it_viec_cung_cap_cong_cu'); },
    category: 'Tìm việc',
  },
  {
    id: 5,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_ung_tuyen'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.de_ung_tuyen_vao_mot_vi'); },
    category: 'Tìm việc',
  },
  {
    id: 6,
    get question() { return i18next.t('app:components.client.faq.faq_data.toi_co_the_theo_doi_trang'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.sau_khi_ung_tuyen_ban_co'); },
    category: 'Tìm việc',
  },
  {
    id: 7,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_dang_tin'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.de_dang_tin_tuyen_dung_ban'); },
    category: 'Nhà tuyển dụng',
  },
  {
    id: 8,
    get question() { return i18next.t('app:components.client.faq.faq_data.chi_phi_dang_tin_tuyen_dung'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.chi_phi_dang_tin_tuyen_dung_2'); },
    category: 'Nhà tuyển dụng',
  },
  {
    id: 9,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_sang_loc'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.it_viec_cung_cap_cong_cu_2'); },
    category: 'Nhà tuyển dụng',
  },
  // {
  //   id: 10,
  //   question: 'IT Việc chấp nhận những phương thức thanh toán nào?',
  //   answer:
  //     'IT Việc chấp nhận nhiều phương thức thanh toán bao gồm thẻ tín dụng/ghi nợ (Visa, MasterCard), chuyển khoản ngân hàng, và các ví điện tử phổ biến như Momo, ZaloPay, VNPay. Bạn có thể chọn phương thức thanh toán thuận tiện nhất khi tiến hành thanh toán.',
  //   category: 'Thanh toán',
  // },
  // {
  //   id: 11,
  //   question: 'Làm thế nào để nhận hóa đơn VAT?',
  //   answer:
  //     'Để nhận hóa đơn VAT, bạn cần cung cấp thông tin xuất hóa đơn khi thanh toán hoặc liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi qua email support@itviec.com sau khi hoàn tất thanh toán. Hóa đơn điện tử sẽ được gửi đến email của bạn trong vòng 3-5 ngày làm việc.',
  //   category: 'Thanh toán',
  // },
  // {
  //   id: 12,
  //   question: 'Chính sách hoàn tiền của IT Việc như thế nào?',
  //   answer:
  //     'IT Việc có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với dịch vụ. Tuy nhiên, việc hoàn tiền sẽ không áp dụng nếu bạn đã sử dụng một phần dịch vụ như đăng tin tuyển dụng, xem thông tin ứng viên hoặc sử dụng các tính năng khác. Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm chi tiết.',
  //   category: 'Thanh toán',
  // },
  {
    id: 13,
    get question() { return i18next.t('app:components.client.faq.faq_data.it_viec_bao_ve_du_lieu'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.it_viec_ap_dung_cac_bien'); },
    category: 'Bảo mật',
  },
  {
    id: 14,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_tang_cuong'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.de_tang_cuong_bao_mat_cho'); },
    category: 'Bảo mật',
  },
  {
    id: 15,
    get question() { return i18next.t('app:components.client.faq.faq_data.lam_the_nao_de_bao_cao'); },
    get answer() { return i18next.t('app:components.client.faq.faq_data.neu_ban_phat_hien_van_de'); },
    category: 'Bảo mật',
  },
];

// Hàm tìm kiếm câu hỏi theo từ khóa
export const searchFaqItems = (items: FaqItemType[], keyword: string): FaqItemType[] => {
  if (!keyword.trim()) return items;

  const lowerKeyword = keyword.toLowerCase().trim();

  return items.filter(
    item =>
      item.question.toLowerCase().includes(lowerKeyword) ||
      item.answer.toLowerCase().includes(lowerKeyword)
  );
};
