import React, { useState, useEffect } from 'react';
import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import {
  FaqSearch,
  FaqCategory,
  FaqItem,
  faqCategories,
  faqItems,
  searchFaqItems,
} from '@/components/client/faq';

const FaqPage: React.FC = () => {
  // State cho từ khóa tìm kiếm
  const [searchValue, setSearchValue] = useState<string>('');

  // State cho danh mục được chọn
  const [activeCategory, setActiveCategory] = useState<string>(faqCategories[0]);

  // State cho danh sách câu hỏi được lọc theo từ khóa
  const [filteredItems, setFilteredItems] = useState(faqItems);

  // Cập nhật danh sách câu hỏi khi từ khóa tìm kiếm thay đổi
  useEffect(() => {
    if (searchValue) {
      const results = searchFaqItems(faqItems, searchValue);
      setFilteredItems(results);
      setActiveCategory('Tất cả');
    } else {
      setFilteredItems(faqItems);
    }
  }, [searchValue]);

  // Xử lý sự kiện thay đổi từ khóa tìm kiếm
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Xử lý sự kiện thay đổi danh mục
  const handleChangeCategory = (category: string) => {
    setActiveCategory(category);
    setSearchValue('');
  };

  return (
    <div className={styles['container']}>
      {/* Component tìm kiếm */}
      <FaqSearch searchValue={searchValue} onSearch={handleSearch} />

      <Divider />

      {/* Component chọn danh mục */}
      <FaqCategory
        categories={faqCategories}
        activeCategory={activeCategory}
        onChangeCategory={handleChangeCategory}
      />

      {/* Component hiển thị danh sách câu hỏi */}
      <FaqItem faqItems={filteredItems} activeCategory={activeCategory} />
    </div>
  );
};

export default FaqPage;
