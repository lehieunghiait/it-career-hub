import { callUpdateResumeStatus } from '@/config/api';
import { IResume } from '@/types/backend';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Modal,
  Input,
  Select,
  Tag,
  Timeline,
  message,
  notification,
} from 'antd';
import { RESUME_STATUS, RESUME_STATUS_OPTIONS, ResumeStatus } from '@/config/resume-status';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IResume | null | any;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}
const ViewDetailResume = (props: IProps) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const isMobile = useIsMobile('md');
  const { onClose, open, dataInit, setDataInit, reloadTable } = props;
  const [form] = Form.useForm();
  const [openPreview, setOpenPreview] = useState();

  const handleChangeStatus = async () => {
    setIsSubmit(true);

    const { status, note } = form.getFieldsValue();
    if (status === dataInit?.status && !note?.trim()) {
      message.info('Choose a new status or write a note for the candidate');
      setIsSubmit(false);
      return;
    }
    const res = await callUpdateResumeStatus(dataInit?._id, status, note?.trim() || undefined);
    if (res.data) {
      message.success('Update Resume status successfully!');
      setDataInit(null);
      onClose(false);
      reloadTable();
    } else {
      notification.error({
        message: 'An error occurred',
        description: res.message,
      });
    }

    setIsSubmit(false);
  };

  useEffect(() => {
    if (dataInit) {
      form.setFieldValue('status', dataInit.status);
    }
    return () => form.resetFields();
  }, [dataInit]);

  return (
    <>
      <Drawer
        title={'Resume Detail'}
        placement='right'
        onClose={() => {
          onClose(false);
          setDataInit(null);
        }}
        open={open}
        width={isMobile ? '100%' : 640}
        maskClosable={false}
        destroyOnClose
        extra={
          <Button
            style={{ color: 'white', backgroundColor: 'green' }}
            loading={isSubmit}
            type='primary'
            onClick={handleChangeStatus}
          >
            Update Status
          </Button>
        }
      >
        <Form form={form} layout='vertical'>
          <Descriptions title='' bordered column={isMobile ? 1 : 2} layout='vertical'>
            <Descriptions.Item label='Email'>{dataInit?.email}</Descriptions.Item>
            <Descriptions.Item label='Status'>
              <Form.Item name={'status'} style={{ marginBottom: 0 }}>
                <Select
                  style={{ width: '100%' }}
                  options={RESUME_STATUS_OPTIONS.map(option => ({
                    value: option.value,
                    label: `${option.value} · ${option.label}`,
                  }))}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item label='Job Name'>{dataInit?.jobId?.name}</Descriptions.Item>
            <Descriptions.Item label='Company Name'>{dataInit?.companyId?.name}</Descriptions.Item>
            <Descriptions.Item label='Created At'>
              {dataInit && dataInit.createdAt
                ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss')
                : ''}
            </Descriptions.Item>
            <Descriptions.Item label='Modified At'>
              {dataInit && dataInit.updatedAt
                ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss')
                : ''}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item
            style={{ marginTop: 20 }}
            name='note'
            label='Message to the candidate (optional)'
            extra='Shown on the candidate timeline, e.g. interview time, place or meeting link.'
          >
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>

        {dataInit?.history?.length > 0 && (
          <>
            <h4 style={{ margin: '8px 0 16px' }}>Status history</h4>
            <Timeline
              items={[...dataInit.history].reverse().map((item: any) => ({
                color: RESUME_STATUS[item.status as ResumeStatus]?.color ?? 'gray',
                children: (
                  <>
                    <Tag color={RESUME_STATUS[item.status as ResumeStatus]?.color}>
                      {item.status}
                    </Tag>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {dayjs(item.updatedAt).format('DD-MM-YYYY HH:mm')}
                      {item.updatedBy?.email ? ` · ${item.updatedBy.email}` : ''}
                    </span>
                    {item.note && (
                      <div style={{ marginTop: 4, whiteSpace: 'pre-line' }}>{item.note}</div>
                    )}
                  </>
                ),
              }))}
            />
          </>
        )}
      </Drawer>
    </>
  );
};

export default ViewDetailResume;
