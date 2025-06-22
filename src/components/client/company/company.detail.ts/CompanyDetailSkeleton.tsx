import { Card, Skeleton } from 'antd';
import styles from 'styles/client.module.scss';

const CompanyDetailSkeleton = () => {
  return (
    <Card className={styles['company-detail-skeleton']}>
      <Skeleton active avatar paragraph={{ rows: 6 }} />
    </Card>
  );
};
export default CompanyDetailSkeleton;
