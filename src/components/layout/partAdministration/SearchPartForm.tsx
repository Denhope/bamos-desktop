import {
  FormInstance,
  ModalForm,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Form } from "antd";
import PartNumberSearch from "@/components/store/search/PartNumberSearch";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredPartNumber } from "@/utils/api/thunks";
type SearchPartFormFormType = {
  onPartSearch: (part?: any) => void;
  currentPart?: any;
};
const SearchPartForm: FC<SearchPartFormFormType> = ({
  currentPart,
  onPartSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const companyID = localStorage.getItem("companyID") || "";
  useEffect(() => {
    // console.log(currentPart);

    if (currentPart) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: "partNumber", value: currentPart?.PART_NUMBER },
        { name: "description", value: currentPart?.DESCRIPTION },
        { name: "remarks", value: currentPart?.PART_REMARKS },
      ]);

      // onFilterTransferParts(form.getFieldsValue());
    }
  }, [currentPart]);
  return (
    <ProForm
      onFinish={async (values: any) => {
        if (values.partNumber) {
          const result = await dispatch(
            getFilteredPartNumber({
              companyID: companyID,
              partNumber: values.partNumber,
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            onPartSearch(result.payload[0]);
          }
        }
      }}
      layout="horizontal"
      formRef={formRef}
      size="small"
      className="bg-white px-4 py-3 rounded-md border-gray-400"
      form={form}
    >
      <ProFormGroup direction="horizontal">
        <ProFormText
          name="partNumber"
          label={`${t("PART No")}`}
          width="sm"
          tooltip={`${t("PART NUMBER")}`}
          //rules={[{ required: true }]}
          fieldProps={{
            onDoubleClick: () => {
              setOpenStoreFind(true);
            },
            onKeyPress: handleKeyPress,
          }}
        />
        <ProFormText
          disabled
          name="description"
          label={t("DESCRIPTION")}
          width="xl"
          tooltip={t("PART DESCRIPTION")}
        ></ProFormText>
        <ProFormTextArea
          disabled
          fieldProps={{ style: { resize: "none" } }}
          // colSize={5}
          name="remarks"
          label={t("REMARKS")}
          width="lg"
          tooltip={t("PART REMARKS")}
        ></ProFormTextArea>
      </ProFormGroup>

      <ModalForm
        // title={`Search on Store`}
        width={"70vw"}
        // placement={'bottom'}
        open={openStoreFindModal}
        // submitter={false}
        onOpenChange={setOpenStoreFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenStoreFind(false);

          form.setFields([
            { name: "partNumber", value: selectedSinglePN.PART_NUMBER },
            { name: "description", value: record.DESCRIPTION },
          ]);
        }}
      >
        <PartNumberSearch
          initialParams={{ partNumber: "" }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenStoreFind(false);

            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
            form.setFields([
              { name: "description", value: record.DESCRIPTION },
            ]);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            setSecectedSinglePN(record);
            onPartSearch(record);
            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
            form.setFields([
              { name: "description", value: record.DESCRIPTION },
            ]);
          }}
        />
      </ModalForm>
    </ProForm>
  );
};

export default SearchPartForm;
