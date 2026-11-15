import { FileTextOutlined, HomeOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Typography } from 'antd';
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
              Feature under development... Coming Soon
            </Typography.Title>
            <Button type='primary' href='/'>
              Back to Home
            </Button>
          </>
        }
        type='info'
      />
    </div>
  );
}
