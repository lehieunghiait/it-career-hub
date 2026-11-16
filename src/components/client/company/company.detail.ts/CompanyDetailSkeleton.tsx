import { Card, Skeleton, Row, Col, Space } from 'antd';
import styles from 'styles/client.module.scss';

const CompanyDetailSkeleton = () => {
  return (
    <>
      <Card className={styles['company-detail-skeleton']} bordered={false}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={8}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
              <Skeleton.Avatar active size={160} shape='square' />
              <Skeleton active title paragraph={{ rows: 4 }} />
              <Skeleton active title={false} paragraph={{ rows: 3 }} />
            </Space>
          </Col>
          <Col xs={24} lg={16}>
            <Skeleton active title paragraph={{ rows: 8 }} />
          </Col>
        </Row>
      </Card>

      <Card
        className={styles['company-detail-skeleton']}
        bordered={false}
        style={{ marginTop: '24px' }}
      >
        <Skeleton active title paragraph={{ rows: 2 }} />
      </Card>

      <Card
        className={styles['company-detail-skeleton']}
        bordered={false}
        style={{ marginTop: '24px' }}
      >
        <Skeleton.Image active style={{ width: '100%', height: '500px' }} />
      </Card>
    </>
  );
};

export default CompanyDetailSkeleton;
