import React, { FC, useState } from "react";
import {
  AppstoreOutlined,
  DownloadOutlined,
  SettingOutlined,
  PlusOutlined,
  FilterOutlined,
  PrinterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Table,
  Checkbox,
  Space,
  Row,
  Empty,
  Spin,
  MenuProps,
  Button,
  Divider,
  DatePicker,
  message,
} from "antd";

import { IPlaneTask, IPlaneTaskResponce } from "@/models/ITask";
import moment from "moment";

import NavigationPanel from "@/components/shared/NavigationPanel";
import DrawerPanel from "@/components/shared/DrawerPanel";
import FIlteredTaskForm from "./FIlteredTaskForm";
import AddForm from "./AddForm";
import AddTaskPackageform from "./AddTaskPackageform";
import TabContent from "@/components/shared/Table/TabContent";
import { IPlaneWO } from "@/models/IPlaneWO";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  getFilteredPlanesTasksForDueUpdate,
  getFilteredPlanesTasksForUpdate,
  updatePlaneTasksByIds,
} from "@/utils/api/thunks";
import { AsyncThunkAction, Dispatch, AnyAction } from "@reduxjs/toolkit";
import toast, { Toaster } from "react-hot-toast";
import WOAddForm from "../wo/WOAddForm";
import Title from "antd/es/typography/Title";
import { useTranslation } from "react-i18next";

