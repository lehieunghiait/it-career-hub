import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Col, Form, Row, message, notification } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';
import { callCreateUser, callFetchCompany, callFetchRole, callUpdateUser } from '@/config/api';
import { IUser } from '@/types/backend';
import { DebounceSelect } from './debouce.select';

import i18next from 'i18next';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: IUser | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

export interface ICompanySelect {
  label: string;
  value: string;
  key?: string;
}

const ModalUser = (props: IProps) => {
  const isMobile = useIsMobile();
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [companies, setCompanies] = useState<ICompanySelect[]>([]);
  const [roles, setRoles] = useState<ICompanySelect[]>([]);

  const [form] = Form.useForm();

  useEffect(() => {
    if (dataInit?._id) {
      if (dataInit.company) {
        setCompanies([
          {
            label: dataInit.company.name,
            value: dataInit.company._id,
            key: dataInit.company._id,
          },
        ]);
      }
      if (dataInit.role) {
        setRoles([
          {
            label: dataInit.role?.name,
            value: dataInit.role?._id,
            key: dataInit.role?._id,
          },
        ]);
      }
    }
  }, [dataInit]);

  const submitUser = async (valuesForm: any) => {
    const { name, email, password, address, age, gender, role, company } = valuesForm;
    if (dataInit?._id) {
      //update
      const user = {
        name,
        email,
        password,
        age,
        gender,
        address,
        role: role?.value ?? role._id,
        company: {
          _id: company?.value ?? company._id,
          name: company?.label ?? company.name,
        },
      };

      const res = await callUpdateUser(user, dataInit._id);
      if (res.data) {
        message.success(i18next.t('app:components.admin.user.modal_user.cap_nhat_user_thanh_cong'));
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.co_loi_xay_ra'),
          description: res.message,
        });
      }
    } else {
      //create
      const user = {
        name,
        email,
        password,
        age,
        gender,
        address,
        role: role.value,
        company: {
          _id: company.value,
          name: company.label,
        },
      };
      const res = await callCreateUser(user);
      if (res.data) {
        message.success(i18next.t('app:components.admin.user.modal_user.them_moi_user_thanh_cong'));
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.co_loi_xay_ra'),
          description: res.message,
        });
      }
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);
    setCompanies([]);
    setRoles([]);
    setOpenModal(false);
  };

  // Usage of DebounceSelect
  async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
    const res = await callFetchCompany(`current=1&pageSize=100&name=/${name}/i`);
    if (res && res.data) {
      const list = res.data.result;
      const temp = list.map(item => {
        return {
          label: item.name as string,
          value: item._id as string,
        };
      });
      return temp;
    } else return [];
  }

  async function fetchRoleList(name: string): Promise<ICompanySelect[]> {
    const res = await callFetchRole(`current=1&pageSize=100&name=/${name}/i`);
    if (res && res.data) {
      const list = res.data.result;
      const temp = list.map(item => {
        return {
          label: item.name as string,
          value: item._id as string,
        };
      });
      return temp;
    } else return [];
  }

  return (
    <>
      <ModalForm
        title={<>{dataInit?._id ? i18next.t('app:components.admin.user.modal_user.cap_nhat_user') : i18next.t('app:components.admin.user.modal_user.tao_moi_user')}</>}
        open={openModal}
        modalProps={{
          onCancel: () => {
            handleReset();
          },
          afterClose: () => handleReset(),
          destroyOnClose: true,
          width: isMobile ? '100%' : 900,
          keyboard: false,
          maskClosable: false,
          okText: <>{dataInit?._id ? i18next.t('app:components.admin.user.modal_user.cap_nhat') : i18next.t('app:components.admin.user.modal_user.tao_moi')}</>,
          cancelText: i18next.t('app:common.huy'),
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitUser}
        initialValues={dataInit?._id ? dataInit : {}}
      >
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:common.email')}
              name='email'
              rules={[
                { required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_khong_bo_trong') },
                { type: 'email', message: i18next.t('app:components.admin.user.modal_user.vui_long_nhap_email_hop_le') },
              ]}
              placeholder={i18next.t('app:components.admin.user.modal_user.nhap_email')}
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText.Password
              disabled={dataInit?._id ? true : false}
              label={i18next.t('app:components.admin.user.modal_user.password')}
              name='password'
              rules={[
                { required: dataInit?._id ? false : true, message: i18next.t('app:components.admin.user.modal_user.vui_long_khong_bo_trong') },
              ]}
              placeholder={i18next.t('app:components.admin.user.modal_user.nhap_password')}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:components.admin.user.modal_user.ten_hien_thi')}
              name='name'
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_khong_bo_trong') }]}
              placeholder={i18next.t('app:components.admin.user.modal_user.nhap_ten_hien_thi')}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormDigit
              label={i18next.t('app:components.admin.user.modal_user.tuoi')}
              name='age'
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_khong_bo_trong') }]}
              placeholder={i18next.t('app:components.admin.user.modal_user.nhap_nhap_tuoi')}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormSelect
              name='gender'
              label={i18next.t('app:components.admin.user.modal_user.gioi_tinh')}
              valueEnum={{
                MALE: 'Nam',
                FEMALE: 'Nữ',
                OTHER: 'Khác',
              }}
              placeholder={i18next.t('app:components.admin.user.modal_user.please_select_a_gender')}
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_chon_gioi_tinh') }]}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProForm.Item
              name='role'
              label={i18next.t('app:components.admin.user.modal_user.vai_tro')}
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_chon_vai_tro') }]}
            >
              <DebounceSelect
                allowClear
                showSearch
                defaultValue={roles}
                value={roles}
                placeholder={i18next.t('app:components.admin.user.modal_user.chon_cong_vai_tro')}
                fetchOptions={fetchRoleList}
                onChange={(newValue: any) => {
                  if (newValue?.length === 0 || newValue?.length === 1) {
                    setRoles(newValue as ICompanySelect[]);
                  }
                }}
                style={{ width: '100%' }}
              />
            </ProForm.Item>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProForm.Item
              name='company'
              label={i18next.t('app:components.admin.user.modal_user.thuoc_cong_ty')}
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_chon_company') }]}
            >
              <DebounceSelect
                allowClear
                showSearch
                defaultValue={companies}
                value={companies}
                placeholder={i18next.t('app:components.admin.user.modal_user.chon_cong_ty')}
                fetchOptions={fetchCompanyList}
                onChange={(newValue: any) => {
                  if (newValue?.length === 0 || newValue?.length === 1) {
                    setCompanies(newValue as ICompanySelect[]);
                  }
                }}
                style={{ width: '100%' }}
              />
            </ProForm.Item>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:components.admin.user.modal_user.dia_chi')}
              name='address'
              rules={[{ required: true, message: i18next.t('app:components.admin.user.modal_user.vui_long_khong_bo_trong') }]}
              placeholder={i18next.t('app:components.admin.user.modal_user.nhap_dia_chi')}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalUser;
