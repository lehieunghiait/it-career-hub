import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  Tag,
  message,
  notification,
} from 'antd';
import { Link } from 'react-router-dom';
import { RESUME_STATUS, ResumeStatus } from '@/config/resume-status';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { TabsProps } from 'antd';
import { IResume } from '@/types/backend';
import { useState, useEffect } from 'react';
import { callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber } from '@/config/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined } from '@ant-design/icons';
import { SKILLS_LIST } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';
import UpdateProfileUser from '@/components/admin/user/update.profile.user';
import { useClerk } from '@clerk/react';
import { useOpenResume } from '@/hooks/useOpenResume';
import i18next from 'i18next';

// Password, email and connected accounts are managed by Clerk
const AccountSecurity = () => {
  const { openUserProfile } = useClerk();
  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <Button type='primary' onClick={() => openUserProfile()}>
        {i18next.t('app:components.client.modal.manage_account.manage_password_amp_security')}
      </Button>
    </div>
  );
};

interface IProps {
  open: boolean;
  onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
  const { openResume, openingId } = useOpenResume();
  const [listCV, setListCV] = useState<IResume[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      const res = await callFetchResumeByUser();
      if (res && res.data) {
        setListCV(res.data as IResume[]);
      }
      setIsFetching(false);
    };
    init();
  }, []);

  const columns: ColumnsType<IResume> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: i18next.t('app:common.company'),
      dataIndex: ['companyId', 'name'],
    },
    {
      title: i18next.t('app:common.position'),
      dataIndex: ['jobId', 'name'],
    },
    {
      title: i18next.t('app:common.status'),
      dataIndex: 'status',
      render: (status: string) => {
        const meta = RESUME_STATUS[status as ResumeStatus];
        return <Tag color={meta?.color}>{meta?.label ?? status}</Tag>;
      },
    },
    {
      title: i18next.t('app:components.client.modal.manage_account.date_of_cv_release'),
      dataIndex: 'createdAt',
      render(value, record, index) {
        return <>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</>;
      },
    },
    {
      title: '',
      dataIndex: '',
      render(value, record, index) {
        return (
          <Button
            type='link'
            size='small'
            loading={openingId === record._id}
            onClick={() => openResume(record._id)}
          >
            {i18next.t('app:common.view_cv')}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to='/my-jobs' onClick={() => props.onNavigate?.()}>
          {i18next.t('app:components.client.modal.manage_account.track_progress_of_each_application_in')}
        </Link>
      </div>
      <Table<IResume>
        columns={columns}
        dataSource={listCV}
        loading={isFetching}
        pagination={false}
      />
    </div>
  );
};

const UserUpdateInfo = (props: any) => {
  return <div>{i18next.t('app:components.client.modal.manage_account.userupdateinfo')}</div>;
};

const JobByEmail = (props: any) => {
  const [form] = Form.useForm();
  const user = useAppSelector(state => state.account.user);

  useEffect(() => {
    const init = async () => {
      const res = await callGetSubscriberSkills();
      if (res && res.data) {
        form.setFieldValue('skills', res.data.skills);
      }
    };
    init();
  }, []);

  const onFinish = async (values: any) => {
    const { skills } = values;
    const res = await callUpdateSubscriber({
      email: user.email,
      name: user.name,
      skills: skills ? skills : [],
    });
    if (res.data) {
      message.success(i18next.t('app:components.client.modal.manage_account.update_information_successfully'));
    } else {
      notification.error({
        message: i18next.t('app:common.an_error_occurred'),
        description: res.message,
      });
    }
  };

  return (
    <>
      <Form onFinish={onFinish} form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item
              label={i18next.t('app:common.skills')}
              name={'skills'}
              rules={[{ required: true, message: i18next.t('app:components.client.modal.manage_account.please_select_at_least_1_skill') }]}
            >
              <Select
                mode='multiple'
                allowClear
                showArrow={false}
                style={{ width: '100%' }}
                placeholder={
                  <>
                    <MonitorOutlined /> {i18next.t('app:components.client.modal.manage_account.search_by_skills')}
                  </>
                }
                optionLabelProp='label'
                options={SKILLS_LIST}
              />
            </Form.Item>
          </Col>
          <Col
            span={24}
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: 'white',
            }}
          >
            <Button type='primary' onClick={() => form.submit()}>
              {i18next.t('app:common.update')}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const ManageAccount = (props: IProps) => {
  const isMobile = useIsMobile();
  const { open, onClose } = props;

  const onChange = (key: string) => {
    // console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: 'user-resume',
      label: `CV`,
      children: <UserResume onNavigate={() => onClose(false)} />,
    },
    {
      key: 'email-by-skills',
      label: i18next.t('app:components.client.modal.manage_account.receive_jobs_by_skills'),
      children: <JobByEmail />,
    },
    {
      key: 'user-update-info',
      label: i18next.t('app:components.client.modal.manage_account.update_profile'),
      children: <UpdateProfileUser />,
    },
    {
      key: 'user-password',
      label: i18next.t('app:components.client.modal.manage_account.account_security'),
      children: <AccountSecurity />,
    },
  ];

  return (
    <>
      <Modal
        title={i18next.t('app:components.client.modal.manage_account.manage_account')}
        open={open}
        onCancel={() => onClose(false)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width={isMobile ? '100%' : '1000px'}
      >
        <div style={{ minHeight: 400 }}>
          <Tabs defaultActiveKey='user-resume' items={items} onChange={onChange} />
        </div>
      </Modal>
    </>
  );
};

export default ManageAccount;
