import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  ModalForm,
  ProCard,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from 'antd';
import 'styles/reset.scss';
import { useIsMobile } from '@/hooks/useIsMobile';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import { callCreateCompany, callUpdateCompany, callUploadSingleFile } from '@/config/api';
import { ICompanyDetail } from '@/types/backend';
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: ICompanyDetail | null;
  setDataInit: (v: ICompanyDetail | null) => void;
  reloadTable: () => void;
}

interface ICompanyForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface ICompanyLogo {
  name: string;
  uid: string;
  url: string;
  email: string;
  address: string;
  website: string;
  originalName?: string;
}

const ModalCompany = (props: IProps) => {
  const isMobile = useIsMobile();
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

  //Modal animation
  const [animation, setAnimation] = useState<string>('open');
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const [dataLogo, setDataLogo] = useState<ICompanyLogo[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [value, setValue] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (dataInit?._id) {
      if (dataInit?.description) {
        setValue(dataInit.description);
      }
      if (dataInit?.logo) {
        setDataLogo([
          {
            name: dataInit.logo,
            uid: uuidv4(),
            url: dataInit.logo,
            email: dataInit?.email ?? '',
            address: dataInit?.address ?? '',
            website: dataInit?.website ?? '',
          },
        ]);
      }
    }
  }, [dataInit]);

  /**
   * Submit company form
   * @param valuesForm
   * @returns
   */
  const submitCompany = async (valuesForm: ICompanyForm) => {
    const { name, address, phone, email, website } = valuesForm;

    if (dataLogo.length === 0) {
      message.error('Please upload a logo');
      return;
    }

    if (dataInit?._id) {
      const res = await callUpdateCompany(dataInit._id, name, address, value, dataLogo[0].url);
      if (res.data) {
        message.success('Update Company successfully');
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: 'An error occurred',
          description: res.message,
        });
      }
    } else {
      const res = await callCreateCompany(
        name,
        address,
        value,
        dataLogo[0].url,
        phone,
        email,
        website
      );
      if (res.data) {
        message.success('Create Company successfully');
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: 'An error occurred',
          description: res.message,
        });
      }
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setValue('');
    setDataInit(null);
    setDataLogo([]);

    //add animation when closing modal
    setAnimation('close');
    await new Promise(r => setTimeout(r, 400));
    setOpenModal(false);
    setAnimation('open');
  };

  const handleRemoveFile = (file: any) => {
    setDataLogo([]);
  };

  const handlePreview = async (file: any) => {
    if (!file.originFileObj) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
      return;
    }
    getBase64(file.originFileObj, (url: string) => {
      setPreviewImage(url);
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    });
  };

  const getBase64 = (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file: any) => {
    const isJpgOrPng = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG/WEBP file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoadingUpload(true);
    }
    if (info.file.status === 'done') {
      setLoadingUpload(false);
    }
    if (info.file.status === 'error') {
      setLoadingUpload(false);
      message.error(info?.file?.error?.event?.message ?? 'Đã có lỗi xảy ra khi upload file.');
    }
  };

  const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
    const res = await callUploadSingleFile(file, 'logo-companies');
    if (res && res.data) {
      const logoUrl = res.data.fileName || res.data.url || '';

      setDataLogo([
        {
          name: logoUrl,
          uid: uuidv4(),
          url: logoUrl,
          email: '',
          address: '',
          website: '',
        },
      ]);
      if (onSuccess) onSuccess('ok');
      message.success('Cập nhật logo thành công!');
    } else {
      notification.error({
        message: 'Cập nhật logo thất bại',
        description: res.message,
      });
      if (onError) {
        setDataLogo([]);
        const error = new Error(res.message);
        onError({ event: error });
      }
    }
  };

  return (
    <>
      {openModal && (
        <>
          <ModalForm
            title={<>{dataInit?._id ? 'Update Company' : 'Create Company'}</>}
            open={openModal}
            modalProps={{
              onCancel: () => {
                handleReset();
              },
              afterClose: () => handleReset(),
              destroyOnClose: true,
              width: isMobile ? '100%' : 900,
              footer: null,
              keyboard: false,
              maskClosable: false,
              className: `modal-company ${animation}`,
              rootClassName: `modal-company-root ${animation}`,
            }}
            scrollToFirstError={true}
            preserve={false}
            form={form}
            onFinish={submitCompany}
            initialValues={dataInit?._id ? dataInit : {}}
            submitter={{
              render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
              submitButtonProps: {
                icon: <CheckSquareOutlined />,
              },
              searchConfig: {
                resetText: 'Hủy',
                submitText: <>{dataInit?._id ? 'Update' : 'Create'}</>,
              },
            }}
          >
            {/* Tên công ty */}
            <Row gutter={16}>
              <Col span={24}>
                <ProFormText
                  label='Company Name'
                  name='name'
                  rules={[{ required: true, message: 'Please enter company name' }]}
                  placeholder='Enter company name'
                />
              </Col>
              {/* Logo công ty */}
              <Col span={8}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  label='Logo'
                  name='logo'
                  rules={[
                    {
                      required: true,
                      message: 'Please enter logo',
                      validator: () => {
                        if (dataLogo.length > 0 && dataLogo[0].url) return Promise.resolve();
                        else return Promise.reject(false);
                      },
                    },
                  ]}
                >
                  <ConfigProvider locale={enUS}>
                    <Upload
                      name='logo'
                      listType='picture-card'
                      className='avatar-uploader'
                      maxCount={1}
                      multiple={false}
                      customRequest={handleUploadFileLogo}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      onRemove={file => handleRemoveFile(file)}
                      onPreview={handlePreview}
                      defaultFileList={
                        dataInit?._id
                          ? [
                              {
                                uid: uuidv4(),
                                name: dataInit?.logo ?? '',
                                status: 'done',
                                url: dataInit?.logo,
                              },
                            ]
                          : []
                      }
                    >
                      <div>
                        {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </ConfigProvider>
                </Form.Item>
              </Col>
              {/* Địa chỉ công ty */}
              <Col span={16}>
                <ProFormTextArea
                  label='Address'
                  name='address'
                  rules={[{ required: true, message: 'Please enter address' }]}
                  placeholder='Enter address'
                  fieldProps={{
                    autoSize: { minRows: 4 },
                  }}
                />
              </Col>
              {/* Số điện thoại */}
              <Col span={24}>
                <ProFormText
                  label='Phone Number'
                  name='phone'
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    {
                      pattern: /^[0-9\b]+$/,
                      message: 'Only type phone number',
                    },
                  ]}
                  placeholder='Enter phone number'
                />
              </Col>
              {/* Email công ty */}
              <Col span={24}>
                <ProFormText
                  label='Email'
                  name='email'
                  rules={[{ required: true, message: 'Please enter CONTACT' }]}
                  placeholder='Enter email'
                />
              </Col>
              {/* Website công ty */}
              <Col span={12}>
                <ProFormText
                  label='Website'
                  name='website'
                  rules={[{ required: true, message: 'Please enter website' }]}
                  placeholder='Enter website'
                />
              </Col>
              {/* Mô tả công ty */}
              <ProCard
                title='Description'
                headStyle={{ color: '#d81921' }}
                style={{ marginBottom: 20 }}
                headerBordered
                size='small'
                bordered
              >
                {/* Quill editor */}
                <Col span={24}>
                  <ReactQuill theme='snow' value={value} onChange={setValue} />
                </Col>
              </ProCard>
            </Row>
          </ModalForm>
          {/* Modal preview image */}
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
            style={{ zIndex: 1500 }}
          >
            <img alt='example' style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </>
      )}
    </>
  );
};

export default ModalCompany;
