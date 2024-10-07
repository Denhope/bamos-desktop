//@ts-nocheck
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
import { useUpdateStorePartsMutation } from '@/features/storeAdministration/PartsApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Split } from '@geoffcox/react-splitter';
import { Form, FormInstance } from 'antd';
import React, { FC, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
interface TransferPartAdminProps {
  onDataTargetUpdate: (data: any) => void; // Функция для передачи данных вверх
  onSubmit: (data: any) => void; // Функция для передачи данных вверх
}
const TransferPartAdmin: FC<TransferPartAdminProps> = ({
  onDataTargetUpdate,
  onSubmit,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const formRefTarget = useRef<FormInstance>(null);
  const [formTarget] = Form.useForm();
  const { t } = useTranslation();
  const { data: stores } = useGetStoresQuery({});
  const [selectedStoreID, setSelectedStoreID] = useState<string | undefined>(
    undefined
  );
  const [selectedCheckbox, setSelectedCheckbox] = useState('changeLocation');
  const [selectedTargetStoreID, setSelectedTargetStoreID] = useState<
    string | undefined
  >(undefined);
  const {
    data: locations,
    isLoading,
    refetch: refetchLocations,
  } = useGetLocationsQuery({
    storeID: selectedStoreID,
  });

  const { data: locationsTarget, refetch: refetchLocationsTarget } =
    useGetLocationsQuery({
      storeID: selectedTargetStoreID,
    });
  const { data: partNumbers, isError } = useGetPartNumbersQuery({});

  useEffect(() => {
    if (selectedCheckbox === 'changeLocation') {
      setSelectedTargetStoreID(selectedStoreID);
      // Обновляем значение поля формы
      formRefTarget.current?.setFieldsValue({
        targetStoreID: selectedStoreID,
        targetLocationID: '',
      });

      // Повторно запрашиваем локации для целевого склада
      refetchLocationsTarget();
    } else if (selectedCheckbox === 'transferParts') {
      // setSelectedTargetStoreID(selectedStoreID);
      // Обновляем значение поля формы
      formRefTarget.current?.setFieldsValue({
        // targetStoreID: selectedStoreID,
        targetLocationID: '',
      });

      // Повторно запрашиваем локации для целевого склада
      refetchLocationsTarget();
    }
  }, [selectedStoreID, selectedCheckbox, selectedTargetStoreID]);

  const handleCheckboxChange = (value: React.SetStateAction<string>) => {
    setSelectedCheckbox(value);
  };

  const handleStoreChange = (value: string) => {
    setSelectedStoreID(value);
  };

  const handleTargetStoreChange = (value: string) => {
    setSelectedTargetStoreID(value);
  };

  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = `${String(mpdCode?.storeShortName)?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const loctionsCodesValueEnum: Record<string, string> =
    locations?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = `${String(mpdCode?.locationName)?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const loctionsTargetCodesValueEnum: Record<string, string> =
    locationsTarget?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = `${String(mpdCode?.locationName)?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber;
      return acc;
    }, {}) || {};
  // Обработчик изменений в правой таблице
  const handleRightTableChange = (data: any) => {
    // Получение всех значений формы
    const formData = formTarget.getFieldsValue();
    // Передача всех данных вверх через пропс onDataUpdate
    onDataTargetUpdate(formData);
  };

  // Обработчик завершения заполнения формы в левой таблице
  const handleLeftTableFinish = async (values: any) => {
    // Передача данных вверх через пропс onDataUpdate
    onSubmit(values);
  };
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const labelFormItemRef = useRef<any>(null);

  useEffect(() => {
    if (labelFormItemRef.current) {
      // Focus on the input element
      labelFormItemRef.current.focus();
    }
  }, [labelFormItemRef.current]);
  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col bg-gray-100">
        <Split initialPrimarySize="35%" splitterSize="20px">
          <div className="h-[22vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col overflow-y-auto">
            <ProForm
              // initialFocus="label"
              onReset={(values) => {
                form.resetFields();
                formTarget.resetFields();
                onSubmit(null);
                onDataTargetUpdate(null);
                setSelectedTargetStoreID(undefined);
                setSelectedStoreID(undefined);
              }}
              layout="horizontal"
              size="small"
              form={form}
              formRef={formRef}
              onFinish={handleLeftTableFinish}
            >
              <ProFormGroup>
                <ProFormSelect
                  //                   showSearch
                  // mode={'multiple'}
                  // rules={[{ required: true }]}
                  name="stationID"
                  label={t('STATION')}
                  width="sm"
                  // valueEnum={companiesCodesValueEnum || []}
                  // disabled={!projectId}
                />
                <ProFormSelect
                  showSearch
                  name="storeIDFrom"
                  label={t('STORE')}
                  width="sm"
                  valueEnum={storeCodesValueEnum || []}
                  onChange={handleStoreChange}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="locationIDFrom"
                  label={t('LOCATION')}
                  width="sm"
                  valueEnum={loctionsCodesValueEnum || []}
                  disabled={!selectedStoreID}
                />
                <ProFormText
                  name="label"
                  fieldProps={{
                    onKeyPress: handleKeyPress,
                    ref: labelFormItemRef,
                  }}
                  label={`${t('LABEL')}`}
                  width="sm"
                />
              </ProFormGroup>
              <ProFormSelect
                showSearch
                width={'lg'}
                name="partNumberID"
                label={`${t(`PART No`)}`}
                options={Object.entries(partValueEnum).map(([key, part]) => ({
                  label: part.PART_NUMBER,
                  value: key,
                  data: part,
                }))}
              />
            </ProForm>
          </div>
          <div className="h-[22vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <ProForm
              layout="horizontal"
              size="small"
              submitter={false}
              form={formTarget}
              formRef={formRefTarget}
              onValuesChange={handleRightTableChange}
            >
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="targetStationID"
                  label={t('TARGET STATION')}
                  width="sm"
                  disabled={selectedCheckbox !== 'transferParts'} // Деактивируем, если выбрано значение, отличное от 'TRANSFER PARTS'
                />
                <ProFormSelect
                  showSearch
                  name="targetStoreID"
                  label={t('TARGET STORE')}
                  width="sm"
                  valueEnum={storeCodesValueEnum || []}
                  onChange={handleTargetStoreChange}
                  disabled={selectedCheckbox == 'changeLocation'}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="targetLocationID"
                  label={t('TARGET LOCATION')}
                  width="sm"
                  valueEnum={loctionsTargetCodesValueEnum || []}
                  disabled={!selectedTargetStoreID}
                />
                <ProFormRadio.Group
                  name="radioGroup"
                  options={[
                    { label: `${t('TRANSFER PARTS')}`, value: 'transferParts' },
                    {
                      label: `${t('CHANGE LOCATION')}`,
                      value: 'changeLocation',
                    },
                  ]}
                  value={selectedCheckbox}
                  onChange={(e: { target: { value: any } }) => {
                    handleCheckboxChange(e.target.value);
                  }}
                />
              </ProFormGroup>

              <ProFormGroup>
                <ProFormDigit
                  disabled={selectedCheckbox == 'changeLocation'}
                  width={'sm'}
                  name="quantity"
                  label={`${t('QUANTITY')}`}
                ></ProFormDigit>
              </ProFormGroup>
            </ProForm>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default TransferPartAdmin;
