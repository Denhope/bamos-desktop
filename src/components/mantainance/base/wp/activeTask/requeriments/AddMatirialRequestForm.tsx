import { ConfigProvider, Form, Input, InputNumber, MenuProps } from "antd";
import EditableTable from "@/components/shared/Table/EditableTable";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IProjectTask } from "@/models/IProjectTask";
import React, { FC, useEffect, useState } from "react";
import { getFilteredRequirements } from "@/utils/api/thunks";
import { v4 as originalUuidv4 } from "uuid";

import {
  ProColumns,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useTranslation } from "react-i18next";
import Title from "antd/es/typography/Title";
type FilteredRequirementItemsListPropsType = {
  projectTaskData: any | null;
  scroll: number;
  isLoading: boolean;
  ids?: any[];
  onReqClick: (record: any) => void;
  handleTableDataChange?: (data: any[]) => void;
  onFieldsChange?: (fields: { [key: string]: any }) => void; // Изменено
};
const AddMatirialRequestList: FC<FilteredRequirementItemsListPropsType> = ({
  projectTaskData,
  ids,
  scroll,
  handleTableDataChange,
  onFieldsChange,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [materialsRequirements, setRequirements] = useState<any>([]);
  const [initialMaterialsRequirements, setInitialRequirements] = useState<any>(
    []
  );
  const [form] = Form.useForm();
  const [updaredMaterialsRequirements, setUpdatedRequirements] =
    useState<any>();
  const items: MenuProps["items"] = [];
  const initialColumns: ProColumns<any>[] = [
    // {
    //   title: `${t('REQUIREMENT NUMBER')}`,
    //   dataIndex: 'requirementID',
    //   // valueType: 'index',
    //   ellipsis: true,
    //   // width: '5%',

    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   render: (text: any, record: any) => {
    //     return (
    //       <a
    //         onClick={() => {
    //           // dispatch(setCurrentProjectTask(record));
    //           // setOpenRequirementDrawer(true);
    //           // onReqClick(record);
    //         }}
    //       >
    //         {record.requirementID && record.requirementID}
    //       </a>
    //     );
    //   },
    //   // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    // },

    {
      title: `${t("PART NUMBER")}`,
      dataIndex: "PN",
      key: "PN",
      width: "14%",
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },

      // responsive: ['sm'],
    },

    {
      title: `${t("DESCRIPTION")}`,
      dataIndex: "description",
      key: "desctiption",
      // responsive: ['sm'],
      tip: "Text Show",
      ellipsis: true, //
      width: "15%",
      editable: (text, record, index) => {
        return false;
      },
    },
    // {
    //    title: `${t('ALTERNATIVE')}`,
    //   dataIndex: 'alternative',
    //   key: 'alternative',
    //   responsive: ['sm'],
    // },
    {
      title: `${t("QWERALL REQUIRED")}`,
      dataIndex: "required",
      key: "required",
      width: "13%",
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.amout - b.amout,
      // responsive: ['sm'],
    },
    {
      title: `${t("ALREADY ISSUED")}`,
      dataIndex: "issuedQuantity",
      key: "issuedQuantity",
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
          // onClick={() => {
          //   onIssuedClick(record.issuedItems);
          // }}
          >
            {record.issuedQuantity && record.issuedQuantity}
          </a>
        );
      },
      // responsive: ['sm'],
    },

    {
      title: `${t("TO BE BOOKED")}`,
      dataIndex: "onOrderQuantity",
      key: "onOrderQuantity",
      render: (text: any, record: any) => record.onOrderQuantity,

      formItemProps: (record) => ({
        validateTrigger: "onChange", // Добавьте это свойство
        rules: [
          {
            required: true,
            message: "Это поле обязательно для заполнения",
          },
          {
            pattern: /^\d+(\.\d+)?$/,
            message: "Пожалуйста, введите только числа",
          },
          {
            validator: (_, value) => {
              const amoutValue = form.getFieldValue("amout");

              if (value > record.getFieldValue("amout")) {
                return Promise.reject(
                  new Error("Значение не может быть больше чем amout")
                );
              }
              return Promise.resolve();
            },
          },
        ],
      }),
    },

    // {
    //   title: 'RETURNED',
    //   dataIndex: 'returnedQuantity',
    //   key: 'returnedQuantity',
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   // sorter: (a, b) => a.amout - b.amout,
    //   // responsive: ['sm'],
    // },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      editable: (text, record, index) => {
        return false;
      },
      responsive: ["sm"],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    // {
    //   title: `${t('FROM STORE')}`,
    //   dataIndex: 'store',
    //   key: 'store',
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   responsive: ['sm'],
    //   // sorter: (a, b) => a.unit.length - b.unit.length,
    // },
    // {
    //   title: `${t('PLANNED DATE')}`,
    //   dataIndex: 'plannedDate',
    //   key: 'plannedDate',

    //   responsive: ['sm'],
    //   // sorter: (a, b) => a.unit.length - b.unit.length,
    // },

    {
      title: `${t("OPTION")}`,
      valueType: "option",
      key: "option",
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const uuidv4: () => string = originalUuidv4;
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        const result = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            projectId: projectTaskData?.projectId?.id || "",
            ids: ids,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          if (result.payload.length) {
            // Изменяем каждый элемент в массиве, устанавливая requestQuantity равным нулю
            const updatedRequirements = result.payload.map(
              (requirement: any) => ({
                id: uuidv4(), // уникальный ключ для каждой вкладки,
                requirementID: requirement._id,
                onOrderQuantity:
                  requirement.amout -
                  (requirement.onOrderQuantity || 0) -
                  (requirement.issuedQuantity || 0),
                required: requirement.amout,
                PN: requirement.PN,
                description: requirement.nameOfMaterial,
                unit: requirement.unit,
                issuedQuantity: requirement?.issuedQuantity,
                status: "issued",
                onBlock: [],
              })
            );
            setRequirements(updatedRequirements);
            // console.log(updatedRequirements);
          } else {
            setRequirements([]);
          }
          // setInitialRequirements(result.payload);
        }
      }
    };
    fetchData();
  }, [dispatch, projectTaskData?._id, ids]);
  const [fields, setFields] = useState({
    getFrom: "",
    neededOn: "",
    remarks: "",
    plannedDate: null,
  });

  const handleFieldChange = (fieldName: string, value: any) => {
    setFields((prevFields) => ({
      ...prevFields,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    if (onFieldsChange) {
      onFieldsChange(fields);
    }
  }, [fields, onFieldsChange]);

  return (
    <div>
      <Title level={5}>
        {t(
          `PLANNED FOR: ${
            projectTaskData?.additionalNumberId ||
            projectTaskData?.projectTaskWO
          }`
        )}
      </Title>

      <ProFormGroup>
        <ProFormSelect
          rules={[{ required: true }]}
          name="getFrom"
          tooltip={`${t("SELECT STORE")}`}
          options={[
            { value: "MSQ", label: "MSQ" },
            { value: "AVJ", label: "AVJ" },
            { value: "PBD", label: "PBD" },
          ]}
          label={`${t("GET FROM")}`}
          onChange={(value) => handleFieldChange("getFrom", value)}
        ></ProFormSelect>
        <ProFormSelect
          rules={[{ required: true }]}
          name="neededOn"
          options={[
            { value: "MSQ", label: "MSQ" },
            { value: "AVJ", label: "AVJ" },
            { value: "PBD", label: "PBD" },
            { value: "MCC", label: "MCC" },
          ]}
          label={`${t("NEEDED ON")}`}
          onChange={(value) => handleFieldChange("neededOn", value)}
        ></ProFormSelect>
        <ProFormText
          name={"remarks"}
          width={"xl"}
          label={`${t("REMARKS")}`}
          fieldProps={{
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange("remarks", e.target.value),
          }}
        ></ProFormText>
        <ProFormDatePicker
          rules={[{ required: true }]}
          name={"plannedDate"}
          label={`${t("PLANNED DATE")}`}
          fieldProps={{
            onChange: (date: any | null) =>
              handleFieldChange("plannedDate", date),
          }}
        ></ProFormDatePicker>
      </ProFormGroup>

      <EditableTable
        onTableDataChange={handleTableDataChange}
        data={materialsRequirements}
        initialColumns={initialColumns}
        isLoading={false}
        menuItems={items}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          throw new Error("Function not implemented.");
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(data);
          setUpdatedRequirements(data);
        }}
        yScroll={scroll}
        externalReload={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
      ></EditableTable>
    </div>
  );
};

export default AddMatirialRequestList;
