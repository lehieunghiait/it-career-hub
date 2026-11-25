import { Card, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from 'styles/client.module.scss';
import { CodeOutlined } from '@ant-design/icons';
import i18next from 'i18next';

const { Title } = Typography;

interface CompanySkillsProps {
  skills: string[];
}

const CompanySkills = ({ skills }: CompanySkillsProps) => {
  const { t } = useTranslation('companyDetail');
  if (!skills || skills.length === 0) return null;

  return (
    <Card
      className={styles['company-skills-card']}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CodeOutlined style={{ color: '#e14000' }} />
          <Title level={4} style={{ margin: 0 }}>
            {i18next.t('app:components.client.company.company_detail_ts.CompanySkills.our_skills')}
          </Title>
        </div>
      }
      bordered={false}
    >
      <div className={styles['skills-container']}>
        {skills.map((skill, index) => (
          <Tag
            key={index}
            className={styles['skill-tag']}
            color='white'
            style={{
              backgroundColor: '#25a5d7',
              color: '#000',
            }}
          >
            {skill}
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default CompanySkills;
