import {
  Button,
  DatePicker,
  Drawer,
  DrawerProps,
  Empty,
  FloatButton,
  Form,
  Input,
  InputRef,
  Select,
  Skeleton,
  Space,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ColumnType, ColumnsType, TableProps } from "antd/es/table";
import Table from "antd/lib/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IProjectTaskAll } from "@/models/IProjectTask";
import { FC, useEffect, useRef, useState } from "react";
import get from "lodash.get";
import {
  featchFilteredTasksByProjectId,
  featchFilteredNRCProject,
  getAllProjectTaskAplications,
  getAllProjectTaskMaterialsForStatistic,
} from "@/utils/api/thunks";

import {
  setCurrentProjectTask,
  setCurrentProjectTaskInstrument,
  setCurrentProjectTaskMaterial,
  setCurrentProjectTaskMaterialRequest,
  setInitialProjecttaskMaterialRequest,
  setMaterialForPrint,
  setProjectTaskInspectionScope,
  setProjectTaskNotIncludePanels,
  setProjectTaskPanels,
  setProjectTaskZones,
} from "@/store/reducers/ProjectTaskSlise";

import { TDifficulty } from "@/models/IAdditionalTask";
import {
  compareForPrint,
  filterMaterial,
  filteredIncludePanels,
  filteredInstrument,
  filteredNotIncludePanels,
  filteredZones,
  inspectionScopes,
} from "@/services/utilites";
import React from "react";
import Highlighter from "react-highlight-words";
import { FilterConfirmProps } from "antd/es/table/interface";
import NRCView from "../activeTask/NRCView";
import ActiveProjectTaskView from "../activeTask/ActiveProjectTaskView";
import moment from "moment";
import Navigation from "@/components/shared/NavigationPanel";
import { useTranslation } from "react-i18next";
// import Store from '@/components/pages/Store';

export interface IProjectTaskListPrors {
  filter: TDifficulty;
}
const sortOptions = [
  {
    label: "Sort by date ascending",
    value: "date-asc",
  },
  {
    label: "Sort by date descending",
    value: "date-desc",
  },
];

