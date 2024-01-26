import {
  Button,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputRef,
  Modal,
  Skeleton,
  Space,
} from "antd";
import Table, { ColumnsType, TableProps } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import React, { FC, useRef, useState, useEffect } from "react";

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
import ProjectListView from "@/components/views/project/ProjectListView";
type RemovedItemPropsType = {
  data: IRemovedItemResponce[];
};

const RemovedItemsList: FC<RemovedItemPropsType> = ({ data }) => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const { isLoading, currentRemoveditem } = useTypedSelector(
    (state) => state.removedItems
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
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

  const [searchText, setSearchText] = useState("");
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

  const useColumnSearchProps = (
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
          onChange={(e) => {
            setSelectedKeys(e.target?.value ? [e.target.value] : []);
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
        text
      ),
  });
  const columns: ColumnsType<IRemovedItemResponce> = [
    {
      title: "P/N",
      dataIndex: "removeItemName",
      key: "removeItemName",
      responsive: ["sm"],
      width: "9%",
      ...useColumnSearchProps("removeItemName"),
    },
    {
      title: "S/N",
      dataIndex: "removeItemNumber",
      key: "removeItemNumber",
      responsive: ["sm"],
      width: "9%",
    },
    {
      title: "Ссылка",
      dataIndex: "reference",
      key: "reference",
      responsive: ["sm"],
      width: "9%",
      // ...useColumnSearchProps('reference'),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      responsive: ["sm"],
      width: "15%",
      ...useColumnSearchProps("description"),
    },
    {
      title: "Область",
      dataIndex: "area",
      key: "area",
      responsive: ["sm"],
      width: "8%",
      ...useColumnSearchProps("area"),
    },
    {
      title: "Зона",
      dataIndex: "zone",
      key: "zone",
      responsive: ["sm"],

      ...useColumnSearchProps("zone"),
    },
    {
      title: "CFI",
      dataIndex: "position",
      key: "position",
      responsive: ["sm"],
    },

    {
      title: "Дата снятия",
      dataIndex: "removeDate",
      key: "removeDate",
      responsive: ["sm"],
      width: "8%",
    },
    {
      title: "Снял (ФИО)",
      dataIndex: "removeName",
      key: "removeName",
      responsive: ["sm"],
      width: "6%",
    },
    {
      title: "Дата уст.",
      dataIndex: "installDate",
      key: "installDate",
      responsive: ["sm"],
      width: "6",
    },
    {
      title: "S/N",
      dataIndex: "installItemNumber",
      key: "installItemNumber",
      responsive: ["sm"],
      // ...useColumnSearchProps('installItemNumber'),
    },
    {
      title: "Установил (ФИО)",
      dataIndex: "installName",
      key: "installName",
      responsive: ["sm"],
      width: "8%",
      // ...useColumnSearchProps('installName'),
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
  const [open, setOpen] = useState(false);
  const [openTags, setOpenTags] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const [openS, setOpenS] = useState(false);
  const onClose = () => {
    setOpenS(false);
  };
  const dataEmpty: readonly IRemovedItemResponce[] | undefined = [];
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
      <Drawer
        title={`Выбор Пакета`}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={openS}
      >
        {" "}
        <ProjectListView />
      </Drawer>
      <Table
        // onChange={handleChange}
        className="py-0"
        rowSelection={rowSelection}
        pagination={{ defaultPageSize: 100 }}
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columns}
        rowKey="id"
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        // pagination={false}
        size="small"
        scroll={{ y: "calc(70vh)" }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
        onRow={(record, rowIndex) => {
          return {
            onDoubleClick: async (event) => {
              dispatch(
                setCurrentRemovedItem({
                  ...record,
                })
              );
              setOpen(true);
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
        onCancel={() => {
          form2.resetFields();
          form1.resetFields();
          form.resetFields();
          setOpenNew(false);
          form2.resetFields();
          form1.resetFields();
          form.resetFields();
        }}
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
                form2.resetFields();
                form1.resetFields();
                form.resetFields();
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
          form2.resetFields();
          form1.resetFields();
          form.resetFields();
          setOpen(false);
          form2.resetFields();
          form1.resetFields();
          form.resetFields();
        }}
      >
        {currentRemoveditem?._id && (
          <div className="flex justify-center ">
            {currentRemoveditem?._id && (
              <div className="flex flex-col">
                {currentRemoveditem.status == "close" && (
                  <Form
                    form={form}
                    className="w-full"
                    autoComplete="off"
                    onFinish={async (values) => {
                      const result = await dispatch(
                        updateremovedItem({
                          ...currentRemoveditem,
                          _id: currentRemoveditem._id || currentRemoveditem._id,
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
                        form2.resetFields();
                        form1.resetFields();
                        form.resetFields();
                        setOpen(false);
                        dispatch(getAllRemovedItems());
                      } else if (result.meta.requestStatus === "rejected") {
                        toast.error("Информация не добавлена");
                      }
                    }}
                  >
                    <Title level={5}>
                      Снятие {currentRemoveditem?.removeItemName}
                    </Title>

                    <Form.Item
                      rules={[{ required: true }]}
                      label="Ссылка на работу"
                      name="reference"
                    >
                      <Input
                        defaultValue={currentRemoveditem?.reference || ""}
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[{ required: true }]}
                      label="Дата снятия"
                      name="removeDate"
                    >
                      <Input
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
                      <Input />
                    </Form.Item>
                    <Form.Item
                      rules={[{ required: true }]}
                      label="Табельный номер"
                      name="removeSing"
                    >
                      <Input
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
                        defaultValue={
                          currentRemoveditem?.installMan?.name ||
                          localStorage.getItem("name") ||
                          ""
                        }
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Сохранить</Button>
                    </Form.Item>

                    <Divider></Divider>

                    <></>
                  </Form>
                )}
                {currentRemoveditem.status == "open" && (
                  <Form
                    form={form1}
                    className="w-full"
                    autoComplete="off"
                    onFinish={async (values) => {
                      const result = await dispatch(
                        updateremovedItem({
                          ...currentRemoveditem,
                          _id: currentRemoveditem._id || currentRemoveditem._id,
                          // removeItemName: values.removeItemName,
                          installMan: {
                            installSing: values.installSing.trim(),
                            installName: values.installName.trim(),
                          },
                          // removeItemNumber: values.installItemNumber,
                          installDate: values.installDate.trim(),
                          status: "close",
                          installItemNumber: values.installItemNumber,
                          installName: values.installName.trim(),
                        })
                      );
                      if (result.meta.requestStatus === "fulfilled") {
                        toast.success("Информация добавлена");
                        form2.resetFields();
                        form1.resetFields();
                        form.resetFields();
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
                      name="installItemNumber"
                    >
                      <Input
                        defaultValue={currentRemoveditem?.removeItemNumber}
                        allowClear
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[{ required: true }]}
                      label="Табельный номер"
                      name="installSing"
                    >
                      <Input
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
                        defaultValue={
                          currentRemoveditem?.installMan?.installName ||
                          // (currentRemoveditem.status == 'open' &&
                          localStorage.getItem("name") ||
                          ""
                        }
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Сохранить</Button>
                    </Form.Item>
                  </Form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        destroyOnClose={true}
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
