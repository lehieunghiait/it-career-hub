import { Button, Checkbox, Divider, Form, Input, Row, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';
import {
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
  HomeOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import Footer from 'components/client/footer.client';

const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    symbol: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });

  const onFinish = async (values: IUser) => {
    const { name, email, password, age, gender, address } = values;
    setIsSubmit(true);
    const res = await callRegister(name, email, password as string, +age, gender, address);
    setIsSubmit(false);
    if (res?.data?._id) {
      message.success('Đăng ký tài khoản thành công!');
      navigate('/login');
    } else {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
        duration: 5,
      });
    }
  };

  const handleGoogleSignUp = () => {
    message.info('Tính năng đăng ký bằng Google đang được phát triển');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordValidation({
      length: value.length >= 12,
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      number: /\d/.test(value),
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
    });
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['register-page']}>
        <main className={styles.main}>
          <div className={`${styles.container} ${styles['responsive-container']}`}>
            <div className={styles['login-container']}>
              <section className={styles.wrapper}>
                <div className={styles.heading}>
                  <h2 className={`${styles.text} ${styles['text-large']}`}>
                    Create an account on <span className={styles.brand}>ITviec</span>
                  </h2>
                  <div className={styles['terms-privacy']}>
                    <Checkbox className={styles['signup-checkbox']}>
                      By signing up with Google, I agree to ITviec&apos;s{' '}
                      <Link to='/terms'>Terms & Conditions</Link> and{' '}
                      <Link to='/privacy'>Privacy Policy</Link> in relation to your privacy
                      information.
                    </Checkbox>
                  </div>
                </div>

                <Button
                  className={styles['google-login']}
                  icon={<GoogleOutlined />}
                  onClick={handleGoogleSignUp}
                >
                  Sign up with Google
                </Button>

                <div className={styles.divider}>
                  <Divider>OR</Divider>
                </div>

                <Form
                  form={form}
                  name='register'
                  onFinish={onFinish}
                  autoComplete='off'
                  layout='vertical'
                  className={styles['login-form']}
                  scrollToFirstError
                >
                  <Form.Item
                    label='Your Name'
                    name='name'
                    rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                  >
                    <Input
                      prefix={<UserOutlined className={styles['input-icon']} />}
                      placeholder='Enter your Name'
                      className={styles['styled-input']}
                    />
                  </Form.Item>

                  <Form.Item
                    label='Email'
                    name='email'
                    rules={[
                      { required: true, message: 'Email không được để trống!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className={styles['input-icon']} />}
                      type='email'
                      placeholder='Enter your email'
                      className={styles['styled-input']}
                    />
                  </Form.Item>

                  <Form.Item
                    label='Password'
                    name='password'
                    rules={[
                      { required: true, message: 'Mật khẩu không được để trống!' },
                      { min: 12, message: 'Mật khẩu phải có ít nhất 12 ký tự!' },
                    ]}
                    tooltip={{
                      title: 'Mật khẩu phải đáp ứng yêu cầu bảo mật',
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input.Password
                      prefix={<LockOutlined className={styles['input-icon']} />}
                      placeholder='Enter password'
                      className={styles['styled-input']}
                      onChange={handlePasswordChange}
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  <div className={styles['password-requirements']}>
                    <p className={passwordValidation.length ? styles['requirement-met'] : ''}>
                      At least 12 characters
                    </p>
                    <p className={passwordValidation.symbol ? styles['requirement-met'] : ''}>
                      At least 1 symbol (@ # $ ...)
                    </p>
                    <p className={passwordValidation.number ? styles['requirement-met'] : ''}>
                      At least 1 number
                    </p>
                    <p className={passwordValidation.uppercase ? styles['requirement-met'] : ''}>
                      At least 1 UPPERCASE letter
                    </p>
                    <p className={passwordValidation.lowercase ? styles['requirement-met'] : ''}>
                      At least 1 lowercase letter
                    </p>
                  </div>

                  <Row gutter={16} className={styles['form-row']}>
                    <div className={styles['form-col']}>
                      <Form.Item
                        label='Age'
                        name='age'
                        rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                      >
                        <Input
                          prefix={<NumberOutlined className={styles['input-icon']} />}
                          type='number'
                          placeholder='Your age'
                          className={styles['styled-input']}
                        />
                      </Form.Item>
                    </div>
                    <div className={styles['form-col']}>
                      <Form.Item
                        name='gender'
                        label='Gender'
                        rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                      >
                        <Select
                          placeholder='Select gender'
                          allowClear
                          className={styles['styled-select']}
                        >
                          <Option value='male'>Nam</Option>
                          <Option value='female'>Nữ</Option>
                          <Option value='other'>Khác</Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </Row>

                  <Form.Item
                    label='Address'
                    name='address'
                    rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                  >
                    <Input
                      prefix={<HomeOutlined className={styles['input-icon']} />}
                      placeholder='Enter your address'
                      className={styles['styled-input']}
                    />
                  </Form.Item>

                  <Form.Item
                    name='agreement'
                    valuePropName='checked'
                    className={styles['agreement']}
                  >
                    <Checkbox>
                      I have read and agree to ITviec&apos;s{' '}
                      <Link to='/terms'>Terms & Conditions</Link> and{' '}
                      <Link to='/privacy'>Privacy Policy</Link>.
                    </Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type='primary'
                      htmlType='submit'
                      loading={isSubmit}
                      className={styles['login-button']}
                    >
                      Sign up with Email
                    </Button>
                  </Form.Item>

                  <div className={styles['register-link']}>
                    <p>
                      Already have an account? <Link to='/login'>Sign in now!</Link>
                    </p>
                  </div>
                </Form>
              </section>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
