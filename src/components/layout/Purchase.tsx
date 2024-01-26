import PuchesListList from "@/components/purchasing/PuchesList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect } from "react";
import { getAllPurchaseItems } from "@/utils/api/thunks";

const Purchase: FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, purchaseItems } = useTypedSelector(
    (state) => state.purchaseItems
  );
  useEffect(() => {
    dispatch(getAllPurchaseItems());
  }, [dispatch]);
  return (
    <div>
      <PuchesListList data={purchaseItems} />
    </div>
  );
};

export default Purchase;
