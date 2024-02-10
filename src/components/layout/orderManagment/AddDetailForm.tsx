import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormItem,
  ProFormRate,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, FormInstance, message } from 'antd';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { t } from 'i18next';
import { IOrder } from '@/models/IOrder';

import React, { FC, useEffect, useRef, useState } from 'react';
import Alternates from '../partAdministration/tabs/mainView/Alternates';
import AlternativeTable from '../AlternativeTable';
import {
  getFilteredAlternativePN,
  getFilteredRequirements,
  updateOrderByID,
} from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import PartsForecast from '../APN/PartsForecast';
import RequirementItemsQuatation from './RequirementItemsQuatation';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import { USER_ID } from '@/utils/api/http';
type AddDetailFormType = {
  currentDetail?: any;
  currenOrder?: IOrder | null;
  onUpdateOrder?: (data: any) => void;
  isEditing?: boolean;
  isCreating?: boolean;
  onSave: (data: any) => void;
  onCancel: (data: any) => void;
  onSearchItems?: (part?: any) => void;
};
const AddDetailForm: FC<AddDetailFormType> = ({
  isEditing,
  isCreating,
  onSearchItems,
  currenOrder,
  currentDetail,
  onUpdateOrder,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [requariment, setRequariment] = useState<any | null>(null);
  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  const [isLocalCreating, setIsLocalCreating] = useState<any>(isCreating);
  const [isLocalEditing, setIsLocalEditing] = useState<any>(isEditing);
  const [alternates, setAlternates] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [quantitySum, setQuantitySum] = useState<any>(null);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [newPart, setnewPart] = useState<any>(currentDetail);
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const formRef = useRef<FormInstance>(null);
  const dispatch = useAppDispatch();
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const uuidv4: () => string = originalUuidv4;
  const companyID = localStorage.getItem('companyID') || '';
  useEffect(() => {
    if (requariment) {
      form.setFields([
        { name: 'requariment', value: requariment.partRequestNumber },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [requariment]);
  useEffect(() => {
    if (selectedSinglePN) {
      const fetchData = async () => {
        const storedKeys = localStorage.getItem('selectedKeys');
        const result = await dispatch(
          getFilteredAlternativePN({
            companyID: companyID,
            partNumber: selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          setAlternates(result.payload);
          onSearchItems && onSearchItems(result.payload);
        }
      };
      const fetchReq = async () => {
        const partNumbers = [
          selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
          ...(alternates || []).map((alternate) => alternate.ALTERNATIVE),
        ];
        const resultReq = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            partNumbers: partNumbers,
            status: ['open', 'onOrder'],
          })
        );

        if (resultReq.meta.requestStatus === 'fulfilled') {
          if (resultReq.meta.requestStatus === 'fulfilled') {
            const filteredPayload = resultReq.payload.filter(
              (record: any) => record.readyStatus === 'not Ready'
            );

            const sum = filteredPayload.reduce((acc: any, record: any) => {
              const amout = record.amout || 0;
              const issuedQuantity = record.issuedQuantity || 0;
              const availableQTY = record.availableQTY || 0;
              return acc + (amout - issuedQuantity - availableQTY);
            }, 0);
            setRequirements(filteredPayload);
            setQuantitySum(sum);
            const newPart = {
              id: uuidv4(),
              PART_NUMBER:
                selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
              DESCRIPTION:
                selectedSinglePN?.nameOfMaterial ||
                selectedSinglePN?.DESCRIPTION,
              ADD_DESCRIPTION:
                selectedSinglePN?.ADD_DESCRIPTION ||
                selectedSinglePN?.nameOfMaterial,
              GROUP: selectedSinglePN?.GROUP || selectedSinglePN?.group,
              TYPE: selectedSinglePN?.GROUP || selectedSinglePN?.type,
              UNIT_OF_MEASURE:
                selectedSinglePN?.UNIT_OF_MEASURE || selectedSinglePN?.unit,
              ADD_UNIT_OF_MEASURE:
                selectedSinglePN?.ADD_UNIT_OF_MEASURE || selectedSinglePN?.unit,
              QUANTITY: form.getFieldValue('quantity'),
              REQUIREMENTS: (filteredPayload || []).map(
                (part: any) => part.partRequestNumber
              ),
              ALTERNATES: (alternates || []).map(
                (part: any) => part.ALTERNATIVE
              ),
              VENDORS: [],
            };

            setnewPart(newPart);
          }
        }
      };

      fetchData();
      fetchReq();
    }
  }, [selectedSinglePN]);

  useEffect(() => {
    if (quantitySum) {
      form.setFields([
        {
          name: 'quantity',
          value: quantitySum,
        },
      ]);
    }
  }, [quantitySum]);
  useEffect(() => {
    if (currentDetail) {
      setIsLocalCreating(isCreating);
      setIsLocalEditing(isEditing);
    }
  }, [currentDetail]);
  return (
    <ProForm
      layout="horizontal"
      submitter={{
        render: (_, dom) =>
          isLocalEditing || isLocalCreating
            ? [
                ...dom,
                <Button
                  key="cancel"
                  onClick={() => {
                    isLocalEditing && setIsLocalEditing(false);
                    isLocalCreating && setIsLocalCreating(false);
                    onCancel(null);
                  }}
                >
                  {t('Cancel')}
                </Button>,
              ]
            : [],
        submitButtonProps: {
          children: 'Search',
        },
      }}
      onFinish={async (values) => {
        if (currenOrder && newPart) {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = await dispatch(
            updateOrderByID({
              id: currenOrder._id || currenOrder.id,
              companyID: currentCompanyID || '',
              updateByID: USER_ID,
              updateBySing: localStorage.getItem('singNumber'),
              updateByName: localStorage.getItem('name'),
              updateDate: new Date(),

              parts: [
                ...(currenOrder.parts || []),
                {
                  id: uuidv4(),
                  PART_NUMBER:
                    selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
                  DESCRIPTION:
                    selectedSinglePN?.nameOfMaterial ||
                    selectedSinglePN?.DESCRIPTION,
                  GROUP: selectedSinglePN?.GROUP || selectedSinglePN?.group,
                  TYPE: selectedSinglePN?.GROUP || selectedSinglePN?.type,
                  UNIT_OF_MEASURE:
                    selectedSinglePN?.UNIT_OF_MEASURE || selectedSinglePN?.unit,
                  QUANTITY: form.getFieldValue('quantity'),
                  ADD_DESCRIPTION:
                    selectedSinglePN?.ADD_DESCRIPTION ||
                    selectedSinglePN?.nameOfMaterial,
                  ADD_UNIT_OF_MEASURE:
                    selectedSinglePN?.ADD_UNIT_OF_MEASURE ||
                    selectedSinglePN?.unit,
                  REQUIREMENTS: (requirements || []).map(
                    (part: any) => part.partRequestNumber
                  ),
                  ALTERNATES: (alternates || []).map(
                    (part: any) => part.ALTERNATIVE
                  ),
                  VENDORS: [],
                },
              ],
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            onUpdateOrder && onUpdateOrder(result.payload);
            message.success(t('SUCCESS'));
            setIsLocalCreating(false);
            setIsLocalEditing(false);
            onSave(null);
          } else message.error(t('ERROR'));
        }
      }}
      size="small"
      form={form}
    >
      <ProFormGroup direction="horizontal">
        <ProFormGroup direction="vertical">
          <ProFormGroup direction="horizontal">
            <ProFormText
              rules={[{ required: true }]}
              name="PART_NUMBER"
              label={t('PART NUMBER')}
              width="sm"
              tooltip={t('PART NUMBER')}
              fieldProps={{
                onDoubleClick: () => {
                  setOpenStoreFind(true);
                },
                onKeyPress: handleKeyPress,
              }}
            ></ProFormText>
            <ProFormText
              rules={[{ required: true }]}
              name="DESCRIPTION"
              label={t('DESCRIPTION')}
              width="sm"
              tooltip={t('DESCRIPTION')}
            ></ProFormText>
            <ProFormGroup>
              <ProFormSelect
                rules={[{ required: true }]}
                name="GROUP"
                label={`${t('PART SPESIAL GROUP')}`}
                width="sm"
                tooltip={`${t('SELECT SPESIAL GROUP')}`}
                options={[
                  { value: 'CONS', label: t('CONS') },
                  { value: 'TOOL', label: t('TOOL') },
                  { value: 'CHEM', label: t('CHEM') },
                  { value: 'ROT', label: t('ROT') },
                  { value: 'GSE', label: t('GSE') },
                ]}
              />
              <ProFormSelect
                rules={[{ required: true }]}
                name="TYPE"
                label={`${t('PART TYPE')}`}
                width="sm"
                tooltip={`${t('SELECT PART TYPE')}`}
                options={[
                  { value: 'ROTABLE', label: t('ROTABLE') },
                  { value: 'CONSUMABLE', label: t('CONSUMABLE') },
                ]}
              />
            </ProFormGroup>
          </ProFormGroup>

          <AlternativeTable
            data={alternates}
            onRowSingleClick={function (record: any, rowIndex?: any): void {}}
            scrolly={7}
          ></AlternativeTable>
        </ProFormGroup>
        <ProFormText
          name="requariment"
          label={t('REQUIREMENT No')}
          width="sm"
          tooltip={t('REQUIREMENTS NUMBER')}
          fieldProps={{
            onDoubleClick: () => setOpenPickViewer(true),

            autoFocus: true,
          }}
        ></ProFormText>
        <RequirementItemsQuatation
          data={requirements}
          scroll={7}
          onReqClick={function (record: any): void {}}
        ></RequirementItemsQuatation>
      </ProFormGroup>
      <ProFormGroup>
        <ProFormDigit
          name="quantity"
          rules={[{ required: true }]}
          label={t('QUANTITY')}
          width="xs"
        ></ProFormDigit>
        <ProFormText
          rules={[{ required: true }]}
          label={t('UNIT')}
          name="UNIT_OF_MEASURE"
          width="xs"
        ></ProFormText>
      </ProFormGroup>

      <ModalForm
        // title={`Search on Store`}
        width={'70vw'}
        // placement={'bottom'}
        open={openStoreFindModal}
        // submitter={false}
        onOpenChange={setOpenStoreFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenStoreFind(false);
          setSecectedSinglePN(record);

          form.setFields([
            { name: 'partNumber', value: selectedSinglePN.PART_NUMBER },
          ]);
        }}
      >
        <PartNumberSearch
          initialParams={{ partNumber: '' }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenStoreFind(false);
            setSecectedSinglePN(record);

            form.setFields([
              { name: 'PART_NUMBER', value: record.PART_NUMBER },
            ]);
            form.setFields([
              { name: 'DESCRIPTION', value: record.DESCRIPTION },
            ]);
            form.setFields([
              { name: 'UNIT_OF_MEASURE', value: record.UNIT_OF_MEASURE },
            ]);

            form.setFields([{ name: 'GROUP', value: record.GROUP }]);
            form.setFields([{ name: 'TYPE', value: record.TYPE }]);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            form.setFields([
              { name: 'PART_NUMBER', value: record.PART_NUMBER },
            ]);
            form.setFields([
              { name: 'DESCRIPTION', value: record.DESCRIPTION },
            ]);
            form.setFields([
              { name: 'UNIT_OF_MEASURE', value: record.UNIT_OF_MEASURE },
            ]);

            form.setFields([{ name: 'GROUP', value: record.GROUP }]);
            form.setFields([{ name: 'TYPE', value: record.TYPE }]);
          }}
        />
      </ModalForm>
      <ModalForm
        title=""
        open={openPickViewer}
        width={'90%'}
        onOpenChange={setOpenPickViewer}
      >
        <div className="h-[78vh]  overflow-hidden">
          <PartsForecast
            onDoubleClick={(record) => {
              setRequariment(record);
              setSecectedSinglePN(record);
              setOpenPickViewer(false);
              form.setFields([{ name: 'PART_NUMBER', value: record.PN }]);
              form.setFields([
                { name: 'DESCRIPTION', value: record.nameOfMaterial },
              ]);
              form.setFields([{ name: 'UNIT_OF_MEASURE', value: record.unit }]);

              form.setFields([{ name: 'GROUP', value: record.group }]);
              form.setFields([{ name: 'TYPE', value: record.type }]);
            }}
          ></PartsForecast>
        </div>
      </ModalForm>
    </ProForm>
  );
};

export default AddDetailForm;
