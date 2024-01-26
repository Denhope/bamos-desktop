import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";

const AirCraftList: FC = () => {
  const dispatch = useAppDispatch();
  const [searchedText, setSerchedText] = useState("");
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  return <div></div>;
};

export default AirCraftList;
