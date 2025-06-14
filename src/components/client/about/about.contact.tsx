import { Card, Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from 'styles/client.module.scss';

const AboutContact = () => {
  const { t } = useTranslation('about');
  return (
    <section style={{ marginBottom: 40 }}>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        {t('contact')}
      </Typography.Title>
      <Card bordered={false} className={styles['about-card']}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Typography.Paragraph>
              <strong>{t('address')}:</strong> {t('city')}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>{t('email')}:</strong> lehieunghia2402@gmail.com
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>{t('phone')}:</strong> +84 399864422 (Vietnam)
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Typography.Paragraph>{t('contact_intro')}</Typography.Paragraph>
          </Col>
        </Row>
      </Card>
    </section>
  );
};

export default AboutContact;
