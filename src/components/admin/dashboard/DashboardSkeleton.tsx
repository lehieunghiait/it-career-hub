import { Card, Col, Row, Skeleton } from 'antd';

const DashboardSkeleton = () => {
  return (
    <Row gutter={[20, 20]}>
      {[1, 2, 3, 4, 5, 6].map(item => (
        <Col xs={24} sm={12} md={6} key={item}>
          <Card bordered={false}>
            <Skeleton.Input active size='small' style={{ width: '100px', marginBottom: '8px' }} />
            <Skeleton.Input active size='large' style={{ width: '150px' }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardSkeleton;