const ProjectTaskListView: FC<IProjectTaskListPrors> = ({ filter }) => {
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

  const { NRCViewMode, currentProjectTask } = useTypedSelector(
    (state) => state.projectTask
  );
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const { RangePicker } = DatePicker;
  const { isProjectTAskListFull } = useTypedSelector(
    (state) => state.viewsStore
  );

  const dateFormat = "YYYY.MM.DD";

  const { ProjectsTask, isLoading } = useTypedSelector(
    (state) => state.projectTask
  );
  const { currentProject } = useTypedSelector((state) => state.projects);
  const { allMaterials } = useTypedSelector((state) => state.material);
  const { allInstruments } = useTypedSelector((state) => state.instrument);
  const { allPanels, allZones, inspectionScope } = useTypedSelector(
    (state) => state.tasks
  );
  const { t } = useTranslation();
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
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      featchFilteredTasksByProjectId({
        projectId: currentProject.id || "",
        filter: filter,
      })
    );
    dispatch(
      featchFilteredNRCProject({
        projectId: currentProject.id || "",
      })
    );
  }, [currentProject.id]);
  const searchInput = useRef<InputRef>(null);
  type DataIndex = keyof any;
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

  const columns: ColumnsType<any> = [
    {
      title: `${t("W/O")}`,
      dataIndex: "projectTaskWO",
      key: "projectTaskWO",
      // responsive: ['lg'],
      width: "7%",
      sorter: (a, b) => (a.projectTaskWO || 0) - (b.projectTaskWO || 0),
      ...getColumnSearchProps("projectTaskWO"),
    },
    {
      title: "Номер",
      dataIndex: ["optional", "taskNumber"],
      key: "taskNumber",
      // responsive: ['lg'],
      width: "12%",
      ...getColumnSearchProps(["optional", "taskNumber"]),
    },
    {
      title: "AMM",
      dataIndex: ["taskId", "amtossNewRev"],
      key: "amtossNewRev",
      // responsive: ['lg'],
      width: "14%",
    },
    {
      title: "Код",
      dataIndex: ["taskId", "code"],
      key: "code",
      width: "7%",
      responsive: ["lg"],
      filters: [
        { text: "FC", value: "FC" },
        { text: "RS", value: "RS" },
        { text: "GVI", value: "GVI" },
        { text: "DET", value: "DET" },
        { text: "VC", value: "VC" },
        { text: "LU", value: "LU" },
        { text: "OP", value: "OP" },
        { text: "SDI", value: "SDI" },
        { text: "OP", value: "OP" },
        { text: "NDT", value: "NDT" },
      ],
      filterSearch: true,

      onFilter: (value: any, record: any) =>
        record?.taskId?.code?.startsWith(String(value)),
    },
    {
      title: "Зона",
      dataIndex: ["taskId", "area"],
      key: "area",
      width: "7%",
      responsive: ["lg"],
      // ...getColumnSearchProps(['taskId', 'area']),
    },

    {
      title: "Описание",
      dataIndex: ["optional", "taskDescription"],
      key: "taskDescription",
      // responsive: ['lg'],

      ...getColumnSearchProps(["optional", "taskDescription"]),
    },

    {
      title: "Дата",
      dataIndex: "finishDate",
      key: "finishDate",
      width: "7%",
      responsive: ["lg"],
      render(text: Date) {
        return text && moment(text).format("DD.MM.YY");
      },
    },

    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: "7%",
      // responsive: ['lg'],
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
    },
  ];

  const rowClassName = (record: IProjectTaskAll) => {
    return record._id === selectedRowKey
      ? "cursor-pointer text-xs text-transform: uppercase bg-blue-400 "
      : "cursor-pointer text-xs text-transform: uppercase ";
  };

  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );
  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <div className="mx-auto flex flex-col">
      {/* <div className=" flex flex-col  my-0 flex-wrap gap-1  sm:flex-row "></div> */}
      {/* <div style={{ height: '30vh', overflowY: 'scroll' }}> */}{" "}
      <Table
        className="py-0 my-0 "
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              showLargeDrawer();
              setSelectedRowKey(record?._id || record?.id);
              dispatch(setCurrentProjectTask(record));

              if (record.materialReuestAplications) {
                dispatch(
                  setInitialProjecttaskMaterialRequest(
                    record.materialReuestAplications
                  )
                );
                dispatch(
                  getAllProjectTaskAplications(record?._id || record?.id || "")
                );
              } else {
                dispatch(setInitialProjecttaskMaterialRequest([]));
              }

              let matRequest = filterMaterial(record, allMaterials);
              let mat = filterMaterial(record, allMaterials);
              let instr = filteredInstrument(record, allInstruments);
              //let panels = filteredIncludePanels(record, allPanels);
              // let zones = filteredZones(record, allZones);
              // let notIncludepanels = filteredNotIncludePanels(
              //   record,
              //   allPanels
              // );
              let inspections = inspectionScopes(record, inspectionScope);

              mat.map((item, index) => {
                if (!item["alternative"]) {
                  item["alternative"] = "-";
                }
                if (!item["nameOfMaterial"]) {
                  item["alternative"] = "-";
                }
                delete item.workInterval;
                delete item.startOfWork;
                delete item.note1;
                delete item.note;
                delete item.taskNumber;
                delete item.id;
                delete item.amtoss;
                // delete item.code;
                // item['id'] = String(index + 1);
                // item['code'] = item.code;
              });
              matRequest.map((item, index) => {
                delete item.id;

                // delete item.code;
                item["id"] = String(index + 1);
                // item['code'] = item.code;
              });

              instr.map((item, index) => {
                delete item.workInterval;
                delete item.startOfWork;
                delete item.note1;
                delete item.note;
                delete item.id;
                delete item.taskNumber;
                delete item.amtoss;
              });

              dispatch(setCurrentProjectTaskMaterial(mat));

              dispatch(setCurrentProjectTaskMaterialRequest(matRequest));
              dispatch(setCurrentProjectTaskInstrument(instr));

              dispatch(setProjectTaskInspectionScope(inspections));
              const result = await dispatch(
                getAllProjectTaskMaterialsForStatistic({
                  projectWO: record.projectWO || 0,
                  projectTaskWO: record.projectTaskWO || 0,
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
        rowKey={"_id"}
        size="small"
        // rowSelection={{}}
        columns={columns}
        pagination={{ defaultPageSize: 100 }}
        bordered
        //onChange={onChange}
        scroll={
          { y: "calc(63vh)" }
          // !isProjectTAskListFull ? { y: 'calc(55vh)' } : { y: 'calc(25vh)' }
        }
        dataSource={isLoading ? [] : ProjectsTask}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <Drawer
        placement="right"
        size={size}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
      >
        <div className="">
          {!NRCViewMode && currentProjectTask && currentProjectTask.ownerId && (
            <ActiveProjectTaskView tab={"1"} />
          )}
          {NRCViewMode &&
            currentAdditionalTask &&
            currentAdditionalTask.ownerId && <NRCView tab={"1"} />}
        </div>
      </Drawer>{" "}
    </div>
    // </div>
  );
};

export default ProjectTaskListView;
