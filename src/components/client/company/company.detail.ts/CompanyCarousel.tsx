import { Card, Carousel, Skeleton } from 'antd';
import styles from '@/styles/client.module.scss';
import { useTranslation } from 'react-i18next';
import Title from 'antd/lib/typography/Title';

interface ICompanyCarouselProps {
  images: string[];
  loading?: boolean;
}

const CompanyCarousel = ({ images, loading = false }: ICompanyCarouselProps) => {
  const { t } = useTranslation('companyDetail');

  if (loading) {
    return (
      <Card className={styles['company-slider-image']}>
        <Skeleton.Input active block style={{ marginBottom: '20px', width: '200px' }} />
        <div className={styles['company-slider']}>
          <Skeleton.Image active className={styles['company-slider-image-item']} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles['company-slider-image']}>
      <Title level={4}>{t('Overview.CompanyImage')}</Title>
      <Carousel autoplay arrows={true} dots={true} className={styles['company-slider']}>
        {images.map((image, index) => (
          <div className={styles['company-slider-image-item']} key={index}>
            <img src={image} alt={`company-slider-image-${index}`} />
          </div>
        ))}
      </Carousel>
    </Card>
  );
};

export default CompanyCarousel;
