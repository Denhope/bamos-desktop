import React from 'react';
import { Text, StyleSheet, View } from '@react-pdf/renderer';

import { Style } from '@react-pdf/types';
import { PdfSmall } from '../pdf/typography.components';
import { PdfBorderView, PdfViewTable } from '../pdf/wrapped-view.component';
import { key } from 'localforage';

const styles = StyleSheet.create({
  table: {
    borderColor: '#000',
    borderWidth: 0.5,
    // marginHorizontal: 20,
    flexFlow: 1,
  },

  tableRow: {
    flexDirection: 'row',
  },
  headerBg: {
    // backgroundColor: '#aaa',
    borderStyle: 'solid',
    // borderColor: '#000',
    textAligh: 'center',
  },
  tableCellHeader: {
    fontSize: 8,
    borderWidth: 1,
    fontWeight: 'bold',
    textAligh: 'center',
  },
  tableCell: {
    margin: 2,
    fontSize: 8,
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

export const PdfTable = ({
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
      {/* {fields.map((item, index) => (
        <View key={index} style={[{ width: item.width + '%' }]}>
          <PdfSmall style={{ textAlign: 'center' }}>{item?.title}</PdfSmall>
        </View>
      ))} */}
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
          <PdfSmall fontSize={6} style={{ textAlign: 'center' }}>
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
            <PdfSmall fontSize={7} style={{ textAlign: 'center' }}>
              {_item[1] || ''}
            </PdfSmall>
          </PdfBorderView>
        ))}
      </View>
    ))}
    {/* </View> */}
  </View>
);

export const PdfTableView = ({
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
        // styles.textCenter,
        styles.tableCellHeader,
      ]}
      fixed={headerFixed}
    >
      {fields.map((item, index) => (
        <View key={index} style={[{ width: item.width + '%' }]}>
          <PdfSmall style={{ textAlign: 'center' }}>{item?.title}</PdfSmall>
        </View>
      ))}
    </View>
    {/* <View> */}
    {data?.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        {Object.entries(item).map((_item: any, _idx) => (
          <PdfViewTable
            key={_idx}
            style={{
              width: fields[_idx]?.width + '%',
              // borderStyle: 'solid',
              borderLeftWidth: 0,
              borderTopWidth: 0,
              paddingLeft: 2,
              // textAlign: 'center',
            }}
            mh={0}
            mv={0}
            p={0}
            // bw={0.5}
            // borderColor="#000"
          >
            <PdfSmall fontSize={6} style={{ textAlign: 'center' }}>
              {_item[1] || ''}
            </PdfSmall>
          </PdfViewTable>
        ))}
      </View>
    ))}
    {/* </View> */}
  </View>
);
