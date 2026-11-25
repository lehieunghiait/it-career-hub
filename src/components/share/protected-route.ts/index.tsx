import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Button, Result } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import NotPermitted from './not-permitted';
import Loading from '../loading';

import i18next from 'i18next';

const RoleBaseRoute = (props: any) => {
  const user = useAppSelector(state => state.account.user);
  const userRole = user?.role?.name;

  // Users without a role (or with the candidate role) can't access the admin area
  if (userRole && userRole !== 'NORMAL_USER') {
    return <>{props.children}</>;
  } else {
    return <NotPermitted />;
  }
};

const ProtectedRoute = (props: any) => {
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const isLoading = useAppSelector(state => state.account.isLoading);
  const authError = useAppSelector(state => state.account.authError);

  if (!isLoaded || isLoading) return <Loading />;

  if (isAuthenticated) return <RoleBaseRoute>{props.children}</RoleBaseRoute>;

  // Signed in with Clerk but the API rejected the session: redirecting to /login would
  // bounce straight back to the home page, so explain what happened instead
  if (isSignedIn) {
    return (
      <Result
        status='warning'
        title={i18next.t('app:components.share.protected_route_ts.index.could_not_verify_your_session_with')}
        subTitle={
          authError ??
          i18next.t('app:components.share.protected_route_ts.index.you_are_signed_in_but_the')
        }
        extra={
          <Button type='primary' onClick={() => window.location.reload()}>
            {i18next.t('app:components.share.protected_route_ts.index.try_again')}
          </Button>
        }
      />
    );
  }

  return <Navigate to='/login' replace />;
};

export default ProtectedRoute;
