import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchPartForm from "../partAdministration/SearchPartForm";
import TabContent from "@/components/shared/Table/TabContent";
import PartView from "../partAdministration/tabs/PartView";
import RemarksView from "../partAdministration/tabs/RemarksView";
import MainView from "../partAdministration/tabs/mainView/MainView";
interface PartAdministrationType {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}
const PartAdministration: FC<PartAdministrationType> = ({}) => {
  const [part, setPart] = useState<any | null>(null);
  const { t } = useTranslation();
  const tabs = [
    {
      content: (
        <PartView
          part={part}
          onEditPartDetailsEdit={function (data: any): void {
            setPart(data);
          }}
        ></PartView>
      ),
      title: `${t("PART")}`,
    },
    {
      content: (
        <MainView
          part={part}
          onEditPartDetailsEdit={function (data: any): void {}}
        ></MainView>
      ),
      title: `${t("MAIN")}`,
    },
    {
      content: (
        <RemarksView
          part={part}
          onEditPartDetailsEdit={function (data: any): void {
            setPart(data);
          }}
        ></RemarksView>
      ),
      title: `${t("REMARKS")}`,
    },
    {
      content: <></>,
      title: `${t("PRICE HISTORY")}`,
    },
  ];

  return (
    <div className="h-[79vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <SearchPartForm
          currentPart={part}
          onPartSearch={function (part): void {
            setPart(part);
          }}
        ></SearchPartForm>
        <TabContent tabs={tabs}></TabContent>
      </div>
    </div>
  );
};

export default PartAdministration;
