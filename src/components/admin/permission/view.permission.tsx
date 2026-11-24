import { IPermission } from '@/types/backend';
import { Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

import i18next from 'i18next';

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IPermission | null;
  setDataInit: (v: any) => void;
}
const ViewDetailPermission = (props: IProps) => {
  const isMobile = useIsMobile('md');
  const { onClose, open, dataInit, setDataInit } = props;

  return (
    <>
      <Drawer
        title={i18next.t('app:components.admin.permission.view_permission.detail')}
        placement='right'
        onClose={() => {
          onClose(false);
          setDataInit(null);
        }}
        open={open}
        width={isMobile ? '100%' : 640}
        maskClosable={false}
      >
        <Descriptions title='' bordered column={isMobile ? 1 : 2} layout='vertical'>
          <Descriptions.Item label={i18next.t('app:components.admin.permission.view_permission.ten_permission')}>{dataInit?.name}</Descriptions.Item>
          <Descriptions.Item label={i18next.t('app:components.admin.permission.view_permission.api_path')}>{dataInit?.apiPath}</Descriptions.Item>

          <Descriptions.Item label={i18next.t('app:common.method')}>{dataInit?.method}</Descriptions.Item>
          <Descriptions.Item label={i18next.t('app:components.admin.permission.view_permission.thuoc_module')}>{dataInit?.module}</Descriptions.Item>

          <Descriptions.Item label={i18next.t('app:components.admin.permission.view_permission.ngay_tao')}>
            {dataInit && dataInit.createdAt
              ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss')
              : ''}
          </Descriptions.Item>
          <Descriptions.Item label={i18next.t('app:components.admin.permission.view_permission.ngay_sua')}>
            {dataInit && dataInit.updatedAt
              ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss')
              : ''}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default ViewDetailPermission;
