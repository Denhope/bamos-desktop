import { ProColumns } from "@ant-design/pro-components";
import { DatePicker } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
type showProjectListType = {
  scroll: number;
  onSelectedProjects: (record: any) => void;
  onSelectedIds?: (record: any) => void;
  selectedProjects?: any;
  projects?: any;
};
//
const { RangePicker } = DatePicker;

const ProjectList: FC<showProjectListType> = ({
  scroll,
  onSelectedIds,
  onSelectedProjects,
  projects,
  selectedProjects,
}) => {
  const { t } = useTranslation();
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("PROJECT No")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      // tip: 'LOCAL_ID',
      ellipsis: true,
      // width: '13%',

      // responsive: ['sm'],
    },
    {
      title: `${t("NAME")}`,
      dataIndex: "projectName", // обновлено
      key: "projectName", // обновлено
      ellipsis: true,
    },
    {
      title: `${t("CUSTOMER")}`,
      dataIndex: "customer", // обновлено
      key: "customer", // обновлено
      ellipsis: true,
    },

    {
      title: `${t("STATE")}`,
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      // width: '10%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Определяем цвет фона в зависимости от условия
        let backgroundColor;
        if (record.state === "CLOSED") {
          backgroundColor = "#62d156";
        } else if (
          record.status === "OPEN" ||
          record.status === "open" ||
          record.status === "DRAFT"
        ) {
          backgroundColor = "red";
        } else {
          backgroundColor = "#f0be37";
        }
        return (
          <div style={{ backgroundColor }}>
            {record.status && record.status}
          </div>
        );
      },
    },
    {
      title: `${t("DATE")}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "createDate",
      key: "createDate",
      // width: '9%',
      responsive: ["lg"],
      valueType: "date",
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
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
    <div className="flex w-[100%] my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        showSearchInput={false}
        data={projects}
        initialColumns={initialColumns}
        // isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        isNoneRowSelection={true}
        xScroll={450}
        onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
        onRowClick={function (record: any, rowIndex?: any): void {
          onSelectedProjects(record);
          console.log(record);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error("Function not implemented.");
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        isLoading={false}
      />
    </div>
  );
};

export default ProjectList;
