import { Col, Row, Typography, Breadcrumb } from 'antd';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';
import { HomeOutlined, BankOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ClientCompanyPage = (props: any) => {
  return (
    <div className={styles['company-page']}>
      <div className={styles['company-page-header']}>
        <div className={styles['container']}>
          <Breadcrumb
            className={styles['company-breadcrumb']}
            items={[
              {
                title: (
                  <>
                    <HomeOutlined /> Trang chủ
                  </>
                ),
                href: '/',
              },
              {
                title: (
                  <>
                    <BankOutlined /> Danh sách công ty
                  </>
                ),
              },
            ]}
          />
          <Title level={2} className={styles['company-page-title']}>
            Khám phá các công ty hàng đầu
          </Title>
          <Paragraph className={styles['company-page-desc']}>
            Tìm hiểu về các công ty tuyển dụng hàng đầu trong lĩnh vực công nghệ thông tin tại Việt
            Nam
          </Paragraph>
        </div>
      </div>

      <div className={styles['container']} style={{ padding: '30px 0' }}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <CompanyCard showPagination={true} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ClientCompanyPage;
