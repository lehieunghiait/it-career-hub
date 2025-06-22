import { Card, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from 'styles/client.module.scss';
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
      title={<Title level={4}>{t('Overview.OurSkills')}</Title>}
    >
      <div className={styles['skills-container']}>
        {skills.map((skill, index) => (
          <Tag key={index} className={styles['skill-tag']}>
            {skill}
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default CompanySkills;
