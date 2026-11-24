import DataTable from '@/components/client/data-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { IPermission } from '@/types/backend';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from 'antd';
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeletePermission } from '@/config/api';
import queryString from 'query-string';
import { fetchPermission } from '@/redux/slice/permissionSlide';
import ViewDetailPermission from '@/components/admin/permission/view.permission';
import ModalPermission from '@/components/admin/permission/modal.permission';
import { colorMethod } from '@/config/utils';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';

import i18next from 'i18next';

const PermissionPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IPermission | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector(state => state.permission.isFetching);
  const meta = useAppSelector(state => state.permission.meta);
  const permissions = useAppSelector(state => state.permission.result);
  const dispatch = useAppDispatch();

  const handleDeletePermission = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeletePermission(_id);
      if (res && res.data) {
        message.success(i18next.t('app:pages.admin.permission.xoa_permission_thanh_cong'));
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

  const columns: ProColumns<IPermission>[] = [
    {
      title: i18next.t('app:common.id'),
      responsive: ['xxl'],
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
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: 'API',
      responsive: ['md'],
      dataIndex: 'apiPath',
      sorter: true,
    },
    {
      title: i18next.t('app:common.method'),
      responsive: ['sm'],
      dataIndex: 'method',
      sorter: true,
      render(dom, entity, index, action, schema) {
        return (
          <p
            style={{
              paddingLeft: 10,
              fontWeight: 'bold',
              marginBottom: 0,
              color: colorMethod(entity?.method as string),
            }}
          >
            {entity?.method || ''}
          </p>
        );
      },
    },
    {
      title: i18next.t('app:pages.admin.permission.module'),
      responsive: ['lg'],
      dataIndex: 'module',
      sorter: true,
    },
    {
      title: i18next.t('app:common.createdat'),
      responsive: ['xxl'],
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
      responsive: ['xl'],
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
          <Access permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE} hideChildren>
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
          <Access permission={ALL_PERMISSIONS.PERMISSIONS.DELETE} hideChildren>
            <Popconfirm
              placement='leftTop'
              title={i18next.t('app:pages.admin.permission.xac_nhan_xoa_permission')}
              description={i18next.t('app:pages.admin.permission.ban_co_chac_chan_muon_xoa')}
              onConfirm={() => handleDeletePermission(entity._id)}
              okText={i18next.t('app:common.xac_nhan')}
              cancelText={i18next.t('app:common.huy')}
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
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    if (clone.name) clone.name = `/${clone.name}/i`;
    if (clone.apiPath) clone.apiPath = `/${clone.apiPath}/i`;
    if (clone.method) clone.method = `/${clone.method}/i`;
    if (clone.module) clone.module = `/${clone.module}/i`;

    let temp = queryString.stringify(clone);

    let sortBy = '';
    if (sort && sort.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name' : 'sort=-name';
    }
    if (sort && sort.apiPath) {
      sortBy = sort.apiPath === 'ascend' ? 'sort=apiPath' : 'sort=-apiPath';
    }
    if (sort && sort.method) {
      sortBy = sort.method === 'ascend' ? 'sort=method' : 'sort=-method';
    }
    if (sort && sort.module) {
      sortBy = sort.module === 'ascend' ? 'sort=module' : 'sort=-module';
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

    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}>
        <DataTable<IPermission>
          actionRef={tableRef}
          headerTitle={i18next.t('app:pages.admin.permission.list_of_permissions')}
          rowKey='_id'
          loading={isFetching}
          columns={columns}
          dataSource={permissions}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchPermission({ query }));
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
                  {range[0]}-{range[1]} {i18next.t('app:pages.admin.permission.tren')}{' '}{total} rows
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
      <ModalPermission
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />

      <ViewDetailPermission
        onClose={setOpenViewDetail}
        open={openViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default PermissionPage;
