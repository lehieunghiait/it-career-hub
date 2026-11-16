import { Card, Col, Row, Skeleton } from 'antd';
import styles from 'styles/client.module.scss';

interface IProps {
  count?: number; // Số lượng skeleton cards muốn hiển thị
}

const JobCardSkeleton = ({ count = 5 }: IProps) => {
  const renderSkeletonCard = (key: number) => (
    <Col span={24} md={12} key={key}>
      <Card size='small'>
        <div className={styles['card-job-content']}>
          {/* Skeleton for company logo */}
          <div className={styles['card-job-left']}>
            <Skeleton.Avatar
              active
              size={50}
              shape='square'
              style={{
                width: '50px',
                height: '50px',
              }}
            />
          </div>

          {/* Skeleton for job details */}
          <div className={styles['card-job-right']}>
            {/* Job title skeleton */}
            <Skeleton
              active
              title={{
                width: '80%',
                style: { marginBottom: '10px' },
              }}
              paragraph={false}
            />

            {/* Location skeleton */}
            <Skeleton
              active
              title={{
                width: '60%',
                style: { marginBottom: '8px', height: '16px' },
              }}
              paragraph={false}
            />

            {/* Salary skeleton */}
            <Skeleton
              active
              title={{
                width: '50%',
                style: { marginBottom: '8px', height: '16px' },
              }}
              paragraph={false}
            />

            {/* Updated time skeleton */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton
                active
                title={{
                  width: '100px',
                  style: { height: '14px' },
                }}
                paragraph={false}
              />
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <Row gutter={[20, 20]}>
      {Array.from({ length: count }).map((_, index) => renderSkeletonCard(index))}
    </Row>
  );
};

export default JobCardSkeleton;
