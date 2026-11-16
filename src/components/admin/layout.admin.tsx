import { useEffect, useMemo, useState } from 'react';
import {
  AliwangwangOutlined,
  ApiOutlined,
  AppstoreOutlined,
  BankOutlined,
  ExceptionOutlined,
  ExportOutlined,
  ProjectOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, ConfigProvider, Drawer, Dropdown, Layout, Menu, message } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useIsMobile } from '@/hooks/useIsMobile';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';
import s from '@/styles/admin.module.scss';

const { Content, Sider } = Layout;

const BRAND = '#e14000';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/job': 'Jobs',
  '/admin/job/upsert': 'Job editor',
  '/admin/company': 'Companies',
  '/admin/resume': 'Applications',
  '/admin/pipeline': 'Pipeline',
  '/admin/user': 'Users',
  '/admin/role': 'Roles',
  '/admin/permission': 'Permissions',
};

type Permission = { apiPath: string; method: string };
const can = (permissions: Permission[], target: Permission) =>
  permissions?.some(p => p.apiPath === target.apiPath && p.method === target.method);

const LayoutAdmin = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  const [collapsed, setCollapsed] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const user = useAppSelector(state => state.account.user);
  const permissions = useAppSelector(state => state.account.user.permissions) as Permission[];

  useEffect(() => setOpenDrawer(false), [location.pathname]);

  const menuItems = useMemo<MenuProps['items']>(() => {
    const item = (to: string, label: string, icon: React.ReactNode, allowed = true) =>
      allowed ? [{ key: to, icon, label: <Link to={to}>{label}</Link> }] : [];

    const recruitment = [
      ...item(
        '/admin/job',
        'Jobs',
        <ScheduleOutlined />,
        can(permissions, ALL_PERMISSIONS.JOBS.GET_PAGINATE)
      ),
      ...item(
        '/admin/company',
        'Companies',
        <BankOutlined />,
        can(permissions, ALL_PERMISSIONS.COMPANIES.GET_PAGINATE)
      ),
      ...item(
        '/admin/resume',
        'Applications',
        <AliwangwangOutlined />,
        can(permissions, ALL_PERMISSIONS.RESUMES.GET_PAGINATE)
      ),
      ...item(
        '/admin/pipeline',
        'Pipeline',
        <ProjectOutlined />,
        can(permissions, ALL_PERMISSIONS.RESUMES.GET_PAGINATE)
      ),
    ];
    const access = [
      ...item(
        '/admin/user',
        'Users',
        <UserOutlined />,
        can(permissions, ALL_PERMISSIONS.USERS.GET_PAGINATE)
      ),
      ...item(
        '/admin/role',
        'Roles',
        <ExceptionOutlined />,
        can(permissions, ALL_PERMISSIONS.ROLES.GET_PAGINATE)
      ),
      ...item(
        '/admin/permission',
        'Permissions',
        <ApiOutlined />,
        can(permissions, ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE)
      ),
    ];

    return [
      {
        type: 'group',
        label: 'Overview',
        children: item('/admin', 'Dashboard', <AppstoreOutlined />),
      },
      ...(recruitment.length
        ? [{ type: 'group' as const, label: 'Recruitment', children: recruitment }]
        : []),
      ...(access.length
        ? [{ type: 'group' as const, label: 'Access control', children: access }]
        : []),
    ];
  }, [permissions]);

  // Highlight the closest menu entry, e.g. /admin/job/upsert -> /admin/job
  const selectedKey =
    Object.keys(PAGE_TITLES)
      .filter(key => key !== '/admin/job/upsert' && location.pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0] ?? '/admin';
  const pageTitle = PAGE_TITLES[location.pathname] ?? PAGE_TITLES[selectedKey];

  const handleLogout = async () => {
    await signOut();
    dispatch(setLogoutAction());
    message.success('Logout successfully');
    navigate('/');
  };

  const accountMenu: MenuProps['items'] = [
    { key: 'site', icon: <ExportOutlined />, label: <Link to='/'>Back to site</Link> },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const brand = (compact: boolean) => (
    <Link to='/admin' className={s['brand']}>
      <span className={s['brand-mark']}>C</span>
      {!compact && (
        <span className={s['brand-text']}>
          Career Hub <small>Recruiter</small>
        </span>
      )}
    </Link>
  );

  const sideMenu = (
    <Menu
      theme='dark'
      mode='inline'
      selectedKeys={[selectedKey]}
      items={menuItems}
      className={s['side-menu']}
    />
  );

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: BRAND, borderRadius: 10, colorBgLayout: '#f5f6f8' },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: BRAND,
            darkGroupTitleColor: 'rgba(255,255,255,0.4)',
            itemBorderRadius: 10,
          },
        },
      }}
    >
      <Layout className={s['admin-root']}>
        {!isMobile && (
          <Sider
            width={240}
            collapsedWidth={76}
            collapsed={collapsed}
            className={s['sider']}
            trigger={null}
          >
            {brand(collapsed)}
            {sideMenu}
          </Sider>
        )}

        <Drawer
          placement='left'
          open={isMobile && openDrawer}
          onClose={() => setOpenDrawer(false)}
          width={260}
          closable={false}
          styles={{ body: { padding: 0, background: '#0f1528' } }}
        >
          {brand(false)}
          {sideMenu}
        </Drawer>

        <Layout>
          <header className={s['topbar']}>
            <div className={s['topbar-left']}>
              <Button
                type='text'
                aria-label='Toggle menu'
                icon={
                  isMobile ? (
                    <MenuOutlined />
                  ) : collapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={() => (isMobile ? setOpenDrawer(true) : setCollapsed(v => !v))}
              />
              <h1>{pageTitle}</h1>
            </div>
            <div className={s['topbar-right']}>
              {!isMobile && (
                <Button icon={<ExportOutlined />} onClick={() => navigate('/')}>
                  View site
                </Button>
              )}
              <Dropdown menu={{ items: accountMenu }} trigger={['click']} placement='bottomRight'>
                <button className={s['account']}>
                  <Avatar src={clerkUser?.imageUrl} size={34}>
                    {user?.name?.substring(0, 1)?.toUpperCase()}
                  </Avatar>
                  {!isMobile && (
                    <span className={s['account-text']}>
                      <b>{user?.name}</b>
                      <small>{user?.role?.name?.replace('_', ' ')}</small>
                    </span>
                  )}
                </button>
              </Dropdown>
            </div>
          </header>
          <Content className={s['content']}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LayoutAdmin;
