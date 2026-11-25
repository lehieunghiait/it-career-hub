import DataTable from '@/components/client/data-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ICompany, IJob, IResume } from '@/types/backend';
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { message, notification } from 'antd';
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteResume, callFetchJob } from '@/config/api';
import queryString from 'query-string';
import { fetchResume } from '@/redux/slice/resumeSlide';
import ViewDetailResume from '@/components/admin/resume/view.resume';
import { ALL_PERMISSIONS } from '@/config/permissions';
import Access from '@/components/share/access';
import { Space, Popconfirm, Button } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { callFetchCompany } from '@/config/api';
import { useEffect } from 'react';
import { useOpenResume } from '@/hooks/useOpenResume';

import i18next from 'i18next';

const ResumePage = () => {
  const { openResume, openingId } = useOpenResume();
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector(state => state.resume.isFetching);
  const meta = useAppSelector(state => state.resume.meta);
  const resumes = useAppSelector(state => state.resume.result);
  const dispatch = useAppDispatch();

  const [dataInit, setDataInit] = useState<IResume | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [jobs, setJobs] = useState<IJob[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await callFetchCompany('current=1&pageSize=100');
        if (res?.data?.result) {
          setCompanies(res.data.result);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const res = await callFetchJob('current=1&pageSize=100');
      if (res?.data?.result) {
        setJobs(res.data.result);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };
  const handleDeleteResume = async (_id: string | undefined) => {
    if (_id) {
      const res = await callDeleteResume(_id);
      if (res && res.data) {
        message.success(i18next.t('app:pages.admin.resume.remove_resume_successfully'));
        reloadTable();
      } else {
        notification.error({
          message: i18next.t('app:common.an_error_occurred'),
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    //reload table
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IResume>[] = [
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
    // Status filed
    {
      title: i18next.t('app:common.status'),
      dataIndex: 'status',
      sorter: true,
      renderFormItem: (item, props, form) => (
        <ProFormSelect
          showSearch
          mode='multiple'
          allowClear
          valueEnum={{
            PENDING: 'PENDING',
            REVIEWING: 'REVIEWING',
            AI_SCREENING: 'AI_SCREENING',
            INTERVIEW: 'INTERVIEW',
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED',
          }}
          placeholder={i18next.t('app:pages.admin.resume.select_level')}
        />
      ),
    },
    {
      title: i18next.t('app:pages.admin.resume.job'),
      dataIndex: ['jobId', 'name'],
      renderFormItem: (item, props, form) => {
        return (
          <ProFormSelect
            placeholder={i18next.t('app:pages.admin.resume.filter_by_job_name')}
            options={jobs.map(job => ({
              label: job.name as string,
              value: job._id as string,
            }))}
            fieldProps={{
              loading: jobs.length === 0,
              filterOption: (input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase()),
              allowClear: true,
              showSearch: true,
            }}
          />
        );
      },
    },
    {
      title: i18next.t('app:common.company'),
      responsive: ['md'],
      dataIndex: ['companyId', 'name'],
      renderFormItem: (item, props, form) => {
        return (
          <ProFormSelect
            placeholder={i18next.t('app:pages.admin.resume.filter_by_company')}
            allowClear
            showSearch
            options={companies.map(company => ({
              label: company.name as string,
              value: company._id as string,
            }))}
            fieldProps={{
              loading: companies.length === 0,
              filterOption: (input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase()),
            }}
          />
        );
      },
    },

    {
      title: i18next.t('app:common.createdat'),
      responsive: ['lg'],
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
      width: 150,
      sorter: true,
      render: (text, record, index, action) => {
        return <>{dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</>;
      },
      hideInSearch: true,
    },
    {
      title: 'CV',
      responsive: ['sm'],
      dataIndex: 'url',
      hideInSearch: true,
      width: 100,
      render: (text, record) => {
        return (
          <Space direction='vertical' size='small' align='center'>
            <Button
              type='link'
              icon={<FileOutlined />}
              style={{ color: '#15bdd7' }}
              loading={openingId === record._id}
              onClick={() => openResume(record._id)}
            >
              {i18next.t('app:common.view_cv')}
            </Button>
          </Space>
        );
      },
    },
    {
      title: i18next.t('app:common.actions'),
      fixed: 'right',
      hideInSearch: true,
      width: 130,
      render: (_value, entity, _index, _action) => (
        <Space>
          <EditOutlined
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#ffa500',
            }}
            type=''
            onClick={() => {
              // navigate(`/admin/job/upsert?id=${entity._id}`);
            }}
          />

          <Popconfirm
            placement='leftTop'
            title={i18next.t('app:common.confirm_delete')}
            description={i18next.t('app:pages.admin.resume.are_you_sure_you_want_to')}
            onConfirm={() => handleDeleteResume(entity._id)}
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

          <EyeOutlined
            style={{ fontSize: 20, color: '#1890ff' }}
            type=''
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(entity);
            }}
            title={i18next.t('app:pages.admin.resume.view_details')}
          />
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    // if (clone.name) clone.name = `/${clone.name}/i`;
    // if (clone.salary) clone.salary = `/${clone.salary}/i`;
    if (clone?.status?.length) {
      clone.status = clone.status.join(',');
    }

    let temp = queryString.stringify(clone);

    let sortBy = '';
    if (sort && sort.status) {
      sortBy = sort.status === 'ascend' ? 'sort=status' : 'sort=-status';
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

    temp +=
      '&populate=companyId,jobId&fields=companyId._id, companyId.name, companyId.logo, jobId._id, jobId.name';
    return temp;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
        <DataTable<IResume>
          actionRef={tableRef}
          headerTitle={i18next.t('app:pages.admin.resume.list_resume')}
          rowKey='_id'
          loading={isFetching}
          columns={columns}
          dataSource={resumes}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchResume({ query }));
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
            return <></>;
          }}
        />
      </Access>
      <ViewDetailResume
        open={openViewDetail}
        onClose={setOpenViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
        reloadTable={reloadTable}
      />
    </div>
  );
};

export default ResumePage;
