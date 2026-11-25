import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

import i18next from 'i18next';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <Result
        status='404'
        title='404'
        subTitle={i18next.t('app:components.share.not_found.sorry_the_page_you_visited_does')}
        extra={
          <Button type='primary' onClick={() => navigate('/')}>
            {i18next.t('app:components.share.not_found.back_home')}
          </Button>
        }
      />
    </>
  );
};

export default NotFound;
