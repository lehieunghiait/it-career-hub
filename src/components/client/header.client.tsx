import { useState, useEffect } from 'react';
import {
  CodeOutlined,
  DollarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  ProfileOutlined,
  RiseOutlined,
  SettingFilled,
  SolutionOutlined,
} from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useClerk, useUser } from '@clerk/react';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { useTranslation } from 'react-i18next';
import ManageAccount from './modal/manage.account';
import LanguageSwitcher from '@/components/share/language.switcher';
import styles from '@/styles/client.module.scss';

import i18next from 'i18next';

const Header = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signOut } = useClerk();
  const { isSignedIn, user: clerkUser } = useUser();

  const user = useAppSelector(state => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [current, setCurrent] = useState('home');
  const location = useLocation();
  const { t } = useTranslation('header');
  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const items: MenuProps['items'] = [
    {
      label: <Link to={'/'}>{i18next.t('app:common.home')}</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to={'/job'}>{i18next.t('app:components.client.header_client.it_jobs')}</Link>,
      key: '/job',
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={'/company'}>{i18next.t('app:components.client.header_client.top_it_companies')}</Link>,
      key: '/company',
      icon: <RiseOutlined />,
    },
    {
      label: <Link to={'/cv'}>{i18next.t('app:components.client.header_client.create_cv')}</Link>,
      key: '/cv',
      icon: <SolutionOutlined />,
    },
    {
      label: <Link to={'/salary'}>{i18next.t('app:common.salary')}</Link>,
      key: '/salary',
      icon: <DollarOutlined />,
    },
    {
      label: <Link to={'/ats'}>{'ATS'}</Link>,
      key: '/ats',
      icon: <FileTextOutlined />,
    },
  ];

  const onClick: MenuProps['onClick'] = e => {
    setCurrent(e.key);
  };
  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await signOut();
    dispatch(setLogoutAction());
    message.success(i18next.t('app:components.client.header_client.logout_successfully'));
    //Redirect to home page
    navigate('/');
  };
  /**
   * List items dropdown
   */
  const itemsDropdown = [
    {
      label: <Link to={'/my-jobs'}>{i18next.t('app:components.client.header_client.my_jobs')}</Link>,
      key: 'my-jobs',
      icon: <ProfileOutlined />,
    },
    {
      label: (
        <label style={{ cursor: 'pointer' }} onClick={() => setOpenManageAccount(true)}>
          {i18next.t('app:components.client.header_client.manage_account')}
        </label>
      ),
      key: 'manage-account',
      icon: <SettingFilled />,
    },
    {
      label: <Link to={'/admin'}>{t('admin')}</Link>,
      key: 'admin',
      icon: <DashboardOutlined />,
    },
    {
      label: (
        <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
          {i18next.t('app:components.client.header_client.logout')}
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
                {/* Logo */}
                {/* <span className={styles['brand-text']}>{import.meta.env.VITE_APP_NAME}</span> */}
              </div>
              <div className={styles['top-menu']}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#ffffff',
                      colorBgContainer: '#222831',
                      colorText: '#ffffff',
                    },
                  }}
                >
                  <Menu
                    selectedKeys={[current]}
                    mode='horizontal'
                    items={items}
                    overflowedIndicator={null}
                  />
                </ConfigProvider>
                <div className={styles['extra']} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LanguageSwitcher theme='light' />
                  {!isSignedIn ? (
                    <Link to={'/login'}>{i18next.t('app:components.client.header_client.login')}</Link>
                  ) : (
                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                      <Space style={{ cursor: 'pointer' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                          {user?.name || clerkUser?.fullName || i18next.t('app:common.guest')}
                        </span>
                        <Avatar style={{ backgroundColor: '#fff' }}>
                          <img
                            src={
                              clerkUser?.imageUrl ||
                              'https://cdn3d.iconscout.com/3d/premium/thumb/man-avatar-3d-icon-png-download-8330274.png'
                            }
                            alt='avatar'
                            width={30}
                            height={30}
                          />
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles['header-mobile']}>
              <span className={styles['brand-text']}>{import.meta.env.VITE_APP_NAME}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <LanguageSwitcher theme='light' />
                <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
              </span>
            </div>
          )}
        </div>
      </div>
      <Drawer
        title={i18next.t('app:components.client.header_client.features')}
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
