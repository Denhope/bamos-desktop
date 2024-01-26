import { View } from "@react-pdf/renderer";
import React, { FC } from "react";

import { StyleSheet } from "@react-pdf/renderer";
import { PdfSmall } from "@/components/pdf/typography.components";
import { PdfFooterView } from "@/components/pdf/wrapped-view.component";
import moment from "moment";
const styles = StyleSheet.create({
  wrapp: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "131",
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});

const FooterPdfView: FC = () => {
  return (
    <PdfFooterView fixed mh={30} alignItems="flex-start">
      <PdfSmall textAlign="left">Form 001 rev. 01</PdfSmall>
      <View style={styles.wrapp}>
        {" "}
        <View>
          <PdfSmall textAlign="left">
            Printed by {localStorage.getItem("singNumber")} on{" "}
            {moment.utc().format("Do. MMM. YYYY")} at{" "}
            {moment.utc().format("HH:mm")} out of database Prod hosted on
            Avia.407-Prod-Server.local
          </PdfSmall>
        </View>
        <View>
          <PdfSmall textAlign="left">
            produced by kovalchukd@avia407.by
          </PdfSmall>
        </View>
      </View>
    </PdfFooterView>
  );
};

export default FooterPdfView;
