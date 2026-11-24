import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DebounceSelect } from '../user/debouce.select';
import {
  FooterToolbar,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ICompanySelect } from '../user/modal.user';
import { useState, useEffect } from 'react';
import { callCreateJob, callFetchCompany, callFetchJobById, callUpdateJob } from '@/config/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IJob } from '@/types/backend';

import i18next from 'i18next';

const ViewUpsertJob = (props: any) => {
  const [companies, setCompanies] = useState<ICompanySelect[]>([]);

  const navigate = useNavigate();
  const [value, setValue] = useState<string>('');

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params?.get('id'); // job id
  const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const init = async () => {
      if (id) {
        const res = await callFetchJobById(id);
        if (res && res.data) {
          setDataUpdate(res.data);
          setValue(res.data.description);
          setCompanies([
            {
              label: res.data.company?.name as string,
              value: `${res.data.company?._id}@#$${res.data.company?.logo}` as string,
              key: res.data.company?._id,
            },
          ]);

          form.setFieldsValue({
            ...res.data,
            company: {
              label: res.data.company?.name as string,
              value: `${res.data.company?._id}@#$${res.data.company?.logo}` as string,
              key: res.data.company?._id,
            },
          });
        }
      }
    };
    init();
    return () => form.resetFields();
  }, [id]);

  // Usage of DebounceSelect
  async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
    const res = await callFetchCompany(`current=1&pageSize=100&name=/${name}/i`);
    if (res && res.data) {
      const list = res.data.result;
      const temp = list.map(item => {
        return {
          label: item.name as string,
          value: `${item._id}@#$${item.logo}` as string,
        };
      });
      return temp;
    } else return [];
  }

  const onFinish = async (values: any) => {
    if (dataUpdate?._id) {
      //update
      const cp = values?.company?.value?.split('@#$');
      const job = {
        name: values.name,
        skills: values.skills,
        company: {
          _id: cp && cp.length > 0 ? cp[0] : '',
          name: values.company.label,
          logo: cp && cp.length > 1 ? cp[1] : '',
        },
        location: values.location,
        salary: values.salary,
        quantity: values.quantity,
        level: values.level,
        description: value,
        startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.startDate)
          ? dayjs(values.startDate, 'DD/MM/YYYY').toDate()
          : values.startDate,
        endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.endDate)
          ? dayjs(values.endDate, 'DD/MM/YYYY').toDate()
          : values.endDate,
        isActive: values.isActive,
      };

      const res = await callUpdateJob(job, dataUpdate._id);
      if (res.data) {
        message.success(i18next.t('app:components.admin.job.upsert_job.cap_nhat_job_thanh_cong'));
        navigate('/admin/job');
      } else {
        notification.error({
          message: i18next.t('app:common.co_loi_xay_ra'),
          description: res.message,
        });
      }
    } else {
      //create
      const cp = values?.company?.value?.split('@#$');
      const job = {
        name: values.name,
        skills: values.skills,
        company: {
          _id: cp && cp.length > 0 ? cp[0] : '',
          name: values.company.label,
          logo: cp && cp.length > 1 ? cp[1] : '',
        },
        location: values.location,
        salary: values.salary,
        quantity: values.quantity,
        level: values.level,
        description: value,
        startDate: dayjs(values.startDate, 'DD/MM/YYYY').toDate(),
        endDate: dayjs(values.endDate, 'DD/MM/YYYY').toDate(),
        isActive: values.isActive,
      };

      const res = await callCreateJob(job);
      if (res.data) {
        message.success(i18next.t('app:components.admin.job.upsert_job.tao_moi_job_thanh_cong'));
        navigate('/admin/job');
      } else {
        notification.error({
          message: i18next.t('app:common.co_loi_xay_ra'),
          description: res.message,
        });
      }
    }
  };

  return (
    <div className={styles['upsert-job-container']}>
      <div className={styles['title']}>
        <Breadcrumb
          separator='>'
          items={[
            {
              title: <Link to='/admin/job'>{i18next.t('app:components.admin.job.upsert_job.manage_job')}</Link>,
            },
            {
              title: i18next.t('app:components.admin.job.upsert_job.upsert_job'),
            },
          ]}
        />
      </div>
      <div>
        <ConfigProvider>
          <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{
              searchConfig: {
                resetText: i18next.t('app:common.huy'),
                submitText: <>{dataUpdate?._id ? i18next.t('app:components.admin.job.upsert_job.cap_nhat_job') : i18next.t('app:components.admin.job.upsert_job.tao_moi_job')}</>,
              },
              onReset: () => navigate('/admin/job'),
              render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
              submitButtonProps: {
                icon: <CheckSquareOutlined />,
              },
            }}
          >
            <Row gutter={[20, 20]}>
              <Col span={24} md={12}>
                <ProFormText
                  label={i18next.t('app:components.admin.job.upsert_job.title')}
                  name='name'
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_enter_a_name') }]}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_enter_a_title')}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormSelect
                  name='skills'
                  label={i18next.t('app:common.skills')}
                  options={SKILLS_LIST}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_select_a_skill_required')}
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_skill_required_2') }]}
                  allowClear
                  mode='multiple'
                  fieldProps={{
                    showArrow: false,
                  }}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormSelect
                  name='location'
                  label={i18next.t('app:common.location')}
                  options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_select_a_location')}
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_location_2') }]}
                  fieldProps={{
                    showSearch: true,
                    filterOption: (input: string, option: any) => {
                      const label =
                        typeof option?.label === 'string'
                          ? option.label
                          : String(option?.label ?? '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    },
                    allowClear: true,
                  }}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormDigit
                  label={i18next.t('app:common.salary')}
                  name='salary'
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_enter_salary') }]}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_enter_salary_2')}
                  fieldProps={{
                    addonAfter: i18next.t('app:common.d'),
                    formatter: value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                    parser: value => +(value || '').replace(/\$\s?|(,*)/g, ''),
                  }}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormDigit
                  label={i18next.t('app:components.admin.job.upsert_job.quantity')}
                  name='quantity'
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_enter_quantity') }]}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_enter_quantity_2')}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormSelect
                  name='level'
                  label={i18next.t('app:common.level')}
                  valueEnum={{
                    INTERN: 'INTERN',
                    FRESHER: 'FRESHER',
                    JUNIOR: 'JUNIOR',
                    MIDDLE: 'MIDDLE',
                    SENIOR: 'SENIOR',
                  }}
                  placeholder={i18next.t('app:components.admin.job.upsert_job.please_select_a_level')}
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_level_2') }]}
                />
              </Col>

              {(dataUpdate?._id || !id) && (
                <Col span={24} md={6}>
                  <ProForm.Item
                    name='company'
                    label={i18next.t('app:common.company')}
                    rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_company') }]}
                  >
                    <DebounceSelect
                      allowClear
                      showSearch
                      defaultValue={companies}
                      value={companies}
                      placeholder={i18next.t('app:components.admin.job.upsert_job.please_select_a_company_2')}
                      fetchOptions={fetchCompanyList}
                      onChange={(newValue: any) => {
                        if (newValue?.length === 0 || newValue?.length === 1) {
                          setCompanies(newValue as ICompanySelect[]);
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </ProForm.Item>
                </Col>
              )}
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={24} md={6}>
                <ProFormDatePicker
                  label={i18next.t('app:components.admin.job.upsert_job.start_date')}
                  name='startDate'
                  normalize={value => value && dayjs(value, 'DD/MM/YYYY')}
                  fieldProps={{
                    format: 'DD/MM/YYYY',
                  }}
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_start_date') }]}
                  placeholder='dd/mm/yyyy'
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormDatePicker
                  label={i18next.t('app:components.admin.job.upsert_job.end_date')}
                  name='endDate'
                  normalize={value => value && dayjs(value, 'DD/MM/YYYY')}
                  fieldProps={{
                    format: 'DD/MM/YYYY',
                  }}
                  // width="auto"
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_select_a_end_date') }]}
                  placeholder='dd/mm/yyyy'
                />
              </Col>
              <Col span={24} md={6}>
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
                <ProForm.Item
                  name='description'
                  label={i18next.t('app:common.description')}
                  rules={[{ required: true, message: i18next.t('app:components.admin.job.upsert_job.please_enter_a_description') }]}
                >
                  <ReactQuill theme='snow' value={value} onChange={setValue} />
                </ProForm.Item>
              </Col>
            </Row>
            <Divider />
          </ProForm>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default ViewUpsertJob;
