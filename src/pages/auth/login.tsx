import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import {
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const callback = params?.get('callback');

  useEffect(() => {
    // Đã login => redirect to '/'
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, []);

  const onFinish = async (values: any) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await callLogin(username, password);
    setIsSubmit(false);
    if (res?.data) {
      localStorage.setItem('access_token', res.data.access_token);
      dispatch(setUserLoginInfo(res.data.user));
      message.success('Đăng nhập tài khoản thành công!');
      window.location.href = callback ? callback : '/';
    } else {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
        duration: 5,
      });
    }
  };

  const handleGoogleLogin = () => {
    // Xử lý đăng nhập bằng Google
    message.info('Tính năng đăng nhập bằng Google đang được phát triển');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['login-page']}>
        <main className={styles.main}>
          <div className={`${styles.container} ${styles['responsive-container']}`}>
            <div className={styles['login-container']}>
              <section className={styles.wrapper}>
                <div className={styles.heading}>
                  <h2 className={`${styles.text} ${styles['text-large']}`}>
                    Welcome to <span className={styles.brand}>ITviec</span>
                  </h2>
                  <div className={styles['terms-privacy']}>
                    <p>
                      By signing in, you agree to ITviec's{' '}
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
                >
                  <Form.Item
                    label='Email'
                    name='username'
                    rules={[
                      { required: true, message: 'Email không được để trống!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className={styles['input-icon']} />}
                      placeholder='Enter your email'
                      className={styles['styled-input']}
                    />
                  </Form.Item>

                  <Form.Item
                    label='Password'
                    name='password'
                    rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className={styles['input-icon']} />}
                      placeholder='Enter your password'
                      className={styles['styled-input']}
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

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
                    >
                      Sign In with Email
                    </Button>
                  </Form.Item>

                  <div className={styles['register-link']}>
                    <p>
                      Do not have an account? <Link to='/register'>Sign up now!</Link>
                    </p>
                  </div>
                </Form>
              </section>
            </div>

            <div className={styles['benefits-section']}>
              <h2>Sign in to get instant access to thousands of reviews and salary information</h2>

              <ul className={styles['benefits-list']}>
                <li>
                  <CheckOutlined className={styles['check-icon']} />
                  <span>View salary to help you negotiate your offer or pay rise</span>
                </li>
                <li>
                  <CheckOutlined className={styles['check-icon']} />
                  <span>Find out about benefits, interview, company culture via reviews</span>
                </li>
                <li>
                  <CheckOutlined className={styles['check-icon']} />
                  <span>Easy apply with only 1 click</span>
                </li>
                <li>
                  <CheckOutlined className={styles['check-icon']} />
                  <span>Manage your own profile & privacy</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
