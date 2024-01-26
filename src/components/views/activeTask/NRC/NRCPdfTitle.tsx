import { Descriptions } from "antd";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

const NRCPdfTitle: FC = () => {
  return (
    <div className="flex p-3 flex-col gap-1 justify-items-center mx-auto border-8 border-indigo-600 bg-slate-50 ">
      <Descriptions
        size="small"
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 2 }}
      ></Descriptions>
    </div>
  );
};

export default NRCPdfTitle;
