import { useState, useEffect } from 'react';
import {
  CodeOutlined,
  ContactsOutlined,
  DashOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { FaReact } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const user = useAppSelector(state => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [current, setCurrent] = useState('home');
  const location = useLocation();
  const { t, i18n } = useTranslation('header');
  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const items: MenuProps['items'] = [
    {
      label: <Link to={'/'}>{t('home')}</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to={'/job'}>{t('job')}</Link>,
      key: '/job',
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={'/company'}>{t('company')}</Link>,
      key: '/company',
      icon: <RiseOutlined />,
    },
    {
      label: <Link to={'/about'}>{t('about')}</Link>,
      key: '/about',
      icon: <InfoCircleOutlined />,
    },
    {
      label: <Link to={'/faq'}>{t('faq')}</Link>,
      key: '/faq',
      icon: <QuestionCircleOutlined />,
    },
    {
      label: <Link to={'/blog'}>{t('blog')}</Link>,
      key: '/blog',
      icon: <FileTextOutlined />,
    },
  ];

  const onClick: MenuProps['onClick'] = e => {
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.data) {
      dispatch(setLogoutAction({}));
      message.success('Logout success');
      navigate('/');
    }
  };
  const handleChangeLanguage = ({ key }: { key: string }) => {
    i18n.changeLanguage(key);
  };

  const itemsLanguage = [
    {
      label: 'English',
      key: 'en',
    },
    {
      label: 'Vietnamese',
      key: 'vi',
    },
  ];

  const itemsDropdown = [
    {
      label: (
        <label style={{ cursor: 'pointer' }} onClick={() => setOpenManageAccount(true)}>
          Quản lý tài khoản
        </label>
      ),
      key: 'manage-account',
      icon: <ContactsOutlined />,
    },
    {
      label: <Link to={'/admin'}>{t('admin')}</Link>,
      key: 'admin',
      icon: <DashOutlined />,
    },
    {
      label: (
        <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: 'logout',
      icon: <LogoutOutlined />,
    },
  ];

  const itemsMobiles = [...items, ...itemsDropdown];

  return (
    <>
      <div className={styles['header-section']}>
        <div className={styles['container']}>
          {!isMobile ? (
            <div style={{ display: 'flex', gap: 30 }}>
              <div className={styles['brand']}>
                <FaReact onClick={() => navigate('/')} title='IT Career' />
              </div>
              <div className={styles['top-menu']}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#fff',
                      colorBgContainer: '#222831',
                      colorText: '#a7a7a7',
                    },
                  }}
                >
                  <Menu
                    // onClick={onClick}
                    selectedKeys={[current]}
                    mode='horizontal'
                    items={items}
                  />
                </ConfigProvider>
                <div className={styles['extra']}>
                  {isAuthenticated === false ? (
                    <Link to={'/login'}>{t('login')}</Link>
                  ) : (
                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                      <Space style={{ cursor: 'pointer' }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                          {t('hello', { name: user?.name })}
                        </span>
                        <Avatar style={{ backgroundColor: '#fff' }}>
                          {user?.name?.substring(0, 2)?.toUpperCase()}
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
                {/* dropdown language */}
                <Dropdown
                  menu={{ items: itemsLanguage, onClick: handleChangeLanguage }}
                  trigger={['click']}
                >
                  <Space style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      {i18n.language === 'en' ? 'English' : 'Vietnamese'}
                    </span>
                  </Space>
                </Dropdown>
              </div>
            </div>
          ) : (
            <div className={styles['header-mobile']}>
              <span>IT Career</span>
              <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
            </div>
          )}
        </div>
      </div>
      <Drawer
        title='Chức năng'
        placement='right'
        onClose={() => setOpenMobileMenu(false)}
        open={openMobileMenu}
      >
        <Menu onClick={onClick} selectedKeys={[current]} mode='vertical' items={itemsMobiles} />
      </Drawer>
      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} />
    </>
  );
};

export default Header;
