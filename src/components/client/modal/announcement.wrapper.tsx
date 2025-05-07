import { useState, useEffect } from 'react';
import AnnouncementModal from './announcement.modal';

const AnnouncementWrapper = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đóng thông báo trước đó hay chưa
    const checkAnnouncementDismissed = () => {
      const dismissedUntil = localStorage.getItem('announcement_dismissed');

      if (!dismissedUntil) {
        // Chưa từng đóng thông báo
        setIsModalOpen(true);
        return;
      }

      const dismissedTime = parseInt(dismissedUntil);
      const currentTime = new Date().getTime();

      if (currentTime > dismissedTime) {
        // Thời gian đã hết hạn, hiển thị lại thông báo
        setIsModalOpen(true);
      }
    };

    // Đợi 1 giây sau khi trang tải xong để hiển thị modal
    const timer = setTimeout(() => {
      checkAnnouncementDismissed();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <AnnouncementModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
};

export default AnnouncementWrapper;
