import { SignUp } from '@clerk/react';
import styles from 'styles/auth.module.scss';

const RegisterPage = () => {
  return (
    <div className={styles['auth-container']}>
      <div className={styles['clerk-wrapper']}>
        <SignUp routing='path' path='/register' signInUrl='/login' fallbackRedirectUrl='/' />
      </div>
    </div>
  );
};

export default RegisterPage;
