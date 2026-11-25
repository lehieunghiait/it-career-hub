import DataTable from '@/components/client/data-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUser } from '@/redux/slice/userSlide';
import { IUser } from '@/types/backend';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from 'antd';
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteUser } from '@/config/api';
import queryString from 'query-string';
import ModalUser from '@/components/admin/user/modal.user';
import ViewDetailUser from '@/components/admin/user/view.user';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { EyeOutlined } from '@ant-design/icons';

import i18next from 'i18next';

const UserPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IUser | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector(state => state.user.isFetching);
  const meta = useAppSelector(state => state.user.meta);
  const users = useAppSelector(state => state.user.result);
  const dispatch = useAppDispatch();

  const handleDeleteUser = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeleteUser(_id);
      if (res && res.data) {
        message.success(i18next.t('app:pages.admin.user.xoa_user_thanh_cong'));
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.co_loi_xay_ra'),
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IUser>[] = [
    {
      title: i18next.t('app:common.id'),
      responsive: ['xl'],
      dataIndex: '_id',
      width: 250,
      render: (text, record, index, action) => {
        return (
          <a
            href='#'
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(record);
            }}
          >
            {record._id}
          </a>
        );
      },
      hideInSearch: true,
    },
    {
      title: i18next.t('app:common.name'),
      responsive: ['sm'],
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: i18next.t('app:common.email'),
      dataIndex: 'email',
      sorter: true,
    },

    {
      title: i18next.t('app:common.createdat'),
      responsive: ['xl'],
      dataIndex: 'createdAt',
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>;
      },
      hideInSearch: true,
    },
    {
      title: i18next.t('app:common.updatedat'),
      responsive: ['lg'],
      dataIndex: 'updatedAt',
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return <>{dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</>;
      },
      hideInSearch: true,
    },
    {
      title: i18next.t('app:common.actions'),
      fixed: 'right',
      hideInSearch: true,
      width: 100,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: '#ffa500',
              }}
              type=''
              onClick={() => {
                setOpenModal(true);
                setDataInit(entity);
              }}
            />
          </Access>
          {/* Action delete user  */}
          <Access permission={ALL_PERMISSIONS.USERS.DELETE} hideChildren>
            <Popconfirm
              placement='leftTop'
              title={i18next.t('app:common.confirm_delete')}
              description={i18next.t('app:pages.admin.user.are_you_sure_you_want_to')}
              onConfirm={() => handleDeleteUser(entity._id)}
              okText={i18next.t('app:common.confirm')}
              cancelText={i18next.t('app:common.cancel')}
            >
              <span style={{ cursor: 'pointer', margin: '0 10px' }}>
                <DeleteOutlined
                  style={{
                    fontSize: 20,
                    color: '#ff4d4f',
                  }}
                />
              </span>
            </Popconfirm>
          </Access>
          {/* Action view detail user */}
          <Access permission={ALL_PERMISSIONS.USERS.GET_DETAIL} hideChildren>
            <EyeOutlined
              style={{
                fontSize: 20,
                color: '#1890ff',
              }}
              type=''
              onClick={() => {
                alert('Feature is developing...');
              }}
            />
          </Access>
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    if (clone.name) clone.name = `/${clone.name}/i`;
    if (clone.email) clone.email = `/${clone.email}/i`;

    let temp = queryString.stringify(clone);

    let sortBy = '';
    if (sort && sort.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name' : 'sort=-name';
    }
    if (sort && sort.email) {
      sortBy = sort.email === 'ascend' ? 'sort=email' : 'sort=-email';
    }
    if (sort && sort.createdAt) {
      sortBy = sort.createdAt === 'ascend' ? 'sort=createdAt' : 'sort=-createdAt';
    }
    if (sort && sort.updatedAt) {
      sortBy = sort.updatedAt === 'ascend' ? 'sort=updatedAt' : 'sort=-updatedAt';
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=-updatedAt`;
    } else {
      temp = `${temp}&${sortBy}`;
    }
    temp += '&populate=role&fields=role._id, role.name';

    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
        <DataTable<IUser>
          actionRef={tableRef}
          headerTitle={i18next.t('app:pages.admin.user.list_of_users')}
          rowKey='_id'
          loading={isFetching}
          columns={columns}
          dataSource={users}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchUser({ query }));
          }}
          scroll={{ x: true }}
          pagination={{
            current: meta.current,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => {
              return (
                <div>
                  {' '}
                  {range[0]}-{range[1]} of {total} rows
                </div>
              );
            },
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return (
              <Button icon={<PlusOutlined />} type='primary' onClick={() => setOpenModal(true)}>
                {i18next.t('app:common.add_new')}
              </Button>
            );
          }}
        />
      </Access>
      <ModalUser
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
      <ViewDetailUser />
    </div>
  );
};

export default UserPage;
