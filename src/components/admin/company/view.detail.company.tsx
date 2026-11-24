import { ICompanyDetail } from '@/types/backend';
import { Modal, Row, Col, Descriptions, Tag, Image, Divider, Spin } from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  BuildOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { callFetchCompanyById } from '@/config/api';
import parse from 'html-react-parser';
import dayjs from 'dayjs';

import i18next from 'i18next';

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  companyId: string | null;
}
//Model xem chi tiết công ty
const ViewDetailCompany = (props: IProps) => {
  const { openViewDetail, setOpenViewDetail, companyId } = props;
  const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      if (companyId) {
        setLoading(true);
        const res = await callFetchCompanyById(companyId);
        if (res && res.data) {
          console.log('show data', res.data);
          setCompanyDetail(res.data);
        }
        setLoading(false);
      }
    };
    if (openViewDetail && companyId) {
      fetchCompanyDetail();
    }
  }, [openViewDetail, companyId]);

  const handleClose = () => {
    setOpenViewDetail(false);
    setCompanyDetail(null);
  };

  return (
    <Modal
      title={
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000',
            paddingRight: 32,
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}
        >
          {i18next.t('app:components.admin.company.view_detail_company.detail')}{' '}{companyDetail?.name}
        </div>
      }
      open={openViewDetail}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : (
        companyDetail && (
          <div>
            {/* Logo & Basic Info */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} md={6}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: '#f5f7fa',
                    borderRadius: '12px',
                    border: '2px solid #e8e8e8',
                  }}
                >
                  {/* Logo công ty */}
                  <Image
                    src={companyDetail.logo}
                    alt={companyDetail.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '150px',
                      objectFit: 'contain',
                    }}
                    preview={true}
                  />
                </div>
              </Col>
              <Col xs={24} md={18}>
                {/* Tên công ty */}
                <h2 style={{ marginBottom: '16px', fontSize: '24px', color: '#262626' }}>
                  {companyDetail.name}
                </h2>
                {/* Địa chỉ công ty */}
                <Descriptions column={{ xs: 1, sm: 1, md: 1 }} size='small'>
                  <Descriptions.Item
                    label={
                      <span>
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        {i18next.t('app:common.address')}
                      </span>
                    }
                  >
                    {companyDetail.address || 'N/A'}
                  </Descriptions.Item>
                  {/* Trang website công ty */}
                  {companyDetail.website && (
                    <Descriptions.Item
                      label={
                        <span>
                          <GlobalOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          {i18next.t('app:common.website')}
                        </span>
                      }
                    >
                      <a
                        href={
                          /^https?:\/\//.test(companyDetail.website)
                            ? companyDetail.website
                            : `https://${companyDetail.website}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ color: '#1890ff' }}
                      >
                        {(companyDetail.website || '').toString().replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </Descriptions.Item>
                  )}
                  {/* Số điện thoại của công ty */}
                  {companyDetail.phone && (
                    <Descriptions.Item
                      label={
                        <span>
                          <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          {i18next.t('app:common.phone')}
                        </span>
                      }
                    >
                      <a href={`tel:${companyDetail.phone}`}>{companyDetail.phone}</a>
                    </Descriptions.Item>
                  )}
                  {companyDetail.email && (
                    <Descriptions.Item
                      label={
                        <span>
                          <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          {i18next.t('app:common.email')}
                        </span>
                      }
                    >
                      <a href={`mailto:${companyDetail.email}`}>{companyDetail.email}</a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
            </Row>

            <Divider />

            {/* Company Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f0f5ff',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  {/* Số lượng nhân viên */}
                  <TeamOutlined
                    style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {companyDetail.size || 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{i18next.t('app:components.admin.company.view_detail_company.number_of_staff')}</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                {/* Loại hình kinh doanh */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f6ffed',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  {/* Loại hình kinh doanh */}
                  <BuildOutlined
                    style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {companyDetail.companyType || 'Technology'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{i18next.t('app:components.admin.company.view_detail_company.type_of_business')}</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                {/* Năm thành lập */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#fff7e6',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  {/* Năm thành lập */}
                  <CalendarOutlined
                    style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {companyDetail.createdAt
                      ? dayjs(companyDetail.createdAt).format('YYYY')
                      : i18next.t('app:components.admin.company.view_detail_company.n_a')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{i18next.t('app:components.admin.company.view_detail_company.year_of_foundation')}</div>
                </div>
                {/* Số lượng nhân viên */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#fff7e6',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                ></div>
              </Col>
            </Row>

            <Divider />

            {/* Skills */}
            {companyDetail.skills && companyDetail.skills.length > 0 && (
              <>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{i18next.t('app:components.admin.company.view_detail_company.skills')}</h3>
                <div style={{ marginBottom: '24px' }}>
                  {companyDetail.skills.map((skill, index) => (
                    <Tag
                      key={index}
                      color='blue'
                      style={{
                        marginBottom: '8px',
                        padding: '4px 12px',
                        fontSize: '13px',
                        borderRadius: '6px',
                      }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
                <Divider />
              </>
            )}

            {/* View Wesite */}

            {/* {companyDetail?.website && (
              <p>
                <GlobalOutlined /> {companyDetail?.website}
              </p>
            )} */}
            {/* Description */}
            {companyDetail.description && (
              <>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{i18next.t('app:components.admin.company.view_detail_company.description')}</h3>
                <div
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {parse(companyDetail.description)}
                </div>
              </>
            )}

            <Divider />

            {/* Metadata */}
            <Descriptions column={2} size='small' bordered>
              <Descriptions.Item label={i18next.t('app:components.admin.company.view_detail_company.created_at')}>
                {dayjs(companyDetail.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label={i18next.t('app:components.admin.company.view_detail_company.updated_at')}>
                {dayjs(companyDetail.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label='ID' span={2}>
                <code style={{ fontSize: '11px' }}>{companyDetail._id}</code>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )
      )}
    </Modal>
  );
};

export default ViewDetailCompany;
