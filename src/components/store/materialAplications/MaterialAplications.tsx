import Title from "antd/es/typography/Title";
import AplicationList from "@/components/store/materialAplications/MaterialAplicationList";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import {
  getAllMaterialAplication,
  getAllPickSlips,
  getCountAllprojectsAplications,
} from "@/utils/api/thunks";

const MaterialAplications: FC = () => {
  const dispatch = useAppDispatch();
  const { materialsAplications } = useTypedSelector(
    (state) => state.materialAplication
  );
  useEffect(() => {
    dispatch(getAllMaterialAplication());
    dispatch(getCountAllprojectsAplications());
    dispatch(getAllPickSlips());
  }, [dispatch]);

  return (
    <div
      className="flex my-0 mx-auto flex-col h-[86vh]"
      style={{
        width: "95%",
      }}
    >
      <Title className="my-0" level={4}>
        Material Aplications
      </Title>

      <AplicationList data={materialsAplications} />
    </div>
  );
};

export default MaterialAplications;
