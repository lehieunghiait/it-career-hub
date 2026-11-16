import { Button, Col, Form, notification, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, UploadOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm, ProFormUploadButton } from '@ant-design/pro-components';
import styles from 'styles/client.module.scss';
import { useTranslation } from 'react-i18next';

const SearchClient = () => {
  const optionsSkills = SKILLS_LIST;
  const optionsLocations = LOCATION_LIST;
  const [form] = Form.useForm();
  const { t } = useTranslation('search');
  const onFinish = async () => {
    notification.success({
      message: 'Feature is under development',
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
                  <MonitorOutlined /> Search by skills....
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
            label='Upload CV'
            max={1}
            fieldProps={{
              beforeUpload: () => false, // Để file không tự upload, chỉ giữ local
              accept: '.pdf,.doc,.docx',
            }}
            title='Chọn CV (.pdf, .doc, .docx)'
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
                  <EnvironmentOutlined /> {'Location'}...
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
