import { ProColumns } from "@ant-design/pro-components";

import { Select, TimePicker } from "antd";
import ContextMenuWrapper from "@/components/shared/ContextMenuWrapperProps";
import FilesSelector from "@/components/shared/FilesSelector";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IStore, IStoreLocation } from "@/models/IStore";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { handleFileSelect } from "@/services/utilites";
import { getFilteredMaterialItems } from "@/utils/api/thunks";
type showPartType = {
  store?: IStore;
  selectedLocations: IStoreLocation[] | [];
  scroll: number;
  onSelectedParts?: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedPN?: any;
  selectedLabel?: any;
  storeName?: any;
  partGroup?: any;
  isOnlyScrapped?: any;
  serialNumber?: any;
};
const ShowParts: FC<showPartType> = ({
  onSelectedParts,
  onSelectedIds,
  selectedLocations,
  store,
  scroll,
  selectedPN,
  selectedLabel,
  storeName,
  partGroup,
  isOnlyScrapped = false,
  serialNumber,
}) => {
  const dispatch = useAppDispatch();
  const { Option } = Select;
  const companyID = localStorage.getItem("companyID") || "";
  useEffect(() => {
    if (isOnlyScrapped) {
      const fetchData = async () => {
        const result = await dispatch(
          getFilteredMaterialItems({
            isAllDate: true,
            companyID: companyID,
            location: ["SCRAP"],
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          setData(result.payload);
        }
      };

      fetchData();
    }
    // Проверяем, существует ли store
    else if (
      store ||
      selectedPN ||
      selectedLabel ||
      storeName ||
      partGroup ||
      serialNumber
    ) {
      const fetchData = async () => {
        const result = await dispatch(
          getFilteredMaterialItems({
            isAllDate: true,
            companyID: companyID,
            location: selectedLocations,
            STOCK: storeName,
            // store?.shopShortName,
            PART_NUMBER: selectedPN,
            GROUP: partGroup,
            localID: "" || selectedLabel,
            isAlternative: true,
            SERIAL_NUMBER: serialNumber,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          setData(result.payload);
        }
      };

      fetchData();
    }
  }, [selectedLocations, store]);
  const [data, setData] = useState<any>([]);
  const { t } = useTranslation();
  const handleCopy = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    navigator.clipboard.writeText(value);
  };
  const handleAdd = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log("Добавить:", value);
  };

  const handleAddPick = (target: EventTarget | null) => {
    const value = (target as HTMLDivElement).innerText;
    console.log("Добавить Pick:", value);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("LOCAL_ID")}`,
      dataIndex: "LOCAL_ID",
      key: "LOCAL_ID",
      // tip: 'LOCAL_ID',
      ellipsis: true,
      width: "7%",
      formItemProps: {
        name: "LOCAL_ID",
      },
      sorter: (a: any, b: any) => a.LOCAL_ID - b.LOCAL_ID, //

      // responsive: ['sm'],
    },

    {
      title: `${t("PN")}`,
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      //tip: 'ITEM PART_NUMBER',
      // ellipsis: true,
      width: "12%",
      formItemProps: {
        name: "PART_NUMBER",
      },
      render: (text: any, record: any) => {
        return (
          <ContextMenuWrapper
            items={[
              {
                label: "Copy",
                action: handleCopy,
              },
              {
                label: "Open with",
                action: () => {},
                submenu: [
                  { label: "Part Tracking", action: handleAdd },
                  { label: "PickSlip Request", action: handleAddPick },
                ],
              },
            ]}
          >
            <a
              onClick={() => {
                // dispatch(setCurrentProjectTask(record));
                // setOpenRequirementDrawer(true);
                // onReqClick(record);
              }}
            >
              {record.PART_NUMBER}
            </a>
          </ContextMenuWrapper>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "NAME_OF_MATERIAL",
      key: "NAME_OF_MATERIAL",
      // tip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: "NAME_OF_MATERIAL",
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("STORE")}`,
      dataIndex: "STOCK",
      key: "STOCK",
      // tip: 'ITEM STORE',
      ellipsis: true,
      width: "4%",
      formItemProps: {
        name: "STOCK",
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.STOCK}
          </div>
        );
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("CONDITION")}`,
      dataIndex: "CONDITION",
      key: "CONDITION",
      //tip: 'CONDITION',
      ellipsis: true,
      width: "10%",
      formItemProps: {
        name: "CONDITION",
      },
      render: (text: any, record: any) => {
        return (
          <div
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.CONDITION}
          </div>
        );
      },

      // responsive: ['sm'],
    },

    {
      title: `${t("LOCATION")}`,
      dataIndex: "SHELF_NUMBER",
      key: "SHELF_NUMBER",
      //tip: 'ITEM LOCATION',
      ellipsis: true,
      width: "7%",
      formItemProps: {
        name: "SHELF_NUMBER",
      },

      // responsive: ['sm'],
    },

    {
      title: `${t("BATCH/SERIAL")}`,
      dataIndex: "SERIAL_NUMBER",
      key: "SERIAL_NUMBER",
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t("RESEIVING")}`,
      dataIndex: "ORDER_NUMBER",
      key: "ORDER_NUMBER",
      //tip: 'ITEM ORDER_NUMBER',
      ellipsis: true,
      width: "7%",
      formItemProps: {
        name: "ORDER_NUMBER",
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("EXPIRY DATE")}`,
      dataIndex: "PRODUCT_EXPIRATION_DATE",
      key: "PRODUCT_EXPIRATION_DATE",
      //tip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      valueType: "date",
      width: "9%",
      formItemProps: {
        name: "PRODUCT_EXPIRATION_DATE",
      },
      sorter: (a, b) => {
        if (a.PRODUCT_EXPIRATION_DATE && b.PRODUCT_EXPIRATION_DATE) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("QTY")}`,
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      width: "5%",
      responsive: ["sm"],
      search: false,
      render: (text, record) => {
        let backgroundColor;
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) >= new Date()
        ) {
          backgroundColor = "#32CD32"; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        } // Зеленый фон по умолчанию
        if (record?.SHELF_NUMBER === "TRANSFER") {
          backgroundColor = "#FFDB58"; // Желтый фон для SHELF_NUMBER 'TRANSFER'
        }
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) < new Date()
        ) {
          backgroundColor = "#FF0000"; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        }
        return <div style={{ backgroundColor }}>{text}</div>;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
      width: "5%",
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t("OWNER")}`,
      dataIndex: "OWNER_SHORT_NAME",
      key: "OWNER_SHORT_NAME",
      width: "6%",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t("DOC")}`,
      dataIndex: "DOC",
      key: "DOC",
      width: "7%",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record.FILES && record.FILES.length > 0 ? (
          <FilesSelector
            files={record.FILES || []}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedIds && onSelectedIds(newSelectedRowKeys);
  };
  return (
    <div>
      <EditableTable
        data={data}
        showSearchInput
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onMultiSelect={(record: any, rowIndex?: any) => {
          const materials = record.map((item: any) => item);
          // console.log(locationNames);
          setSelectedMaterials(materials);
          onSelectedParts && onSelectedParts(materials);
        }}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        // onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onRowClick={function (record: any, rowIndex?: any): void {
          setSelectedMaterials((prevSelectedItems: (string | undefined)[]) =>
            prevSelectedItems && prevSelectedItems.includes(record._id)
              ? []
              : [record]
          );
          onSelectedParts &&
            onSelectedParts((prevSelectedItems: (string | undefined)[]) =>
              prevSelectedItems && prevSelectedItems.includes(record._id)
                ? []
                : [record]
            );
        }}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onSave={function (rowKey: any, data: any, row: any): void {}}
        yScroll={scroll}
        externalReload={function () {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
    </div>
  );
};

export default ShowParts;
