import { SearchOutlined } from "@ant-design/icons";
import get from "lodash.get";

import {
  Button,
  DatePicker,
  Drawer,
  DrawerProps,
  Empty,
  Form,
  Input,
  InputRef,
  List,
  Select,
  Skeleton,
  Space,
} from "antd";
import Table, { ColumnType, ColumnsType } from "antd/es/table";
import { useTypedSelector, useAppDispatch } from "@/hooks/useTypedSelector";
import { IAdditionalTask, TDifficulty } from "@/models/IAdditionalTask";
import moment from "moment";
import React, { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskService from "@/services/taskService";
import { compareForPrint, saveExls } from "@/services/utilites";

import {
  setCurrentAdditionalTask,
  setMaterialForPrint,
} from "@/store/reducers/AdditionalTaskSlice";
import {
  featchFilteredTasksByProjectId,
  featchProjectTasksByProjectId,
  getAllAdditionalTaskAplications,
  getAllAdditionalTaskMaterialsForStatistic,
} from "@/utils/api/thunks";
import ActiveProjectTaskView from "../activeTask/ActiveProjectTaskView";
import NRCView from "../activeTask/NRCView";
import { FilterConfirmProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";

export interface IAdditionalTaskListPrors {
  filter: TDifficulty;
}
const NRCListView: FC<IAdditionalTaskListPrors> = ({ filter }) => {
  const { NRCViewMode, currentProjectTask } = useTypedSelector(
    (state) => state.projectTask
  );
  const getColumnSearchProps = (dataIndex: any): ColumnType<any> => ({
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
          // placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            confirm({ closeDropdown: false });
          }}
          onPressEnter={() => {
            handleSearch(selectedKeys as string[], confirm, dataIndex);
          }}
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
      get(record, dataIndex)
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

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const { NRC, isLoading } = useTypedSelector((state) => state.projectTask);
  const { isProjectTAskListFull } = useTypedSelector(
    (state) => state.viewsStore
  );
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps["size"]>();
  const showDefaultDrawer = () => {
    setSize("default");
    setOpen(true);
  };
  const showLargeDrawer = () => {
    setSize("large");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const { currentProject } = useTypedSelector((state) => state.projects);
  const dispatch = useAppDispatch();
  const history = useNavigate();
  useEffect(() => {
    dispatch(
      featchFilteredTasksByProjectId({
        projectId: currentProject.id || "",
        filter: filter,
      })
    );
  }, [currentProject.id]);
  const dateFormat = "YYYY.MM.DD";
  const [searchedText, setSerchedText] = useState("");
  const [searchedRequest, setSerchedRequest] = useState("");
  const [searchedStatus, setSerchedStatus] = useState("");
  const [searchedZone, setSerchedZone] = useState("");
  const searchInput = useRef<InputRef>(null);
  const { RangePicker } = DatePicker;
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const { t } = useTranslation();
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const columns: ColumnsType<IAdditionalTask> = [
    {
      title: `${t("W/O")}`,
      dataIndex: "additionalNumberId",
      key: "additionalNumberId",
      responsive: ["lg"],
      width: "7%",
      // filteredValue: [searchedText],
      sorter: (a, b) =>
        Number(a.additionalNumberId || 0) - Number(b.additionalNumberId || 0),
      ...getColumnSearchProps("additionalNumberId"),
      // onFilter: (value: any, record: any) => {
      //   return (
      //     String(record.additionalNumberId).includes(value) ||
      //     record.taskHeadLine?.toLowerCase().includes(value.toLowerCase()) ||
      //     record.taskDescription?.toLowerCase().includes(value.toLowerCase())
      //   );
      // },
    },
    {
      title: "Номер",
      dataIndex: "taskHeadLine",
      key: "taskHeadLine",
      responsive: ["lg"],
      width: "13%",
      // filteredValue: [searchedText],
      ...getColumnSearchProps("taskHeadLine"),
    },
    {
      title: "Описание ",
      dataIndex: "taskDescription",
      key: "taskDescription",
      responsive: ["sm"],
      ...getColumnSearchProps("taskDescription"),
      // filteredValue: [searchedText],
    },
    {
      title: "Зона",
      dataIndex: ["optional", "NRCInfo", "zone"],
      key: "area",
      width: "7%",
      responsive: ["lg"],

      ...getColumnSearchProps(["optional", "NRCInfo", "zone"]),
      // filteredValue: [searchedZone],
      // onFilter: (value: any, record: any) => {
      //   if (
      //     record.optional.NRCInfo.zone
      //       ?.toLowerCase()
      //       .includes(value.toLowerCase())
      //   ) {
      //     return record.optional.NRCInfo.zone
      //       .toLowerCase()
      //       .includes(String(value.toLowerCase()));
      //   }
      // },
    },

    // {
    //   title: 'Планируемое дата выполнения',
    //   dataIndex: 'planedStartDate',
    //   key: 'planedStartDate',
    //   responsive: ['sm'],
    // },

    {
      title: "Дата откр.",
      dataIndex: "createDate",
      key: "createDate",
      responsive: ["sm"],
      width: "7%",
      render(text: Date) {
        return text && moment(text).format("DD.MM.YY, HH:mm");
      },
      sorter: (a, b) =>
        moment(a.createDate).unix() - moment(b.createDate).unix(),
    },
    {
      title: "Дата закр.",
      dataIndex: "finishDate",
      key: "finishDate",
      responsive: ["sm"],
      width: "7%",
      render(text: Date) {
        return text && moment(text).format("DD.MM.YY, HH:mm");
      },
      sorter: (a, b) =>
        moment(a.finishDate).unix() - moment(b.finishDate).unix(),
    },

    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: "7%",
      responsive: ["lg"],
      render(text, record) {
        if (text == "выполнен") {
          return {
            props: {
              style: { background: "#09F600" },
            },
            children: <div>{text}</div>,
          };
        } else if (text == "закрыт") {
          return {
            props: {
              style: { background: "#097800" },
            },
            children: <div>{text}</div>,
          };
        } else if (text == "отложен") {
          return {
            props: {
              style: { background: "" },
            },
            children: <div>{text}</div>,
          };
        } else if (text == "в работе") {
          return {
            props: {
              style: { background: "#FBAC05" },
            },
            children: <div>{text}</div>,
          };
        }
      },
      filters: [
        { text: "Выполненные", value: "выполнен" },
        { text: "Закрытые", value: "закрыт" },
        { text: "Неактивные", value: "отложен" },
        { text: "В работе", value: "в работе" },
      ],
      filterSearch: true,
      onFilter: (value, record) => record.status.startsWith(String(value)),

      // filteredValue: [searchedStatus],
      // onFilter: (value: any, record) => {
      //   return record.status.includes(String(value));
      // },
    },
  ];

  const rowClassName = (record: any) => {
    return record._id === selectedRowKey
      ? "cursor-pointer text-xs text-transform: uppercase bg-blue-400"
      : "cursor-pointer text-xs text-transform: uppercase ";
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: any
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  return (
    <div className="flex flex-col">
      <div className="  ml-auto flex flex-col  my-0 flex-wrap gap-1  sm:flex-row ">
        <Button type="primary" onClick={() => saveExls(columns, NRC, "NRC")}>
          Сохранить
        </Button>
      </div>

      <Table
        className="my-1"
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              showLargeDrawer();
              setSelectedRowKey(record?._id || record?.id);
              dispatch(setCurrentAdditionalTask(record));
              dispatch(
                getAllAdditionalTaskAplications(record?._id || record?.id || "")
              );
              TaskService.setCurrentNRCTask(record._id);
              // dispatch(
              //   featchProjectTasksByProjectId({
              //     projectId: record.projectId || '',
              //     projectTaskId: record.projectTaskID,
              //   })
              // );
              const result = await dispatch(
                getAllAdditionalTaskMaterialsForStatistic({
                  projectWO: record.projectWO || 0,
                  projectTaskWO: record.additionalNumberId || 0,
                })
              );

              if (result.meta.requestStatus === "fulfilled") {
                // console.log(result);

                dispatch(setMaterialForPrint(compareForPrint(result.payload)));
              }
            },
          };
        }}
        rowClassName={rowClassName}
        rowSelection={rowSelection}
        rowKey="_id"
        size="small"
        columns={columns}
        bordered
        pagination={{ defaultPageSize: 100 }}
        scroll={
          { y: "calc(60vh)" }
          // !isProjectTAskListFull ? { y: 'calc(55vh)' } : { y: 'calc(25vh)' }
        }
        dataSource={isLoading ? [] : NRC}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <Drawer
        // title={`${size} Drawer`}
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        // extra={
        //   <Space>
        //     <Button onClick={onClose}>Cancel</Button>
        //     <Button type="primary" onClick={onClose}>
        //       OK
        //     </Button>
        //   </Space>
        // }
      >
        <div className="flex mx-auto w-6/6">
          {!NRCViewMode && currentProjectTask && currentProjectTask.ownerId && (
            <ActiveProjectTaskView tab={"1"} />
          )}
          {NRCViewMode &&
            currentAdditionalTask &&
            currentAdditionalTask.ownerId && (
              // localStorage.getItem('activeNRCTask')
              <NRCView tab={"1"} />
            )}
        </div>
      </Drawer>
    </div>
  );
};

export default NRCListView;
