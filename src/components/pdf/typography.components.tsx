import React from 'react';
import { Style } from '@react-pdf/types';
import { Text } from '@react-pdf/renderer';

interface PdfTextProps {
  fontWeight?: 'bold' | 'medium' | 'normal' | 'black';
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  style?: Style | Style[];
  bottom?: number;
  fixed?: boolean;
  children?: React.ReactNode;
}

export const PdfHeading = ({
  fontWeight = 'bold',
  fontSize = 17,
  textAlign,
  fontFamily = 'Roboto',
  children,
}: PdfTextProps) => {
  return (
    <Text
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
        textAlign: textAlign,
      }}
    >
      {children}
    </Text>
  );
};

export const PdfMedium = ({
  fontWeight = 'medium',
  fontSize = 16,
  fontFamily = 'Roboto',
  children,
  textAlign = 'left',
}: PdfTextProps) => {
  return (
    <Text
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
        textAlign: textAlign,
      }}
    >
      {children}
    </Text>
  );
};
export const PdfRegular = ({
  fontWeight = 'normal',
  fontSize = 15,
  fontFamily = 'Roboto',
  textAlign,
  children,
}: PdfTextProps) => {
  return (
    <Text
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
        textAlign: textAlign,
      }}
    >
      {children}
    </Text>
  );
};
export const PdfRegularSmall = ({
  fontWeight = 'normal',
  fontSize = 8,
  fontFamily = 'Roboto',
  children,
}: PdfTextProps) => {
  return (
    <Text
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
      }}
    >
      {children}
    </Text>
  );
};

export const PdfSmall = ({
  fontWeight = 'normal',
  fontSize = 7,
  fontFamily = 'Roboto',
  textAlign,
  children,
  style,
}: PdfTextProps) => {
  return (
    <Text
      style={{
        ...style,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
        textAlign: textAlign,
      }}
    >
      {children}
    </Text>
  );
};
export const PdfNumber = ({ style, bottom = 30 }: PdfTextProps) => {
  return (
    <Text
      style={{
        ...style,
        fontSize: 6,
        right: 20,
        // color: 'grey',
        bottom: bottom,
        position: 'absolute',
      }}
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages} / Стр ${pageNumber} из ${totalPages}`
      }
      fixed
    ></Text>
  );
};
