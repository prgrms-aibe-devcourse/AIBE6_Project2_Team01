'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileFallbackImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
}

export function ProfileFallbackImage({
  src,
  alt,
  fallbackSrc = '/images/default-avatar.png',
  className,
  sizes
}: ProfileFallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
