import TabContent from "@/components/shared/Table/TabContent";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import StockGrid from "./StockGrid";

import StockDetails from "./StockDetails";
import StockUnServise from "./StockUnServise";
import TransferDetailes from "./Trafer";
export interface IGroupTaskListPrors {
  stocks: any;
  totalQuantity?: number;
  partNumber?: any;
}
const StockTab: FC<IGroupTaskListPrors> = ({
  partNumber,
  stocks,
  totalQuantity,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex my-0 h-[78vh] relative overflow-hidden">
      <TabContent
        tabs={[
          {
            content: (
              <div className="flex relative overflow-hidden">
                <StockGrid
                  totalQuantity={totalQuantity}
                  stocks={stocks}
                  partNumber={partNumber}
                ></StockGrid>
              </div>
            ),
            title: `${t("STOCK INFO")}`,
          },
          {
            content: <StockDetails></StockDetails>,
            title: `${t("STOCK DETAIL")}`,
          },

          // {
          //   content: <TransferDetailes></TransferDetailes>,
          //   title: `${t('TRANSFER')}`,
          // },
          {
            content: <StockUnServise></StockUnServise>,
            title: `${t("U/S")}`,
          },
        ]}
      />
    </div>
  );
};

export default StockTab;
