import React from 'react';
import { Input, Button, Row, Col, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';

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
            Câu Hỏi Thường Gặp
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: 'center', fontSize: 16 }}>
            Tìm kiếm câu trả lời cho những thắc mắc của bạn
          </Typography.Paragraph>
        </Col>
        <Col xs={24} md={16} lg={12}>
          <Input
            size='large'
            placeholder='Nhập từ khóa để tìm kiếm câu hỏi...'
            value={searchValue}
            onChange={handleChange}
            suffix={
              <Button
                type='primary'
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className={styles['faq-search-button']}
              >
                Tìm kiếm
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
