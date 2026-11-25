import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

import i18next from 'i18next';

const NotPermitted = () => {
  const navigate = useNavigate();
  return (
    <Result
      status='403'
      title='403'
      subTitle={i18next.t('app:components.share.protected_route_ts.not_permitted.sorry_you_are_not_authorized_to')}
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          {i18next.t('app:components.share.protected_route_ts.not_permitted.back_home')}
        </Button>
      }
    />
  );
};

export default NotPermitted;
