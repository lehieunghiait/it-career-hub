import { callDeleteCompany, callFetchUser } from '@/config/api';
import { IAccount, IUser } from '@/types/backend';
import { FacebookFilled } from '@ant-design/icons';
import { Badge, Descriptions, Drawer } from 'antd';
import { calc } from 'antd/es/theme/internal';
import dayjs from 'dayjs';
import { use } from 'i18next';
import { useEffect, useState } from 'react';

import i18next from 'i18next';

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IUser | null;
  setDataInit: (v: any) => void;
}
const ViewDetailUser = () => {
  return <Drawer title={i18next.t('app:components.admin.user.view_user.view_detail_user')}>{i18next.t('app:components.admin.user.view_user.view_detail_user')}</Drawer>;
};

export default ViewDetailUser;
