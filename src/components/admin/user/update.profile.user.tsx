import { useAppSelector } from '@/redux/hooks';
import { Form, InputNumber, message, notification, Select } from 'antd';
import { useEffect } from 'react';

import { Row, Col, Input } from 'antd';
import { Button } from 'antd/lib';
import { callUpdateUser } from '@/config/api';
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
      message.success('Update profile successfully');
    } else {
      notification.error({
        message: 'Update profile failed',
        description: res.message,
      });
    }
  };
  return (
    <Form onFinish={onFinish} form={form}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Form.Item label='Name' name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label='Email' name='email'>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label='Age' name='age'>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label='Gender' name='gender'>
            <Select
              options={[
                { label: 'Male', value: 'MALE' },
                { label: 'Female', value: 'FEMALE' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label='Address' name='address'>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button type='primary' onClick={() => form.submit()}>
            Update Profile
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default UpdateProfileUser;
