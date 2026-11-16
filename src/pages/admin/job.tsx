import DataTable from '@/components/client/data-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { IJob } from '@/types/backend';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, Tooltip, message, notification } from 'antd';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { callDeleteJob } from '@/config/api';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import { fetchJob } from '@/redux/slice/jobSlide';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import ViewDetailJob from '@/components/admin/job/view.detail.job';
import { getLocationName } from '@/config/utils';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import styles from '@/styles/dashboard.module.scss';

const JobPage = () => {
  const tableRef = useRef<ActionType>();
  const [viewJobId, setViewJobId] = useState<string | null>(null);

  const isFetching = useAppSelector(state => state.job.isFetching);
  const meta = useAppSelector(state => state.job.meta);
  const jobs = useAppSelector(state => state.job.result);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleDeleteJob = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeleteJob(_id);
      if (res && res.data) {
        message.success('Delete Job successfully');
        reloadTable();
      } else {
        notification.error({
          message: 'An error occurred',
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IJob>[] = [
    {
      title: 'STT',
      responsive: ['md'],
      key: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => {
        return <>{index + 1 + (meta.current - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: (_dom, entity) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
          <CompanyLogo
            className={styles['mini-logo']}
            src={entity.company?.logo}
            name={entity.company?.name}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{entity.name}</div>
            <small style={{ color: '#6b7280' }}>{entity.company?.name}</small>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      responsive: ['lg'],
      dataIndex: 'location',
      hideInSearch: true,
      render: (_dom, entity) => getLocationName(entity.location),
    },
    {
      title: 'Salary',
      responsive: ['sm'],
      dataIndex: 'salary',
      sorter: true,
      render(dom, entity, index, action, schema) {
        const str = '' + entity.salary;
        return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</>;
      },
    },
    {
      title: 'Level',
      responsive: ['md'],
      dataIndex: 'level',
      renderFormItem: (item, props, form) => (
        <ProFormSelect
          showSearch
          mode='multiple'
          allowClear
          valueEnum={{
            INTERN: 'INTERN',
            FRESHER: 'FRESHER',
            JUNIOR: 'JUNIOR',
            MIDDLE: 'MIDDLE',
            SENIOR: 'SENIOR',
          }}
          placeholder='Select level'
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tag color={entity.isActive ? 'lime' : 'red'}>
              {entity.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Tag>
          </>
        );
      },
      hideInSearch: true,
    },

    {
      title: 'CreatedAt',
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
      title: 'UpdatedAt',
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
      title: 'Actions',
      fixed: 'right',
      hideInSearch: true,
      width: 130,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Tooltip title='View details'>
            <EyeOutlined
              aria-label='View details'
              style={{ fontSize: 20, color: '#2a78d6', cursor: 'pointer' }}
              onClick={() => setViewJobId(entity._id ?? null)}
            />
          </Tooltip>
          <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: '#ffa500',
              }}
              type=''
              onClick={() => {
                navigate(`/admin/job/upsert?id=${entity._id}`);
              }}
            />
          </Access>
          <Access permission={ALL_PERMISSIONS.JOBS.DELETE} hideChildren>
            <Popconfirm
              placement='leftTop'
              title={'Confirm delete'}
              description={'Are you sure you want to delete this job?'}
              onConfirm={() => handleDeleteJob(entity._id)}
              okText='Confirm'
              cancelText='Cancel'
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
    if (clone.salary) clone.salary = `/${clone.salary}/i`;
    if (clone?.level?.length) {
      clone.level = clone.level.join(',');
    }

    let temp = queryString.stringify(clone);

    let sortBy = '';
    if (sort && sort.name) {
      sortBy = sort.name === 'ascend' ? 'sort=name' : 'sort=-name';
    }
    if (sort && sort.salary) {
      sortBy = sort.salary === 'ascend' ? 'sort=salary' : 'sort=-salary';
    }
    if (sort && sort.createdAt) {
      sortBy = sort.createdAt === 'ascend' ? 'sort=createdAt' : 'sort=-createdAt';
    }
    if (sort && sort.updatedAt) {
      sortBy = sort.updatedAt === 'ascend' ? 'sort=updatedAt' : 'sort=-updatedAt';
    }

    //default sort by updatedAt
    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=-updatedAt`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}>
        <DataTable<IJob>
          actionRef={tableRef}
          headerTitle='List of Jobs'
          rowKey='_id'
          loading={isFetching}
          columns={columns}
          dataSource={jobs}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchJob({ query }));
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
              <Button icon={<PlusOutlined />} type='primary' onClick={() => navigate('upsert')}>
                Add new
              </Button>
            );
          }}
        />
      </Access>
      <ViewDetailJob open={!!viewJobId} jobId={viewJobId} onClose={() => setViewJobId(null)} />
    </div>
  );
};

export default JobPage;
