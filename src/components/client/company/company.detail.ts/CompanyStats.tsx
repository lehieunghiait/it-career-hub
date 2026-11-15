import { TeamOutlined, BankOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ICompanyDetail } from '@/types/backend';
import { Divider } from 'antd';

interface CompanyStatsProps {
  company: ICompanyDetail;
}

const CompanyStats = ({ company }: CompanyStatsProps) => {
  const { t } = useTranslation('companyDetail');

  const stats = [
    {
      icon: <TeamOutlined className='text-[22px] text-blue-500 transition-all duration-300' />,
      value: company.size || 'N/A',
      label: t('Overview.NumberOfStaff'),
    },
    {
      icon: <BankOutlined className='text-[22px] text-blue-500 transition-all duration-300' />,
      value: company.companyType || 'Technology',
      label: t('Overview.TypeOfBusiness'),
    },
    {
      icon: <CalendarOutlined className='text-[22px] text-blue-500 transition-all duration-300' />,
      value: company.createdAt ? new Date(company.createdAt).getFullYear() : 'N/A',
      label: t('Overview.YearOfFoundation'),
    },
  ];

  return (
    <>
      <Divider className='!my-5' />
      <div className='grid grid-cols-1 gap-3 mt-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='flex items-center gap-3 p-4 rounded-[10px] border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:from-gray-100 hover:to-gray-50 group'
          >
            <div className='flex items-center justify-center w-11 h-11 rounded-full bg-blue-100 flex-shrink-0 transition-all duration-300 group-hover:bg-blue-200'>
              {stat.icon}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-base font-semibold text-gray-800 mb-1 truncate'>
                {stat.value}
              </div>
              <div className='text-[13px] text-gray-600 leading-snug'>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CompanyStats;
