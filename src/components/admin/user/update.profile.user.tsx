import { useAppSelector } from '@/redux/hooks';
import { Form, InputNumber, message, notification, Select } from 'antd';
import { useEffect } from 'react';

import { Row, Col, Input } from 'antd';
import { Button } from 'antd/lib';
import { callUpdateUser } from '@/config/api';
import i18next from 'i18next';

const UpdateProfileUser = (props: any) => {
  const [form] = Form.useForm();
  const user = useAppSelector(state => state.account.user);
  useEffect(() => {
  });
  const onFinish = async (values: any) => {
    const res = await callUpdateUser(
      {
        name: values.name,
        email: values.email,
        age: values.age,
        gender: values.gender,
        address: values.address,
      },
      user._id
    );
    if (res.data) {
      message.success(i18next.t('app:components.admin.user.update_profile_user.update_profile_successfully'));
    } else {
      notification.error({
        message: i18next.t('app:components.admin.user.update_profile_user.update_profile_failed'),
        description: res.message,
      });
    }
  };
  return (
    <Form onFinish={onFinish} form={form}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Form.Item label={i18next.t('app:common.name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={i18next.t('app:common.email')} name='email'>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={i18next.t('app:components.admin.user.update_profile_user.age')} name='age'>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={i18next.t('app:components.admin.user.update_profile_user.gender')} name='gender'>
            <Select
              options={[
                { label: i18next.t('app:components.admin.user.update_profile_user.male'), value: 'MALE' },
                { label: i18next.t('app:components.admin.user.update_profile_user.female'), value: 'FEMALE' },
                { label: i18next.t('app:components.admin.user.update_profile_user.other'), value: 'OTHER' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={i18next.t('app:common.address')} name='address'>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button type='primary' onClick={() => form.submit()}>
            {i18next.t('app:components.admin.user.update_profile_user.update_profile')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default UpdateProfileUser;
