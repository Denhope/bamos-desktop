import {
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Button, Form, Space, Upload, UploadFile, message } from "antd";
import { RcFile, UploadChangeParam } from "antd/lib/upload";
import { useAppDispatch } from "@/hooks/useTypedSelector";

import { IStore } from "@/models/IStore";
import React, { FC, useEffect, useState } from "react";
import {
  getFileFromServer,
  postNewStoreShop,
  updateStoreByID,
  uploadFileServer,
} from "@/utils/api/thunks";
import { UploadOutlined } from "@ant-design/icons";
import FileUploader, { AcceptedFileTypes } from "@/components/shared/Upload";
import FilesSelector from "@/components/shared/FilesSelector";
import { useTranslation } from "react-i18next";
type StoreEditFormType = {
  onEditSrore?: (record: any) => void;
  currentStore: IStore;
};

const StoreEditForm: FC<StoreEditFormType> = ({
  onEditSrore,
  currentStore,
}) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<any | null>(null);

  const handleUploadChange = (info: UploadChangeParam<UploadFile<any>>) => {
    setFile(info.fileList[0].originFileObj);
    console.log(info.fileList[0].originFileObj);
  };
  const { t } = useTranslation();
  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      console.log(formData.get("file")); // Должен выводить информацию о файле
      // const result = await dispatch(uploadFileServer(formData));
      // return result;
    }
  };
  // useEffect(() => {
  //   if (file) {
  //     handleUpload();
  //   }
  // }, [file]);

  useEffect(() => {
    form.setFields([
      { name: "shopLongName", value: currentStore?.shopLongName },
      { name: "shopShortName", value: currentStore?.shopShortName },
      { name: "description", value: currentStore?.description },
      { name: "status", value: currentStore?.status },
      { name: "id", value: currentStore?.id },
      { name: "_id", value: currentStore?._id },
      { name: "station", value: currentStore?.station },
      { name: "adress", value: currentStore?.adress },
      { name: "ownerLongName", value: currentStore?.ownerLongName },
      { name: "ownerShotName", value: currentStore?.ownerShotName },
      { name: "owner", value: currentStore?.owner },
      { name: "ownerID", value: currentStore?.ownerId },
      { name: "remarks", value: currentStore?.remarks },
      // Добавьте здесь другие поля, которые вы хотите обновить
    ]);
  }, [currentStore, form]);
  const dispatch = useAppDispatch();
  async function handleFileSelect(file: {
    id: string;
    name: string;
  }): Promise<void> {
    try {
      const companyID = localStorage.getItem("companyID") || "";
      const fileData = await getFileFromServer(companyID, file.id);

      // Определите MIME-тип на основе расширения файла
      const extension = file.name.split(".").pop();
      let type = "";
      switch (extension) {
        case "pdf":
          type = "application/pdf";
          break;
        case "jpg":
        case "jpeg":
          type = "image/jpeg";
          break;
        case "png":
          type = "image/png";
          break;
        case "gif":
          type = "image/gif";
          break;
        case "txt":
          type = "text/plain";
          break;
        case "doc":
        case "docx":
          type = "application/msword";
          break;
        case "xls":
        case "xlsx":
          type = "application/vnd.ms-excel";
          break;
        case "ppt":
        case "pptx":
          type = "application/vnd.ms-powerpoint";
          break;
        case "zip":
          type = "application/zip";
          break;
        case "rar":
          type = "application/x-rar-compressed";
          break;
        // добавьте больше случаев для других типов файлов...
        default:
          type = "application/octet-stream"; // общий тип для двоичных файлов
      }

      // Создайте Blob из файла
      const blob = new Blob([fileData], { type: type });

      // Создайте временный URL для Blob
      const fileURL = window.URL.createObjectURL(blob);

      // Выведите URL файла в консоль
      console.log(fileURL);

      // Создайте ссылку для скачивания файла
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = file.name; // Используйте имя файла
      link.click();
    } catch (error) {
      console.error("Не удалось получить файл", error);
    }
  }

  return (
    <ProForm
      form={form}
      onFinish={async (values) => {
        onEditSrore?.(values as IStore);
        const result = await dispatch(
          updateStoreByID({
            ...currentStore,
            ...values,
          })
        );
        if (result.meta.requestStatus === "fulfilled" && onEditSrore) {
          onEditSrore(result.payload);
        }
        // const resultFiles = await handleUpload();
      }}
    >
      <ProFormGroup>
        <ProFormText
          name="shopLongName"
          label={`${t("STORE LONG NAME")}`}
          width="lg"
          tooltip={`${t("STORE LONG NAME")}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="shopShortName"
          label={`${t("STORE SHORT NAME")}`}
          width="sm"
          tooltip={`${t("STORE SHORT NAME")}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormSelect
          label={`${t("STATUS")}`}
          width="sm"
          name="status"
          tooltip={`${t("ENTER STATUS")}`}
          rules={[{ required: true }]}
          valueEnum={{
            active: { text: "ACTIVE" },
            unActive: { text: "UN ACTIVE" },
          }}
        ></ProFormSelect>
      </ProFormGroup>
      <ProFormGroup>
        <ProFormText
          name="description"
          label={`${t("STORE DESCRIPTION")}`}
          width="xl"
          tooltip={`${t("STORE ADRESS")}`}
          rules={[{ required: true }]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormSelect
          label={`${t("STATION")}`}
          width="sm"
          name="station"
          tooltip={`${t("ENTER STATION")}`}
          rules={[{ required: true }]}
          valueEnum={{
            MSQ: { text: "MINSK-2" },
            SMQ: { text: "SMOLEVICHI" },
          }}
        ></ProFormSelect>
        <ProFormText
          name="adress"
          label={`${t("STORE ADRESS")}`}
          width="lg"
          tooltip={`${t("STORE ADRESS")}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="ownerShotName"
          label={`${t("OWNER SHORT NAME")}`}
          width="sm"
          tooltip={`${t("OWNER SHORT NAME")}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="remarks"
          label={`${t("REMARKS")}`}
          width="lg"
          tooltip={`${t("REMARKS")}`}
          rules={[{ required: true }]}
        ></ProFormText>{" "}
        {/* <Upload
          name="file"
          beforeUpload={(file) => {
            setFile(file);
            return false;
          }}
          fileList={file ? [file] : []}
        >
          <Button icon={<UploadOutlined />}>Upload File</Button>
        </Upload> */}
      </ProFormGroup>
      <ProFormGroup>
        <Space size={"large"} className=" flex justify-between py-5 ">
          <FileUploader
            onUpload={uploadFileServer}
            acceptedFileTypes={[AcceptedFileTypes.JPG, AcceptedFileTypes.PDF]}
            onSuccess={async function (response: any): Promise<void> {
              if (response) {
                const updatedFiles = currentStore.files
                  ? [...currentStore.files, response]
                  : [response];
                const result = await dispatch(
                  updateStoreByID({
                    ...currentStore,
                    files: updatedFiles,
                  })
                );
                if (result.meta.requestStatus === "fulfilled" && onEditSrore) {
                  onEditSrore(result.payload);
                }
              }
            }}
          />

          <FilesSelector
            files={currentStore.files || []}
            onFileSelect={handleFileSelect}
          />
        </Space>
      </ProFormGroup>
    </ProForm>
  );
};

export default StoreEditForm;