type PlaneTaskListPropsType = {
  data: any[];
  isLoading: boolean;
  onRowClick: (record: IPlaneWO) => void;
};
const PlaneTaskList: FC<PlaneTaskListPropsType> = ({
  onRowClick,
  data,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  interface DataType {
    key: React.Key;
    taskNumber: string;
    partNbr?: string;
    partSerialNbr?: string;
    MOS?: string;
    HRS?: string;
    intervalMOC?: string;
    intervalHRS?: string;
    intervalAHL?: string;
  }

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

  const initialColumns = [
    {
      title: "PN/SN",
      dataIndex: "pn",
      key: "pn",
      render: (text: any, record: any) =>
        record.partNbr || record.partSerialNbr,
      width: "17%",
      className: "rounded-tl-none",
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      render: (text: any, record: any) =>
        record.MOS || record.HRS || record.AFL,
    },
    {
      title: `${t("Interval")}`,
      dataIndex: "interval",
      key: "interval",
      render: (text: any, record: any) =>
        record.intervalMOC || record.intervalHRS || record.intervalAHL,
    },
    {
      title: "C/W",
      dataIndex: "C/W",
      key: "C/W",
      render: (text: any, record: any) =>
        record.completeDAYS ||
        record.completeHRS ||
        record.completeHRSENC ||
        record.completeHRSAPUS ||
        record.completeAFL ||
        record.completeENC ||
        record.completeAPUS,
    },
    {
      title: `${t("Next Due(ENG/APU)A/C")}`,
      dataIndex: "due",
      key: "due",
      render: (text: any, record: any) =>
        record.nextDueMOS ||
        record.nextDueHRS ||
        record.nextDueAFL ||
        record.nextDueENC ||
        record.nextdueAPUS,
    },
    {
      title: `${t("Max. Limit")}`,
      dataIndex: "max",
      key: "max",
      render: (text: any, record: any) =>
        record.maxLimitMOS ||
        record.maxLimitHRS ||
        record.maxLimitHRSENG ||
        record.maxLimitHRSAPUS ||
        record.maxLimitAFL ||
        record.maxLimitAFLENC ||
        record.maxLimitAFLAPUS,
    },
    {
      title: `${t("Remaining")}`,
      dataIndex: "remaining",
      key: "remaining",
      render: (text: any, record: any) =>
        record.timeRemainingDays ||
        record.timeRemainingHRS ||
        record.timeRemainingHRSENC ||
        record.timeRemainingHRSAPUS ||
        record.timeRemainingAFL ||
        record.timeRemainingENC ||
        record.timeRemainingAPUS,
    },
    {
      title: `${t("Time Accrued")}`,
      dataIndex: "accrued",
      key: "accrued",
      className: "rounded-tr-none",
      render: (text: any, record: any) =>
        record.timeAccruedMOS ||
        record.timeAccruedHRS ||
        record.timeAccruedHRSENC ||
        record.timeAccruedHRSAPUS ||
        record.timeAccruedAFL ||
        record.timeAccruedAPUS ||
        record.timeAccruedENC,
    },
  ];

  const { planesWO } = useTypedSelector((state) => state.planes);
  const [openTaskFilterForm, setopenTaskFilterForm] = useState(false);
  const [openAddPackForm, setOpenAddPackForm] = useState(false);
  const [openAddTaskForm, setOpenAddtaskForm] = useState(false);
  const [openAddGroupForm, setOpenAddGroupForm] = useState(false);
  const [openEditTaskForm, setOpenEditTaskForm] = useState(false);
  const [openTaskDrawer, setOpenTaskDrawer] = useState(false);
  const dataTab = [
    data &&
      data.map((planeTask: IPlaneTaskResponce) => ({
        key: planeTask._id || planeTask.id,
        regNbr: planeTask.regNbr,
        status: planeTask.status,
        taskNbr: planeTask.taskNbr,
        description: planeTask.description,
        workOrderNbr: planeTask.workOrderNbr,
        workOrderID: planeTask.workOrderID,
        ata: planeTask.ata,
        disposition: planeTask.disposition,

        children: [
          {
            key: planeTask._id || planeTask.id,
            partNbr: planeTask.partNbr && <>PN: {planeTask.partNbr}</>,
            MOS: "MOS",

            intervalMOC: planeTask.toleranceMOS ? (
              <div className="text-lime-500 hover:normal-case">
                {planeTask.intervalMOS}(+{planeTask.toleranceMOS}/-
                {planeTask.toleranceMOS})
              </div>
            ) : (
              <div className="text-lime-500">{planeTask.intervalMOS}</div>
            ),

            completeDAYS: (
              <a>
                {planeTask.completeMOS &&
                  moment(planeTask?.completeMOS).format("DD-MMM-YY")}
              </a>
            ),

            nextDueMOS:
              planeTask.nextDueMOS &&
              moment(planeTask.nextDueMOS).format("DD-MMM-YY"),
            maxLimitMOS:
              planeTask.maxLimitMOS &&
              moment(planeTask.maxLimitMOS).format("DD-MMM-YY"),
            timeRemainingDays:
              planeTask.timeRemainingDAYS &&
              planeTask.intervalMOS &&
              planeTask.timeRemainingDAYS > 0 ? (
                <>
                  <div>
                    {planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS > planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS}{" "}
                    {planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS > planeTask.toleranceMOS && (
                        <a className="text-lime-500 hover:no-underline inline ">
                          (+{planeTask.toleranceMOS})
                        </a>
                      )}
                    {planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS <= planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS}{" "}
                    {planeTask.toleranceMOS &&
                      planeTask.timeRemainingDAYS <= planeTask.toleranceMOS && (
                        <a className="text-orange-600">
                          (+{planeTask.toleranceMOS})
                        </a>
                      )}
                    {!planeTask.toleranceMOS && planeTask.timeRemainingDAYS}{" "}
                  </div>
                </>
              ) : (
                planeTask.intervalMOS &&
                planeTask.completeMOS && (
                  // planeTask.timeRemainingDAYS! > 0 &&
                  <div className="text-rose-600 ">OVD</div>
                )
              ),

            timeAccruedMOS: planeTask.timeAccruedDAYS,
          },
          {
            key: "1-2",
            partSerialNbr: planeTask.partSerialNbr && (
              <>
                SN: <a> {planeTask.partSerialNbr}</a>{" "}
              </>
            ),

            HRS: "HRS",
            intervalHRS: planeTask.toleranceMHS ? (
              <div className="text-lime-500">
                {planeTask.intervalHRS}(+{planeTask.toleranceMHS}/-
                {planeTask.toleranceMHS})
              </div>
            ) : (
              <div className="text-lime-500">{planeTask.intervalHRS}</div>
            ),
            completeHRS: planeTask.completeHRS,
            nextDueHRS: planeTask.nextDueHRS,
            maxLimitHRS: planeTask.maxLimitHRS,
            // timeRemainingHRS: planeTask.timeRemainingHRS,
            timeRemainingHRS: planeTask.toleranceMHS ? (
              <>
                <div className="inline">{planeTask.timeRemainingHRS}</div>
                <div className="text-lime-500 hover:no-underline inline">
                  (+{planeTask.toleranceMHS})
                </div>
              </>
            ) : (
              <div className="">{planeTask.timeRemainingHRS}</div>
            ),

            timeAccruedHRS: planeTask.timeAccruedHRS,
          },
          {
            key: "1-3",

            intervalAHL: planeTask.toleranceAFL ? (
              <div className="text-lime-500 hover:no-underline inline">
                {planeTask.intervalAFL}(+{planeTask.toleranceAFL}/-
                {planeTask.toleranceAFL})
              </div>
            ) : (
              <div className="text-lime-500">{planeTask.intervalAFL}</div>
            ),
            AFL: "AFL",
            completeAFL: planeTask.completeAFL,
            nextDueAFL: planeTask.nextDueAFL,
            maxLimitAFL: planeTask.maxLimitAFL,
            // timeRemainingAFL: planeTask.timeRemainingAFL,
            timeRemainingAFL:
              planeTask.timeRemainingAFL &&
              planeTask.intervalAFL &&
              planeTask.timeRemainingAFL > 0 ? (
                <>
                  <div>
                    {planeTask.toleranceAFL &&
                      planeTask.timeRemainingAFL > planeTask.toleranceAFL &&
                      planeTask.timeRemainingAFL}{" "}
                    {planeTask.toleranceAFL &&
                      planeTask.timeRemainingAFL > planeTask.toleranceAFL && (
                        <a className="text-lime-500 hover:no-underline inline ">
                          (+{planeTask.toleranceAFL})
                        </a>
                      )}
                    {planeTask.toleranceAFL &&
                      planeTask.timeRemainingAFL < planeTask.toleranceAFL && (
                        <a className="text-orange-600">
                          (+{planeTask.toleranceAFL})
                        </a>
                      )}
                    {!planeTask.toleranceAFL && planeTask.timeRemainingAFL}{" "}
                  </div>
                </>
              ) : (
                planeTask.intervalAFL &&
                planeTask.completeAFL && (
                  <div className="text-rose-600 ">OVD</div>
                )
              ),

            timeAccruedAFL: planeTask.timeAccruedAFL,
          },
        ],
      })),
  ];
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<IPlaneTaskResponce>();
  const [columns, setColumns] = useState(initialColumns);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const toggleColumn = (columnKey: any) => {
    setColumns((prevColumns: any) =>
      prevColumns.some((column: any) => column.key === columnKey)
        ? prevColumns.filter((column: any) => column.key !== columnKey)
        : [
            ...prevColumns,
            initialColumns.find((column) => column.key === columnKey),
          ]
    );
  };

  const newMenuItems = planesWO.map(
    (wo) =>
      wo.status == "OPEN" &&
      selectedRowKeys.length > 0 &&
      getItem(
        wo.status == "OPEN" && (
          <div
            onClick={async () => {
              const result = await dispatch(
                updatePlaneTasksByIds({
                  ids: selectedRowKeys,
                  workOrderID: wo._id,
                  workOrderNbr: wo.WONbr,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                if (
                  localStorage.getItem("selectedKeys") &&
                  localStorage.getItem("selectedKeys") ===
                    '["/maintenance/mtx/task"]'
                ) {
                  dispatch(
                    getFilteredPlanesTasksForUpdate(
                      localStorage.getItem("taskSearchUrl") || ""
                    )
                  );
                }
                if (
                  localStorage.getItem("selectedKeys") &&
                  localStorage.getItem("selectedKeys") ===
                    '["/maintenance/mtx/due"]'
                ) {
                  dispatch(
                    getFilteredPlanesTasksForDueUpdate(
                      localStorage.getItem("dueSearchUrl") || ""
                    )
                  );
                }
                toast.success("Task upload");
              }
            }}
          >
            {wo.WONbr}
          </div>
        ),
        wo.WONbr
      )
  );

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: onSelectChange,
  // };
  const items: MenuProps["items"] = [
    // getItem(
    //   localStorage.getItem('selectedKeys') &&
    //     localStorage.getItem('selectedKeys') ===
    //       '["/maintenance/mtx/task"]' && (
    //       <div onClick={() => setopenTaskFilterForm(true)}>
    //         <FilterOutlined /> Filter By
    //       </div>
    //     ),
    //   'filter'
    // ),

    {
      label: `${t("Report")}`,
      key: "print",
      icon: <AppstoreOutlined />,
      children: [
        // getItem('Print Status Report', 'sub4', <PrinterOutlined />, [
        getItem("Print", "sub4.1", "", [
          getItem("Selected Items", "sub4.1.1", <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            "9ssxs"
          ),
        ]),

        getItem("Export to Exel", "sub5", "", [
          getItem(
            <div>
              <DownloadOutlined /> Selected Items
            </div>,
            "5.1"
          ),
          getItem(
            <div
            // onClick={() =>
            //   allAplications.length &&
            //   exportToExcel(
            //     true,
            //     selectedRowKeys,
            //     selectedColumns,
            //     allAplications,
            //     'All Data'
            //   )
            // }
            >
              <DownloadOutlined /> All Items
            </div>,
            "5.2"
          ),
        ]),
      ],
    },

    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: <SettingOutlined />,
      children: [
        getItem("Add Selected Task to Work Order", "sub09", "", [
          getItem(
            <>
              <div onClick={() => setOpenAddWOForm(true)}>
                <PlusOutlined /> New Work Order<Divider></Divider>
              </div>
            </>,
            "9ss"
          ),

          ...newMenuItems,
        ]),

        getItem("Add to Group", "sub09s", "", [
          getItem(
            <div onClick={() => setOpenAddGroupForm(true)}>
              <PlusOutlined /> New Group
            </div>,
            "9sxs"
          ),
        ]),
        getItem(
          <div
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error("Please select only one Item.");
                return;
              }
              setOpenEditTaskForm(true);
            }}
          >
            <EditOutlined></EditOutlined> Edit Selected Task
          </div>,
          "9sxs"
        ),
        getItem("Add New Task", "sub09gts", "", [
          getItem(
            <div onClick={() => setOpenAddtaskForm(true)}>
              <PlusOutlined /> Single Task
            </div>,
            "9sssxs"
          ),
          getItem(
            <div onClick={() => setOpenAddPackForm(true)}>
              <DownloadOutlined /> Download Package
            </div>,
            "9sessxs"
          ),
        ]),
      ],
    },
  ];

  const taskItems: MenuProps["items"] = [
    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: <SettingOutlined />,
      children: [
        getItem("Print", "sub4.13", "", [
          getItem("Quick Print Work Card", "sub4.1.31", <PrinterOutlined />),
          // getItem(
          //   <div
          //   // onClick={() => setOpenAddAppForm(true)}
          //   >
          //     <PrinterOutlined /> All Items
          //   </div>,
          //   '9sscdxs'
          // ),
        ]),
        getItem(
          <div onClick={() => console.log("New Work Order open Form")}>
            <EditOutlined /> Edit
          </div>,
          "9sssxxss"
        ),
        getItem(
          <div onClick={() => console.log("New Wsork Order open Form")}>
            Update
          </div>,
          "9sssxxss"
        ),
        getItem("Update Rewiew Status", "subydd09", "", [
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              Blank
            </div>,
            "9saqss"
          ),
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              In Progress
            </div>,
            "9sasyhqss"
          ),
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              Rewiewed
            </div>,
            "9saqs46ms"
          ),
        ]),

        getItem("Add to Work Order", "suby09", "", [
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              <PlusOutlined /> New Work Order
            </div>,
            "9ss"
          ),
          ...newMenuItems,
        ]),
        getItem("Add to Group", "sub09s", "", [
          getItem(
            <div onClick={() => setOpenAddGroupForm(true)}>
              <PlusOutlined /> New Group
            </div>,
            "9sxs"
          ),
        ]),
        getItem(
          <div onClick={() => console.log("Edit Selected Task open Form")}>
            <EditOutlined></EditOutlined> Edit Selected Task
          </div>,
          "9sxs"
        ),
      ],
    },
  ];
  const [openAddWOForm, setOpenAddWOForm] = useState(false);
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

  return (
    <div className="w-full relative overflow-hidden h-[74vh]">
      <Row>
        <div className="w-3/12">
          <NavigationPanel
            onMenuClick={handleMenuClick}
            columns={columns}
            selectedColumns={selectedColumns}
            menuItems={items}
            selectedRows={selectedRowKeys}
            data={data}
            sortOptions={[]}
            isSorting={false}
            isView={true}
          />
        </div>
        <Space className="ml-auto">
          {/* {selectedRowKeys.length && selectedRowKeys.length > 0 && ( */}
          <Space>
            {t("Selected items")}: {selectedRowKeys.length}
          </Space>
          {/* )} */}

          <Space>
            {t("items")}: {data.length}
          </Space>
        </Space>
      </Row>

      {isLoading && (
        <Spin
          style={{ height: "74vh" }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )}
      {!isLoading && data.length ? (
        <div className=" overflow-y-scroll flex my-0 mx-auto flex-col h-full  ">
          {dataTab &&
            dataTab[0].length > 0 &&
            dataTab[0].map((row: any) => (
              <div key={row.key}>
                <Table<any>
                  // rowSelection={rowSelection}
                  columns={columns}
                  className="my-0 py-0"
                  rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                  dataSource={row.children}
                  bordered
                  pagination={false}
                  size="small"
                  title={() => (
                    <Row className="my-0 py-0" justify="space-between">
                      <Space>
                        <Checkbox
                          className="text-sm font-bold"
                          checked={selectedRowKeys.includes(row.key)}
                          onChange={() =>
                            onSelectChange(
                              selectedRowKeys.includes(row.key)
                                ? selectedRowKeys.filter(
                                    (key) => key !== row.key
                                  )
                                : [...selectedRowKeys, row.key]
                            )
                          }
                        ></Checkbox>
                        <Row className="align-middle">
                          <a
                            onClick={() => {
                              setOpen(true);
                              setItem(row);
                              setOpenTaskDrawer(true);
                            }}
                          >
                            {row.taskNbr}
                          </a>
                          <div className="ml-2"> {row.description}</div>
                        </Row>
                      </Space>
                      <div className="text-xs">Service ATA:{row.ata}</div>
                    </Row>
                  )}
                  footer={() => (
                    <Row justify="space-between">
                      <Row>
                        <div> {t("Disposition")}:</div>
                        <div className=" font-semibold">{row.disposition}</div>
                      </Row>{" "}
                      <div>
                        {" "}
                        {row.workOrderNbr && (
                          <Row>
                            <div>WO#:</div>
                            <a
                              onClick={() => onRowClick(row)}
                              className="font-semibold ml-2"
                            >
                              {row.workOrderNbr}
                            </a>
                          </Row>
                        )}
                      </div>
                    </Row>
                  )}
                />
              </div>
            ))}
        </div>
      ) : (
        <>
          <>{!isLoading && <Empty></Empty>}</>
        </>
      )}
      <DrawerPanel
        title={"FILTERED FORM"}
        size={"medium"}
        placement={"left"}
        open={openTaskFilterForm}
        onClose={setopenTaskFilterForm}
        getContainer={false}
      >
        <FIlteredTaskForm isMenuCollapse={false}></FIlteredTaskForm>
      </DrawerPanel>

      <DrawerPanel
        title={"ADD TASK PACKAGE"}
        size={"medium"}
        placement={"right"}
        open={openAddPackForm}
        onClose={setOpenAddPackForm}
        getContainer={false}
      >
        <AddTaskPackageform></AddTaskPackageform>
      </DrawerPanel>
      <DrawerPanel
        title={"ADD NEW TASK"}
        size={"medium"}
        placement={"right"}
        open={openAddTaskForm}
        onClose={setOpenAddtaskForm}
        getContainer={false}
      >
        <AddForm></AddForm>
      </DrawerPanel>
      <DrawerPanel
        title={"ADD NEW GROUP"}
        size={"medium"}
        placement={"right"}
        open={openAddGroupForm}
        onClose={setOpenAddGroupForm}
        getContainer={false}
      >
        <>ADD GROUP</>
      </DrawerPanel>
      <DrawerPanel
        title={"ADD NEW WO"}
        size={"medium"}
        placement={"right"}
        open={openAddWOForm}
        onClose={setOpenAddWOForm}
        getContainer={false}
      >
        <WOAddForm></WOAddForm>
      </DrawerPanel>
      <DrawerPanel
        title={"EDIT TASK"}
        size={"medium"}
        placement={"right"}
        open={openEditTaskForm}
        onClose={setOpenEditTaskForm}
        getContainer={false}
      >
        <>edit task form</>
      </DrawerPanel>

      <DrawerPanel
        title={`${item?.taskNbr?.toUpperCase()} ###${item?.description?.toUpperCase()}`}
        size={"mediumL"}
        placement={"bottom"}
        open={openTaskDrawer}
        onClose={setOpenTaskDrawer}
        getContainer={false}
        extra={
          <>
            <NavigationPanel
              onMenuClick={handleMenuClick}
              columns={columns}
              selectedColumns={selectedColumns}
              menuItems={taskItems}
              selectedRows={selectedRowKeys}
              data={data}
              sortOptions={[]}
              isSorting={false}
              isView={false}
            />
            <div className=" w-20">{``}</div>
          </>
        }
      >
        <TabContent
          tabs={[
            { content: <>Details Content1</>, title: "Details" },
            { content: <>Related Tasks Content1</>, title: "Related Tasks" },
            { content: <>Req/Parts Content1</>, title: "Req/Parts" },
            { content: <>History Content1</>, title: "History" },
          ]}
        />
      </DrawerPanel>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default PlaneTaskList;
