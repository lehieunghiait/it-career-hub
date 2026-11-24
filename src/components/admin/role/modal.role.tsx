import {
  FooterToolbar,
  ModalForm,
  ProCard,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Form, Row, message, notification } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { callCreateRole, callFetchPermission, callUpdateRole } from '@/config/api';
import { IPermission } from '@/types/backend';
import { CheckSquareOutlined } from '@ant-design/icons';
import ModuleApi from './module.api';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { resetSingleRole } from '@/redux/slice/roleSlide';

import i18next from 'i18next';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  reloadTable: () => void;
}

const ModalRole = (props: IProps) => {
  const isMobile = useIsMobile();
  const { openModal, setOpenModal, reloadTable } = props;
  const singleRole = useAppSelector(state => state.role.singleRole);
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();

  const [listPermissions, setListPermissions] = useState<
    | {
        module: string;
        permissions: IPermission[];
      }[]
    | null
  >(null);

  const groupByPermission = (data: any) => {
    return _(data)
      .groupBy(x => x.module)
      .map((value, key) => {
        return { module: key, permissions: value as IPermission[] };
      })
      .value();
  };

  useEffect(() => {
    const init = async () => {
      const res = await callFetchPermission(`current=1&pageSize=100`);
      if (res.data?.result) {
        setListPermissions(groupByPermission(res.data?.result));
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (listPermissions?.length && singleRole?._id) {
      form.setFieldsValue({
        name: singleRole.name,
        isActive: singleRole.isActive,
        description: singleRole.description,
      });
      const userPermissions = groupByPermission(singleRole.permissions);

      listPermissions.forEach(x => {
        let allCheck = true;
        x.permissions?.forEach(y => {
          const temp = userPermissions.find(z => z.module === x.module);

          if (temp) {
            const isExist = temp.permissions.find(k => k._id === y._id);
            if (isExist) {
              form.setFieldValue(['permissions', y._id as string], true);
            } else allCheck = false;
          } else {
            allCheck = false;
          }
        });
        form.setFieldValue(['permissions', x.module], allCheck);
      });
    }
  }, [listPermissions, singleRole]);

  const submitRole = async (valuesForm: any) => {
    const { description, isActive, name, permissions } = valuesForm;
    const checkedPermissions = [];

    if (permissions) {
      for (const key in permissions) {
        if (key.match(/^[0-9a-fA-F]{24}$/) && permissions[key] === true) {
          checkedPermissions.push(key);
        }
      }
    }

    if (singleRole?._id) {
      //update
      const role = {
        name,
        description,
        isActive,
        permissions: checkedPermissions,
      };
      const res = await callUpdateRole(role, singleRole._id);
      if (res.data) {
        message.success(i18next.t('app:components.admin.role.modal_role.cap_nhat_role_thanh_cong'));
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
      const role = {
        name,
        description,
        isActive,
        permissions: checkedPermissions,
      };
      const res = await callCreateRole(role);
      if (res.data) {
        message.success(i18next.t('app:components.admin.role.modal_role.them_moi_role_thanh_cong'));
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
    setOpenModal(false);
    dispatch(resetSingleRole({}));
  };

  return (
    <>
      <ModalForm
        title={<>{singleRole?._id ? i18next.t('app:components.admin.role.modal_role.cap_nhat_role') : i18next.t('app:components.admin.role.modal_role.tao_moi_role')}</>}
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
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitRole}
        submitter={{
          render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
          submitButtonProps: {
            icon: <CheckSquareOutlined />,
          },
          searchConfig: {
            resetText: i18next.t('app:common.huy'),
            submitText: <>{singleRole?._id ? i18next.t('app:components.admin.role.modal_role.cap_nhat') : i18next.t('app:components.admin.role.modal_role.tao_moi')}</>,
          },
        }}
      >
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:common.name')}
              name='name'
              rules={[{ required: true, message: i18next.t('app:components.admin.role.modal_role.please_do_not_leave_blank') }]}
              placeholder={i18next.t('app:components.admin.role.modal_role.enter_name')}
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormSwitch
              label={i18next.t('app:common.status')}
              name='isActive'
              checkedChildren='ACTIVE'
              unCheckedChildren='INACTIVE'
              initialValue={true}
              fieldProps={{
                defaultChecked: true,
              }}
            />
          </Col>

          <Col span={24}>
            <ProFormTextArea
              label={i18next.t('app:common.description')}
              name='description'
              rules={[{ required: true, message: i18next.t('app:components.admin.role.modal_role.please_do_not_leave_blank') }]}
              placeholder={i18next.t('app:components.admin.role.modal_role.enter_description')}
              fieldProps={{
                autoSize: { minRows: 2 },
              }}
            />
          </Col>
          <Col span={24}>
            <ProCard
              title={i18next.t('app:components.admin.role.modal_role.permissions')}
              subTitle={i18next.t('app:components.admin.role.modal_role.the_permissions_allowed_for_this_role')}
              headStyle={{ color: '#d81921' }}
              style={{ marginBottom: 20 }}
              headerBordered
              size='small'
              bordered
            >
              <ModuleApi form={form} listPermissions={listPermissions} />
            </ProCard>
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalRole;
