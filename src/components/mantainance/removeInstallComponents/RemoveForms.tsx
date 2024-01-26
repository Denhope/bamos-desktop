import {
  Button,
  Divider,
  Empty,
  Form,
  Input,
  InputRef,
  Modal,
  Skeleton,
  Space,
  Tabs,
  TabsProps,
} from "antd";
import Table, { ColumnsType, TableProps } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import React, { FC, useEffect, useRef, useState } from "react";

import {
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PrinterOutlined,
  PlusCircleOutlined,
  FundViewOutlined,
  EditOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { setCurrentRemovedItem } from "@/store/reducers/RemovedItemsSlice";
import { current } from "@reduxjs/toolkit";
import moment from "moment";
import Title from "antd/es/typography/Title";
import {
  createRemoveItem,
  getAllRemovedItems,
  getSelectedItems,
  updateremovedItem,
} from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import GeneretedTagspdf from "@/components/pdf/GeneretedTagspdf";
import {
  ColumnType,
  FilterConfirmProps,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
type RemovedItemPropsType = {
  data: IRemovedItemResponce[];
};

const RemovedItemsList: FC<RemovedItemPropsType> = ({ data }) => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  const { isLoading, currentRemoveditem } = useTypedSelector(
    (state) => state.removedItems
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const idr = [];
  useEffect(() => {
    setItem(1);
  }, [currentRemoveditem?._id]);
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

  const [searchText, setSearchText] = useState("");
  const [item, setItem] = useState(1);
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<
    SorterResult<IRemovedItemResponce>
  >({});
  const handleChange: TableProps<IRemovedItemResponce>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<IRemovedItemResponce>);
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
  type DataIndex = keyof IRemovedItemResponce;
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
  ): ColumnType<IRemovedItemResponce> => ({
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
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
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
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
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
      searchedColumn === dataIndex
        ? // <Highlighter
          //   highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          //   searchWords={[searchText]}
          //   autoEscape
          //   textToHighlight={text ? text.toString() : ''}
          // />
          text
        : text,
  });
  const columns: ColumnsType<IRemovedItemResponce> = [
    // {
    //   title: 'Номер п/п',
    //   dataIndex: '',
    //   key: '',
    //   responsive: ['sm'],
    //   // filteredValue: [searchedText],
    //   // onFilter: (value: any, record: any) => {
    //   //   return (
    //   //     String(record?.pickSlipNumber).includes(value) ||
    //   //     String(record.pickSlipNumber)
    //   //       ?.toLowerCase()
    //   //       .includes(value.toLowerCase()) ||
    //   //     String(record.materialAplicationId.projectWO)
    //   //       ?.toLowerCase()
    //   //       .includes(value.toLowerCase()) ||
    //   //     String(record.materialAplicationId.projectTaskWO)
    //   //       ?.toLowerCase()
    //   //       .includes(value.toLowerCase())
    //   //   );
    //   // },
    //   // sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    // },

    {
      title: "P/N",
      dataIndex: "removeItemName",
      key: "removeItemName",
      responsive: ["sm"],
      ...getColumnSearchProps("removeItemName"),
    },
    {
      title: "S/N",
      dataIndex: "removeItemNumber",
      key: "removeItemNumber",
      responsive: ["sm"],
      // ...getColumnSearchProps('removeItemName'),
    },
    {
      title: "Ссылка ра работу",
      dataIndex: "reference",
      key: "reference",
      responsive: ["sm"],
      // ...getColumnSearchProps('reference'),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      responsive: ["sm"],
    },
    {
      title: "Область",
      dataIndex: "area",
      key: "area",
      responsive: ["sm"],
      ...getColumnSearchProps("area"),
    },
    {
      title: "Зона",
      dataIndex: "zone",
      key: "zone",
      responsive: ["sm"],

      ...getColumnSearchProps("zone"),
    },
    {
      title: "CFI Позиция",
      dataIndex: "position",
      key: "position",
      responsive: ["sm"],
    },

    {
      title: "Дата снятия",
      dataIndex: "removeDate",
      key: "removeDate",
      responsive: ["sm"],
    },
    {
      title: "Снял (ФИО)",
      dataIndex: "removeName",
      key: "removeName",
      responsive: ["sm"],
    },
    {
      title: "Дата установки",
      dataIndex: "installDate",
      key: "installDate",
      responsive: ["sm"],
    },
    {
      title: "Установил (ФИО)",
      dataIndex: "installName",
      key: "installName",
      responsive: ["sm"],
      // ...getColumnSearchProps('installName'),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      responsive: ["sm"],
      // filteredValue: filteredInfo.status || null,
      // onFilter: (value: any, record: any) => record?.status?.includes(value),
      filters: [
        { text: "Open", value: "open" },
        { text: "Close", value: "close" },
      ],
      onFilter: (value: any, record: any) =>
        record?.status.indexOf(value) === 0,
    },
  ];
  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onChange = (key: string) => {};

  const [openTags, setOpenTags] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const dataEmpty: readonly IRemovedItemResponce[] | undefined = [];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Снятие`,
      children: (
        <>
          {" "}
          <Form
            form={form}
            className="w-full"
            autoComplete="off"
            onFinish={async (values) => {
              const result = await dispatch(
                updateremovedItem({
                  ...currentRemoveditem,
                  _id: currentRemoveditem?._id || currentRemoveditem?._id,
                  // removeItemName: values.removeItemName,
                  removeMan: {
                    removedSing: values.removeSing.trim(),
                    removeName: values.removeMan.trim(),
                  },
                  // removeItemNumber: values.installItemNumber,
                  removeDate: values.removeDate.trim(),
                  status: "open",
                  removeItemNumber: values.removeItemNumber,
                  removeName: values.removeMan.trim(),
                  reference: values.reference,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("Информация добавлена");
                setOpen(false);
                dispatch(getAllRemovedItems());
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            }}
          >
            <Title level={5}>Снятие {currentRemoveditem?.removeItemName}</Title>

            <Form.Item
              rules={[{ required: true }]}
              label="Ссылка на работу"
              name="reference"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "open"
                }
                defaultValue={currentRemoveditem?.reference || ""}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Дата снятия"
              name="removeDate"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "open"
                }
                defaultValue={
                  currentRemoveditem?.removeDate ||
                  moment.utc().format("Do. MMM. YYYY")
                }
              />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="S/N (при необход.)"
              name="removeItemNumber"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "open"
                }
                defaultValue={currentRemoveditem?.removeItemNumber || ""}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Табельный номер"
              name="removeSing"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "open"
                }
                defaultValue={
                  currentRemoveditem?.removeMan?.sing ||
                  localStorage.getItem("singNumber") ||
                  ""
                }
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Снял (Имя Фамилия)"
              name="removeMan"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "open"
                }
                defaultValue={
                  currentRemoveditem?.installMan?.name ||
                  localStorage.getItem("name") ||
                  ""
                }
              />
            </Form.Item>
            <Form.Item>
              <Button
                disabled={
                  isLoading ||
                  (currentRemoveditem?.status &&
                    currentRemoveditem?.status == "open")
                }
                htmlType="submit"
              >
                Сохранить
              </Button>
            </Form.Item>

            <></>
          </Form>
        </>
      ),
    },
    {
      key: "2",
      label: `Установка`,
      children: (
        <>
          <Form
            form={form3}
            className="w-full"
            autoComplete="off"
            onFinish={async (values) => {
              const result = await dispatch(
                updateremovedItem({
                  ...currentRemoveditem,
                  _id: currentRemoveditem?._id || currentRemoveditem?._id,
                  // removeItemName: values.removeItemName,
                  installMan: {
                    installSing: values.installSing.trim(),
                    installName: values.installName.trim(),
                  },
                  // removeItemNumber: values.installItemNumber,
                  installDate: values.installDate.trim(),
                  status: "close",
                  removeItemNumber: values.removeItemNumber,
                  installName: values.installName.trim(),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("Информация добавлена");
                setOpen(false);
                dispatch(getAllRemovedItems());
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            }}
          >
            <Title level={5}>
              Установка {currentRemoveditem?.removeItemName}
            </Title>
            <Form.Item
              rules={[{ required: true }]}
              label="Дата установки"
              name="installDate"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "close"
                }
                defaultValue={
                  currentRemoveditem?.installDate ||
                  // (currentRemoveditem.status == 'open' &&
                  moment.utc().format("Do. MMM. YYYY") ||
                  ""
                }
              />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="S/N (при необход.)"
              name="removeItemNumber"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "close"
                }
                defaultValue={currentRemoveditem?.removeItemNumber || ""}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Табельный номер"
              name="installSing"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "close"
                }
                defaultValue={
                  currentRemoveditem?.installMan?.installSing ||
                  // (currentRemoveditem.status == 'open' &&
                  localStorage.getItem("singNumber") ||
                  ""
                }
              />
            </Form.Item>

            <Form.Item
              rules={[{ required: true }]}
              label="Установил (Имя Фамилия)"
              name="installName"
            >
              <Input
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "close"
                }
                defaultValue={
                  currentRemoveditem?.installMan?.installName ||
                  // (currentRemoveditem.status == 'open' &&
                  localStorage.getItem("name") ||
                  ""
                }
              />
            </Form.Item>
            <Form.Item>
              <Button
                disabled={
                  currentRemoveditem?.status &&
                  currentRemoveditem?.status == "close"
                }
                htmlType="submit"
              >
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </>
      ),
    },
    {
      key: "3",
      label: `Редактирование`,
      children: (
        <>
          <Form
            form={form2}
            className="w-full"
            autoComplete="off"
            onFinish={async (values) => {
              const result = await dispatch(
                updateremovedItem({
                  ...currentRemoveditem,
                  _id: currentRemoveditem?._id || currentRemoveditem?._id,

                  installDate: values.installDate.trim(),

                  removeDate: values.removeDate.trim(),

                  reference: values.reference,

                  removeItemNumber: values.removeItemNumber.trim(),
                  position: values.position.trim(),
                  removeItemName: values.removeItemName.trim(),
                  zone: values.zone.trim(),
                  area: values.area.trim(),
                  description: values.description.trim(),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("Информация добавлена");
                setOpen(false);
                dispatch(getAllRemovedItems());
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            }}
          >
            <Form.Item
              // rules={[{ required: true }]}
              label="PN"
              name="removeItemName"
            >
              <Input defaultValue={currentRemoveditem?.removeItemName} />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Ссылка на работу"
              name="reference"
            >
              <Input defaultValue={currentRemoveditem?.reference || ""} />
            </Form.Item>

            <Form.Item
              // rules={[{ required: true }]}
              label="S/N (при необход.)"
              name="removeItemNumber"
            >
              <Input
                defaultValue={currentRemoveditem?.removeItemNumber || ""}
              />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Позиция"
              name="position"
            >
              <Input />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Описание"
              name="description"
            >
              <Input />
            </Form.Item>
            <Form.Item label="Зона" name="zone">
              <Input />
            </Form.Item>
            <Form.Item label="Область" name="area">
              <Input />
            </Form.Item>
            <Form.Item label="Дата снятия" name="removeDate">
              <Input defaultValue={currentRemoveditem?.removeDate} />
            </Form.Item>

            <Form.Item label="Дата установки" name="installDate">
              <Input defaultValue={currentRemoveditem?.installDate} />
            </Form.Item>

            <Form.Item>
              <Button htmlType="submit">Сохранить</Button>
            </Form.Item>
          </Form>
        </>
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button className="my-2" onClick={() => setOpenNew(true)}>
        Добавить Запись
      </Button>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => setOpenTags(true)}
          disabled={!hasSelected}
          loading={loading}
        >
          Распечатать
        </Button>
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
        </span>
      </div>
      <Table
        // onChange={handleChange}
        className="py-0"
        rowSelection={rowSelection}
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columns}
        rowKey="id"
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        // pagination={false}
        size="small"
        scroll={{ y: "calc(60vh)" }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              setOpen(true);
              dispatch(setCurrentRemovedItem(record));
            },
          };
        }}
      ></Table>
      <Modal
        okButtonProps={
          {
            // disabled: isLoading || !checked || !addButtonDisabled,
          }
        }
        title="Добавить запись"
        centered
        open={openNew}
        cancelText="отмена"
        okType={"default"}
        okText="Отправить Заявку"
        footer={null}
        onOk={async () => {}}
        onCancel={() => setOpenNew(false)}
      >
        <div className="flex justify-center ">
          <Form
            form={form2}
            className="w-full"
            autoComplete="off"
            onFinish={async (values) => {
              const result = await dispatch(
                createRemoveItem({
                  removeItemNumber: values.removeItemNumber.trim(),
                  position: values.position.trim(),
                  removeItemName: values.removeItemName.trim(),
                  zone: values.zone.trim(),
                  reference: values.reference.trim(),
                  removeName: values.removeMan.trim(),
                  removeMan: {
                    removeName: values.removeMan.trim(),
                    removedSing: values.removeSing.trim(),
                  },
                  area: values.area.trim(),
                  status: "open",
                  removeDate: values.removeDate.trim(),
                  description: values.description.trim(),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("Информация добавлена");
                setOpenNew(false);
                dispatch(getAllRemovedItems());
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            }}
          >
            <Form.Item
              rules={[{ required: true }]}
              label="Ссылка на работу"
              name="reference"
            >
              <Input />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="PN"
              name="removeItemName"
            >
              <Input />
            </Form.Item>

            <Form.Item
              // rules={[{ required: true }]}
              label="S/N (при необход.)"
              name="removeItemNumber"
            >
              <Input />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Позиция (при необход.)"
              name="position"
            >
              <Input />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Описание"
              name="description"
            >
              <Input />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} label="Зона" name="zone">
              <Input />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} label="Область" name="area">
              <Input />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Дата снятия (UTC)"
              name="removeDate"
            >
              <Input defaultValue={moment.utc().format("Do. MMM. YYYY")} />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Табельный номер"
              name="removeSing"
            >
              <Input defaultValue={localStorage.getItem("singNumber") || ""} />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Снял (Имя Фамилия)"
              name="removeMan"
            >
              <Input defaultValue={localStorage.getItem("name") || ""} />
            </Form.Item>

            <Form.Item>
              <Button disabled={isLoading} htmlType="submit">
                Сохранить
              </Button>
            </Form.Item>

            <Divider></Divider>

            <></>
          </Form>
        </div>
      </Modal>
      <Modal
        okButtonProps={
          {
            // disabled: isLoading || !checked || !addButtonDisabled,
          }
        }
        title="Редактирование"
        centered
        open={open}
        cancelText="отмена"
        okType={"default"}
        okText="Сохранить изменения"
        footer={null}
        onOk={async () => {}}
        onCancel={() => {
          setOpen(false);
          setItem(1);
        }}
      >
        <div className="flex justify-center ">
          {currentRemoveditem && (
            <div className="flex flex-col">
              <Tabs
                type="card"
                defaultActiveKey={String(item)}
                items={items}
                // onChange={onChange}
              />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        okButtonProps={{}}
        title="Печать Ярлыка"
        centered
        open={openTags}
        cancelText="отмена"
        okType={"default"}
        okText="Закрыть "
        onOk={async () => {}}
        width={"60%"}
        onCancel={() => setOpenTags(false)}
        footer={null}
      >
        <GeneretedTagspdf />
      </Modal>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default RemovedItemsList;
