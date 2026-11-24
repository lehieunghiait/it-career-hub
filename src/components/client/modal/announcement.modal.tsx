import { Modal, Typography, Button, Space, Divider } from 'antd';
import styles from 'styles/client.module.scss';
import { BellOutlined, CloseCircleOutlined } from '@ant-design/icons';

import i18next from 'i18next';

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
          <span>{i18next.t('app:components.client.modal.announcement_modal.thong_bao_moi')}</span>
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
          {i18next.t('app:components.client.modal.announcement_modal.toi_da_hieu')}
        </Button>,
        <Button
          key='back'
          onClick={handleCancel}
          className={styles['announcement-cancel-btn']}
          icon={<CloseCircleOutlined />}
        >
          {i18next.t('app:components.client.modal.announcement_modal.dong')}
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
          {i18next.t('app:components.client.modal.announcement_modal.chao_mung_den_voi_website_cua')}
        </Title>

        <Paragraph className={styles['announcement-paragraph']}>
          {i18next.t('app:components.client.modal.announcement_modal.chung_toi_rat_vui_mung_thong')}
        </Paragraph>

        <Divider orientation='left' style={{ color: 'red' }}>
          {i18next.t('app:components.client.modal.announcement_modal.thong_bao_ve_viec_dung_tai')}
        </Divider>

        <Space direction='vertical' className={styles['announcement-features']}>
          <Paragraph>
            {i18next.t('app:components.client.modal.announcement_modal.tai_khoan_user')}{' '}<Text strong>user@gmail.com</Text>
          </Paragraph>
          <Paragraph>
            {i18next.t('app:components.client.modal.announcement_modal.mat_khau')}{' '}<Text strong>123456</Text>
          </Paragraph>
        </Space>
      </div>
    </Modal>
  );
};

export default AnnouncementModal;
