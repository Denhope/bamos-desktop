import React, { useState } from "react";

import {
  Text,
  Page,
  Image,
  Document,
  StyleSheet,
  Font,
  View,
} from "@react-pdf/renderer";

import {
  PdfSmall,
  PdfRegular,
  PdfRegularSmall,
  PdfNumber,
} from "../typography.components";
import { PdfView, PDFGrid, PdfHeader } from "../wrapped-view.component";
import { IPickSlipResponse } from "@/models/IPickSlip";
import moment from "moment";
import { PdfTablePickSlip } from "../table.componentsPickSlip";
import { useTranslation } from "react-i18next";
import FooterPdfView from "./footer.component";
import { PdfImage } from "../images.components";

// import { QRCode } from 'antd';
import QRCode from "qrcode.react";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingBottom: "40pt",
    paddingTop: "20pt",
    fontFamily: "Roboto",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  wrapp: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "140",
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});

interface PdfPatientReportProps {
  data: any;
  bookedQty?: number;
  type?: any;
}

export const PdfParientLabelsCompleted = ({
  data,
  type,
  bookedQty,
}: PdfPatientReportProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Document>
        <Page size="A7">
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid p={1} height={10} cols={2}>
              <PdfRegularSmall textAlign="left"></PdfRegularSmall>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={40} p={1} cols={2}>
              {data?.QRCodeLink && (
                <PdfImage
                  src={data?.QRCodeLink}
                  style={{
                    width: 30,
                    height: 30,
                  }}
                ></PdfImage>
              )}
              <PdfRegularSmall> L:{data?.LOCAL_ID}</PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={40} p={1} cols={1}>
              <PdfRegular textAlign="right" fontWeight="black" fontSize={9}>
                {t("407 TECHNICS")}
              </PdfRegular>
              {/* <PdfRegular textAlign="right" fontSize={8}>
                {t('CONDITION')}:
              </PdfRegular> */}
              <PdfRegular textAlign="right" fontSize={12}>
                {/* {data?.RESTRICTION || data.CONDITION} */}
                {/* {data?.locationType &&
                  data?.locationType === 'scrap' &&
                  'SCRAPPED TAG'} */}
                {data?.locationType === "standart" && "SERVICEABLE TAG"}
                {data?.locationType === "scrap" && "SCRAPPED TAG"}
                {(data?.locationType === "quarantine" ||
                  type === "unserviceable") &&
                  "UNSERVICEABLE TAG"}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid p={1} height={20} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("PART No")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={1}>
              <PdfRegular textAlign="right" fontSize={11}>
                {data?.PART_NUMBER}
              </PdfRegular>
            </PDFGrid>
          </PdfView>

          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid p={1} height={20} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("BATCH No")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid p={1} height={20} cols={2}>
              <PdfRegular textAlign="right" fontSize={11}>
                {data?.SUPPLIER_BATCH_NUMBER}
              </PdfRegular>
            </PDFGrid>
          </PdfView>

          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">{t("MC/QTY")}:</PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data?.GROUP} / {bookedQty || data?.QUANTITY}
                {"\r"}
                {data.UNIT_OF_MEASURE}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid p={1} height={20} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("CONDITION")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={1}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data?.CONDITION}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("EXP.DATE")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {(data.PRODUCT_EXPIRATION_DATE &&
                  moment(data.PRODUCT_EXPIRATION_DATE).format(
                    "Do. MMM. YYYY"
                  )) ||
                  "N/A"}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("DESCRIPTION")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data?.NAME_OF_MATERIAL}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("CERT No")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data?.APPROVED_CERT || "N/A"}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">
                {t("ORDER No")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data?.ORDER_NUMBER || "N/A"}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="row" alignItems="center">
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegularSmall textAlign="left">
                {" "}
                {t("REC.DATE")}:
              </PdfRegularSmall>
            </PDFGrid>
            <PDFGrid height={20} p={1} cols={2}>
              <PdfRegular textAlign="right" fontSize={8}>
                {data.RECEIVED_DATE &&
                  moment(data.RECEIVED_DATE).format("Do. MMM. YYYY")}
              </PdfRegular>
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="column">
            <PDFGrid height={30} p={1} cols={1} borderColor="#00" bw={0.5}>
              {data?.locationType === "standart" && (
                <>
                  <PdfRegularSmall>
                    {t("MATERIAL INCOMING INSPECTION")}
                  </PdfRegularSmall>
                  <PdfRegular textAlign="left" fontSize={11}>
                    {localStorage.getItem("singNumber")}
                  </PdfRegular>
                </>
              )}
              {data?.locationType === "scrap" && (
                <>
                  <PdfRegularSmall>
                    {t("THIS ITEM IS DESTROYD BEYOND USAGE")}
                  </PdfRegularSmall>
                  <PdfRegular textAlign="left" fontSize={8}>
                    Date:{moment.utc().format("DD. MM. YYYY")}
                    {"\r"} {"\r"} {"\r"} {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"} {"\r"} {"\r"} {"\r"} {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    {"\r"}
                    Sing:{localStorage.getItem("singNumber")}
                  </PdfRegular>
                </>
              )}
            </PDFGrid>
          </PdfView>
          <PdfView display="flex" flexDirection="column">
            <PDFGrid height={30} p={1} cols={1}>
              <PdfRegular textAlign="right" fontSize={12}>
                {data?.STOCK || "N/A"}/ {data?.SHELF_NUMBER || "N/A"}
              </PdfRegular>
            </PDFGrid>
          </PdfView>

          <FooterPdfView />
        </Page>
      </Document>
    </>
  );
};
