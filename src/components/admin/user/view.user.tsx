import { callDeleteCompany, callFetchUser } from '@/config/api';
import { IAccount, IUser } from '@/types/backend';
import { FacebookFilled } from '@ant-design/icons';
import { Badge, Descriptions, Drawer } from 'antd';
import { calc } from 'antd/es/theme/internal';
import dayjs from 'dayjs';
import { use } from 'i18next';
import { useEffect, useState } from 'react';

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IUser | null;
  setDataInit: (v: any) => void;
}
const ViewDetailUser = () => {
  return <Drawer title='View Detail User'>View Detail User</Drawer>;
};

export default ViewDetailUser;
