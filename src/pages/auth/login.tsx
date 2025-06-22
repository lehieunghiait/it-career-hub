import { Button, Divider, Form, Input, message, notification, Typography, Row, Col } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import {
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
} from '@ant-design/icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const [isLandscape, setIsLandscape] = useState(false);
  const formRef = useRef<any>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const callback = params?.get('callback');

  // Check for orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode =
        window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
      setIsLandscape(isLandscapeMode);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: any) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await callLogin(username, password);
    setIsSubmit(false);
    if (res?.data) {
      localStorage.setItem('access_token', res.data.access_token);
      dispatch(setUserLoginInfo(res.data.user));
      message.success('Login account successfully!');
      window.location.href = callback ? callback : '/';
    } else {
      notification.error({
        message: 'Something went wrong',
        description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
        duration: 5,
      });
    }
  };

  const handleGoogleLogin = () => {
    message.info('Feature login with Google is under development');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={`${styles['auth-container']} ${isLandscape ? styles['landscape-mode'] : ''}`}>
      <div className={styles['login-page']}>
        <main className={styles.main}>
          <div className={`${styles.container} ${styles['responsive-container']}`}>
            <Row className={styles['full-width']} gutter={[0, { xs: 16, sm: 20, md: 24 }]}>
              <Col xs={24} sm={24} md={24} lg={12} xl={10} className={styles['login-container']}>
                <section className={styles.wrapper}>
                  <div className={styles.heading}>
                    <Typography.Title
                      level={isLandscape ? 3 : 2}
                      className={styles['modern-title']}
                    >
                      Welcome to <span className={styles.brand}>ITviec</span>
                    </Typography.Title>
                    <div className={styles['terms-privacy']}>
                      <p>
                        By signing in, you agree to ITviec&apos;s{' '}
                        <Link to='/terms'>Terms & Conditions</Link> and{' '}
                        <Link to='/privacy'>Privacy Policy</Link> in relation to your privacy
                        information.
                      </p>
                    </div>
                  </div>

                  <Button
                    className={styles['google-login']}
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                  >
                    Sign In with Google
                  </Button>

                  <div className={styles.divider}>
                    <Divider>or</Divider>
                  </div>

                  <Form
                    name='basic'
                    onFinish={onFinish}
                    autoComplete='off'
                    layout='vertical'
                    className={styles['login-form']}
                    ref={formRef}
                    size={isLandscape ? 'middle' : 'large'}
                  >
                    <Row gutter={[16, 0]}>
                      <Col span={24}>
                        <Form.Item
                          label='Email'
                          name='username'
                          rules={[
                            { required: true, message: 'Email is required!' },
                            { type: 'email', message: 'Email is not valid!' },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined className={styles['input-icon']} />}
                            placeholder='Enter your email'
                            className={styles['styled-input']}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label='Password'
                          name='password'
                          rules={[{ required: true, message: 'Password is required!' }]}
                        >
                          <Input.Password
                            prefix={<LockOutlined className={styles['input-icon']} />}
                            placeholder='Enter your password'
                            className={styles['styled-input']}
                            iconRender={visible =>
                              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className={styles['forgot-password']}>
                      <Button
                        type='link'
                        onClick={handleForgotPassword}
                        className={styles['forgot-btn']}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Form.Item>
                      <Button
                        type='primary'
                        htmlType='submit'
                        loading={isSubmit}
                        className={styles['login-button']}
                        icon={<LoginOutlined />}
                        size={isLandscape ? 'middle' : 'large'}
                        block
                      >
                        Sign In with Email
                      </Button>
                    </Form.Item>

                    <div className={styles['register-link']}>
                      <p>
                        Don&apos;t have an account?{' '}
                        <Link to='/register' className={styles['signup-link']}>
                          Sign up now!
                        </Link>
                      </p>
                    </div>
                  </Form>
                </section>
              </Col>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
