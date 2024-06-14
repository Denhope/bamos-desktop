import TabContent from "@/components/shared/Table/TabContent";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import Alternates from "./Alternates";
type MainViewType = {
  part: any;
  onEditPartDetailsEdit: (data: any) => void;
};

const MainView: FC<MainViewType> = ({ onEditPartDetailsEdit, part }) => {
  const { t } = useTranslation();

  const tabs = [
    {
      content: <Alternates currentPart={part}></Alternates>,
      title: `${t("ALTERNATES")}`,
    },
    // {
    //   content: <></>,
    //   title: `${t('REQUIREMENTS')}`,
    // },
    // {
    //   content: <></>,
    //   title: `${t('RESOURCES')}`,
    // },
    // {
    //   content: <></>,
    //   title: `${t('LOCATION')}`,
    // },
  ];
  return (
    <div>
      <TabContent tabs={tabs}></TabContent>
    </div>
  );
};

export default MainView;
