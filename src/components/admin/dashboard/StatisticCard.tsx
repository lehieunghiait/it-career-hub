import { Card } from 'antd';
import CountUp from 'react-countup';
import { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  bgColor: string;
}

const StatisticCard = ({ title, value, icon, color, bgColor }: StatisticCardProps) => {
  return (
    <Card
      bordered={false}
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        border: '1px solid #f0f0f0',
      }}
      bodyStyle={{
        padding: '24px',
      }}
      hoverable
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div
            style={{
              color: '#8c8c8c',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: '#262626',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            <CountUp end={value} separator=',' duration={2} />
          </div>
        </div>
        <div
          style={{
            color: color,
            backgroundColor: bgColor,
            borderRadius: '12px',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatisticCard;
