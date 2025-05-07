import { FaqItemType } from './faq.item';

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
    question: 'Làm thế nào để tạo tài khoản trên IT Việc?',
    answer:
      'Để tạo tài khoản trên IT Việc, bạn có thể nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web. Sau đó, bạn cần điền thông tin cá nhân như họ tên, email, mật khẩu và làm theo các hướng dẫn để hoàn tất quá trình đăng ký.',
    category: 'Tài khoản',
  },
  {
    id: 2,
    question: 'Tôi quên mật khẩu, làm thế nào để khôi phục?',
    answer:
      'Nếu bạn quên mật khẩu, bạn có thể nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi một email khôi phục mật khẩu đến địa chỉ email mà bạn đã đăng ký. Làm theo hướng dẫn trong email để đặt lại mật khẩu của bạn.',
    category: 'Tài khoản',
  },
  {
    id: 3,
    question: 'Làm thế nào để cập nhật hồ sơ cá nhân?',
    answer:
      'Để cập nhật hồ sơ cá nhân, đăng nhập vào tài khoản của bạn và nhấp vào tên người dùng ở góc trên bên phải, sau đó chọn "Quản lý tài khoản". Tại đây, bạn có thể cập nhật thông tin cá nhân, kinh nghiệm làm việc, kỹ năng và thông tin liên hệ của mình.',
    category: 'Tài khoản',
  },
  {
    id: 4,
    question: 'Làm thế nào để tìm việc phù hợp với kỹ năng của tôi?',
    answer:
      'IT Việc cung cấp công cụ tìm kiếm nâng cao cho phép bạn lọc các công việc dựa trên kỹ năng, vị trí, mức lương và nhiều tiêu chí khác. Bạn cũng có thể đăng ký nhận thông báo việc làm để nhận các cơ hội việc làm phù hợp với hồ sơ của bạn qua email.',
    category: 'Tìm việc',
  },
  {
    id: 5,
    question: 'Làm thế nào để ứng tuyển vào một vị trí?',
    answer:
      'Để ứng tuyển vào một vị trí, hãy nhấp vào nút "Ứng tuyển ngay" trên trang chi tiết công việc. Bạn sẽ được yêu cầu gửi CV và có thể thêm thư xin việc. Đảm bảo rằng hồ sơ của bạn đã được cập nhật đầy đủ trước khi ứng tuyển.',
    category: 'Tìm việc',
  },
  {
    id: 6,
    question: 'Tôi có thể theo dõi trạng thái ứng tuyển của mình như thế nào?',
    answer:
      'Sau khi ứng tuyển, bạn có thể theo dõi trạng thái ứng tuyển bằng cách đăng nhập vào tài khoản và truy cập mục "Việc làm đã ứng tuyển". Tại đây, bạn sẽ thấy danh sách các vị trí đã ứng tuyển và trạng thái hiện tại của chúng.',
    category: 'Tìm việc',
  },
  {
    id: 7,
    question: 'Làm thế nào để đăng tin tuyển dụng?',
    answer:
      'Để đăng tin tuyển dụng, bạn cần đăng nhập với tài khoản nhà tuyển dụng. Sau đó, nhấp vào "Đăng tin tuyển dụng" và điền đầy đủ thông tin về vị trí cần tuyển, yêu cầu công việc, mức lương và thông tin liên hệ. Sau khi xem lại, bạn có thể đăng tin và nó sẽ được hiển thị trên trang việc làm.',
    category: 'Nhà tuyển dụng',
  },
  {
    id: 8,
    question: 'Chi phí đăng tin tuyển dụng là bao nhiêu?',
    answer:
      'Chi phí đăng tin tuyển dụng phụ thuộc vào gói dịch vụ mà bạn lựa chọn. Chúng tôi cung cấp nhiều gói khác nhau với các tính năng và thời hạn khác nhau. Vui lòng truy cập mục "Bảng giá" để xem chi tiết về các gói và lựa chọn phù hợp với nhu cầu của công ty bạn.',
    category: 'Nhà tuyển dụng',
  },
  {
    id: 9,
    question: 'Làm thế nào để sàng lọc ứng viên hiệu quả?',
    answer:
      'IT Việc cung cấp công cụ quản lý ứng viên giúp bạn sàng lọc hiệu quả. Bạn có thể đánh giá CV, ghi chú, phân loại ứng viên và theo dõi tiến trình tuyển dụng. Ngoài ra, chúng tôi cũng cung cấp tính năng gửi email hàng loạt và lên lịch phỏng vấn trực tiếp từ hệ thống.',
    category: 'Nhà tuyển dụng',
  },
  {
    id: 10,
    question: 'IT Việc chấp nhận những phương thức thanh toán nào?',
    answer:
      'IT Việc chấp nhận nhiều phương thức thanh toán bao gồm thẻ tín dụng/ghi nợ (Visa, MasterCard), chuyển khoản ngân hàng, và các ví điện tử phổ biến như Momo, ZaloPay, VNPay. Bạn có thể chọn phương thức thanh toán thuận tiện nhất khi tiến hành thanh toán.',
    category: 'Thanh toán',
  },
  {
    id: 11,
    question: 'Làm thế nào để nhận hóa đơn VAT?',
    answer:
      'Để nhận hóa đơn VAT, bạn cần cung cấp thông tin xuất hóa đơn khi thanh toán hoặc liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi qua email support@itviec.com sau khi hoàn tất thanh toán. Hóa đơn điện tử sẽ được gửi đến email của bạn trong vòng 3-5 ngày làm việc.',
    category: 'Thanh toán',
  },
  {
    id: 12,
    question: 'Chính sách hoàn tiền của IT Việc như thế nào?',
    answer:
      'IT Việc có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với dịch vụ. Tuy nhiên, việc hoàn tiền sẽ không áp dụng nếu bạn đã sử dụng một phần dịch vụ như đăng tin tuyển dụng, xem thông tin ứng viên hoặc sử dụng các tính năng khác. Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm chi tiết.',
    category: 'Thanh toán',
  },
  {
    id: 13,
    question: 'IT Việc bảo vệ dữ liệu cá nhân của tôi như thế nào?',
    answer:
      'IT Việc áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ thông tin cá nhân của bạn. Chúng tôi sử dụng mã hóa SSL, lưu trữ dữ liệu an toàn và tuân thủ các quy định về bảo vệ dữ liệu. Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý của bạn.',
    category: 'Bảo mật',
  },
  {
    id: 14,
    question: 'Làm thế nào để tăng cường bảo mật cho tài khoản của tôi?',
    answer:
      'Để tăng cường bảo mật cho tài khoản, bạn nên sử dụng mật khẩu mạnh, thay đổi mật khẩu định kỳ, và bật xác thực hai yếu tố nếu có. Đồng thời, hãy đảm bảo rằng bạn đăng xuất khỏi tài khoản khi sử dụng máy tính công cộng và cập nhật thông tin liên hệ để có thể khôi phục tài khoản khi cần thiết.',
    category: 'Bảo mật',
  },
  {
    id: 15,
    question: 'Làm thế nào để báo cáo vấn đề bảo mật hoặc lừa đảo?',
    answer:
      'Nếu bạn phát hiện vấn đề bảo mật hoặc nghi ngờ có hoạt động lừa đảo trên IT Việc, vui lòng liên hệ ngay với chúng tôi qua email security@itviec.com hoặc hotline 1900 1234. Chúng tôi có đội ngũ chuyên trách xử lý các vấn đề bảo mật và sẽ phản hồi trong thời gian sớm nhất.',
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
