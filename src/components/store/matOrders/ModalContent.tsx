import { Col, MenuProps, Row, Space, TimePicker, message } from "antd";
import { useTranslation } from "react-i18next";
import Title from "antd/es/typography/Title";
import EditableSearchTable from "@/components/shared/Table/EditableSearchTable";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC, useEffect, useState } from "react";

import { DeleteOutlined } from "@ant-design/icons";
import {
  ProColumns,
  ProForm,
  ProFormDigit,
  ProFormText,
} from "@ant-design/pro-components";
import {
  MaterialOrder,
  setUpdatedMaterialOrder,
} from "@/store/reducers/StoreLogisticSlice";
import {
  getFilteredMaterialItems,
  getFilteredMaterialOrders,
  updateRequirementByID,
  updatedMaterialItemsById,
  updatedMaterialOrdersById,
} from "@/utils/api/thunks";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import MenuItem from "antd/es/menu/MenuItem";
import { v4 as uuidv4 } from "uuid";
export interface ModalSearchContentProps {
  item: any;
  scroll: number;
  onRowClick: (record: any) => void;
  order: MaterialOrder;
  onSetData: (result: any) => void;
  disabled?: boolean;
}
const ModalSearchContent: FC<ModalSearchContentProps> = ({
  item,
  scroll,
  order,
  onSetData,
  disabled,
}) => {
  // const [data, setData] = useState(order.materials);
  // console.log(data);
  const { t } = useTranslation();
  const handleSearch = (formValues: any) => {
    // Здесь выполняется ваш запрос, используя значения формы.
    // Обновите состояние `data` с полученными данными.
    // setData(newData);
  };
  const { filteredMaterialOrders } = useTypedSelector(
    (state) => state.storesLogistic
  );
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  // let rrr= !data.some((item: { status: string }) => item.status === 'open');
  // console

  const initialColumns: ProColumns<any>[] = [
    {
      title: "LOCAL ID",
      dataIndex: "LOCAL_ID",
      // valueType: 'index',
      ellipsis: true,
      key: "LOCAL_ID",
      width: "12%",

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.LOCAL_ID}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t("PN")}`,
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      ellipsis: true,
      formItemProps: {
        name: "PART_NUMBER",
      },

      // responsive: ['sm'],
    },
    {
      title: `${t("STORE")}`,
      dataIndex: "STOCK",
      key: "STOCK",
      // responsive: ['sm'],
      tip: "Text Show",
      ellipsis: true, //
      // width: '20%',
    },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "NAME_OF_MATERIAL",
      key: "NAME_OF_MATERIAL",
      // responsive: ['sm'],
      tip: "Text Show",
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: `${t("QUANTITY")}`,
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
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
      title: "RESERVED",
      dataIndex: "reserved",
      key: "reserved",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: "BLOCKED",
      dataIndex: "ONBLOCK_QUANTITY",
      key: "ONBLOCK_QUANTITY",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: "LOCATION",
      dataIndex: "SHELF_NUMBER",
      key: "SHELF_NUMBER",
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },

    {
      title: `${t("UNIT")}`,
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
  ];
  const initialColumnsBlock: ProColumns<any>[] = [
    {
      title: "LOCAL ID",
      dataIndex: "LOCAL_ID",
      // valueType: 'index',
      ellipsis: true,
      key: "LOCAL_ID",
      // width: '5%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.ID}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t("PN")}`,
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      ellipsis: true,
      formItemProps: {
        name: "PART_NUMBER",
      },

      // responsive: ['sm'],
    },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "NAME_OF_MATERIAL",
      key: "NAME_OF_MATERIAL",
      // responsive: ['sm'],
      tip: "Text Show",
      ellipsis: true, //
      // width: '20%',
    },

    {
      title: `${t("QTY")}`,
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      responsive: ["sm"],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t("UNIT")}`,
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      // responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            // action?.startEditable?.(record.id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [updatedOrder, setUpdatedOrder] = useState(order);
  const [onBlockData, setOnBlockData] = useState(item.onBlock || []);
  const [fetchItem, setFetchItem] = useState(order);
  const [sumOnBlockData, setSumOnBlockData] = useState(0);
  const dispatch = useAppDispatch();
  useEffect(() => {
    // setData(updatedOrder.materials);
    setSumOnBlockData(
      onBlockData && onBlockData.length
        ? onBlockData.reduce(
            (sum: any, item: any) => sum + Number(item.QUANTITY),
            0
          )
        : 0
    );
    // const sumOnBlockData =
  }, [onBlockData]);

  useEffect(() => {
    setOnBlockData(item.onBlock);
  }, [item.id]);
  type MenuItem = Required<MenuProps>["items"][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const items: MenuProps["items"] = [
    getItem("Delete Items ", "sub85", <DeleteOutlined />, [
      getItem(
        <div
          onClick={async () => {
            const selectedCount = selectedRowKeys && selectedRowKeys.length;
            if (selectedCount < 1) {
              message.error("Please select Items.");
              return;
            }
            const companyID = localStorage.getItem("companyID");
            // const result = await dispatch(
            //   deleteRequirementsByIds({
            //     ids: selectedRowKeys,
            //     companyID: companyID || '',
            //     projectID: projectTaskData?.projectId || '',
            //   })
            // );
            // if (result.meta.requestStatus === 'fulfilled') {
            //   setSelectedRowKeys([]);
            //   const result = await dispatch(
            //     getFilteredRequirements({
            //       companyID: companyID || '',
            //       projectId: projectTaskData?.projectId || '',
            //       projectTaskID: projectTaskData?._id,
            //     })
            //   );
            //   setRequirements(result.payload);
            // }
          }}
        >
          Selected Items
        </div>,
        "5.18"
      ),
      getItem(
        <div
          onClick={async () => {
            const companyID = localStorage.getItem("companyID");
            // const result = await dispatch(
            //   deleteRequirementsByIds({
            //     ids: extractIds(materialsRequirements),
            //     companyID: companyID || '',
            //     projectID: projectTaskData?.projectId || '',
            //   })
            // );
            // if (result.meta.requestStatus === 'fulfilled') {
            //   setSelectedRowKeys([]);
            //   const result = await dispatch(
            //     getFilteredRequirements({
            //       companyID: companyID || '',
            //       projectId: projectTaskData?.projectId || '',
            //       projectTaskID: projectTaskData?._id,
            //     })
            //   );
            //   setRequirements(result.payload);
            // }
          }}
        >
          All Items
        </div>,
        "5.1827"
      ),
    ]),
  ];

  // const uuidv4: () => string = originalUuidv4;
  // const matData=
  return (
    <div className="flex flex-col">
      <Title level={5}>
        {" "}
        <Space>PICKSLIP CONFIRMATION</Space>
        <Space>
          {`PN: ${item.PN}`}
          {`DESCRIPTION: ${item.description}`}
          {`QUANTITY: ${item.onOrderQuantity}`}
          {`UNIT: ${item.unit}`}
        </Space>
      </Title>
      <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
        <Col xs={24} sm={10}>
          <EditableTable
            data={onBlockData || []}
            initialColumns={initialColumnsBlock}
            isLoading={false}
            menuItems={items}
            recordCreatorProps={false}
            onRowClick={function (record: any, rowIndex?: any): void {
              console.log(rowIndex);
            }}
            onSave={function (rowKey: any, data: any, row: any): void {
              console.log(rowKey);
            }}
            yScroll={20}
            onSelectedRowKeysChange={handleSelectedRowKeysChange}
            externalReload={function (): Promise<void> {
              throw new Error("Function not implemented.");
            }}
            // onTableDataChange={}
          />
          <ProForm
            disabled={
              updatedOrder.status === "closed" ||
              updatedOrder.status === "canceled"
            }
            onFinish={async (values: any) => {
              if (!values.QUANTITY) {
                message.error("QUANTITY is required!");
                return;
              }

              // console.log(order);
              const resultItem = await dispatch(
                getFilteredMaterialItems({
                  companyID: localStorage.getItem("companyID") || "",
                  localID: values.ID,
                })
              );
              // Вычисление суммы значений QUANTITY в onBlockData
              // const sumOnBlockData =
              //   onBlockData && onBlockData.length
              //     ? onBlockData.reduce(
              //         (sum: any, item: any) => sum + Number(item.QUANTITY),
              //         0
              //       )
              //     : 0;
              // console.log(sumOnBlockData);
              // console.log(sumOnBlockData, item.onOrderQuantity);

              // Добавлена проверка, чтобы убедиться, что QUANTITY не превышает разницу между item.onOrderQuantity и суммой значений QUANTITY в onBlockData
              if (values.QUANTITY > item.onOrderQuantity - sumOnBlockData) {
                message.error(
                  "QUANTITY should not be more than the difference between requirement Quantity and the sum of  block QUANTITY in table!"
                );
                return;
              }
              if (
                values.QUANTITY >
                resultItem.payload[0].QUANTITY -
                  resultItem.payload[0].ONBLOCK_QUANTITY
              ) {
                message.error(
                  "Value should not be more than  variety of available materials"
                );
                return;
              }
              if (resultItem.meta.requestStatus === "fulfilled") {
                const updatedMaterials = updatedOrder.materials.map(
                  (material: any) => {
                    if (material.id === item.id) {
                      // Замените 'your-id' на id элемента, который вы хотите обновить
                      const updatedPayload = resultItem.payload.map(
                        (item: any) => {
                          // console.log(item);
                          return {
                            ...item,
                            QUANTITY: values.QUANTITY,
                            // id: uuidv4(), // уникальный ключ для каждой вкладки,
                            requirementID: material.requirementID,
                            status: "completed",
                          };
                        }
                      );

                      setOnBlockData([
                        ...(onBlockData || []),
                        ...updatedPayload,
                      ]);

                      setSumOnBlockData(
                        updatedPayload && updatedPayload.length
                          ? updatedPayload.reduce(
                              (sum: any, item: any) =>
                                sum + Number(item.QUANTITY),
                              0
                            )
                          : // .toFixed(3)
                            0
                      );

                      return {
                        ...material,
                        onBlockQuantity:
                          sumOnBlockData + Number(values.QUANTITY),
                        // .toFixed(3),
                        status:
                          sumOnBlockData + Number(values.QUANTITY) ==
                          //  +
                          // values.QUANTITY
                          Number(item.onOrderQuantity)
                            ? "completed"
                            : "open",
                        onBlock: [
                          ...(material.onBlock || []),
                          ...updatedPayload,
                        ],
                      };
                    }
                    //console.log(material);
                    return material;
                  }
                );

                setUpdatedOrder({
                  ...updatedOrder,
                  materials: updatedMaterials,
                });
                // console.log(updatedMaterials);
                let yyy = {
                  ...updatedOrder,
                  materials: updatedMaterials,
                  status: updatedMaterials.some(
                    (item: { status: string }) =>
                      item.status === "open" || item.status === "canceled"
                  )
                    ? "open"
                    : "completed",
                };
                // console.log(yyy);
                if (yyy) {
                  const result = await dispatch(updatedMaterialOrdersById(yyy));

                  if (result.meta.requestStatus === "fulfilled") {
                    onSetData(result.payload.materials);
                    // console.log(result.payload);
                    const index = filteredMaterialOrders.findIndex(
                      (item: any) => item._id === result.payload._id
                    );
                    dispatch(
                      setUpdatedMaterialOrder({
                        index: index,
                        item: result.payload,
                      })
                    );
                    // console.log(index);

                    // console.log(result.payload);

                    ///вставить обновление стора
                    // if(.)
                    dispatch(
                      updatedMaterialItemsById({
                        companyID: localStorage.getItem("companyID") || "",
                        _id: resultItem.payload[0]._id,
                        ONBLOCK_QUANTITY: values.QUANTITY,
                        BATCH: resultItem.payload[0].BATCH,
                        // localID: values.ID,
                      })
                    );
                    const companyID = localStorage.getItem("companyID");
                    // result.payload.materials.forEach((material: any) => {
                    //   if (material.onBlockQuantity == material.required) {
                    //     dispatch(
                    //       updateRequirementByID({
                    //         id: material.requirementID,
                    //         status: 'closed',
                    //         updateUserID: USER_ID || '',
                    //         updateDate: new Date(),
                    //         companyID: localStorage.getItem('companyID') || '',
                    //         projectID: result.payload.projectId,
                    //       })
                    //     );
                    //   }
                    // });

                    // console.log(result.payload.materials);

                    // setOnBlockData(result.payload);
                  }
                }
              } else {
                message.error("Error");
              }
              // message.success('提交成功');
            }}
          >
            <ProFormText
              width="md"
              name="ID"
              label="LOCAL ID"
              tooltip="ENTER ID"
              placeholder="Item ID"
            />
            <ProFormDigit
              width="sm"
              name="QUANTITY"
              label="QUANTITY"
              tooltip="ENTER QUANTITY"
              placeholder="Item QUANTITY"
              rules={[
                {
                  required: true,
                  message: "Please Enter Digits less than requirement !",
                  pattern: new RegExp("^[0-9]*[.,]?[0-9]+$"), // Добавлено правило для целых и нецелых чисел
                  validator: (_, value) => {
                    if (value === "") {
                      return Promise.reject(
                        new Error("Field cannot be empty!")
                      );
                    }
                    if (value > item.onOrderQuantity) {
                      return Promise.reject(
                        new Error(
                          "Value should not be more than  variety of available materials!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </ProForm>
        </Col>
        <Col xs={24} sm={14}>
          <EditableSearchTable
            initialParams={{ PART_NUMBER: item.PN }}
            data={[]}
            initialColumns={initialColumns}
            isLoading={false}
            menuItems={undefined}
            recordCreatorProps={false}
            onSelectedRowKeysChange={handleSelectedRowKeysChange}
            onRowClick={function (record: any): void {
              console.log(record);
            }}
            onSave={function (rowKey: any, data: any, row: any): void {
              console.log(rowKey);
            }}
            yScroll={scroll}
            // externalReload={function (): Promise<void> {
            //   throw new Error('Function not implemented.');
            // }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ModalSearchContent;
