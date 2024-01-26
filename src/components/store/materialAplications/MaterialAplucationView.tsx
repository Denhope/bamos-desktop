import Table, { ColumnsType } from "antd/es/table";
import React, { FC, useState } from "react";
import { Empty, Input, InputNumber, List, Skeleton, notification } from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";

import {
  IMatRequestAplication,
  MatRequestAplication,
} from "@/store/reducers/ProjectTaskSlise";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PrinterOutlined,
  PlusCircleOutlined,
  FundViewOutlined,
  ShoppingCartOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Button, Descriptions, Modal } from "antd";
import moment from "moment";
import { IMatData, IMatData1, IPurchaseMaterial } from "@/types/TypesData";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  addEditedMaterial,
  setAddedMaterial,
  setEditedMaterialAplication,
  setEditedMaterialAplicationMaterials,
  addPurchaseMaterialAplicationMaterials,
  setOnPurchaseMaterial,
} from "@/store/reducers/MatirialAplicationsSlise";
import { sign } from "crypto";
import {
  fetchCurrentMaterials,
  fetchSameMaterials,
  getAllMaterialAplication,
  updateAplicationById,
} from "@/utils/api/thunks";
import { setInitialMaterial } from "@/store/reducers/MaterialStoreSlice";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import toast, { Toaster } from "react-hot-toast";
import Paragraph from "antd/es/typography/Paragraph";
import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";

