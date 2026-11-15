import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin, Typography, Button, Skeleton } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ArrowRightOutlined } from '@ant-design/icons';
const { Title } = Typography;
import SeeMoreLink from '@/components/client/common/SeeMoreLink';
interface IProps {
  showPagination?: boolean;
}

const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles['custom-arrow']} ${styles['custom-next-arrow']}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <RightOutlined />
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles['custom-arrow']} ${styles['custom-prev-arrow']}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <LeftOutlined />
    </div>
  );
};

const CompanyCard = (props: IProps) => {
  const { showPagination = false } = props;
  const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [sortQuery, setSortQuery] = useState('sort=-updatedAt');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompany();
  }, [current, pageSize, filter, sortQuery]);

  const fetchCompany = async () => {
    setIsLoading(true);
    let query = `current=${current}&pageSize=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    const res = await callFetchCompany(query);
    if (res && res.data) {
      setDisplayCompany(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  const handleOnchangePage = (pagination: { current: number; pageSize: number }) => {
    if (pagination && pagination.current !== current) {
      setCurrent(pagination.current);
    }
    if (pagination && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1);
    }
  };

  const handleViewDetailJob = (item: ICompany) => {
    if (item.name) {
      const slug = convertSlug(item.name);
      navigate(`/company/${slug}?id=${item._id}`);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: displayCompany && displayCompany.length > 4 ? 4 : displayCompany?.length || 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  /**
   *
   * @returns Render company cards in slider for homepage and grid for other pages
   */
  const renderCompanyCards = () => {
    if (!displayCompany || displayCompany.length === 0) {
      return (
        <Row gutter={[24, 24]} className={styles['row-company-grid']}>
          {Array.from({ length: showPagination ? pageSize : 4 }).map((_, index) => (
            <Col span={24} md={12} lg={6} key={index}>
              <Card className={styles['company-card']}>
                <Skeleton.Image active style={{ width: '100%', height: '250px' }} />
                <div style={{ padding: '20px' }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                  <Skeleton.Button active block style={{ marginTop: '12px' }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    // Render company cards in slider for homepage
    if (!showPagination && displayCompany.length >= 3) {
      return (
        <div className={styles['company-slider']}>
          <Slider {...settings}>{displayCompany.map(item => renderCompanyCard(item))}</Slider>
        </div>
      );
    }

    return (
      <Row gutter={[24, 24]} className={styles['row-company-grid']}>
        {displayCompany.map(item => (
          <Col span={24} md={12} lg={6} key={item._id}>
            {renderCompanyCard(item)}
          </Col>
        ))}
      </Row>
    );
  };

  const renderCompanyCard = (item: ICompany) => {
    // Clean description text by removing HTML tags
    const cleanDescription = item.description
      ? item.description.replace(/<\/?[^>]+(>|$)/g, '')
      : '';

    return (
      <Card
        className={styles['company-card']}
        onClick={() => handleViewDetailJob(item)}
        hoverable
        cover={
          <div className={styles['card-image-container']}>
            <img alt={item.name} src={item.logo} className={styles['company-image']} />
          </div>
        }
      >
        <div className={styles['company-card-content']}>
          <Title level={5} className={styles['company-name']} title={item.name}>
            {item.name}
          </Title>
          {cleanDescription && (
            <p className={styles['company-description']} title={cleanDescription}>
              {cleanDescription}
            </p>
          )}
          <Button type='primary' className={styles['view-btn']}>
            {'See more'}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className={`${styles['company-section']}`}>
      <div className={styles['company-content']}>
        <Spin spinning={isLoading} tip='Loading...'>
          <div className={styles['section-header']}>
            <Title level={3} className={styles['section-title']}>
              {'Top IT Companies in Vietnam 🇻🇳'}
            </Title>
            {!showPagination && <SeeMoreLink to='company' />}
          </div>

          {renderCompanyCards()}

          {showPagination && displayCompany && displayCompany.length > 0 && (
            <div className={styles['pagination-container']}>
              <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                responsive
                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
              />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default CompanyCard;
