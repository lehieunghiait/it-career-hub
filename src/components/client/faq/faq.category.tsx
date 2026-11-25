import React from 'react';
import { Typography, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

// Khai báo kiểu dữ liệu cho props
interface FaqCategoryProps {
  categories: string[];
  activeCategory: string;
  onChangeCategory: (category: string) => void;
}

// Component FaqCategory hiển thị các tab danh mục
const FaqCategory: React.FC<FaqCategoryProps> = ({
  categories,
  activeCategory,
  onChangeCategory,
}) => {
  // Xử lý sự kiện khi thay đổi tab
  const handleChangeTab = (activeKey: string) => {
    onChangeCategory(activeKey);
  };

  // Biến đổi danh sách danh mục thành các items cho component Tabs
  const tabItems: TabsProps['items'] = categories.map(category => ({
    key: category,
    label: category,
  }));

  return (
    <div className={styles['faq-category-container']}>
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        {i18next.t('app:components.client.faq.faq_category.danh_muc')}
      </Typography.Title>
      <Tabs
        centered
        activeKey={activeCategory}
        onChange={handleChangeTab}
        items={tabItems}
        size='large'
        type='card'
        className={styles['faq-tabs']}
      />
    </div>
  );
};

export default FaqCategory;
