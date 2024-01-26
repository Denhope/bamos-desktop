import Title from "antd/es/typography/Title";
import PickSlipList from "@/components/store/pickSlip/PickSlipsList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import {
  getAllMaterialAplication,
  getAllPickSlips,
  getCountAllprojectsAplications,
} from "@/utils/api/thunks";

const PickSlip = () => {
  const dispatch = useAppDispatch();
  const { isLoading, pickSlips } = useTypedSelector((state) => state.pickSlips);
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
        PickSlips
      </Title>
      <PickSlipList data={pickSlips} />
    </div>
  );
};

export default PickSlip;
