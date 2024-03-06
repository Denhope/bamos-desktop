import {
  ModalForm,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Col, Form, Modal, Row, Space, message } from 'antd';
import AlternativeTable from '@/components/layout/AlternativeTable';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  deleteAlternativePartByID,
  getFilteredAlternativePN,
  postNewAlternativePart,
  updateAlternativePartByID,
} from '@/utils/api/thunks';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { USER_ID } from '@/utils/api/http';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type AlternatesFormType = {
  onEditPart?: (part?: any) => void;
  currentPart?: any;
};
const Alternates: FC<AlternatesFormType> = ({ currentPart }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [formCreate] = Form.useForm();
  const [openCreateAlternate, setOpenCreateAlternate] = useState(false);
  const companyID = localStorage.getItem('companyID') || '';
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);
  const [groupTwoWays, setGroupTwoWays] = useState<any>(false);
  const [alternates, setAlternates] = useState<any[]>([]);
  const [currentAlternate, setCurrentAlternate] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedSingleAlternativePN, setSecectedSingleAlternativePN] =
    useState<any>();
  useEffect(() => {
    if (currentPart) {
      const fetchData = async () => {
        const storedKeys = localStorage.getItem('selectedKeys');
        const result = await dispatch(
          getFilteredAlternativePN({
            companyID: companyID,
            partNumber: currentPart?.PART_NUMBER,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          setAlternates(result.payload);
          setCurrentAlternate(null);
        }
        setCurrentAlternate(null);
      };

      fetchData();
    }
  }, [currentPart]);
  useEffect(() => {
    // if (currentAlternate) {
    form.setFields([
      { name: 'alternativeType', value: currentAlternate?.ALTERNATIVE_TYPE },
      {
        name: 'alternative',
        value:
          currentAlternate?.ALTERNATIVE || currentAlternate?.ALTERNATIVE_NUMBER,
      },
      {
        name: 'description',
        value: currentAlternate?.ALTERNATIVE_DESCRIPTION,
      },
      {
        name: 'alternativeRemarks',
        value: currentAlternate?.ALTERNATIVE_REMARKS,
      },
      {
        name: 'createDate',
        value: currentAlternate?.DATE_ENTERED || currentAlternate?.createDate,
      },
      { name: 'updateUserSing', value: currentAlternate?.updateUserSing },
      {
        name: 'updateDate',
        value: currentAlternate?.updateDate,
      },
      { name: 'createUserSing', value: currentAlternate?.createUserSing },
    ]);
    // }
  }, [currentAlternate]);
  useEffect(() => {
    if (currentPart) {
      formCreate.setFields([
        { name: 'partNumber', value: currentPart?.PART_NUMBER },
      ]);
    }
  }, [currentPart]);
  useEffect(() => {
    if (currentAlternate && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [currentAlternate]);
  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  const [initialFormPN, setinitialFormPN] = useState<any>('');
  return (
    <div>
      <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }} className="gap-5">
        <Col
          xs={2}
          sm={16}
          className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <div className="h-[47vh] overflow-hidden flex flex-col justify-between">
            <AlternativeTable
              scrolly={59}
              data={alternates}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setCurrentAlternate(record);
              }}
            ></AlternativeTable>
          </div>
        </Col>
        <Col
          className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
          xs={2}
          sm={7}
        >
          <Space direction="vertical">
            <Row justify="space-between">
              <Space
                onClick={() =>
                  currentAlternate && setIsEditingView(!isEditingView)
                }
                className={`cursor-pointer transform transition px-3 ${
                  !currentAlternate
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:text-blue-500'
                }`}
              >
                <EditOutlined />
                <div className="p-1 bg-neutral-100"> {t('ALTERNATES')}</div>
              </Space>
              <Space>
                <PlusOutlined
                  onClick={() => setOpenCreateAlternate(true)}
                  className={`cursor-pointer transform transition px-3 ${
                    isEditingView || !currentPart
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:text-blue-500'
                  }`}
                />
                <DeleteOutlined
                  onClick={() => {
                    Modal.confirm({
                      title: t('ARE YOU SURE YOU WANT TO DELETE?'),
                      onOk: async () => {
                        const currentCompanyID =
                          localStorage.getItem('companyID') || '';
                        const result = await dispatch(
                          deleteAlternativePartByID({
                            companyID: currentCompanyID,
                            id: currentAlternate._id || currentAlternate.id,
                          })
                        );
                        if (result.meta.requestStatus === 'fulfilled') {
                          setAlternates((prevAlternates) =>
                            prevAlternates.filter(
                              (item) => item?._id !== currentAlternate?._id
                            )
                          );

                          if (currentAlternate.ISTWOWAYS) {
                            const resultADD = await dispatch(
                              getFilteredAlternativePN({
                                companyID: companyID,
                                partNumber: currentAlternate.ALTERNATIVE,
                                alternatine: currentPart?.PART_NUMBER,
                              })
                            );
                            if (resultADD.meta.requestStatus === 'fulfilled') {
                              // console.log(resultADD.payload[0]);
                              const result = await dispatch(
                                deleteAlternativePartByID({
                                  companyID: currentCompanyID,
                                  id: resultADD.payload[0]._id,
                                })
                              );
                              setCurrentAlternate(null);
                              message.success('SUCCESS');
                            }
                          } else {
                            setCurrentAlternate(null);
                            message.success('SUCCESS');
                          }
                        }
                      },
                    });
                  }}
                  className={`cursor-pointer transform transition px-3 ${
                    !currentAlternate || !isEditingView
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:text-blue-500'
                  }`}
                />
              </Space>
            </Row>
            <div>
              <ProForm
                onFinish={async (values) => {
                  const currentCompanyID =
                    localStorage.getItem('companyID') || '';
                  if (isEditing) {
                    const result = await dispatch(
                      updateAlternativePartByID({
                        companyID: currentCompanyID,
                        id: currentAlternate._id,
                        updateDate: new Date(),
                        updateUserID: USER_ID || '',
                        updateUserSing:
                          localStorage.getItem('singNumber') || '',
                        ALTERNATIVE_REMARKS: values?.alternativeRemarks,
                        ALTERNATIVE_DESCRIPTION: values?.description,
                        ALTERNATIVE: values?.alternative,
                        ALTERNATIVE_TYPE: values?.alternativeType,
                      })
                    );
                    if (result.meta.requestStatus === 'fulfilled') {
                      setCurrentAlternate(result.payload);
                      setAlternates(
                        alternates.map((item) =>
                          item._id === result.payload._id
                            ? result.payload
                            : item
                        )
                      );
                      message.success('SUCCESS');
                    }
                  }
                }}
                form={form}
                submitter={{
                  render: (_, dom) =>
                    isEditing
                      ? [
                          ...dom,
                          <Button
                            key="cancel"
                            onClick={() => {
                              isEditing && setIsEditingView(!isEditingView);
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
                size="small"
                layout="horizontal"
              >
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="alternativeType"
                  disabled={!isEditing}
                  label={`${t('TYPE')}`}
                  width="sm"
                  tooltip={`${t('SELECT ALTERNATIVE TYPE')}`}
                  options={[{ value: 'A', label: t('ALTERNATIVE PARTNUMBER') }]}
                />
                <ProFormText
                  disabled
                  rules={[{ required: true }]}
                  name="alternative"
                  label={t('ALTERNATE NUMBER')}
                  width="sm"
                  tooltip={t('ALTERNATE NUMBER')}
                ></ProFormText>
                <ProFormText
                  disabled
                  rules={[{ required: true }]}
                  label={t('DESCRIPTION')}
                  name="description"
                  width="lg"
                ></ProFormText>
                <ProFormCheckbox.Group
                  labelAlign="left"
                  disabled
                  name="GROUP"
                  fieldProps={{
                    onChange: (value) => setGroupTwoWays(!groupTwoWays),
                  }}
                  options={[
                    { label: 'TWO WAYS INTERCHANGEBILITY', value: 'group' },
                  ].map((option) => ({
                    ...option,
                    style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                  }))}
                />
                <ProFormTextArea
                  disabled={!isEditing}
                  fieldProps={{ style: { resize: 'none' } }}
                  colSize={2}
                  label={t('REMARKS')}
                  name="alternativeRemarks"
                  width="lg"
                  tooltip={t('PURCHASE REMARKS')}
                ></ProFormTextArea>

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
                    width="sm"
                  ></ProFormDatePicker>
                </ProFormGroup>
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
                    width="sm"
                  ></ProFormDatePicker>
                </ProFormGroup>
              </ProForm>
            </div>
          </Space>
        </Col>
        <ModalForm
          layout="horizontal"
          form={formCreate}
          size="small"
          onFinish={async (values) => {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (openCreateAlternate) {
              const result = await dispatch(
                postNewAlternativePart({
                  companyID: currentCompanyID,
                  createDate: new Date(),
                  createUserID: USER_ID || '',
                  createUserSing: localStorage.getItem('singNumber') || '',
                  ALTERNATIVE_REMARKS: values?.alternativeRemarks,
                  ALTERNATIVE_DESCRIPTION: values?.description,
                  ALTERNATIVE: selectedSingleAlternativePN?.PART_NUMBER,
                  ALTERNATIVE_TYPE: values?.alternativeType,
                  PART_NUMBER: currentPart?.PART_NUMBER,
                  DESCRIPTION: currentPart?.DESCRIPTION,
                  GROUP: currentPart?.GROUP,
                  TYPE: currentPart?.TYPE,
                  ACTYPE: currentPart.ACTYPE,
                  ISTWOWAYS: groupTwoWays,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                if (groupTwoWays) {
                  const resultAdd = await dispatch(
                    postNewAlternativePart({
                      companyID: currentCompanyID,
                      createDate: new Date(),
                      createUserID: USER_ID || '',
                      createUserSing: localStorage.getItem('singNumber') || '',
                      ALTERNATIVE_REMARKS: currentPart?.PART_REMARKS,
                      ALTERNATIVE_DESCRIPTION: currentPart?.DESCRIPTION,
                      ALTERNATIVE: currentPart?.PART_NUMBER,
                      ALTERNATIVE_TYPE: values?.alternativeType,
                      PART_NUMBER: selectedSingleAlternativePN?.PART_NUMBER,
                      DESCRIPTION: values?.description,
                      TYPE: currentPart.TYPE,
                      GROUP: currentPart.GROUP,
                      ACTYPE: currentPart.ACTYPE,
                      ISTWOWAYS: groupTwoWays,
                    })
                  );
                }

                setAlternates((prevAlternates) => [
                  ...prevAlternates,
                  result.payload,
                ]);
                message.success('SUCCESS');
                setOpenCreateAlternate(false);
              }
            }
          }}
          title={`${t('ADD NEW ALTERNATE')}`}
          open={openCreateAlternate}
          width={'40vw'}
          onOpenChange={setOpenCreateAlternate}
        >
          <ProFormText
            initialValue={currentPart?.PART_NUMBER}
            disabled
            rules={[{ required: true }]}
            name="partNumber"
            label={t('PART No')}
            width="sm"
            tooltip={t('PART No')}
          ></ProFormText>
          <ProFormSelect
            // initialValue={['A']}
            rules={[{ required: true }]}
            name="alternativeType"
            label={`${t('TYPE')}`}
            width="sm"
            tooltip={`${t('SELECT ALTERNATIVE TYPE')}`}
            options={[{ value: 'A', label: t('ALTERNATIVE PARTNUMBER') }]}
          />
          {/* <ProFormText
            rules={[{ required: true }]}
            name="alternative"
            label={t('ALTERNATE NUMBER')}
            width="sm"
            tooltip={t('DOUBLE CLICK OPEN PARTlIST')}
            fieldProps={{
              onDoubleClick: () => {
                setOpenStoreFind(true);
              },
            }}
          ></ProFormText> */}
          <ContextMenuPNSearchSelect
            label={t('PART NO')}
            // isResetForm={isResetForm}
            rules={[{ required: true }]}
            onSelectedPN={function (PN: any): void {
              setSecectedSingleAlternativePN(PN),
                // form.setFields([{ name: 'partNumber', value: PN.PART_NUMBER }]);
                formCreate.setFields([
                  { name: 'description', value: PN.DESCRIPTION },
                ]);
            }}
            name={'alternative'}
            initialFormPN={initialFormPN}
            width={'sm'}
          ></ContextMenuPNSearchSelect>
          <ProFormText
            rules={[{ required: true }]}
            label={t('DESCRIPTION')}
            name="description"
            width="xl"
          ></ProFormText>
          <ProFormCheckbox.Group
            labelAlign="left"
            name="GROUP"
            fieldProps={{
              onChange: (value) => {
                if (value.includes('group')) {
                  setGroupTwoWays(true);
                } else {
                  setGroupTwoWays(false);
                }
              },
            }}
            options={[
              { label: 'TWO WAYS INTERCHANGEBILITY', value: 'group' },
            ].map((option) => ({
              ...option,
              style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
            }))}
          />
          <ProFormTextArea
            fieldProps={{ style: { resize: 'none' } }}
            colSize={2}
            label={t('REMARKS')}
            name="alternativeRemarks"
            width="lg"
            tooltip={t('PURCHASE REMARKS')}
          ></ProFormTextArea>
        </ModalForm>
        {/* <ModalForm
          // title={`Search on Store`}
          width={'70vw'}
          // placement={'bottom'}
          open={openStoreFindModal}
          // submitter={false}
          onOpenChange={setOpenStoreFind}
          onFinish={async function (
            record: any,
            rowIndex?: any
          ): Promise<void> {
            setOpenStoreFind(false);

            form.setFields([
              { name: 'partNumber', value: selectedSinglePN.PART_NUMBER },
              { name: 'description', value: record.DESCRIPTION },
            ]);
          }}
        >
          <PartNumberSearch
            initialParams={{ partNumber: '' }}
            scroll={45}
            onRowClick={function (record: any, rowIndex?: any): void {
              setOpenStoreFind(false);

              formCreate.setFields([
                { name: 'alternative', value: record.PART_NUMBER },
              ]);
              formCreate.setFields([
                { name: 'description', value: record.DESCRIPTION },
              ]);
            }}
            isLoading={false}
            onRowSingleClick={function (record: any, rowIndex?: any): void {
              setSecectedSinglePN(record);

              formCreate.setFields([
                { name: 'alternative', value: record.PART_NUMBER },
              ]);
              formCreate.setFields([
                { name: 'description', value: record.DESCRIPTION },
              ]);
            }}
          />
        </ModalForm> */}
      </Row>
    </div>
  );
};

export default Alternates;
