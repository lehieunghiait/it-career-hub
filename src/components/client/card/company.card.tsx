import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin, Typography, Button } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title } = Typography;

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
  const [pageSize, setPageSize] = useState(8); // Tăng kích thước trang để hiển thị nhiều công ty hơn
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

  const renderCompanyCards = () => {
    if (!displayCompany || displayCompany.length === 0) {
      return (
        <div className={styles['empty']}>
          <Empty description='Không có dữ liệu' />
        </div>
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

    // Render company cards in grid for company page
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
    return (
      <Card
        className={styles['company-card']}
        onClick={() => handleViewDetailJob(item)}
        hoverable
        cover={
          <div className={styles['card-image-container']}>
            <img
              alt={item.name}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.logo}`}
              className={styles['company-image']}
            />
          </div>
        }
      >
        <div className={styles['company-card-content']}>
          <Title level={5} className={styles['company-name']}>
            {item.name}
          </Title>
          {item.description && (
            <p className={styles['company-description']}>
              {item.description.length > 80
                ? `${item.description.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 80)}...`
                : item.description.replace(/<\/?[^>]+(>|$)/g, '')}
            </p>
          )}
          <Button type='primary' className={styles['view-btn']}>
            Xem chi tiết
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
              Nhà Tuyển Dụng Hàng Đầu
            </Title>
            {!showPagination && (
              <Link to='/company' className={styles['view-all-link']}>
                Xem tất cả
              </Link>
            )}
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
