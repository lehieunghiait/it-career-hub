import { useState } from 'react';

const initials = (name = '') =>
  name
    .replace(/công ty|cổ phần|tnhh|co\.,?|ltd\.?/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

interface CompanyLogoProps {
  src?: string;
  name?: string;
  className?: string;
}

/**
 * Company logo with a lettermark fallback when the remote image can't be loaded
 */
const CompanyLogo = ({ src, name, className }: CompanyLogoProps) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className}>
      {src && !failed ? (
        <img src={src} alt={name} loading='lazy' onError={() => setFailed(true)} />
      ) : (
        <span data-fallback>{initials(name)}</span>
      )}
    </div>
  );
};

export default CompanyLogo;
