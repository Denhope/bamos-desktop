import {
  Button,
  Empty,
  Modal,
  Skeleton,
  Checkbox,
  Form,
  Input,
  Select,
  InputRef,
  Space,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";

import Table, { ColumnType, ColumnsType, TableProps } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useRef, useState, useEffect } from "react";
import {} from "@/store/reducers/ProjectTaskSlise";

import moment from "moment";
import {
  getAllPurchaseItems,
  getSelectedItems,
  updatePushesItem,
} from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import { IPurchaseMaterial } from "@/types/TypesData";

import { saveExls } from "@/services/utilites";
import {
  FilterValue,
  SorterResult,
  FilterConfirmProps,
} from "antd/es/table/interface";
import TextArea from "antd/es/input/TextArea";
import { setCurrentpurchaseItem } from "@/store/reducers/PurchaseSlice";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";

// import Highlighter from 'react-highlight-words';
const { RangePicker } = DatePicker;
type PuchesListPropsType = {
  data: IPurchaseMaterial[];
};
const PuchesListList: FC<PuchesListPropsType> = ({ data }) => {
  const dispatch = useAppDispatch();

  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    console.log("Selected Time: ", value);
    console.log("Formatted Selected Time: ", dateString);
  };

  const onOk = (
    value: DatePickerProps["value"] | RangePickerProps["value"]
  ) => {
    // console.log('onOk: ', value);
  };

  const { isLoading, purchaseItems, currentPurchaseItem } = useTypedSelector(
    (state) => state.purchaseItems
  );
  useEffect(() => {}, [dispatch]);

  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  // const [onReleaseMan, setonReleaseMan] = useState(
  //   currentPurchaseItem?.onReleaseMan
  // );
  const [openForm, setOpenForm] = useState(false);

  const idr = [];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);

    dispatch(getSelectedItems(newSelectedRowKeys));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<IPurchaseMaterial>>(
    {}
  );
  const handleChange: TableProps<IPurchaseMaterial>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<IPurchaseMaterial>);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const setAgeSort = () => {
    setSortedInfo({
      order: "descend",
      columnKey: "age",
    });
  };

  const searchInput = useRef<InputRef>(null);
  type DataIndex = keyof IPurchaseMaterial;
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<IPurchaseMaterial> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            confirm({ closeDropdown: false });
          }}
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            поиск
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm({ closeDropdown: false });
            }}
            size="small"
            style={{ width: 90 }}
          >
            сброс
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            закрыть
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        // text
        text
      ),
  });

  const columns: ColumnsType<any> = [
    {
      title: "P/N",
      dataIndex: "PN",
      key: "PN",
      // responsive: ['sm'],
      ...getColumnSearchProps("PN"),
      sorter: (a: any, b: any) => a.PN.length - b.PN.length,
    },

    {
      title: "Описание",
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["lg"],
      ...getColumnSearchProps("nameOfMaterial"),
      sorter: (a: any, b: any) =>
        a.nameOfMaterial.length - b.nameOfMaterial.length,
    },
    {
      title: " Альтернатива",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["lg"],
      // ...getColumnSearchProps('alternative'),
      // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },
    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["lg"],
      width: 70,
      // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },
    {
      title: "Ед.Изм",
      dataIndex: "unit",
      key: "unit",
      responsive: ["lg"],
      width: 70,
      // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },
    {
      title: "Номер Работы",
      dataIndex: "taskWO",
      key: "taskWO",
      responsive: ["sm"],
      //width: 70,
      ...getColumnSearchProps("taskWO"),
      sorter: (a: any, b: any) => a.taskWO - b.taskWO,
      // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },
    {
      title: "Заказчик",
      dataIndex: "consignee",
      key: "consignee",
      responsive: ["sm"],
      ...getColumnSearchProps("consignee"),
      // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },

    {
      title: `${t("W/O")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      responsive: ["sm"],
      width: 70,
      ...getColumnSearchProps("projectWO"),
    },

    {
      title: "Дата создания",
      dataIndex: "createDate",
      key: "createDate",
      responsive: ["lg"],
      render(text: Date) {
        return text && moment(text).format("D.MM.YY, HH:mm");
      },

      sorter: (a, b) =>
        moment(a.createDate).unix() - moment(b.createDate).unix(),
      width: 100,
    },

    {
      title: "Номер ВС",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      // responsive: ['sm'],
      width: 80,
      ...getColumnSearchProps("registrationNumber"),
    },
    {
      title: "Подтвердил",
      dataIndex: "onReleaseMan",
      key: "onReleaseMan",
      responsive: ["lg"],
      // width: 150,
    },
    {
      title: "Дата подтв.",
      dataIndex: "realeseDate",
      key: "realeseDate",
      responsive: ["lg"],
      render(text: Date) {
        return text && moment(text).format("D.MM.YY, HH:mm");
      },
      sorter: (a, b) =>
        moment(a.realeseDate).unix() - moment(b.realeseDate).unix(),

      // sorter: (a, b) => a.realeseDate?.lengh - b.realeseDate?.lengh,
      width: 100,
    },
    {
      title: "Закупил",
      dataIndex: "onPurchaseMan",
      key: "onPurchaseMan",
      responsive: ["lg"],
      // width: 150,
    },
    {
      title: "Дата поставки (план.)",
      dataIndex: "onPurchaseDate",
      key: "onPurchaseDate",
      responsive: ["lg"],

      render(text: Date) {
        return text && moment(text).format("D.MM.YY");
      },

      sorter: (a, b) =>
        moment(a.onPurchaseDate).unix() - moment(b.onPurchaseDate).unix(),
      // width: 150,
    },

    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      // responsive: ['sm'],

      filters: [
        { text: "Не обработано", value: "Не обработано" },
        { text: "Подтверждено", value: "Подтверждено" },
        { text: "Отменено", value: "Отменено" },
        { text: "Сбор предложений", value: "Сбор предложений" },
        { text: "Ожидание оплаты", value: "Ожидание оплаты" },
        { text: "Ожидание поставки", value: "Ожидание поставки" },
        { text: "Томоженное оформление", value: "Томоженное оформление" },
        { text: "На складе", value: "На складе" },
        { text: "Поставка заказчиком", value: "Поставка заказчиком" },
      ],
      onFilter: (value: any, record: any) =>
        record?.status.indexOf(value) === 0,
    },
    {
      title: "Примечание",
      dataIndex: "note",
      key: "note",
      responsive: ["sm"],
    },
  ];
  const dataEmpty: readonly IPurchaseMaterial[] | undefined = [];
  const [open, setOpen] = useState(false);

  return (
    <div className="flex  flex-col">
      <Form.Item className="flex justify-end">
        <Button
          type="primary"
          onClick={() => saveExls(columns, purchaseItems, "Purchases")}
        >
          Сохранить
        </Button>
      </Form.Item>
      <Table
        className="py-0"
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columns}
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        pagination={false}
        size="small"
        scroll={{ y: "calc(70vh)" }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              // setOpen(true);
              const result = dispatch(setCurrentpurchaseItem(record));
              // if (result.payload._id) {
              setOpenForm(true);
              // }
            },
          };
        }}
      ></Table>

      <Modal
        okButtonProps={
          {
            //   disabled: isLoading || !currentAdditionalTask.material.length,
          }
        }
        title="Редактирование"
        centered
        open={openForm}
        cancelText="отмена"
        okType={"default"}
        okText="Сохранить"
        destroyOnClose={true}
        footer={null}
        onOk={async () => {
          Modal.confirm({
            title: "Вы уверены что  хотите отредактировать запись?",
            okText: "Да",
            cancelText: "Отмена",
            okType: "danger",
            onOk: async () => {
              // if (addButtonDisabled) {
              // if (result.meta.requestStatus === 'fulfilled') {
              //   toast.success('Заявка успешно отправлена');
              //   dispatch(
              //     getAllAdditionalTaskAplications(
              //       currentAdditionalTask?._id ||
              //         currentAdditionalTask?.id ||
              //         ''
              //     )
              //   );
              //   setOpenMaterial(false);
              // } else {
              //   toast.error('Не удалось создать заявку');
              // }
              // }
            },
          });
        }}
        onCancel={() => {
          setOpenForm(false);
          form.resetFields();
          dispatch(
            setCurrentpurchaseItem({
              _id: "",
              amout: 0,
              unit: "",
              note: "",
            })
          );
        }}
        width={"30%"}
      >
        <Form
          form={form}
          className="w-full"
          autoComplete="off"
          onFinish={async (values: IPurchaseMaterial) => {
            {
              Modal.confirm({
                title: "Вы уверены что  хотите отредактировать запись?",
                okText: "Да",
                cancelText: "Отмена",
                okType: "danger",
                onOk: async () => {
                  const result = await dispatch(
                    updatePushesItem({
                      ...currentPurchaseItem,
                      // id: currentPurchaseItem?.id || currentPurchaseItem?._id,
                      _id: currentPurchaseItem?._id,
                      amout: currentPurchaseItem?.amout || 0,
                      unit: currentPurchaseItem?.unit || "",
                      status: values.status || currentPurchaseItem?.status,
                      note: values.note || currentPurchaseItem?.note,
                      onReleaseMan:
                        (values.onReleaseMan &&
                          String(values.onReleaseMan).trim()) ||
                        currentPurchaseItem?.onReleaseMan,
                      onPurchaseMan:
                        (values.onPurchaseMan &&
                          String(values.onPurchaseMan).trim()) ||
                        currentPurchaseItem?.onPurchaseMan ||
                        "",
                      onPurchaseDate:
                        values.onPurchaseDate ||
                        currentPurchaseItem?.onPurchaseDate,
                      realeseDate:
                        values.realeseDate || currentPurchaseItem?.realeseDate,
                      alternative:
                        values.alternative || currentPurchaseItem?.alternative,
                    })
                  );
                  if (result.meta.requestStatus === "fulfilled") {
                    dispatch(getAllPurchaseItems());
                    toast.success("Данные успешно обновлены");
                    setOpenForm(false);
                  } else {
                    toast.error("Не удалось обновить");
                  }
                },
              });
            }

            // console.log(values);
          }}
          onFinishFailed={(error: any) => {
            console.log({ error });
          }}
        >
          <div className="flex flex-col">
            {(localStorage.getItem("role") == "admin" ||
              (localStorage.getItem("role") == "engineer" &&
                localStorage.getItem("name") == "Александр Топорков")) && (
              <>
                {!currentPurchaseItem?.onPurchaseDate &&
                  !currentPurchaseItem?.onReleaseMan && (
                    <>
                      <Form.Item
                        rules={[{ required: true }]}
                        label="Подтвердил (ФИО)"
                        name="onReleaseMan"
                      >
                        <Input
                          // value={onReleaseMan}
                          // disabled
                          disabled={
                            currentPurchaseItem?.onReleaseMan?.length
                              .toString &&
                            currentPurchaseItem?.onReleaseMan?.length > 0
                          }
                          defaultValue={
                            currentPurchaseItem?.onReleaseMan ||
                            localStorage.getItem("name") ||
                            ""
                          }
                        />
                      </Form.Item>

                      {/* <Form.Item label="Альтернатива" name="alternative">
                        <Input
                          defaultValue={currentPurchaseItem?.alternative}
                        />
                      </Form.Item> */}

                      <Form.Item
                        rules={[{ required: true }]}
                        label="Дата подтверждения"
                        name="realeseDate"
                      >
                        <DatePicker onChange={onChange} onOk={onOk} />
                      </Form.Item>
                      <Form.Item
                        rules={[{ required: true }]}
                        label="Статус"
                        name="status"
                      >
                        <Select
                          defaultValue={currentPurchaseItem?.status || ""}
                          placeholder="Статус"
                          allowClear
                        >
                          <Select.Option value="Отменено">
                            Отменено
                          </Select.Option>
                          <Select.Option value="Подтверждено">
                            Подтверждено
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </>
                  )}

                <Form.Item label="Альтернатива" name="alternative">
                  <Input defaultValue={currentPurchaseItem?.alternative} />
                </Form.Item>
                <Form.Item
                  // rules={[{ required: true }]}
                  label="Примечание"
                  name="note"
                >
                  <TextArea
                    defaultValue={
                      currentPurchaseItem?.note &&
                      currentPurchaseItem?.note.length > 0
                        ? currentPurchaseItem?.note
                        : ""
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    className=""
                    htmlType="submit"
                    // onClick={resetValues}
                    style={{ marginTop: 16 }}
                  >
                    Изменить
                  </Button>
                </Form.Item>
              </>
            )}

            {localStorage.getItem("role") == "logistic" &&
              currentPurchaseItem?.status !== "Не обработано" &&
              currentPurchaseItem?.status !== "Отменено" && (
                <>
                  {!currentPurchaseItem?.onPurchaseMan && (
                    <Form.Item
                      rules={[{ required: true }]}
                      label="Закупил (ФИО)"
                      name="onPurchaseMan"
                    >
                      <Input
                        disabled={
                          currentPurchaseItem?.onPurchaseMan?.length.toString &&
                          currentPurchaseItem?.onPurchaseMan?.length > 0
                        }
                        defaultValue={
                          currentPurchaseItem?.onPurchaseMan ||
                          localStorage.getItem("name") ||
                          ""
                        }
                      />
                    </Form.Item>
                  )}
                  <Form.Item
                    rules={[{ required: true }]}
                    label="Статус"
                    name="status"
                  >
                    <Select
                      defaultValue={currentPurchaseItem?.status || ""}
                      placeholder="Статус"
                      allowClear
                    >
                      <Select.Option value="Поставка заказчиком">
                        Поставка заказчиком
                      </Select.Option>
                      <Select.Option value="Сбор предложений">
                        Сбор предложений
                      </Select.Option>
                      <Select.Option value="Ожидание оплаты">
                        Ожидание оплаты
                      </Select.Option>
                      <Select.Option value="Ожидание поставки">
                        Ожидание поставки
                      </Select.Option>
                      <Select.Option value="Томоженное оформление">
                        Томоженное оформление
                      </Select.Option>
                      <Select.Option value="На складе">На складе</Select.Option>{" "}
                      <Select.Option value="Отменено">Отменено</Select.Option>
                    </Select>
                  </Form.Item>
                  {/* <Form.Item
                  // rules={[{ required: true }]}
                  label="Дата поставки (план.)"
                  name="onPurchaseDate"
                >
                  <Input />
                </Form.Item> */}

                  <Form.Item
                    label="Дата поставки (план.)"
                    name="onPurchaseDate"
                  >
                    <DatePicker onChange={onChange} onOk={onOk} />
                  </Form.Item>

                  <Form.Item
                    // rules={[{ required: true }]}
                    label="Примечание"
                    name="note"
                  >
                    <TextArea defaultValue={currentPurchaseItem?.note || ""} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      className=""
                      htmlType="submit"
                      // onClick={resetValues}
                      style={{ marginTop: 16 }}
                    >
                      Изменить
                    </Button>
                  </Form.Item>
                </>
              )}

            {(localStorage.getItem("role") == "logistic" &&
              currentPurchaseItem?.status == "Не обработано") ||
              (currentPurchaseItem?.status == "Отменено" && (
                <div>Заявка не подтверждена! Редактирование не возможно!</div>
              ))}
          </div>
          <Toaster position="top-center" reverseOrder={false} />
        </Form>
      </Modal>
    </div>
  );
};

export default PuchesListList;
