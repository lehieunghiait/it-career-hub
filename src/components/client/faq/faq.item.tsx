import React from 'react';
import { Collapse, Typography } from 'antd';
import type { CollapseProps } from 'antd';
import styles from 'styles/client.module.scss';

// Khai báo interface cho câu hỏi thường gặp
export interface FaqItemType {
  id: string | number;
  question: string;
  answer: string;
  category: string;
}

// Khai báo props cho component
interface FaqItemProps {
  faqItems: FaqItemType[];
  activeCategory: string;
}

// Component FaqItem hiển thị danh sách câu hỏi thường gặp dưới dạng accordion
const FaqItem: React.FC<FaqItemProps> = ({ faqItems, activeCategory }) => {
  // Lọc các câu hỏi theo danh mục đang active
  const filteredItems = faqItems.filter(
    item => activeCategory === 'Tất cả' || item.category === activeCategory
  );

  // Tạo danh sách các item cho Collapse component
  const collapseItems: CollapseProps['items'] = filteredItems.map(item => ({
    key: item.id,
    label: (
      <Typography.Title level={5} style={{ margin: 0 }}>
        {item.question}
      </Typography.Title>
    ),
    children: (
      <Typography.Paragraph className={styles['faq-answer']}>{item.answer}</Typography.Paragraph>
    ),
  }));

  return (
    <div className={styles['faq-item-container']}>
      {filteredItems.length > 0 ? (
        <Collapse
          bordered={false}
          expandIconPosition='end'
          className={styles['faq-collapse']}
          items={collapseItems}
        />
      ) : (
        <Typography.Paragraph className={styles['faq-empty']}>
          Không có câu hỏi nào trong danh mục này.
        </Typography.Paragraph>
      )}
    </div>
  );
};

export default FaqItem;
