import { Card, Carousel, Skeleton, Empty } from 'antd';
import styles from '@/styles/client.module.scss';
import { PictureOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';

interface ICompanyCarouselProps {
  images: string[];
  loading?: boolean;
}

const CompanyCarousel = ({ images, loading = false }: ICompanyCarouselProps) => {
  if (loading) {
    return (
      <Card className={styles['company-slider-image']} bordered={false}>
        <Skeleton.Input
          active
          block
          style={{ marginBottom: '20px', width: '200px', height: '32px' }}
        />
        <div className={styles['company-slider']}>
          <Skeleton.Image active style={{ width: '100%', height: '500px' }} />
        </div>
      </Card>
    );
  }
  // If no images, show empty card
  if (!images || images.length === 0) {
    return (
      <Card
        className={styles['company-slider-image']}
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined style={{ color: '#1677ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              Company Image
            </Title>
          </div>
        }
      >
        <Empty description='No images available' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    // If images, show carousel
    <Card
      className={styles['company-slider-image']}
      bordered={false}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PictureOutlined style={{ color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Company Image
          </Title>
        </div>
      }
    >
      <Carousel
        autoplay
        autoplaySpeed={4000}
        arrows={true}
        dots={true}
        className={styles['company-slider']}
        pauseOnHover={true}
        draggable={true}
      >
        {images.map((image, index) => (
          <div
            className={styles['company-slider-image-item']}
            key={index}
            style={{ height: '500px', width: '100%' }}
          >
            <img
              src={image}
              alt={`Company workspace ${index + 1}`}
              loading='lazy'
              style={{
                height: '500px',
                width: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </Carousel>
    </Card>
  );
};
export default CompanyCarousel;
