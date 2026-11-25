import { Button, Col, Form, notification, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, UploadOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm, ProFormUploadButton } from '@ant-design/pro-components';
import styles from 'styles/client.module.scss';
import { useTranslation } from 'react-i18next';

import i18next from 'i18next';

const SearchClient = () => {
  const optionsSkills = SKILLS_LIST;
  const optionsLocations = LOCATION_LIST;
  const [form] = Form.useForm();
  const { t } = useTranslation('search');
  const onFinish = async () => {
    notification.success({
      message: i18next.t('app:components.client.search_client.feature_is_under_development'),
    });
  };

  return (
    <ProForm
      form={form}
      onFinish={onFinish}
      submitter={{
        render: () => <></>,
      }}
    >
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <h2>{t('title')}</h2>
        </Col>
        <Col span={24} md={16}>
          <ProForm.Item name='skills'>
            <Select
              mode='multiple'
              allowClear
              style={{ width: '100%' }}
              placeholder={
                <>
                  <MonitorOutlined /> {i18next.t('app:components.client.search_client.search_by_skills')}
                </>
              }
              optionLabelProp='label'
              options={optionsSkills}
            />
          </ProForm.Item>
        </Col>
        {/* Search job with CV */}
        <Col span={12} md={8}>
          <ProFormUploadButton
            name='cv'
            label={i18next.t('app:components.client.search_client.upload_cv')}
            max={1}
            fieldProps={{
              beforeUpload: () => false, // Để file không tự upload, chỉ giữ local
              accept: '.pdf,.doc,.docx',
            }}
            title={i18next.t('app:components.client.search_client.chon_cv_pdf_doc_docx')}
            icon={<UploadOutlined />}
          />
        </Col>
        <Col span={12} md={4}>
          <ProForm.Item name='location'>
            <Select
              mode='multiple'
              allowClear
              style={{ width: '100%' }}
              placeholder={
                <>
                  <EnvironmentOutlined /> {i18next.t('app:common.location')}...
                </>
              }
              optionLabelProp='label'
              options={optionsLocations}
            />
          </ProForm.Item>
        </Col>
        {/* Search button */}
        <Col span={8} md={3}>
          <Button type='primary' onClick={() => form.submit()} className={styles['search-button']}>
            {t('search')}
          </Button>
        </Col>
      </Row>
    </ProForm>
  );
};
export default SearchClient;
