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
import { ICompany, ICompanyDetail } from '@/types/backend';
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';

import i18next from 'i18next';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: (ICompany & Partial<ICompanyDetail>) | null;
  setDataInit: (v: ICompany | null) => void;
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
      message.error(i18next.t('app:components.admin.company.modal_company.please_upload_a_logo'));
      return;
    }

    if (dataInit?._id) {
      const res = await callUpdateCompany(dataInit._id, name, address, value, dataLogo[0].url);
      if (res.data) {
        message.success(i18next.t('app:components.admin.company.modal_company.update_company_successfully'));
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.an_error_occurred'),
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
        message.success(i18next.t('app:components.admin.company.modal_company.create_company_successfully'));
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.an_error_occurred'),
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
      message.error(i18next.t('app:components.admin.company.modal_company.you_can_only_upload_jpg_png'));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(i18next.t('app:components.admin.company.modal_company.image_must_smaller_than_2mb'));
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
      message.error(info?.file?.error?.event?.message ?? i18next.t('app:components.admin.company.modal_company.da_co_loi_xay_ra_khi'));
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
      message.success(i18next.t('app:components.admin.company.modal_company.cap_nhat_logo_thanh_cong'));
    } else {
      notification.error({
        message: i18next.t('app:components.admin.company.modal_company.cap_nhat_logo_that_bai'),
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
            title={<>{dataInit?._id ? i18next.t('app:components.admin.company.modal_company.update_company') : i18next.t('app:components.admin.company.modal_company.create_company')}</>}
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
                resetText: i18next.t('app:common.huy'),
                submitText: <>{dataInit?._id ? i18next.t('app:common.update') : i18next.t('app:components.admin.company.modal_company.create')}</>,
              },
            }}
          >
            {/* Tên công ty */}
            <Row gutter={16}>
              <Col span={24}>
                <ProFormText
                  label={i18next.t('app:components.admin.company.modal_company.company_name')}
                  name='name'
                  rules={[{ required: true, message: i18next.t('app:components.admin.company.modal_company.please_enter_company_name') }]}
                  placeholder={i18next.t('app:components.admin.company.modal_company.enter_company_name')}
                />
              </Col>
              {/* Logo công ty */}
              <Col span={8}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  label={i18next.t('app:components.admin.company.modal_company.logo')}
                  name='logo'
                  rules={[
                    {
                      required: true,
                      message: i18next.t('app:components.admin.company.modal_company.please_enter_logo'),
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
                        <div style={{ marginTop: 8 }}>{i18next.t('app:components.admin.company.modal_company.upload')}</div>
                      </div>
                    </Upload>
                  </ConfigProvider>
                </Form.Item>
              </Col>
              {/* Địa chỉ công ty */}
              <Col span={16}>
                <ProFormTextArea
                  label={i18next.t('app:common.address')}
                  name='address'
                  rules={[{ required: true, message: i18next.t('app:components.admin.company.modal_company.please_enter_address') }]}
                  placeholder={i18next.t('app:components.admin.company.modal_company.enter_address')}
                  fieldProps={{
                    autoSize: { minRows: 4 },
                  }}
                />
              </Col>
              {/* Số điện thoại */}
              <Col span={24}>
                <ProFormText
                  label={i18next.t('app:components.admin.company.modal_company.phone_number')}
                  name='phone'
                  rules={[
                    { required: true, message: i18next.t('app:components.admin.company.modal_company.please_enter_phone_number') },
                    {
                      pattern: /^[0-9\b]+$/,
                      message: i18next.t('app:components.admin.company.modal_company.only_type_phone_number'),
                    },
                  ]}
                  placeholder={i18next.t('app:components.admin.company.modal_company.enter_phone_number')}
                />
              </Col>
              {/* Email công ty */}
              <Col span={24}>
                <ProFormText
                  label={i18next.t('app:common.email')}
                  name='email'
                  rules={[{ required: true, message: i18next.t('app:components.admin.company.modal_company.please_enter_contact') }]}
                  placeholder={i18next.t('app:components.admin.company.modal_company.enter_email')}
                />
              </Col>
              {/* Website công ty */}
              <Col span={12}>
                <ProFormText
                  label={i18next.t('app:common.website')}
                  name='website'
                  rules={[{ required: true, message: i18next.t('app:components.admin.company.modal_company.please_enter_website') }]}
                  placeholder={i18next.t('app:components.admin.company.modal_company.enter_website')}
                />
              </Col>
              {/* Mô tả công ty */}
              <ProCard
                title={i18next.t('app:common.description')}
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
