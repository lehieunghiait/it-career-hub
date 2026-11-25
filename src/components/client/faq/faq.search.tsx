import React from 'react';
import { Input, Button, Row, Col, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

// Khai báo props cho component
interface FaqSearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
}

// Component FaqSearch hiển thị thanh tìm kiếm câu hỏi
const FaqSearch: React.FC<FaqSearchProps> = ({ searchValue, onSearch }) => {
  // Xử lý sự kiện khi người dùng thay đổi giá trị tìm kiếm
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  // Xử lý sự kiện khi người dùng nhấn nút tìm kiếm
  const handleSearch = () => {
    // Có thể thêm logic bổ sung nếu cần
  };

  return (
    <div className={styles['faq-search-container']}>
      <Row justify='center' align='middle' gutter={[0, 20]}>
        <Col xs={24}>
          <Typography.Title level={2} style={{ textAlign: 'center' }}>
            {i18next.t('app:components.client.faq.faq_search.cau_hoi_thuong_gap')}
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: 'center', fontSize: 16 }}>
            {i18next.t('app:components.client.faq.faq_search.tim_kiem_cau_tra_loi_cho')}
          </Typography.Paragraph>
        </Col>
        <Col xs={24} md={16} lg={12}>
          <Input
            size='large'
            placeholder={i18next.t('app:components.client.faq.faq_search.nhap_tu_khoa_de_tim_kiem')}
            value={searchValue}
            onChange={handleChange}
            suffix={
              <Button
                type='primary'
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className={styles['faq-search-button']}
              >
                {i18next.t('app:components.client.faq.faq_search.tim_kiem')}
              </Button>
            }
            className={styles['faq-search-input']}
          />
        </Col>
      </Row>
    </div>
  );
};

export default FaqSearch;
