import ModalCompany from '@/components/admin/company/modal.company';
import DataTable from '@/components/client/data-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCompany } from '@/redux/slice/companySlide';
import { ICompany } from '@/types/backend';
import { DeleteOutlined, EditOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Dropdown, Popconfirm, Space, message, notification } from 'antd';
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteCompany } from '@/config/api';
import queryString from 'query-string';
import Access from '@/components/share/access';
import { EyeOutlined } from '@ant-design/icons';
import { ALL_PERMISSIONS } from '@/config/permissions';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import styles from '@/styles/dashboard.module.scss';
import { useNavigate } from 'react-router-dom';
import ViewDetailCompany from '@/components/admin/company/view.detail.company';

import i18next from 'i18next';

const CompanyPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ICompany | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector(state => state.company.isFetching);
  const meta = useAppSelector(state => state.company.meta);
  const companies = useAppSelector(state => state.company.result);
  const dispatch = useAppDispatch();

  const handleDeleteCompany = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeleteCompany(_id);
      if (res && res.data) {
        message.success(i18next.t('app:pages.admin.company.delete_company_successfully'));
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.an_error_occurred'),
          description: res.message,
        });
      }
    }
  };
  // reload table
  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<ICompany>[] = [
    {
      title: i18next.t('app:pages.admin.company.index'),
      responsive: ['md'],
      key: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
      hideInSearch: true,
    },
    {
      title: i18next.t('app:common.name'),
      dataIndex: 'name',
      sorter: true,
      render: (_dom, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
          <CompanyLogo className={styles['mini-logo']} src={record.logo} name={record.name} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <small style={{ color: '#6b7280' }}>{record.address}</small>
          </div>
        </div>
      ),
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
          {/* Action update company */}
          <Access permission={ALL_PERMISSIONS.COMPANIES.UPDATE} hideChildren>
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
          {/* Action remove company */}
          <Access permission={ALL_PERMISSIONS.COMPANIES.DELETE} hideChildren>
            <Popconfirm
              placement='leftTop'
              title={i18next.t('app:pages.admin.company.xac_nhan_xoa_company')}
              description={i18next.t('app:pages.admin.company.ban_co_chac_chan_muon_xoa')}
              onConfirm={() => handleDeleteCompany(entity._id)}
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
          {/* Action view detail company */}
          <Access permission={ALL_PERMISSIONS.COMPANIES.GET_DETAIL} hideChildren>
            <EyeOutlined
              style={{
                fontSize: 20,
                color: '#1890ff',
              }}
              type=''
              onClick={() => {
                setOpenViewDetail(true);
                setSelectedCompanyId(entity._id ?? null);
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
    if (clone.address) clone.address = `/${clone.address}/i`;

    let temp = queryString.stringify(clone);

    let sortBy = '';
    if (sort && sort.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name' : 'sort=-name';
    }
    if (sort && sort.address) {
      sortBy = sort.address === 'ascend' ? 'sort=address' : 'sort=-address';
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
      <Access permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}>
        <DataTable<ICompany>
          actionRef={tableRef}
          headerTitle={i18next.t('app:pages.admin.company.list_of_companies')}
          rowKey='_id'
          loading={isFetching}
          columns={columns}
          dataSource={companies}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchCompany({ query }));
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
                  {range[0]}-{range[1]} {i18next.t('app:pages.admin.company.tren')}{' '}{total} rows
                </div>
              );
            },
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return (
              <Space>
                <Access permission={ALL_PERMISSIONS.COMPANIES.CREATE} hideChildren>
                  <Button icon={<PlusOutlined />} type='primary' onClick={() => setOpenModal(true)}>
                    {i18next.t('app:common.add_new')}
                  </Button>
                </Access>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'export-excel',
                        label: (
                          <span
                            onClick={() => {
                              // Export to Excel logic here
                              // You would replace this with a real export function as needed
                              message.info(i18next.t('app:pages.admin.company.export_to_excel'));
                            }}
                          >
                            {i18next.t('app:pages.admin.company.export_to_excel')}
                          </span>
                        ),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button
                    style={{
                      color: '#1890ff',
                    }}
                  >
                    {i18next.t('app:pages.admin.company.export')}
                  </Button>
                </Dropdown>
              </Space>
            );
          }}
        />
      </Access>
      <ModalCompany
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
      <ViewDetailCompany
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        companyId={selectedCompanyId}
      />
    </div>
  );
};

export default CompanyPage;
