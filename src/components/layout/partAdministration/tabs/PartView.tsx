import { Badge, Button, Col, Divider, Form, Row, Space, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import {
  createBookingItem,
  postNewPart,
  updatePartByID,
} from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { USER_ID } from '@/utils/api/http';
type PartFormType = {
  part: any;

  onEditPartDetailsEdit: (data: any) => void;
};
const PartView: FC<PartFormType> = ({ part, onEditPartDetailsEdit }) => {
  const { t } = useTranslation();
  const statusEnum: Record<
    string,
    {
      text: string;
      status: 'default' | 'success' | 'processing' | 'error' | 'warning';
    }
  > = {
    ACTIVE: { text: t('ACTIVE'), status: 'success' },
    NO_ACTIVE: { text: t('NO ACTIVE'), status: 'error' },
  };
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);
  const [isCreateView, setIsCreateView] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();

  useEffect(() => {
    if (part && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [part]);
  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  useEffect(() => {
    // console.log(currentPart);

    if (part) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'partNumber', value: part?.PART_NUMBER },
        { name: 'description', value: part?.DESCRIPTION },
        { name: 'addDescription', value: part?.ADD_DESCRIPTION },
        { name: 'addUnit', value: part?.ADD_UNIT_OF_MEASURE },
        { name: 'remarks', value: part?.PART_REMARKS },
        { name: 'partGroup', value: part.GROUP },
        { name: 'partType', value: part.TYPE },
        { name: 'defaultSupplier', value: part.DEFAULT_SUPPLIER },
        { name: 'defaultRepare', value: part.DEFAULT_REPAIRE },
        { name: 'manafacturer', value: part.MANAFACTURER },
        { name: 'partType', value: part.TYPE },
        { name: 'unit', value: part.UNIT_OF_MEASURE },
      ]);
      formAdd.setFields([
        { name: 'partStatus', value: part.STATUS },
        { name: 'updateUserSing', value: part.updateUserSing },
        { name: 'updateDate', value: part.updateDate },
        { name: 'createDate', value: part.createDate },
        { name: 'createUserSing', value: part.createUserSing },
      ]);

      // onFilterTransferParts(form.getFieldsValue());
    }
  }, [part]);
  const dispatch = useAppDispatch();

  return (
    <div>
      <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }} className="gap-5">
        <Col
          xs={2}
          sm={4}
          className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <Space direction="vertical">
            <Space
              className={`cursor-pointer transform transition px-3 ${
                isEditing || isCreating // Добавьте проверку на режим создания
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-blue-500'
              }`}
              onClick={() => {
                if (!isEditing) {
                  setIsEditingView(!isEditingView);
                  // Добавьте проверку на режим создания
                  form.resetFields(); // сбросить все поля формы
                  formAdd.resetFields(); // сбросить все поля формы
                  setIsCreating(true); // включить режим создания
                  setIsEditing(false); // выключить режим редактирования
                  onEditPartDetailsEdit(null);
                }
              }}
            >
              <SettingOutlined
                className={`${
                  isEditing || !isCreating
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer' // Добавьте проверку на режим создания
                }`}
              />
              <div
                className={`${
                  isEditing || !isCreating
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer' // Добавьте проверку на режим создания
                }`}
              >
                {t('CREATE PART')}
              </div>
            </Space>
            <Space
              onClick={() => part && setIsEditingView(!isEditingView)}
              className={`cursor-pointer transform transition px-3 ${
                !part ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              }`}
            >
              <EditOutlined />
              <>{t('EDIT')}</>
            </Space>
          </Space>
        </Col>
        <Col
          xs={2}
          sm={13}
          className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <ProForm
            onFinish={async (values) => {
              const currentCompanyID = localStorage.getItem('companyID') || '';
              if (isEditing && !isCreating) {
                const result = await dispatch(
                  updatePartByID({
                    companyID: currentCompanyID,
                    id: part._id,
                    updateDate: new Date(),
                    updateUserID: USER_ID || '',
                    updateUserSing: localStorage.getItem('singNumber') || '',
                    STATUS: formAdd.getFieldValue('partStatus'),
                    PART_NUMBER: values.partNumber,
                    DESCRIPTION: values.description,
                    ADD_DESCRIPTION: values.addDescription,
                    TYPE: values.partType,
                    GROUP: values.partGroup,
                    ACTYPE: values.acType,
                    COUNTRY_OF_ORIGIN: values.country,
                    RESOURCE_TYPE: values.resourceType,
                    DEFAULT_REPAIRE: formAdd.getFieldValue('defaultRepare'),
                    DEFAULT_SUPPLIER: formAdd.getFieldValue('defaultSupplier'),
                    MANAFACTURER: formAdd.getFieldValue('manafacturer'),
                    UNIT_OF_MEASURE: values.unit,
                    ADD_UNIT_OF_MEASURE: values.addUnit,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onEditPartDetailsEdit(result.payload);
                  message.success('SUCCESS');
                  await dispatch(
                    createBookingItem({
                      companyID: currentCompanyID,
                      data: {
                        companyID: currentCompanyID,
                        userSing: localStorage.getItem('singNumber') || '',
                        userID: USER_ID || '',
                        createDate: new Date(),
                        PART_NUMBER: result.payload?.PART_NUMBER,
                        voucherModel: 'MODIFIED',
                        GROUP: result.payload?.GROUP,
                        TYPE: result.payload?.TYPE,
                        CONDITION: result.payload?.CONDITION,
                        NAME_OF_MATERIAL: result.payload?.NAME_OF_MATERIAL,
                        STOCK: result.payload?.STOCK,
                        RECEIVED_DATE: result.payload?.RECEIVED_DATE,
                        UNIT_OF_MEASURE: result.payload.UNIT_OF_MEASURE,
                        ADD_UNIT_OF_MEASURE:
                          result.payload?.ADD_UNIT_OF_MEASURE,
                        ADD_NAME_OF_MATERIAL:
                          result.payload?.ADD_NAME_OF_MATERIAL,
                        ADD_PART_NUMBER: result.payload?.ADD_PART_NUMBER,
                        ADD_QUANTITY: result.payload?.ADD_QUANTITY,
                        STATUS: result.payload?.STATUS,
                      },
                    })
                  );
                }
              }
              if (isCreating) {
                const resultPost = await dispatch(
                  postNewPart({
                    companyID: currentCompanyID,
                    createDate: new Date(),
                    createUserID: USER_ID || '',
                    createUserSing: localStorage.getItem('singNumber') || '',
                    STATUS: formAdd.getFieldValue('partStatus'),
                    PART_NUMBER: String(values.partNumber)?.toLowerCase(),
                    DESCRIPTION: String(values.description)?.toLowerCase(),
                    ADD_DESCRIPTION: String(
                      values.addDescription
                    )?.toLowerCase(),
                    TYPE: values.partType,
                    GROUP: values.partGroup,
                    ACTYPE: values.acType,
                    COUNTRY_OF_ORIGIN: values.country,
                    RESOURCE_TYPE: values.resourceType,
                    DEFAULT_REPAIRE: formAdd
                      .getFieldValue('defaultRepare')
                      ?.toLowerCase(),
                    DEFAULT_SUPPLIER: formAdd
                      .getFieldValue('defaultSupplier')
                      ?.toLowerCase(),
                    MANAFACTURER: formAdd.getFieldValue('manafacturer'),
                    UNIT_OF_MEASURE: String(values?.unit)?.toLowerCase(),
                    ADD_UNIT_OF_MEASURE: String(values?.unit)?.toLowerCase(),
                  })
                );
                if (resultPost.meta.requestStatus === 'fulfilled') {
                  onEditPartDetailsEdit(resultPost.payload);
                  message.success('SUCCESS');
                  setIsEditing(false);
                  setIsCreating(false);
                  await dispatch(
                    createBookingItem({
                      companyID: currentCompanyID,
                      data: {
                        companyID: currentCompanyID,
                        userSing: localStorage.getItem('singNumber') || '',
                        userID: USER_ID || '',
                        createDate: new Date(),
                        PART_NUMBER: resultPost.payload.PART_NUMBER,
                        voucherModel: 'ADD_NEW_PART',
                        GROUP: resultPost.payload?.GROUP,
                        TYPE: resultPost.payload?.TYPE,
                        CONDITION: resultPost.payload?.CONDITION,
                        NAME_OF_MATERIAL: resultPost.payload?.NAME_OF_MATERIAL,
                        STOCK: resultPost.payload?.STOCK,
                        RECEIVED_DATE: resultPost.payload?.RECEIVED_DATE,
                        UNIT_OF_MEASURE: resultPost.payload.UNIT_OF_MEASURE,
                        ADD_UNIT_OF_MEASURE:
                          resultPost.payload?.ADD_UNIT_OF_MEASURE,
                        ADD_NAME_OF_MATERIAL:
                          resultPost.payload?.ADD_NAME_OF_MATERIAL,
                        ADD_PART_NUMBER: resultPost.payload?.ADD_PART_NUMBER,
                        STATUS: resultPost.payload?.STATUS,
                      },
                    })
                  );
                }
              }
            }}
            size="small"
            form={form}
            submitter={{
              render: (_, dom) =>
                isEditing || isCreating
                  ? [
                      ...dom,
                      <Button
                        key="cancel"
                        onClick={() => {
                          isEditing && setIsEditingView(!isEditingView);
                          isCreating && setIsCreating(false);
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
            disabled={!isEditing && !isCreating}
            layout="horizontal"
            labelCol={{ span: 8 }}
          >
            {isEditing && (
              <>
                <ProFormText
                  disabled={!isCreating}
                  rules={[{ required: true }]}
                  name="partNumber"
                  label={t('PART No')}
                  width="lg"
                  tooltip={t('PART No')}
                ></ProFormText>
                <ProFormText
                  fieldProps={{ style: { resize: 'none' } }}
                  rules={[{ required: true }]}
                  name="description"
                  label={t('DESCRIPTION')}
                  width="lg"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
                <ProFormText
                  fieldProps={{ style: { resize: 'none' } }}
                  // rules={[{ required: true }]}
                  name="addDescription"
                  label={t(' ADD DESCRIPTION')}
                  width="lg"
                  tooltip={t('ADD DESCRIPTION')}
                ></ProFormText>
              </>
            )}
            <ProFormSelect
              rules={[{ required: true }]}
              name="partType"
              label={`${t('PART TYPE')}`}
              width="lg"
              tooltip={`${t('SELECT PART TYPE')}`}
              options={[
                { value: 'ROTABLE', label: t('ROTABLE') },
                { value: 'CONSUMABLE', label: t('CONSUMABLE') },
              ]}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="partGroup"
              label={`${t('PART GROUP')}`}
              width="lg"
              tooltip={`${t('SELECT SPESIAL GROUP')}`}
              options={[
                { value: 'CONS', label: t('CONS') },
                { value: 'TOOL', label: t('TOOL') },
                { value: 'CHEM', label: t('CHEM') },
                { value: 'ROT', label: t('ROT') },
                { value: 'GSE', label: t('GSE') },
              ]}
            />
            <ProFormGroup>
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                label={t('UNIT')}
                name="unit"
                width="sm"
                valueEnum={{
                  EA: `EA/${t('EACH').toUpperCase()}`,
                  M: `M/${t('Meters').toUpperCase()}`,
                  ML: `ML/${t('Milliliters').toUpperCase()}`,
                  SI: `SI/${t('Sq Inch').toUpperCase()}`,
                  CM: `CM/${t('Centimeters').toUpperCase()}`,
                  GM: `GM/${t('Grams').toUpperCase()}`,
                  YD: `YD/${t('Yards').toUpperCase()}`,
                  FT: `FT/${t('Feet').toUpperCase()}`,
                  SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                  IN: `IN/${t('Inch').toUpperCase()}`,
                  SH: `SH/${t('Sheet').toUpperCase()}`,
                  SM: `SM/${t('Sq Meters').toUpperCase()}`,
                  RL: `RL/${t('Roll').toUpperCase()}`,
                  KT: `KT/${t('Kit').toUpperCase()}`,
                  LI: `LI/${t('Liters').toUpperCase()}`,
                  KG: `KG/${t('Kilograms').toUpperCase()}`,
                  JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                }}
              ></ProFormSelect>
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                label={t('ADD UNIT')}
                name="addUnit"
                width="sm"
                valueEnum={{
                  шт: `${t('шт').toUpperCase()}`,
                  м: `${t('м').toUpperCase()}`,
                  мл: `${t('мл').toUpperCase()}`,
                  дюйм2: `${t('дюйм2').toUpperCase()}`,
                  см: `${t('см').toUpperCase()}`,
                  г: `${t('г').toUpperCase()}`,
                  ярд: `${t('ярд').toUpperCase()}`,
                  фут: `${t('фут').toUpperCase()}`,
                  см2: `${t('см2').toUpperCase()}`,
                  дюйм: `${t('дюйм').toUpperCase()}`,
                  м2: `${t('м2').toUpperCase()}`,
                  рул: `${t('рул').toUpperCase()}`,
                  л: `${t('л').toUpperCase()}`,
                  кг: `${t('кг').toUpperCase()}`,
                }}
              ></ProFormSelect>
            </ProFormGroup>

            {/* <ProFormSelect
              showSearch
              // rules={[{ required: true }]}
              name="condition"
              label={t('CONDITION')}
              width="lg"
              tooltip={t('CONDITION')}
              valueEnum={{
                '/NEW': t('NEW'),
                '/INSPECTED': t('INSPECTED'),
                '/REPAIRED': t('REPAIRED / ТЕКУЩИЙ РЕМОНТ'),
                '/SERVICABLE': t('SERVICABLE / ИСПРАВНО'),
                '/UNSERVICABLE': t('UNSERVICABLE / НЕИСПРАВНО'),
              }}
            /> */}
            <ProFormText
              // rules={[{ required: true }]}
              label={t('AC TYPE')}
              name="acType"
              width="md"
            ></ProFormText>
            <ProFormText
              // rules={[{ required: true }]}
              label={t('COUNTRY OF ORIGIN')}
              name="country"
              width="md"
            ></ProFormText>
            <ProFormText
              // rules={[{ required: true }]}
              label={t('RESOURCE TYPE')}
              name="resourceType"
              width="md"
            ></ProFormText>
          </ProForm>
        </Col>
        <Col
          className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
          xs={2}
          sm={6}
        >
          <Space direction="vertical">
            <div className="p-1 bg-neutral-100"> {t('PART STATUS')}</div>
            <div>
              <Space className={`w-[100%] `} direction="vertical">
                <ProForm
                  disabled={!isEditing}
                  form={formAdd}
                  submitter={false}
                  size="small"
                  layout="horizontal"
                >
                  <div
                    className={`w-[100%] my-1 p-1 ${
                      part?.STATUS === 'ACTIVE' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <>{t('PART is')}</>{' '}
                    <Badge
                      status={statusEnum[part?.STATUS || 'NO_ACTIVE']?.status}
                    />
                    {''} {statusEnum[part?.STATUS || 'NO_ACTIVE']?.text}
                  </div>
                  {isEditing && (
                    <ProFormSelect
                      rules={[{ required: true }]}
                      name="partStatus"
                      label={`${t('PART STATUS')}`}
                      width="sm"
                      tooltip={`${t('SELECT PART STATUS')}`}
                      options={[
                        { value: 'ACTIVE', label: t('ACTIVE') },
                        { value: 'NO_ACTIVE', label: t('NO ACTIVE') },
                      ]}
                    />
                  )}
                  <Divider className="py-2 my-2"></Divider>
                  <div className="p-1 my-1 bg-neutral-100">
                    {t('LOGISTIC OWERVIEW')}
                  </div>

                  <ProFormText
                    // rules={[{ required: true }]}
                    label={t('DEFAULT SUPPLIER')}
                    name="defaultSupplier"
                    width="sm"
                  ></ProFormText>
                  <ProFormText
                    // rules={[{ required: true }]}
                    label={t('DEFAULT REPAIRE')}
                    name="defaultRepare"
                    width="sm"
                  ></ProFormText>
                  <ProFormText
                    // rules={[{ required: true }]}
                    label={t('MANAFACTURER')}
                    name="manafacturer"
                    width="sm"
                  ></ProFormText>
                  <Divider className="py-2 my-2"></Divider>
                  <div className="p-1 my-1 bg-neutral-100">
                    {t('CREATION/MUTATION')}
                  </div>
                  <ProFormGroup>
                    <ProFormText
                      disabled
                      // rules={[{ required: true }]}
                      label={t('CREATE BY')}
                      name="createUserSing"
                      width="xs"
                    ></ProFormText>{' '}
                    <ProFormDatePicker
                      disabled
                      name="createDate"
                      label={t('ON')}
                      width="xs"
                    ></ProFormDatePicker>
                  </ProFormGroup>
                  <ProFormGroup>
                    <ProFormText
                      disabled
                      // rules={[{ required: true }]}
                      label={t('UPDATE BY')}
                      name="updateUserSing"
                      width="xs"
                    ></ProFormText>
                    <ProFormDatePicker
                      disabled
                      name="updateDate"
                      label={t('ON')}
                      width="xs"
                    ></ProFormDatePicker>
                  </ProFormGroup>
                </ProForm>
              </Space>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PartView;
