import { useEffect, useState } from 'react';
import { Result } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import i18next from 'i18next';

interface IProps {
  hideChildren?: boolean;
  children: React.ReactNode;
  permission: { method: string; apiPath: string; module: string };
}

const Access = (props: IProps) => {
  //set default: hideChildren = false => vẫn render children
  // hideChildren = true => ko render children, ví dụ hide button (button này check quyền)
  const { permission, hideChildren = false } = props;
  const [allow, setAllow] = useState<boolean>(true);

  const permissions = useAppSelector(state => state.account.user.permissions);

  useEffect(() => {
    if (permissions.length) {
      const check = permissions.find(
        item =>
          item.apiPath === permission.apiPath &&
          item.method === permission.method &&
          item.module === permission.module
      );
      if (check) {
        setAllow(true);
      } else setAllow(false);
    }
  }, [permissions]);

  return (
    <>
      {allow === true ? (
        <>{props.children}</>
      ) : (
        <>
          {hideChildren === false ? (
            <Result
              status='403'
              title={i18next.t('app:components.share.access.access_denied')}
              subTitle={i18next.t('app:components.share.access.sorry_you_are_not_authorized_to')}
            />
          ) : (
            <>{/* render nothing */}</>
          )}
        </>
      )}
    </>
  );
};

export default Access;
