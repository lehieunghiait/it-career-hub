import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Col, Form, Row, message, notification } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { callCreatePermission, callUpdatePermission } from '@/config/api';
import { IPermission } from '@/types/backend';
import { ALL_MODULES } from '@/config/permissions';

import i18next from 'i18next';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: IPermission | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

const ModalPermission = (props: IProps) => {
  const isMobile = useIsMobile();
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const submitPermission = async (valuesForm: any) => {
    const { name, apiPath, method, module } = valuesForm;
    if (dataInit?._id) {
      //update
      const permission = {
        name,
        apiPath,
        method,
        module,
      };

      const res = await callUpdatePermission(permission, dataInit._id);
      if (res.data) {
        message.success(i18next.t('app:components.admin.permission.modal_permission.update_permission_successfully'));
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.an_error_occurred'),
          description: res.message,
        });
      }
    } else {
      //create
      const permission = {
        name,
        apiPath,
        method,
        module,
      };
      const res = await callCreatePermission(permission);
      if (res.data) {
        message.success(i18next.t('app:components.admin.permission.modal_permission.create_permission_successfully'));
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
    setDataInit(null);
    setOpenModal(false);
  };

  return (
    <>
      <ModalForm
        title={<>{dataInit?._id ? i18next.t('app:components.admin.permission.modal_permission.update_permission') : i18next.t('app:components.admin.permission.modal_permission.create_permission')}</>}
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
          okText: <>{dataInit?._id ? i18next.t('app:common.update') : i18next.t('app:components.admin.permission.modal_permission.create')}</>,
          cancelText: i18next.t('app:common.cancel'),
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitPermission}
        initialValues={dataInit?._id ? dataInit : {}}
      >
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:common.name')}
              name='name'
              rules={[{ required: true, message: i18next.t('app:components.admin.permission.modal_permission.please_do_not_leave_blank') }]}
              placeholder={i18next.t('app:components.admin.permission.modal_permission.enter_name')}
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label={i18next.t('app:components.admin.permission.modal_permission.api_path')}
              name='apiPath'
              rules={[{ required: true, message: i18next.t('app:components.admin.permission.modal_permission.please_do_not_leave_blank') }]}
              placeholder={i18next.t('app:components.admin.permission.modal_permission.enter_path')}
            />
          </Col>

          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormSelect
              name='method'
              label={i18next.t('app:common.method')}
              valueEnum={{
                GET: 'GET',
                POST: 'POST',
                PUT: 'PUT',
                PATCH: 'PATCH',
                DELETE: 'DELETE',
              }}
              placeholder={i18next.t('app:components.admin.permission.modal_permission.please_select_a_method')}
              rules={[{ required: true, message: i18next.t('app:components.admin.permission.modal_permission.please_select_a_method_2') }]}
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormSelect
              name='module'
              label={i18next.t('app:components.admin.permission.modal_permission.module')}
              valueEnum={ALL_MODULES}
              placeholder={i18next.t('app:components.admin.permission.modal_permission.please_select_a_module')}
              rules={[{ required: true, message: i18next.t('app:components.admin.permission.modal_permission.please_select_a_module_2') }]}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalPermission;
