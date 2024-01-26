import { View } from '@react-pdf/renderer';
import React, { FC } from 'react';
import { PdfSmall } from '../typography.components';
import { PdfFooterView } from '../wrapped-view.component';
import { StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';
const styles = StyleSheet.create({
  wrapp: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '131',
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});

const FooterPdfView: FC = () => {
  return (
    <PdfFooterView fixed alignItems="flex-start">
      {/* <PdfSmall textAlign="left">Form 001 rev. 01</PdfSmall> */}
      <View style={styles.wrapp}>
        <View>
          <PdfSmall textAlign="left">
            Printed by {localStorage.getItem('singNumber')} on{' '}
            {moment.utc().format('Do. MMM. YYYY')} at{' '}
            {moment.utc().format('HH:mm')}
          </PdfSmall>
        </View>
      </View>
    </PdfFooterView>
  );
};

export default FooterPdfView;
