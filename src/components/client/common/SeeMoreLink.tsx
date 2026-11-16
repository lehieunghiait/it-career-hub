import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface SeeMoreLinkProps {
  to: string;
  label?: string;
}

const SeeMoreLink: React.FC<SeeMoreLinkProps> = ({ to, label = 'See more' }) => (
  <Link
    style={{
      fontWeight: 500,
      color: '#1677ff',
    }}
    to={to}
  >
    <ArrowRightOutlined style={{ marginRight: 5 }} />
    {label}
  </Link>
);

export default SeeMoreLink;
