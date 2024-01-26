import React, { FC } from 'react';
import { Style } from '@react-pdf/types';
import { View } from '@react-pdf/renderer';

interface PDFViewProps {
  mh?: number;
  ml?: number;
  mt?: number;
  mv?: number;
  p?: number;
  pl?: number;
  pb?: number;
  borderColor?: string;
  bg?: string;
  bw?: number;
  display?: 'flex';
  alignItems?: 'flex-end' | 'flex-start' | 'center';
  flexDirection?: 'row' | 'column';
  fixed?: boolean;
  style?: Style | Style[];
  children: React.ReactNode;
  data?: Array<any>;
}

export const PdfView = ({
  mh = 20,
  ml,
  p = 0,
  flexDirection = 'column',
  style,
  fixed = false,
  children,
  data,
}: PDFViewProps) => {
  return (
    <View
      style={{
        ...style,
        marginHorizontal: mh,
        marginLeft: ml,
        padding: p,
        flexDirection: flexDirection,
      }}
      fixed={fixed}
    >
      {children}
    </View>
  );
};
export const PdfViewTable = ({
  mh = 0,
  ml,
  p = 0,
  flexDirection = 'column',
  style,
  fixed = false,
  children,
  data,
}: PDFViewProps) => {
  return (
    <View
      style={{
        ...style,
        marginHorizontal: mh,
        marginLeft: ml,
        padding: p,
        flexDirection: flexDirection,
      }}
      fixed={fixed}
    >
      {children}
    </View>
  );
};

export const PdfBorderView = ({
  mh = 20,
  p = 2,
  mv = 50,
  pl,
  borderColor = 'grey',
  bw = 1,
  style,
  fixed = false,
  flexDirection = 'row',
  children,
}: PDFViewProps) => {
  return (
    <View
      style={{
        ...style,
        marginHorizontal: mh,
        padding: p,
        borderColor: borderColor,
        borderWidth: bw,
        paddingLeft: pl,
      }}
      fixed={fixed}
    >
      {children}
    </View>
  );
};

export const PdfHeader = ({
  // p = 10,
  borderColor = 'grey',
  bw = 2,
  alignItems = 'flex-start',
  style,
  bg = 'grey',
  fixed = false,
  children,
}: PDFViewProps) => {
  return (
    <View
      style={{
        ...style,
        // backgroundColor: bg,
        // padding: p,
        // borderColor: borderColor,
        // borderWidth: bw,
        // alignItems: alignItems,
      }}
      fixed={fixed}
    >
      {children}
    </View>
  );
};
export const PdfSubHeader = ({
  p = 4,
  borderColor = 'grey',
  bw = 2,
  alignItems = 'flex-start',
  style,
  bg = 'grey',
  fixed = false,
  children,
}: PDFViewProps) => {
  return (
    <View
      style={{
        ...style,
        backgroundColor: bg,
        padding: p,
        borderColor: borderColor,
        borderWidth: bw,
        alignItems: alignItems,
      }}
      fixed={fixed}
    >
      {children}
    </View>
  );
};
export const PdfFooterView = ({
  p = 20,
  borderColor = 'grey',
  bw,
  alignItems = 'center',
  style,
  bg,
  fixed = false,
  children,
  pb = 5,
}: PDFViewProps) => {
  return (
    <View
      style={[
        { position: 'absolute', bottom: 0, left: 0, right: 0 },
        {
          backgroundColor: bg,
          padding: p,
          paddingBottom: pb,
          borderColor: borderColor,
          borderWidth: bw,
          alignItems: alignItems,
          paddingLeft: 20,
        },
      ]}
      fixed={fixed}
    >
      {children}
    </View>
  );
};

interface GridProps {
  cols?: number;
  borderColor?: string;
  bg?: string;
  bw?: number;
  p?: number;
  pl?: number;
  ph?: number;
  alignItems?: 'flex-end' | 'flex-start' | 'center';
  flexDirection?: 'row' | 'column';
  height?: number;
  children: React.ReactNode;
  ml?: string;
  mr?: string;
  blw?: number;
  blr?: number;
  blt?: number;
  blb?: number;
  mt?: number;
}

export const PDFGrid: FC<GridProps> = ({
  cols = 1,
  bg,
  children,
  borderColor,
  bw,
  alignItems,
  flexDirection,
  ml,
  mr,
  mt,
  height,
  p,
  pl,
  ph,
  blw,
  blr,
  blt,
  blb,
}) => (
  <View
    style={{
      width: `${100 / cols}+%`,
      borderWidth: bw,
      borderColor: borderColor,
      backgroundColor: bg,
      flexDirection: flexDirection,
      padding: p,
      height: height,
      alignItems: alignItems,
      marginLeft: ml,
      marginRight: mr,
      marginTop: mt,
      paddingLeft: pl,
      paddingHorizontal: ph,
      borderLeftWidth: blw,
      borderRightWidth: blr,
      borderBottomWidth: blb,
      borderTopWidth: blt,
    }}
  >
    {children}
  </View>
);
