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

const Header = (props: any) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const user = useAppSelector(state => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [current, setCurrent] = useState('home');
  const location = useLocation();

  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const items: MenuProps['items'] = [
    {
      label: <Link to={'/'}>Trang Chủ</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to={'/job'}>Việc Làm IT</Link>,
      key: '/job',
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={'/company'}>Top Công ty IT</Link>,
      key: '/company',
      icon: <RiseOutlined />,
    },
    // {
    //   label: <Link to={'/announcement'}>Thông báo</Link>,
    //   key: '/announcement',
    //   icon: <BellOutlined />,
    // },
    // {
    //   label: <Link to={'/contact'}>Liên Hệ</Link>,
    //   key: '/contact',
    //   icon: <ContactsOutlined />,
    // },
    {
      label: <Link to={'/about'}>Về Chúng Tôi</Link>,
      key: '/about',
      icon: <InfoCircleOutlined />,
    },
    {
      label: <Link to={'/faq'}>Hỏi Đáp</Link>,
      key: '/faq',
      icon: <QuestionCircleOutlined />,
    },
    {
      label: <Link to={'/blog'}>Blog</Link>,
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
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

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
      label: <Link to={'/admin'}>Trang Quản Trị</Link>,
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
                <FaReact onClick={() => navigate('/')} title='Hỏi Dân IT' />
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
                    <Link to={'/login'}>Đăng Nhập</Link>
                  ) : (
                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                      <Space style={{ cursor: 'pointer' }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                          Xin chào {user?.name}
                        </span>
                        <Avatar style={{ backgroundColor: '#fff' }}>
                          {user?.name?.substring(0, 2)?.toUpperCase()}
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
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
