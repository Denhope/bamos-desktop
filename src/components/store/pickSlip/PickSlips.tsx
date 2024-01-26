import { useColumnSearchProps } from "@/components/shared/Table/columnSearch";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IPickSlipResponse } from "@/models/IPickSlip";
import React, { FC, useEffect, useState } from "react";
import { getFilteredPickSlips } from "@/utils/api/thunks";
import { ProColumns } from "@ant-design/pro-components";
import { DatePicker, Modal } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import GeneretedPickSlip from "@/components/pdf/GeneretedPickSlip";
import { useTranslation } from "react-i18next";

export interface PickSlipListPrors {
  data: IPickSlipResponse[] | [];
  scroll: number;
  isLoading: boolean;
  onRowClick: (record: any) => void;
}
const PickSlipsList: FC<PickSlipListPrors> = ({
  data,
  // isLoading,
  onRowClick,
  scroll,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { filteredPickSlips, isLoading } = useTypedSelector(
    (state) => state.storesLogistic
  );
  useEffect(() => {
    const currentCompanyID = localStorage.getItem("companyID");
    if (currentCompanyID) {
      // Вызываем функцию сразу при монтировании компонента
      dispatch(
        getFilteredPickSlips({
          companyID: currentCompanyID,
          projectId: "",
        })
      );

      // Затем устанавливаем интервал для повторного вызова функции каждые 3 минуты
      const intervalId = setInterval(() => {
        dispatch(
          getFilteredPickSlips({
            companyID: currentCompanyID,
            projectId: "",
          })
        );
      }, 180000); // 180000 миллисекунд = 3 минуты

      // Не забываем очистить интервал при размонтировании компонента
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    setPickslips(filteredPickSlips);
    setInitialPickSlips(filteredPickSlips);
  }, [filteredPickSlips]);
  const [pickSlipsRequirements, setPickslips] = useState<any>([]);
  const [initialpickSlips, setInitialPickSlips] = useState<any>([
    filteredPickSlips,
  ]);
  const [openPickSlip, setOpenPickSlip] = useState(false);
  const [currentPickSlipID, setcurrentPickSlipID] = useState("");
  const { RangePicker } = DatePicker;
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t("Status")}`,
      key: "status",
      width: "10%",
      valueType: "select",
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,
      valueEnum: {
        open: { text: "OPEN", status: "Error" },
        closed: { text: "CLOSED", status: "Default" },
        canceled: { text: "CANCELED", status: "Error" },
      },

      dataIndex: "status",
    },
    {
      title: "ISSUED NBR",
      dataIndex: "pickSlipNumber",
      key: "pickSlipNumber",
      // responsive: ['sm'],
      // filteredValue: [searchedText],
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              setOpenPickSlip(true);
              setcurrentPickSlipID(record._id);
            }}
          >
            {record.pickSlipNumber}
          </a>
        );
      },
      ...useColumnSearchProps({
        dataIndex: "pickSlipNumber",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = pickSlipsRequirements.filter((item: any) =>
              item.pickSlipNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setPickslips(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setPickslips(initialpickSlips);
          }
        },
        data: pickSlipsRequirements,
      }),
    },
    {
      title: `${t("A/C NBR")}`,
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      ...useColumnSearchProps({
        dataIndex: "registrationNumber",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = pickSlipsRequirements.filter((item: any) =>
              item.registrationNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setPickslips(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setPickslips(initialpickSlips);
          }
        },
        data: pickSlipsRequirements,
      }),
    },
    {
      title: `${t("TASK")}`,
      dataIndex: "projectTaskWO",
      key: "projectTaskWO",
      responsive: ["sm"],
      ...useColumnSearchProps({
        dataIndex: "projectTaskWO",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = pickSlipsRequirements.filter((item: any) =>
              item.projectTaskWO
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setPickslips(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setPickslips(initialpickSlips);
          }
        },
        data: pickSlipsRequirements,
      }),
    },
    {
      title: `${t("W/O")}`,
      dataIndex: "projectWO",
      key: "projectWO",
      responsive: ["sm"],
      ...useColumnSearchProps({
        dataIndex: "projectWO",
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = pickSlipsRequirements.filter((item: any) =>
              item.projectWO
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setPickslips(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setPickslips(initialpickSlips);
          }
        },
        data: pickSlipsRequirements,
      }),
    },
    {
      title: `${t("CREATE BY")}`,
      dataIndex: "storeMan",
      key: "storeMan",
      responsive: ["sm"],
    },
    {
      title: "CREATE DATE",
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: "createDate",
      key: "createDate",
      // width: '7%',
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
    <div className="flex my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        data={pickSlipsRequirements}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={undefined}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          console.log("data");
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          throw new Error("Function not implemented.");
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      />
      <Modal
        title="PICKSLIP PRINT"
        open={openPickSlip}
        width={"60%"}
        onCancel={() => setOpenPickSlip(false)}
        footer={null}
      >
        <GeneretedPickSlip currentPickSlipID={currentPickSlipID} />
      </Modal>
    </div>
  );
};

export default PickSlipsList;
