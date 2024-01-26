import React from 'react';
import { Text, StyleSheet, View } from '@react-pdf/renderer';

import { Style } from '@react-pdf/types';
import { PdfBorderView, PdfView, PdfViewTable } from './wrapped-view.component';
import { PdfRegular, PdfRegularSmall, PdfSmall } from './typography.components';
const styles = StyleSheet.create({
  table: {
    borderColor: '#000',
    borderWidth: 0.5,
    marginHorizontal: 20,
    flexFlow: 1,
  },

  tableRow: {
    flexDirection: 'row',
  },
  headerBg: {
    backgroundColor: '#fff',
    borderStyle: 'solid',
    // borderColor: '#000',
    textAligh: 'center',
    // borderWidth: 0.5,
  },
  tableCellHeader: {
    // margin: 2,
    borderWidth: 0.5,
    fontWeight: 'bold',
    textAligh: 'center',
  },
  tableCell: {
    margin: 2,
    fontSize: 10,
    paddingLeft: 2,
  },
  textCenter: {
    textAlign: 'center',
  },
  tableAccess: {
    // borderColor: '#000',
    // borderWidth: 0.5,
    // marginHorizontal: 20,
    flexFlow: 1,
  },
});

interface PdfTableProps {
  style?: Style;
  headerFixed?: boolean;
  fields: Array<any>;
  data: Array<any>;
}

export const PdfTablePickSlip = ({
  headerFixed = false,
  fields,
  data,
  style,
}: PdfTableProps) => (
  <View style={[styles.table, { ...style }]}>
    <View
      style={[
        styles.tableRow,
        styles.headerBg,
        styles.textCenter,
        styles.tableCellHeader,
      ]}
      fixed={headerFixed}
    >
      {fields.map((item, index) => (
        <PdfBorderView
          key={index}
          mh={0}
          mv={0}
          p={0}
          pl={3}
          bw={0.5}
          borderColor="#000"
          style={{ width: item.width + '%' }}
        >
          <PdfSmall fontSize={8} style={{ textAlign: 'center' }}>
            {item?.title}
          </PdfSmall>
        </PdfBorderView>
      ))}
    </View>
    {/* <View> */}
    {data?.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        {Object.entries(item).map((_item: any, _idx) => (
          <PdfBorderView
            key={_idx}
            style={{
              width: fields[_idx]?.width + '%',
              borderStyle: 'solid',
              borderLeftWidth: 0,
              borderTopWidth: 0,
              // textAlign: 'center',
            }}
            mh={0}
            mv={0}
            p={0}
            pl={3}
            bw={0.5}
            borderColor="#000"
          >
            <PdfSmall fontSize={8} style={{ textAlign: 'center' }}>
              {_item[1] || ''}
            </PdfSmall>
          </PdfBorderView>
        ))}
      </View>
    ))}
  </View>
);
