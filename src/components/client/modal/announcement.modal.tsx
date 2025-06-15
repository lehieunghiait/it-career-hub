import { Modal, Typography, Button, Space, Divider } from 'antd';
import styles from 'styles/client.module.scss';
import { BellOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface AnnouncementModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

const AnnouncementModal = ({ isModalOpen, setIsModalOpen }: AnnouncementModalProps) => {
  const handleOk = () => {
    // Lưu trạng thái vào localStorage để không hiển thị lại trong 7 ngày
    const expiryTime = new Date().getTime() + 5 * 1000; // 5 giây
    localStorage.setItem('announcement_dismissed', expiryTime.toString());
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={
        <div className={styles['announcement-header']}>
          <BellOutlined className={styles['announcement-icon']} />
          <span>Thông báo mới</span>
        </div>
      }
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      centered
      className={styles['announcement-modal']}
      footer={[
        <Button
          key='submit'
          type='primary'
          onClick={handleOk}
          className={styles['announcement-ok-btn']}
        >
          Tôi đã hiểu
        </Button>,
        <Button
          key='back'
          onClick={handleCancel}
          className={styles['announcement-cancel-btn']}
          icon={<CloseCircleOutlined />}
        >
          Đóng
        </Button>,
      ]}
    >
      <div className={styles['announcement-content']}>
        {/* <div className={styles["announcement-image"]}>
          <Image
            src="https://plus.unsplash.com/premium_photo-1677252438450-b779a923b0f6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Thông báo"
            preview={false}
            width={100}
            height={100}
          />
        </div> */}

        <Title
          level={4}
          className={styles['announcement-title']}
          style={{ color: 'red', fontWeight: 'bold' }}
        >
          Chào mừng đến với website của chúng tôi - Nền tảng tuyển dụng IT hàng đầu Việt Nam!
        </Title>

        <Paragraph className={styles['announcement-paragraph']}>
          Chúng tôi rất vui mừng thông báo về những cập nhật mới trên nền tảng ITviec, giúp việc tìm
          kiếm công việc IT mơ ước trở nên dễ dàng hơn bao giờ hết.
        </Paragraph>

        <Divider orientation='left' style={{ color: 'red' }}>
          Thông báo về việc dùng tài khoản (demo) truy cập vào website
        </Divider>

        <Space direction='vertical' className={styles['announcement-features']}>
          <Paragraph>
            Tài khoản user: <Text strong>user@gmail.com</Text>
          </Paragraph>
          <Paragraph>
            Mật khẩu: <Text strong>123456</Text>
          </Paragraph>
        </Space>
      </div>
    </Modal>
  );
};

export default AnnouncementModal;
