import {
  PdfRegular,
  PdfRegularSmall,
  PdfSmall,
} from "@/components/pdf/typography.components";
import {
  PdfView,
  PDFGrid,
  PdfViewTable,
} from "@/components/pdf/wrapped-view.component";
import { IProjectTaskAll } from "@/models/IProjectTask";
import moment from "moment";
import React, { FC } from "react";
import { IPanelDTO, IPanelDTO1 } from "@/types/TypesData";
import { PDFViewer, Text, View } from "@react-pdf/renderer";
import { PdfTable, PdfTableView } from "@/components/pdf/table.components";

export interface IWOAccessProps {
  data?: IProjectTaskAll;

  fieldAccess: any;
  fieldZones: any;
  fieldNotIncludeAccess: any;
}

const WoAsscces: FC<IWOAccessProps> = ({
  data,
  fieldZones,
  fieldAccess,
  fieldNotIncludeAccess,
}) => {
  return (
    <>
      <PdfView
        display="flex"
        style={{ alignItems: "center", gap: "0" }}
        flexDirection="column"
      >
        <PDFGrid
          height={13}
          cols={1}
          bg="#aaa"
          borderColor="#00"
          bw={0.5}
          flexDirection="row"
        >
          {" "}
          <PdfSmall> Access / Доступ </PdfSmall>
        </PDFGrid>
      </PdfView>

      {data?.accessArr && data?.accessArr.length ? (
        <>
          {/* <PdfTable
            // headerFixed
            fields={fieldAccess}
            data={data?.currentPanels || []}
          ></PdfTable> */}
          <PdfView display="flex" flexDirection="row">
            <PDFGrid cols={1} pl={3} borderColor="#00" bw={0.5}>
              {" "}
              <PdfRegularSmall fontSize={10}>
                Panels/Панели: {data?.access}
              </PdfRegularSmall>
            </PDFGrid>
          </PdfView>
        </>
      ) : (
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={16} cols={1} borderColor="#00" bw={0.5}>
            {" "}
            <PdfRegularSmall>
              No panels defined!/ Нет панелей необходимых к вскрытию{" "}
            </PdfRegularSmall>
          </PDFGrid>
        </PdfView>
      )}
      {data?.zonesArr && data?.zonesArr.length ? (
        // <PdfTable
        //   headerFixed
        //   fields={fieldZones}
        //   data={data?.currentZones || []}
        // ></PdfTable>
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={16} cols={1} pl={3} borderColor="#00" bw={0.5}>
            {" "}
            <PdfRegularSmall fontSize={10}>
              Zones/Зоны: {data?.area}
            </PdfRegularSmall>
          </PDFGrid>
        </PdfView>
      ) : (
        <PdfView display="flex" flexDirection="row">
          <PDFGrid height={16} cols={1} borderColor="#00" bw={0.5}>
            {" "}
            <PdfRegularSmall> Zones/Зоны: No Information</PdfRegularSmall>
          </PDFGrid>
        </PdfView>
      )}
    </>
  );
};

export default WoAsscces;
