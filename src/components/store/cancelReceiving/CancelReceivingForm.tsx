import {
  FormInstance,
  ProForm,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
import { DatePickerProps, Form, message } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import moment from "moment";
import React, { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredReceivingItems } from "@/utils/api/thunks";
type CancelReceivingFormType = {
  onFilterReceiving: (record: any) => void;
};
const CancelReceivingForm: FC<CancelReceivingFormType> = ({
  onFilterReceiving,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  return (
    <div>
      <ProForm
        onFinish={async (values: any) => {
          if (null) {
            message.error("Some fields are empty");
          } else {
            const currentCompanyID = localStorage.getItem("companyID") || "";
            const result = dispatch(
              getFilteredReceivingItems({
                companyID: currentCompanyID,
                orderNumber: form.getFieldValue("onorderNumber"),
                vendorName: form.getFieldValue("vendorName"),
                partNumber: form.getFieldValue("partNumber"),
                orderType: form.getFieldValue("orderType"),
                serialNumber: form.getFieldValue("serialNumber"),
                batchNumber: form.getFieldValue("batchNumber"),
                receiningNumber: form.getFieldValue("receiningNumber"),
                receiningItemNumber: form.getFieldValue("receiningItemNumber"),
                store: form.getFieldValue("store"),
                station: form.getFieldValue("station"),
                partGroup: form.getFieldValue("partGroup"),
                partType: form.getFieldValue("partType"),
                location: form.getFieldValue("location"),
                receivedBy: form.getFieldValue("receivedBy"),
                label: form.getFieldValue("label"),
                startDate: selectedStartDate,
                endDate: selectedEndDate,
                isCancelled: false,
              })
            );
            if ((await result).meta.requestStatus === "fulfilled") {
              onFilterReceiving((await result).payload || []);
            } else {
              message.error("Error");
            }
            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
        initialValues={{
          receivingDate: [moment().subtract(1, "months"), moment()],
        }}
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
      >
        <ProFormGroup>
          <ProFormText
            name="onorderNumber"
            label={`${t("ORDER No")}`}
            width="sm"
            tooltip="ORDER NUMBER"
            //rules={[{ required: true }]}
            fieldProps={{
              onKeyPress: handleKeyPress,
            }}
          />
          <ProFormText
            name="receiningNumber"
            label={`${t("RECEIVING No")}`}
            width="sm"
            tooltip="RECEIVING NUMBER"
            //rules={[{ required: true }]}
            fieldProps={{
              onKeyPress: handleKeyPress,
              autoFocus: true,
            }}
          />
          <ProFormText
            name="partNumber"
            label={`${t("PART NUMBER")}`}
            width="sm"
            tooltip={`${t("PART NUMBER")}`}
            //rules={[{ required: true }]}
            fieldProps={{
              onDoubleClick: () => {},
              onKeyPress: handleKeyPress,
            }}
          />
          <ProFormText
            name="serialNumber"
            label={t("SERIAL No")}
            width="sm"
            tooltip={t("SERIAL No")}
            fieldProps={{
              // onDoubleClick: () => setOpenPickViewer(true),
              onKeyPress: handleKeyPress,
            }}
          ></ProFormText>
          <ProFormDateRangePicker
            name="receivingDate"
            label={`${t("RECEIVING DATE")}`}
            width="sm"
            tooltip="RECEIVING DATE"
            fieldProps={{
              onChange: onChange,
            }}
          />
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default CancelReceivingForm;
