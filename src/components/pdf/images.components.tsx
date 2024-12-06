import React from 'react';
import { Image } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';

interface PdfImageProps {
  src?: string;
  style?: Style | Style[];
  fixed?: boolean;
}

export const PdfImage = ({ src, style }: PdfImageProps) => {
  return <Image style={{ ...style }} src={src} />;
};
