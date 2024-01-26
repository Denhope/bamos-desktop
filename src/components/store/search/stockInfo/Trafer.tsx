import { ProColumns } from "@ant-design/pro-components";
import ContextMenuWrapper from "@/components/shared/ContextMenuWrapperProps";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const TransferDetailes: FC = () => {
  const { t } = useTranslation();
  const { isLoading, filteredCurrentStockItems, filteredTransferItems } =
    useTypedSelector((state) => state.storesLogistic);
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    setData(filteredTransferItems);

    // navigate(storedKey);
  }, [filteredTransferItems]);
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

    // {
    //   title: `${t('DESCRIPTION')}`,
    //   dataIndex: 'NAME_OF_MATERIAL',
    //   key: 'NAME_OF_MATERIAL',

    //   // responsive: ['sm'],
    //   tip: 'ITEM DESCRIPTION',
    //   ellipsis: true, //
    //   width: '20%',
    // },
    {
      title: `${t("BATCH/SERIAL")}`,
      dataIndex: "SERIAL_NUMBER",
      key: "SERIAL_NUMBER",
      render: (text: any, record: any) =>
        record.SERIAL_NUMBER || record.SUPPLIER_BATCH_NUMBER,
      ellipsis: true,
      width: "9%",
      formItemProps: {
        name: "Batch_Unit Notes",
      },

      // responsive: ['sm'],
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
      width: "9%",
      formItemProps: {
        name: "PRODUCT_EXPIRATION_DATE",
      },
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
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
      render: (text, record) => (
        <div
          style={{
            backgroundColor:
              record?.SHELF_NUMBER !== "TRANSFER" ? "#32CD32" : "#FFDB58",
          }}
        >
          {text}
        </div>
      ),

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t("UNIT")}`,
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
      width: "4%",
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: "TRENSFER ORDER",
      dataIndex: "transferOrder",
      key: "transferOrder",
      width: "10%",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: "OWNER",
      dataIndex: "Owner Short Name",
      key: "Owner Short Name",
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
      width: "4%",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
  ];
  return (
    <div className="py-5 flex flex-col w-[99%]">
      <EditableTable
        data={data}
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          throw new Error("Function not implemented.");
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error("Function not implemented.");
        }}
        yScroll={40}
        externalReload={function () {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
};

export default TransferDetailes;
