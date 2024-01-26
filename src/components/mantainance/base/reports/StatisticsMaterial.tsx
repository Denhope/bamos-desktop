import Title from "antd/es/typography/Title";
import MaterialRequestList from "@/components/mantainance/base/reports/MaterialList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import { getAllProjectMaterialsForStatistic } from "@/utils/api/thunks";

const StatisticsMaterial: FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, requaredMaterialItems } = useTypedSelector(
    (state) => state.statisticsItems
  );
  useEffect(() => {
    dispatch(getAllProjectMaterialsForStatistic("1004"));
  }, [dispatch]);
  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "95%",
      }}
    >
      <div
        className="flex flex-col mx-auto"
        style={{
          width: "99%",
        }}
      >
        {" "}
        <Title className="my-0 uppercase text-gray-500 py-0" level={5}>
          Material Reports
        </Title>
        <MaterialRequestList
          data={requaredMaterialItems}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default StatisticsMaterial;
