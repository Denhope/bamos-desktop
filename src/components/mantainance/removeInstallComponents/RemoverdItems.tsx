import { ModalForm, ProColumns, ProForm } from "@ant-design/pro-components";
import { ConfigProvider, DatePicker, MenuProps, Tag, message } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, ReactNode, useEffect, useState } from "react";

import {
  DownloadOutlined,
  StopOutlined,
  SettingOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  createSingleRequirement,
  getFilteredProjectTasks,
  getFilteredRemoverdItems,
  getFilteredRemoverdItemsForPrint,
  updateRemovedItemByIds,
  updateRequirementByID,
} from "@/utils/api/thunks";
import { exportToExcel } from "@/services/utilites";
import DrawerPanel from "@/components/shared/DrawerPanel";
import RemoveInstallAddForm from "./RemoveInstallAddForm";
import ChangeFormItem from "./ChangeFormItem";
import UserSearchProForm from "@/components/shared/form/UserSearchProForm";
import { UserResponce } from "@/models/IUser";
import GeneretedTagspdf from "@/components/pdf/GeneretedTagspdf";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
type FilteredRemoverdItemsListPropsType = {
  data: any;
  projectData: any;
  scroll: number;
  scrollX: number;
  isLoading: boolean;
  onIssuedClick: (record: any) => void;
};
const RemoverdItems: FC<FilteredRemoverdItemsListPropsType> = ({
  projectData,
  scrollX,
  // isLoading,
  scroll,
}) => {
  const handleReset = () => {
    setSelectedUser(null); // сбросить выбранного пользователя
    setReset(true); // установить reset в true при сбросе
  };
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  const [openTags, setOpenTags] = useState(false);
  const [reset, setReset] = useState(false); //
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [dataFiltered, setDataFiltered] = useState<any[]>([]);
  const [openAddGroupForm, setOpenAddGroupForm] = useState(false);
  const [openCloseForm, seOpenCloseForm] = useState(false);
  const [openOpenForm, seOpenOpenForm] = useState(false);
  const [initialMaterialsRequirements, setInitialRemoverdItems] = useState<
    any[]
  >([]);
  const [issuedChangeDrawer, setOpenChangeDrawer] = useState(false);
  const [currenItem, setCurrenItem] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { RangePicker } = DatePicker;
  const { projectFilteredRemoverdItems } = useTypedSelector(
    (state) => state.mtbase
  );
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  const { isLoading } = useTypedSelector((state) => state.mtbase);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          getFilteredRemoverdItems({
            companyID: companyID,
            projectId: projectData._id,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          // console.log(result.payload);

          result.payload.length
            ? setDataSource(result.payload)
            : setDataSource([]);
          setInitialRemoverdItems(result.payload);
        }
      }
    };
    fetchData();
  }, [dispatch]);
  useEffect(() => {
    setDataSource(projectFilteredRemoverdItems);
  }, [projectFilteredRemoverdItems]);
  const allZones = Array.from(
    new Set(dataSource.map((item: any) => item.removeItem.zone))
  );
  const allSubZones = Array.from(
    new Set(dataSource.map((item: any) => item.removeItem.subZone))
  );
  const allSubTypes = Array.from(
    new Set(dataSource.map((item: any) => item.type))
  );
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
    {
      label: `${t("Add New Item")}`,
      key: "add",
      icon: <PlusOutlined />,
      onClick: () => {
        setOpenAddGroupForm(true);
      },
    },
    {
      label: `${t("Print")}`,
      key: "print",
      icon: null,
      children: [
        getItem("Print Tags", "sub4.1", null, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                const companyID = localStorage.getItem("companyID");

                if (companyID) {
                  const result = await dispatch(
                    getFilteredRemoverdItemsForPrint({
                      companyID: companyID,
                      projectId: projectData._id,
                      ids: selectedRowKeys,
                    })
                  );
                  if (result.meta.requestStatus === "fulfilled") {
                    // console.log(result.payload);

                    result.payload.length
                      ? setDataFiltered(result.payload)
                      : setDataFiltered([]);
                  }
                }

                setOpenTags(true);
              }}
            >
              <PrinterOutlined /> Selected Items
            </div>,
            "9ssxs"
          ),
          // getItem(
          //   <div onClick={() => setOpenTags(true)}>
          //     <PrinterOutlined /> All Items
          //   </div>,
          //   '9ssxs'
          // ),
        ]),

        // ]),
      ],
    },

    {
      label: `${t("Export")}`,
      key: "export",
      icon: null,
      children: [
        getItem("Export to Exel", "sub5", "", [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  dataSource,
                  `Filtred-WOTasks-${projectData?.projectName}`
                )
              }
            >
              <DownloadOutlined /> Selected Items
            </div>,
            "5.1"
          ),
          getItem(
            <div
              onClick={() =>
                dataSource.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  dataSource,
                  `ALL-REMOVED-ITEMS-${projectData?.projectName}`
                )
              }
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
      icon: null,
      children: [
        getItem("Update Status selected items", "subydd09", "", [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                seOpenOpenForm(true);
              }}
            >
              Open
            </div>,
            "9sasyhqss"
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error("Please select  Items.");
                  return;
                }
                seOpenCloseForm(true);
              }}
            >
              Closed
            </div>,
            "9sasyssshqss"
          ),
        ]),
      ],
    },
  ];
  const initialColumns: ProColumns<any>[] = [
    {
      title: "",
      dataIndex: "readyStatus",
      key: "readyStatus",
      width: "3%",
      editable: (text, record, index) => {
        return false;
      },
      valueType: "select",

      filters: true,
      onFilter: true,
      valueEnum: {
        "not Ready to close": { text: "NOT READY TO CLOSE" },
        "Ready to close": { text: "READY TO CLOSE" },
      },
      render: (text: any, record: any) => {
        let color =
          record.readyStatus === "not Ready to close" ? "red" : "green";
        return (
          <>
            <Tag
              color={color}
              style={{ borderRadius: "50%", width: "16px", height: "16px" }}
            />{" "}
          </>
        );
      },
    },
    {
      title: `${t("ACCESS/P/N")}`,
      width: "8%",
      dataIndex: "accessNbr",
      key: "accessNbr",
      responsive: ["sm"],
      sorter: (a: any, b: any) => a.accessNbr.localeCompare(b.accessNbr),
      // width: '9%',
      render: (_, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              setOpenChangeDrawer(true);
              setCurrenItem(record);

              // onReqClick(record);
            }}
          >
            {record.accessNbr && record.accessNbr}
          </a>
        );
      },
      ...useColumnSearchProps({
        dataIndex: "accessNbr",

        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item: any) =>
              item.accessNbr
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(initialMaterialsRequirements);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t("Status")}`,
      dataIndex: "status",

      key: "status",
      // width: '9%',
      editable: (text, record, index) => {
        return false;
      },

      filters: true,
      onFilter: true,
      valueType: "select",
      filterSearch: true,
      valueEnum: {
        open: { text: "OPEN", status: "Error" },
        inProgress: { text: "IN PROGRESS", status: "Processing" },
        closed: { text: "CLOSED", status: "Success" },
      },
    },
    {
      title: `${t("DISCRIPTIONS")}`,
      dataIndex: ["removeItem", "description"],
      key: "description",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },

      // width: '9%',

      responsive: ["lg"],
    },
    {
      title: `${t("REFERENCE")}`,
      dataIndex: "referenceSum",
      key: "referenceSum",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (_, record) => {
        return record.referenceSum.join(", ");
      },
      responsive: ["lg"],
    },
    {
      title: `${t("TYPE")}`,
      dataIndex: "type",
      key: "type",
      editable: (text, record, index) => {
        return false;
      },

      valueType: "select",
      filters: Array.from(
        new Set(
          dataSource.map((item: { type: any }) =>
            String(item.type).toUpperCase()
          )
        )
      ).map((value) => ({ text: value, value })),
      onFilter: (value, record) =>
        typeof record.type === "string" && typeof value === "string"
          ? record.type.toLowerCase().includes(value.toLowerCase())
          : false,
    },

    {
      title: `${t("ZONE")}`,
      dataIndex: ["removeItem", "zone"],
      key: "zone",
      editable: (text, record, index) => {
        return false;
      },

      filters: allZones.map((value) => ({
        text: value as ReactNode,
        value: value as string,
      })),
      onFilter: (value, record) =>
        Array.isArray(record.removeItem)
          ? record.removeItem.some((item: any) => item.zone === value)
          : record.removeItem.zone === value,
    },
    {
      title: `${t("SUB ZONE")}`,
      ellipsis: true,
      dataIndex: ["removeItem", "subZone"],
      key: "subZone",
      editable: (text, record, index) => {
        return false;
      },

      filters: allSubZones.map((value) => ({
        text: value as ReactNode,
        value: value as string,
      })),
      onFilter: (value, record) =>
        Array.isArray(record.removeItem)
          ? record.removeItem.some((item: any) => item.subZone === value)
          : record.removeItem.subZone === value,
    },

    {
      title: `${t("REMOVE SERIAL")}`,
      dataIndex: ["removeItem", "serialNbr"],
      key: "serialNbr",
      responsive: ["sm"],
      // width: '9%',
    },
    {
      title: `${t("REMOVE DATE")}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "removeDate",
      key: "removeDate",
      // width: '7%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.removeDate && b.removeDate) {
          const aFinishDate = new Date(a.removeDate);
          const bFinishDate = new Date(b.removeDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
    {
      title: `${t("INSTALL SERIAL")}`,
      dataIndex: ["installItem", "serialNbr"],
      key: "serialNbr",
      responsive: ["sm"],
      // width: '9%',
    },
    {
      title: `${t("INSTALL DATE")}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "installDate",
      key: "installDate",
      width: "9%",
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.installDate && b.installDate) {
          const aFinishDate = new Date(a.installDate);
          const bFinishDate = new Date(b.installDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
  ];
  return (
    <div className="flex my-0 mx-auto flex-col  h-[73vh] relative overflow-hidden">
      <EditableTable
        recordCreatorProps={false}
        xScroll={scrollX}
        data={dataSource}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {}}
        yScroll={scroll}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={async function (): Promise<void> {
          try {
            const companyID = localStorage.getItem("companyID");
            const result = await dispatch(
              getFilteredRemoverdItems({
                companyID: companyID || "",
                projectId: projectData._id,
              })
            );
          } catch (error) {
            console.error(error);
          }
        }}
      ></EditableTable>
      <DrawerPanel
        title={t(`New item`)}
        size={"medium"}
        placement={"right"}
        open={openAddGroupForm}
        onClose={setOpenAddGroupForm}
        getContainer={false}
      >
        <RemoveInstallAddForm projectData={projectData}></RemoveInstallAddForm>
      </DrawerPanel>{" "}
      <ModalForm
        title={`Remove/Unstall Form`}
        size={"small"}
        // placement={'bottom'}
        open={issuedChangeDrawer}
        submitter={false}
        width={"60vw"}
        onOpenChange={setOpenChangeDrawer}
        // getContainer={false}
      >
        <ChangeFormItem currentItem={currenItem} />
      </ModalForm>
      {/*  */}{" "}
      <ModalForm
        title={`Open Form`}
        size={"small"}
        // placement={'bottom'}
        open={openOpenForm}
        submitter={false}
        // width={'60vw'}
        onOpenChange={seOpenOpenForm}
        // getContainer={false}
      >
        <ProForm
          onReset={handleReset}
          onFinish={async (values) => {
            const companyID = localStorage.getItem("companyID");
            // console.log(selectedRowKeys);
            const result = await dispatch(
              updateRemovedItemByIds({
                companyID: companyID || "",
                updateDate: new Date(),
                updateUserID: selectedUser?._id || "",
                status: "open",
                ids: selectedRowKeys,
                removeDate: new Date(),

                removeManId: USER_ID || "",
              })
            );
            if (result.meta.requestStatus === "fulfilled") {
              const result = await dispatch(
                getFilteredRemoverdItems({
                  companyID: companyID || "",
                  projectId: projectData._id,
                })
              );
            }
          }}
        >
          <UserSearchProForm
            performedName={null}
            performedSing={null}
            onUserSelect={(user) => {
              setSelectedUser(user);
              setReset(false);
            }}
            actionNumber={null}
            reset={reset}
          />
        </ProForm>
      </ModalForm>{" "}
      <ModalForm
        title={`Close Fotm`}
        size={"small"}
        // placement={'bottom'}
        open={openCloseForm}
        submitter={false}
        // width={'60vw'}
        onOpenChange={seOpenCloseForm}
        // getContainer={false}
      >
        <ProForm
          onReset={handleReset}
          onFinish={async (values) => {
            const companyID = localStorage.getItem("companyID");
            // console.log(selectedRowKeys);
            const result = await dispatch(
              updateRemovedItemByIds({
                companyID: companyID || "",
                updateDate: new Date(),
                updateUserID: selectedUser?._id || "",
                status: "closed",
                ids: selectedRowKeys,
                installDate: new Date(),
                installManId: USER_ID || "",
              })
            );
            if (result.meta.requestStatus === "fulfilled") {
              const result = await dispatch(
                getFilteredRemoverdItems({
                  companyID: companyID || "",
                  projectId: projectData._id,
                })
              );
            }
          }}
        >
          <UserSearchProForm
            performedName={null}
            performedSing={null}
            onUserSelect={(user) => {
              setSelectedUser(user);
              setReset(false);
            }}
            actionNumber={null}
            reset={reset}
          />
        </ProForm>
      </ModalForm>
      <ModalForm
        title="Tags Print"
        open={openTags}
        onOpenChange={setOpenTags}
        // width={'60%'}
        submitter={false}
      >
        <GeneretedTagspdf data={dataFiltered} projectData={projectData} />
      </ModalForm>
    </div>
  );
};

export default RemoverdItems;
