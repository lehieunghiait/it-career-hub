import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Button, Result } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import NotPermitted from './not-permitted';
import Loading from '../loading';

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
        title='Could not verify your session with the server'
        subTitle={
          authError ??
          'You are signed in, but the API rejected your session token. Please try again later or contact the administrator.'
        }
        extra={
          <Button type='primary' onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  return <Navigate to='/login' replace />;
};

export default ProtectedRoute;
