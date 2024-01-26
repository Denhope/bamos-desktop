import React, { FC, useEffect, useState } from "react";
import { MenuProps } from "antd";

import { DownloadOutlined, StopOutlined } from "@ant-design/icons";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { useTranslation } from "react-i18next";
import { exportToExcel } from "@/services/utilites";
import {
  setCurrentAdditionalAction,
  setCurrentAdditionalActionIndexMtb,
  setUpdatedProjectAdditionalTask,
} from "@/store/reducers/MtbSlice";

import { updateAdditionalTask } from "@/utils/api/thunks";
import EditableTable from "@/components/shared/Table/EditableTable";
import { ProColumns } from "@ant-design/pro-components";
import { IActionType } from "@/models/IAdditionalTaskMTB";
import { setCurrentAdditionalTask } from "@/store/reducers/AdditionalTaskSlice";
import { USER_ID } from "@/utils/api/http";

export interface IActionDescriptionListPrors {
  data: IActionType[];
}

const WOActionDescriptionList: FC<IActionDescriptionListPrors> = ({ data }) => {
  const {
    isLoading,
    currentProjectAdditionalTask,
    currentAdditionalAction,
    projectAdditionalTasks,
    currentActiveAdditionalIndex,
  } = useTypedSelector((state) => state.mtbase);
  const [openAddStepForm, setOpenAddStepForm] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [editingDescription, setEditingDescription] = useState("");

  const [editing, setEditing] = useState(false);
  const [editableRecord, setEditableRecord] = useState<IActionType | null>(
    null
  );
  const columns: ProColumns<IActionType>[] = [
    {
      title: `${t("Steps")}`,
      dataIndex: "actionNumber",
      key: "actionNumber",
      responsive: ["sm"],
      width: "9%",
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t("DESCRIPTIONS")}`,
      dataIndex: "actionDescription",
      key: "actionDescription",
      ellipsis: true,

      // },
      responsive: ["sm"],
    },
    {
      title: `${t("PERFOMED")}`,
      dataIndex: "performedSing",
      key: "performedSing",
      width: "15%",
      responsive: ["sm"],
      editable: (text, record, index) => {
        return false;
      },
      // width: '8%',
    },
    {
      title: `${t("INSPECTED")}`,
      dataIndex: "inspectedSing",
      key: "inspectedSing",
      responsive: ["sm"],
      width: "14%",
      editable: (text, record, index) => {
        return false;
      },
    },

    // },
    {
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      width: "14%",
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.actionNumber);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  useEffect(() => {
    if (currentProjectAdditionalTask) {
      dispatch(
        setCurrentAdditionalAction(
          currentProjectAdditionalTask?.actions?.[0] || null
        )
      );
      setSelectedRowKey(1);
    }
  }, []);

  useEffect(() => {
    if (currentActiveAdditionalIndex) {
      dispatch(
        setCurrentAdditionalAction(
          currentProjectAdditionalTask?.actions?.[
            currentActiveAdditionalIndex
          ] || null
        )
      );
    }
  }, [
    currentAdditionalAction,
    currentActiveAdditionalIndex,
    currentProjectAdditionalTask,
  ]);
  useEffect(() => {
    if (currentProjectAdditionalTask) {
      setEditableRecord(
        currentProjectAdditionalTask.actions?.[
          currentProjectAdditionalTask.actions?.length - 1
        ] || null
      );
      setEditingDescription(editableRecord?.actionDescription || "");
    }
  }, [editableRecord]);

  const dataEmpty = [
    {
      actionDescription: "",
      performedSing: "",
      performedDate: "",
      performedTime: "",
    },
  ];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(1);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleDeleteSelectedItems = async () => {
    // Удаляем выбранные строки из данных
    const updatedData = data.filter(
      (row: any) =>
        row.actionNumber && !selectedRowKeys.includes(row.actionNumber)
    );

    // Обновляем данные

    const result = dispatch(
      updateAdditionalTask({
        projectId: currentProjectAdditionalTask?.projectId._id,
        actions: updatedData,
        _id:
          currentProjectAdditionalTask?._id || currentProjectAdditionalTask?.id,
      })
    );
    if ((await result).meta.requestStatus === "fulfilled") {
      const index = projectAdditionalTasks.findIndex(
        (task: { _id: string | undefined }) =>
          task._id === currentProjectAdditionalTask?._id
      );
      if (index !== -1) {
        dispatch(
          setUpdatedProjectAdditionalTask({
            index: index,
            task: (await result).payload,
          })
        );
      }
    }

    // Очищаем выбранные ключи
    setSelectedRowKeys([]);
  };
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
      label: `${t("Report")}`,
      key: "print",
      icon: null,
      children: [
        // getItem('Print Status Report', 'sub4', <PrinterOutlined />, [

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
                  data,
                  `Filtred-Actions-${
                    currentProjectAdditionalTask &&
                    currentProjectAdditionalTask?.taskHeadLine
                  }`
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
                data.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  data,
                  `ALL-Actions-${
                    currentProjectAdditionalTask &&
                    currentProjectAdditionalTask?.taskHeadLine
                  }`
                )
              }
            >
              <DownloadOutlined /> All Items
            </div>,
            "5.2"
          ),
        ]),
        // ]),
      ],
    },

    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: null,
      children: [
        getItem(" Update Selected Steps", "subydd09", "", [
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              Perfomed Step
            </div>,
            "9saqrrss"
          ),
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              Inspected Step
            </div>,
            "9saryjsyhqss"
          ),
          getItem(
            <div onClick={() => console.log("New Work Order open Form")}>
              DInspected Step
            </div>,
            "9sasmvfyhqss"
          ),
        ]),

        getItem(
          <div onClick={handleDeleteSelectedItems}>
            <StopOutlined /> Delete Selected Items
          </div>,
          "9ss2hhhxs"
        ),
      ],
    },
  ];
  const [position, setPosition] = useState<"top" | "bottom" | "hidden">(
    "bottom"
  );
  return (
    <div className="flex my-0 mx-auto flex-col h-[48vh] overflow-hidden relative ">
      <EditableTable
        recordCreatorProps={
          position !== "hidden"
            ? {
                position: position as "top",
                record: () => ({
                  actionNumber: currentProjectAdditionalTask?.actions?.length
                    ? currentProjectAdditionalTask.actions.length + 1
                    : 1,
                  cteateDate: new Date(),
                  actionCteateUserID: USER_ID,
                }),
              }
            : false
        }
        data={data.length > 0 ? data : []}
        initialColumns={columns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any, rowIndex: number): void {
          setSelectedRowKey(record.actionNumber || null);
          // console.log(record.actionNumber);
          // console.log(rowIndex);
          dispatch(setCurrentAdditionalAction(record));
          dispatch(setCurrentAdditionalActionIndexMtb(rowIndex));
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          const updatedActions = [
            ...(currentProjectAdditionalTask?.actions || []),
          ];
          updatedActions[data.index] = {
            ...updatedActions[data.index],
            actionDescription: data.actionDescription,
            actionNumber: data.actionNumber,
            updateDate: new Date(),
            actionUpdateUserID: USER_ID,
          };
          const result = await dispatch(
            updateAdditionalTask({
              projectId: currentProjectAdditionalTask?.projectId._id,
              actions: updatedActions,
              _id:
                currentProjectAdditionalTask?._id ||
                currentProjectAdditionalTask?.id,
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            const index = projectAdditionalTasks.findIndex(
              (task: any) => task._id === currentProjectAdditionalTask?._id
            );
            if (index !== -1) {
              dispatch(
                setUpdatedProjectAdditionalTask({
                  index: index,
                  task: result.payload,
                })
              );
            }
          }
        }}
        yScroll={20}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
    </div>
  );
};

export default WOActionDescriptionList;
