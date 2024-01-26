import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Form } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IStore, IStoreLocation } from "@/models/IStore";

import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updateStoreByID } from "@/utils/api/thunks";
import { v4 as uuidv4 } from "uuid";
type CreateNewLocationType = {
  store: IStore;
  selectedLocation: IStoreLocation;
  oncreateNewLocation?: (record: IStoreLocation[]) => void;
};
const EditLocation: FC<CreateNewLocationType> = ({
  store,
  oncreateNewLocation,
  selectedLocation,
}) => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({
    locationName: selectedLocation?.locationName,
    description: selectedLocation?.description,
    storageType: selectedLocation?.storageType,
    // Добавьте здесь другие поля, которые вы хотите установить
    id: selectedLocation?.id,
    _id: selectedLocation?._id,
    rectriction: selectedLocation?.rectriction,
    locationType: selectedLocation?.locationType,
    owner: selectedLocation?.owner,
    ownerID: selectedLocation?.ownerID,
    remarks: selectedLocation?.remarks,
    ownerLongName: selectedLocation?.ownerLongName,
    ownerShotName: selectedLocation?.ownerShotName,
  });
  useEffect(() => {
    form.setFields([
      { name: "locationName", value: selectedLocation?.locationName },
      { name: "description", value: selectedLocation?.description },
      { name: "storageType", value: selectedLocation?.storageType },
      { name: "id", value: selectedLocation?.id },
      { name: "_id", value: selectedLocation?._id },
      { name: "rectriction", value: selectedLocation?.rectriction },
      { name: "locationType", value: selectedLocation?.locationType },
      { name: "ownerLongName", value: selectedLocation?.ownerLongName },
      { name: "ownerShotName", value: selectedLocation?.ownerShotName },
      { name: "owner", value: selectedLocation?.owner },
      { name: "ownerID", value: selectedLocation?.ownerID },
      { name: "remarks", value: selectedLocation?.remarks },
      // Добавьте здесь другие поля, которые вы хотите обновить
    ]);
  }, [selectedLocation, form]);

  const [locations, setLocations] = useState<IStoreLocation[]>([]);
  const dispatch = useAppDispatch();
  // const [store, setStore] = useState<IStoreLocation[]>([]);
  useEffect(() => {
    setLocations(store?.locations || []);
  }, [store, dispatch]);
  const { t } = useTranslation();

  return (
    <ProForm
      form={form}
      // initialValues={initialValues}
      onFinish={async (values) => {
        const newLocations = (store?.locations?.map((location) =>
          location.id === selectedLocation.id
            ? { ...location, ...values }
            : location
        ) || []) as IStoreLocation[];
        const result = await dispatch(
          updateStoreByID({
            ...store,
            locations: newLocations,
          })
        );
        if (result.meta.requestStatus === "fulfilled" && oncreateNewLocation) {
          oncreateNewLocation(result.payload.locations);
        }
      }}
    >
      <ProFormGroup>
        <ProFormText
          name="locationName"
          label={`${t("LOCATION NAME")}`}
          width="sm"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="description"
          label={`${t("DESCRIPTION")}`}
          width="lg"
          tooltip={`${t("STORE SHORT NAME")}`}
          rules={[{ required: true }]}
          valueEnum={{
            LOCATION_FOR_UNSERVICEABLE_PARTS: {
              text: t("LOCATION FOR UNSERVICEABLE PARTS"),
            },
            LOCATION_FOR_PARTS_IN_HANGAR: {
              text: t("LOCATION FOR PARTS IN HANGAR"),
            },
            LOCATION_FOR_PARTS_IN_INVENTORY: {
              text: t("LOCATION FOR PARTS IN INVENTORY"),
            },
            LOCATION_FOR_SERVICEABLE_PARTS: {
              text: t("LOCATION FOR SERVICEABLE PARTS"),
            },
            LOCATION_FOR_PARTS_TO_SCRAP: {
              text: t("LOCATION FOR PARTS TO SCRAP"),
            },
            LOCATION_FOR_PARTS_IN_QUARANTINE: {
              text: t("LOCATION FOR PARTS IN QUARANTINE"),
            },
            LOCATION_FOR_PARTS_ON_ROLLOUT: {
              text: t("LOCATION FOR PARTS ON ROLLOUT"),
            },
            LOCATION_FOR_PARTS_IN_SHOP: {
              text: t("LOCATION FOR PARTS IN SHOP"),
            },
            QUAR_LOCATION: { text: t("QUAR LOCATION") },
            DROP_LOCATION: { text: t("DROP LOCATION") },
          }}
        />
        <ProFormSelect
          disabled
          name="storageType"
          label={`${t("STORAGE TYPE")}`}
          width="sm"
          tooltip={`${t("STORAGE TYPE")}`}
          rules={[{ required: true }]}
          valueEnum={{
            manual: { text: t("MANUAL") },
            auto: { text: t("AUTO") },
          }}
        />
        <ProFormSelect
          name="rectriction"
          label={`${t("RESTRICTION")}`}
          width="sm"
          tooltip={`${t("RESTRICTION")}`}
          rules={[{ required: true }]}
          valueEnum={{
            standart: { text: t("STANDART") },
            inaccessible: { text: t("INACCESSIBLE") },
            restricted: { text: t("RESTRICTED") },
          }}
        />
        <ProFormSelect
          name="locationType"
          label={`${t("LOCATION TYPE")}`}
          width="sm"
          tooltip={`${t("LOCATION TYPE")}`}
          rules={[{ required: true }]}
          valueEnum={{
            standart: { text: t("STANDART") },
            hangar: { text: t("HANGAR") },
            inventory: { text: t("INVENTORY") },
            quarantine: { text: t("QUARANTINE") },
            rollOut: { text: t("ROLLOUT") },
            scrap: { text: t("SCRAP") },
            shipment: { text: t("SHIPMENT") },
            transfer: { text: t("TRANSFER") },
            shop: { text: t("SHOP") },
            unserviceable: { text: t("UNSERVICEABLE") },
            reservation: { text: t("RESERVATION") },
            customer: { text: t("CUSTOMER") },
            consingment: { text: t("CONSIGNMENT") },
            // pool: { text: t('POOL') },
            tool: { text: t("TOOL") },
            arhive: { text: t("ARCHIVE") },
            moving: { text: t("MOVING") },
          }}
        />
        <ProFormText
          name="ownerShotName"
          label={`${t("OWNER SHORT NAME")}`}
          width="sm"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="ownerLongName"
          label={`${t("OWNER LONG NAME")}`}
          width="lg"
          rules={[{ required: true }]}
        />
        <ProFormTextArea name="remarks" label={`${t("REMARKS")}`} width="lg" />
      </ProFormGroup>
      <ProForm.Item name="id" noStyle />
    </ProForm>
  );
};

export default EditLocation;
