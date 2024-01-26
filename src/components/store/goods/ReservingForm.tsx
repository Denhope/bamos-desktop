import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { t } from "i18next";
import React, { FC, useState } from "react";
import FilesUpload from "./FilesUpload";
import UserSearchForm from "@/components/shared/form/UserSearchForm";
import { UserResponce } from "@/models/IUser";
import UserSearchProForm from "@/components/shared/form/UserSearchProForm";
import { Form } from "antd";
import SearchSelect from "@/components/shared/form/SearchSelect";
import { getFilteredProjects, getFilteredUsers } from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";

const ReservingForm: FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  const [shouldReset, setShouldReset] = useState(false);
  const [form] = Form.useForm();
  const companyID = localStorage.getItem("companyID") || ""; // Замените на ваше значение
  const dispatch = useAppDispatch();
  const handleSearch = async (value: any) => {
    const result = await dispatch(
      getFilteredProjects({
        companyID: companyID,
      })
    );
    return result;
  };

  const handleSelect = (selectedOption: any) => {
    console.log(selectedOption); // Замените на вашу логику обработки
  };
  const handleAreaChange = (value: string) => {
    setZone(value);
    setUnit(value);
  };
  const [subZone, setZone] = useState("");

  const [subUnit, setUnit] = useState("");

  const zones: { [key: string]: string[] } = {
    ROTABLE: ["TOOL", "ROT", "GSE"],
    CONSUMABLE: ["CHEM", "GSE"],
  };
  const unitLabels: { [key: string]: string } = {
    EA: "EA",
    "m Metre": "METRE",
    MI: "mi",
    GRAMM: "GM",
    YARD: "YD",
    SI: "SI",
    INCHE: "IN",
    SM: "SM",
    "x Sq Centimetre": "SQ Centimetre",
    LITRE: "LI",
    KT: "KT",
    KG: "KG",
  };

  const unit: { [key: string]: string[] } = {
    ROTABLE: ["EA"],
    CONSUMABLE: [
      "m Metre",
      "MI",
      "GRAMM",
      "YARD",
      "SI",
      "INCHE",
      "SM",
      "x Sq Centimetre",
      "LITRE",
      "KT",
      "KG",
    ],
  };
  return (
    <div className="h-[82vh] flex flex-col mx-auto">
      <ProForm size="middle" submitter={false}></ProForm>

      <ProForm onReset={() => setShouldReset(true)} form={form} size="middle">
        <ProForm.Group>
          <ProForm.Group align="center">
            <ProFormText
              name="id"
              label="BARCODE"
              width="sm"
              tooltip="Scan Barcode"
            />
          </ProForm.Group>
          <SearchSelect
            onSearch={async () => null}
            optionLabel1="order"
            optionLabel2="projectName"
            onSelect={() => null}
            label={`${t("ORDER")}`}
            tooltip={`${t("ORDER")}`}
            rules={[]}
            name={"order"}
          />
          <SearchSelect
            onSearch={handleSearch}
            optionLabel1="projectWO"
            optionLabel2="projectName"
            onSelect={handleSelect}
            label={`${t("W/O")}`}
            tooltip={`${t("W/O")}`}
            rules={[]}
            name={"projectWO"}
          />

          <SearchSelect
            onSearch={async () => null}
            optionLabel1="store"
            optionLabel2="store"
            onSelect={() => null}
            label={`${t("STORE")}`}
            tooltip={`${t("STORE")}`}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
            name={"store"}
          />

          <ProFormSelect
            showSearch
            name="rack"
            label={`${t("RACK")}`}
            width="sm"
            tooltip="Item RACK Number"
            // valueEnum={zones[subZone]?.reduce(
            //   (prev: any, curr: string) => ({ ...prev, [curr]: curr }),
            //   {}
            // )}

            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />
          <ProFormSelect
            showSearch
            name="shelf"
            label={`${t("BIN")}`}
            width="sm"
            tooltip="Item BIN Number"
            // valueEnum={zones[subZone]?.reduce(
            //   (prev: any, curr: string) => ({ ...prev, [curr]: curr }),
            //   {}
            // )}

            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            showSearch
            name="COSTUMER"
            label="COSTUMER"
            width="sm"
            tooltip="Enter COSTUMER"
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
          />
          <ProFormSelect
            showSearch
            name="owner"
            label="OWNER"
            width="sm"
            tooltip="Enter TYPE"
            rules={[
              {
                required: true,
                type: "string",
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <SearchSelect
            onSearch={async () => null}
            optionLabel1="PART_NUMBER"
            optionLabel2="DESCRIPTION"
            onSelect={() => null}
            label={`${t("P/N")}`}
            tooltip={`${t("P/N")}`}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
            name={"PART_NUMBER"}
          />
          <ProFormText
            width="lg"
            name="DESCRIPTION"
            label={`${t("DESCRIPTION")}`}
            tooltip="DESCRIPTION"
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
            fieldProps={
              {
                // onChange: handleAreaChange,
              }
            }
          />{" "}
          <ProFormText
            width="sm"
            name="SERIAL_NUMBER"
            label={`${t("SERIAL_NUMBER")}`}
            tooltip="SERIAL NUMBER"
            fieldProps={
              {
                // onChange: handleAreaChange,
              }
            }
          />{" "}
          <ProFormSelect
            showSearch
            name="TYPE"
            label="TYPE"
            width="sm"
            tooltip="Enter TYPE"
            valueEnum={{
              ROTABLE: "ROTABLE",
              CONSUMABLE: "CONSUMABLE",
            }}
            fieldProps={{
              onChange: handleAreaChange,
            }}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />{" "}
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            showSearch
            name="condition"
            label="CONDITION"
            width="sm"
            tooltip="Enter CONDITION"
            valueEnum={{
              "NEW/": "NEW/",
              "INS/": "INS/",
              "REP/": "REP/",
              "OH/": "OH/",
              "TES/": "TES/",
              "US/": "US/",
            }}
            // fieldProps={{
            //   onChange: handleAreaChange,
            // }}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />{" "}
          <ProFormSelect
            showSearch
            name="GROUP"
            label="GROUP"
            width="sm"
            tooltip="Enter GROUP"
            valueEnum={zones[subZone]?.reduce(
              (prev: any, curr: string) => ({ ...prev, [curr]: curr }),
              {}
            )}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />{" "}
          <ProFormDigit
            name="Qty"
            label="Qty"
            width="sm"
            tooltip="Enter Qty"
            rules={[
              {
                required: true,

                type: "number",
              },
            ]}
          ></ProFormDigit>
          <ProFormSelect
            showSearch
            name="UNIT"
            label="UNIT"
            width="sm"
            tooltip="Enter UNIT"
            // valueEnum={{
            //   EA: 'EA',
            //   'm Metre': 'METRE',
            //   mi: 'MI',
            //   GM: 'GRAMM',
            //   YD: 'YARD',
            //   SI: 'SI',
            //   IN: 'INCHE',
            //   SM: 'SM',
            //   'x Sq Centimetre': 'SQ Centimetre',
            //   LI: 'LITRE',
            //   KT: 'KT',
            //   KG: 'KG',
            // }}
            valueEnum={unit[subUnit]?.reduce(
              (prev: any, curr: string) => ({
                ...prev,
                [curr]: unitLabels[curr],
              }),
              {}
            )}
            rules={[
              {
                required: true,

                type: "string",
              },
            ]}
          />{" "}
        </ProForm.Group>
        <div className="flex">
          <div className="flex flex-col w-1/2">
            <ProFormTextArea
              name="note"
              label="NOTE"
              width="xl"
              tooltip="Enter NOTE"
            />
          </div>
          <div className="w-1/3">
            <FilesUpload></FilesUpload>
          </div>
        </div>

        <ProForm.Group>
          <UserSearchProForm
            onUserSelect={setSelectedUser}
            reset={shouldReset}
            actionNumber={null}
          ></UserSearchProForm>
        </ProForm.Group>
      </ProForm>
    </div>
  );
};

export default ReservingForm;