type MaterialAplicationTypeProps = { data: MatRequestAplication };
const MaterialAplicationView: FC<MaterialAplicationTypeProps> = ({ data }) => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  // const [checked, setCheked] = useState(data.isEdited);

  const onChangeCheckBox = (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(0);
  const [inputSearchValue, setSerchedText] = useState("");
  const [tostrVisible, setVisible] = useState<boolean>(false);
  const [rowInsex, setRowIndex] = useState(0);
  const [purchaseMaterial, setpurchaseMaterialMaterial] =
    useState<IPurchaseMaterial>({
      amout: 0,
      PN: "",
      unit: "",
      alternative: "",
      amtoss: "",
      code: "",
      id: 0,
      consignee: "",
      nameOfMaterial: "",
    });
  const [editingMaterial, setEditingMaterial] = useState<IMatData1>({
    amout: 0,
    PN: "",
    unit: "",
    alternative: "",
    amtoss: "",
    code: "",
    id: 0,
  });
  const { searchedAllItemsQuantity, searchedSameItemsQuantity, isLoading } =
    useTypedSelector((state) => state.materialStore);

  const { currentMaterialsAplication } = useTypedSelector(
    (state) => state.materialAplication
  );

  const columnsMatStore: ColumnsType<any> = [
    {
      title: "P/N",
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      responsive: ["sm"],
    },
    {
      title: "Партия",
      dataIndex: "BATCH",
      key: "BATCH",
      responsive: ["sm"],
    },
    {
      title: "S/N",
      dataIndex: "BATCH_ID",
      key: "BATCH_ID",
      responsive: ["sm"],
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "NAME_OF_MATERIAL",
      key: "NAME_OF_MATERIAL",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      responsive: ["sm"],
    },
    {
      title: "Бронь",
      dataIndex: "RESERVATION",
      key: "RESERVATION",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
    },
    {
      title: "Номер склада",
      dataIndex: "STOCK",
      key: "STOCK",
      responsive: ["sm"],
    },
    {
      title: "Номер стелажа",
      dataIndex: "RACK_NUMBER",
      key: "RACK_NUMBER",
      responsive: ["sm"],
    },
    {
      title: "Номер полки",
      dataIndex: "SHELF_NUMBER",
      key: "SHELF_NUMBER",
      responsive: ["sm"],
    },
    {
      key: "5",
      title: "Списание",
      render: (text, record: IMaterialStoreRequestItem) => {
        return (
          <div className="flex gap-1 align-middle">
            <InputNumber
              min={0}
              max={record.QUANTITY - Number(record?.RESERVATION || 0)}
              // defaultValue={1}
              onChange={onChange}
            />
            <div className="my-1">{record.UNIT_OF_MEASURE}</div>

            <></>
            <div className="my-1">
              <PlusCircleOutlined
                style={{ fontSize: "25px" }}
                onClick={() => {
                  value > 0 &&
                    Modal.confirm({
                      title: `Вы уверены что хотите отметить ${record.PART_NUMBER} в колличестве ${value} ${record.UNIT_OF_MEASURE} для формирования заявки?`,
                      okText: "Да",
                      cancelText: "Отмена",
                      okType: "danger",
                      onOk: async () => {
                        if (value > 0) {
                          dispatch(
                            addEditedMaterial({
                              PART_NUMBER: record.PART_NUMBER,
                              NAME_OF_MATERIAL: record.NAME_OF_MATERIAL,
                              ID: record.ID,
                              QUANTITY: value,
                              UNIT_OF_MEASURE: record.UNIT_OF_MEASURE,
                              BATCH: record.BATCH,
                              BATCH_ID: record.BATCH_ID || "0",
                              CUSTOMER_MATERIAL: record.CUSTOMER_MATERIAL,
                              INVENTORY_ACCOUNT: record.INVENTORY_ACCOUNT,
                              RACK_NUMBER: record.RACK_NUMBER,
                              SHELF_NUMBER: record.SHELF_NUMBER,
                              PRICE: record.PRICE,
                            })
                          );
                          dispatch(
                            setAddedMaterial({
                              id: rowInsex - 1,
                              payload: { ...editingMaterial, isEdited: true },
                            })
                          );
                          toast.success("Информация добавлена");
                        }
                      },
                    });
                }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const openNotification = (record: any) => {
    // console.log(record);
    notification.open({
      message: `Выбранные материалы`,
      description: `${currentMaterialsAplication.editedAction.editedStoreMaterials.map(
        (item: any) =>
          `${item.PART_NUMBER}------------\n${item.NAME_OF_MATERIAL}`
      )}`,

      onClick: () => {},
    });
  };
  const columnsMat: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: "code",
      key: "code",
      responsive: ["sm"],
    },
    { title: "P/N", dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: "Альтернатива",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
    {
      key: "5",
      title: "Поиск",
      render: (text, record: any, index) => {
        return (
          <>
            {" "}
            {(!record.isEdited &&
              currentMaterialsAplication.status === "отложена") ||
              (currentMaterialsAplication.status === "в работе" &&
                !record.isEdited &&
                !record.isOnonPurchase &&
                (localStorage.getItem("role") == "storeMen" ||
                  localStorage.getItem("role") == "admin") && (
                  <FundViewOutlined
                    disabled={
                      localStorage.getItem("role") == "boss" ||
                      localStorage.getItem("role") == "engineer"
                      //  ||
                      // localStorage.getItem('role') !== 'logistic'
                    }
                    width={"40px"}
                    style={{ fontSize: "25px" }}
                    onClick={() => {
                      onEditMaterial(record);
                      setRowIndex(index + 1);
                    }}
                  />
                ))}
            {record.isEdited && (
              <Checkbox
                disabled={
                  localStorage.getItem("role") == "boss" ||
                  localStorage.getItem("role") == "engineer" ||
                  localStorage.getItem("role") == "logistic"
                }
                checked={record.isEdited}
                onClick={() => {
                  setVisible(true);
                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible ? "animate-enter" : "animate-leave"
                        } max-w-2xl  w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                      >
                        <div className="flex-1 w-0 p-4 scroll-my-96">
                          <p className="text-sm font-medium text-gray-900">
                            МАТЕРИАЛЫ
                          </p>
                          {currentMaterialsAplication.editedAction.editedStoreMaterials.map(
                            (item: any) => (
                              <ul>
                                <li>
                                  PN: {item.PART_NUMBER} <br />
                                  ПАРТИЯ: {item.BATCH}
                                  <br />
                                  ОПИСАНИЕ:{item.NAME_OF_MATERIAL} <br />
                                  КОЛ-ВО: {item.QUANTITY} <br />
                                  СТЕЛАЖ:{item.RACK_NUMBER} <br />
                                  ПОЛКА: {item.SHELF_NUMBER}
                                </li>
                              </ul>
                            )
                          )}
                        </div>
                        <div className="flex border-l border-gray-200">
                          <button
                            onClick={() => {
                              toast.dismiss(t.id);
                              setVisible(false);
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            закрыть
                          </button>
                        </div>
                      </div>
                    )

                    // { duration: 100000 }
                  );
                }}
              >
                Cобрано
              </Checkbox>
            )}
          </>
        );
      },
    },
    {
      key: "6",
      title: "В закупку",
      render: (text, record: IMatData1, index) => {
        return (
          <>
            {" "}
            {(!record.isEdited &&
              currentMaterialsAplication.status === "отложена") ||
              (currentMaterialsAplication.status === "в работе" &&
                !record.isOnonPurchase &&
                !record.isEdited &&
                // localStorage.getItem('role') !== 'logistic' ||
                (localStorage.getItem("role") == "storeMen" ||
                  localStorage.getItem("role") == "admin") && (
                  <ShoppingCartOutlined
                    disabled={
                      localStorage.getItem("role") == "boss" ||
                      // localStorage.getItem('role') !== 'logistic' ||
                      localStorage.getItem("role") == "engineer"
                    }
                    width={"40px"}
                    style={{ fontSize: "25px" }}
                    onClick={() => {
                      if (
                        localStorage.getItem("role") !== "boss" ||
                        localStorage.getItem("role") !== "logistic" ||
                        localStorage.getItem("role") !== "engineer"
                      ) {
                        setpurchaseMaterialMaterial({ ...record });
                        // onEditMaterial(record);
                        setRowIndex(index);
                        onPurchaseMaterial(record, index);
                      }
                    }}
                  />
                ))}{" "}
            {record.isOnonPurchase && (
              <Checkbox
                disabled={
                  localStorage.getItem("role") == "boss" ||
                  localStorage.getItem("role") == "logistic" ||
                  localStorage.getItem("role") == "engineer"
                }
                checked={record.isOnonPurchase}
                onClick={() => {}}
              >
                В закупку
              </Checkbox>
            )}
          </>
        );
      },
    },
  ];

  const onPurchaseMaterial = (record: IMatData1, index: number) => {
    Modal.confirm({
      title:
        "Вы уверены, что данной позиции нет на складе и хотите отправить в закупку?",
      okText: "Да",
      cancelText: "Отмена",
      okType: "danger",
      onOk: async () => {
        dispatch(
          addPurchaseMaterialAplicationMaterials({
            taskWO: data?.projectTaskWO || data?.additionalTaskId || "",
            projectWO: data.projectWO,
            amout: record?.amout,
            unit: record?.unit,
            PN: record?.PN,
            alternative: record?.alternative,
            nameOfMaterial: record?.nameOfMaterial,
            status: "Не обработано",
            taskNumber: record?.taskNumber,
            consignee: data?.user,
            id: record.id,
            registrationNumber: data?.registrationNumber,
            additionalTaskId: data.additionalTaskId,
            projectTaskId: data.projectTaskId,
            materialAplicationNumber: data?.materialAplicationNumber,
            createDate: new Date(),
            storeMan: localStorage.getItem("name"),
          })
        );

        // console.log(record);
        dispatch(
          setOnPurchaseMaterial({
            id: index,
            payload: {
              taskWO: data?.projectTaskWO || data?.additionalTaskId,
              projectWO: data.projectWO,
              amout: record?.amout,
              unit: record?.unit,
              PN: record?.PN,
              alternative: record?.alternative,
              nameOfMaterial: record?.nameOfMaterial,
              status: "Не обработано",
              taskNumber: record?.taskNumber,
              consignee: data?.user,
              id: record.id,
              planeNumber: data?.registrationNumber,
              materialAplicationNumber: data?.materialAplicationNumber,
              isOnonPurchase: true,
              code: record?.code,
            },
          })
        );

        // const result3 = await dispatch(
        //   updateAplicationById({
        //     ...currentMaterialsAplication,
        //     _id:
        //       currentMaterialsAplication._id || currentMaterialsAplication.id,
        //     status: 'частично закрыта',
        //   })
        // );
        // if (result3.meta.requestStatus === 'fulfilled') {
        //   toast.success('Информация о необходимости закупки добавлена');
        // }
      },
    });
  };
  const onEditMaterial = (record: any) => {
    setIsEditing(true);
    setEditingMaterial({ ...record });
    dispatch(fetchCurrentMaterials(record.PN));
    // console.log('changed', record);
  };
  // const onPurchaseMaterial = (record: any) => {
  //   setIsEditing(true);
  //   setEditingMaterial({ ...record });
  //   dispatch(fetchCurrentMaterials(record.PN));
  //   // console.log('changed', record);
  // };

  const resetEditing = () => {
    setIsEditing(false);
    dispatch(setInitialMaterial([]));
  };
  const onChange = (value: any) => {
    setValue(value);
  };

  return (
    <div className="min-h-full">
      <div className="flex">
        <PrinterOutlined
          onClick={() => {}}
          className="cursor-pointer"
          style={{ fontSize: "25px" }}
        />{" "}
        <p className="my-1 mx-2"></p>
        <p className="my-1 mx-4  font-semibold ml-auto">
          Статус: {(data?.status && String(data?.status.toUpperCase())) || ""}
        </p>
      </div>
      <Descriptions
        size="small"
        column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 3, xs: 3 }}
      >
        <Descriptions.Item label={<p className="text-l  my-0">Номер заявки</p>}>
          <p className="text-l  font-semibold my-0">
            {data.materialAplicationNumber}
          </p>
        </Descriptions.Item>

        <Descriptions.Item label={<p className="text-l  my-0">Номер работы</p>}>
          <p className="text-l  font-semibold my-0">{data.projectTaskWO}</p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Рег. Номер ВС</p>}
        >
          <p className="text-l  font-semibold my-0">
            {data.registrationNumber}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Внутренний W/O</p>}
        >
          <p className="text-l  font-semibold my-0">{data.projectWO}</p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Номер Расходного требования</p>}
        >
          <p className="text-l  font-semibold my-0">{/* {data.projectWO} */}</p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="text-l  my-0">Заказчик</p>}>
          <p className="text-l  font-semibold my-0">
            {data.userId?.email || data.user}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Дата создания</p>}
        >
          <p className="text-l  font-semibold my-0">
            {moment(data.createDate).format("D.MM.YY, HH:mm")}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Дата формирования</p>}
        >
          <p className="text-l  font-semibold my-0">
            {data.editedAction &&
              moment(data.editedAction.editedTime).format("D.MM.YY, HH:mm")}
          </p>
        </Descriptions.Item>
      </Descriptions>

      <Table
        columns={columnsMat}
        size="small"
        scroll={{ y: "calc(50vh)" }}
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        dataSource={data.materials}
        pagination={false}
      ></Table>
      <Modal
        title="Просмотр остатков"
        visible={isEditing}
        okText="Применить"
        cancelText="Отмена"
        onCancel={() => {
          resetEditing();
          dispatch(setInitialMaterial([]));
          setSerchedText("");
          setValue(0);
        }}
        onOk={() => {
          resetEditing();
          setInitialMaterial([]);
          setSerchedText("");
          setValue(0);
        }}
        width={"80%"}
      >
        <div className="flex">
          {" "}
          <div className="font-semibold text-l">
            <Paragraph className="font-semibold text-xl my-0 py-0" copyable>
              {editingMaterial.PN}
            </Paragraph>
            <Paragraph className="font-semibold text-l my-0 py-0" copyable>
              {editingMaterial.nameOfMaterial}
            </Paragraph>
            {/* <br /> */}
            <Paragraph className="font-semibold text-l my-0 py-0" copyable>
              {editingMaterial?.amout} {editingMaterial?.unit}
            </Paragraph>
          </div>
        </div>
        {searchedAllItemsQuantity.length > 0 ? (
          <Table
            size="small"
            scroll={{ y: "calc(45vh)" }}
            rowClassName="cursor-pointer  text-xs text-transform: uppercase"
            columns={columnsMatStore}
            dataSource={isLoading ? [] : searchedAllItemsQuantity}
            locale={{
              emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
            }}
          ></Table>
        ) : (
          <>
            <Input.Search
              className="my-2"
              defaultValue={""}
              allowClear
              placeholder="Для поиска альтеннативы введите значение"
              onSearch={(value) => {
                dispatch(fetchSameMaterials(value.trim()));
              }}
              onChange={(e) => {
                setSerchedText(e.target.value.trim());
              }}
            />
            {searchedSameItemsQuantity && (
              <Table
                size="small"
                scroll={{ y: "calc(45vh)" }}
                rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                dataSource={isLoading ? [] : searchedSameItemsQuantity}
                locale={{
                  emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
                }}
                columns={columnsMatStore}
              ></Table>
            )}
          </>
        )}
      </Modal>

      <Toaster position="top-center" reverseOrder={true} />
    </div>
  );
};

export default MaterialAplicationView;
