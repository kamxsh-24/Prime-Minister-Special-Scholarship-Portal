import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getMediaUrl } from '../../services/apiBase';

const UserAvatar = ({
  src,
  name = '',
  className = 'h-10 w-10 rounded-full',
  textClassName = 'text-xs font-bold',
  alt = 'User avatar',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const mediaUrl = getMediaUrl(src);

  const initials =
    name
      ?.trim()
      ?.split(/\s+/)
      ?.map((part) => part[0])
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) ||
    name?.charAt(0)?.toUpperCase() ||
    '';

  if (mediaUrl && !imgError) {
    return (
      <img
        src={mediaUrl}
        alt={alt}
        className={`${className} object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} bg-primary-100 text-primary flex items-center justify-center flex-shrink-0 font-semibold select-none overflow-hidden`}
    >
      {initials ? (
        <span className={textClassName}>{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-primary" />
      )}
    </div>
  );
};

export default UserAvatar;
