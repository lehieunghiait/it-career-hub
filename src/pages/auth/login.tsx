import { SignIn } from '@clerk/react';
import { useLocation } from 'react-router-dom';
import styles from 'styles/auth.module.scss';

const LoginPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const callback = params?.get('callback');

  return (
    <div className={styles['auth-container']}>
      <div className={styles['clerk-wrapper']}>
        <SignIn
          routing='path'
          path='/login'
          signUpUrl='/register'
          fallbackRedirectUrl='/'
          {...(callback ? { forceRedirectUrl: callback } : {})}
        />
      </div>
    </div>
  );
};

export default LoginPage;
