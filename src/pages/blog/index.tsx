import { FileTextOutlined, HomeOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Typography } from 'antd';
import i18next from 'i18next';

const { Text } = Typography;
export default function BlogPage() {
  return (
    <div>
      <Alert
        style={{
          textAlign: 'center',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        message={
          <>
            <Typography.Title level={2} style={{ marginBottom: '20px' }}>
              {i18next.t('app:pages.blog.index.feature_under_development_coming_soon')}
            </Typography.Title>
            <Button type='primary' href='/'>
              {i18next.t('app:pages.blog.index.back_to_home')}
            </Button>
          </>
        }
        type='info'
      />
    </div>
  );
}
