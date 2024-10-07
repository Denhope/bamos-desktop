import {
  FormInstance,
  ModalForm,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';

import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredPartNumber } from '@/utils/api/thunks';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type SearchPartFormFormType = {
  onPartSearch: (part?: any) => void;
  currentPart?: any;
};
const SearchPartForm: FC<SearchPartFormFormType> = ({
  currentPart,
  onPartSearch,
}) => {
  const formRef = useRef<FormInstance>(null);

  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const companyID = localStorage.getItem('companyID') || '';
  useEffect(() => {
    if (currentPart) {
      setSecectedSinglePN(currentPart);
      form.setFields([
        { name: 'partNumber', value: currentPart?.PART_NUMBER },
        { name: 'description', value: currentPart?.DESCRIPTION },
        { name: 'remarks', value: currentPart?.PART_REMARKS },
      ]);
    }
  }, [currentPart]);
  const [initialFormPN, setinitialFormPN] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  return (
    <ProForm
      onReset={() => {
        onPartSearch(null);
        setinitialFormPN('');
        setIsResetForm(true);
        setTimeout(() => {
          setIsResetForm(false);
        }, 0);
        setSecectedSinglePN({ PART_NUMBER: '' });
      }}
      onFinish={async (values: any) => {
        if (selectedSinglePN) {
          const result = await dispatch(
            getFilteredPartNumber({
              companyID: companyID,
              partNumber: selectedSinglePN.PART_NUMBER,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
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
        <ContextMenuPNSearchSelect
          label={t('PART No')}
          isResetForm={isResetForm}
          rules={[{ required: true }]}
          onSelectedPN={function (PN: any): void {
            setSecectedSinglePN(PN), onPartSearch(PN);
            // form.setFields([{ name: 'partNumber', value: PN.PART_NUMBER }]);
            form.setFields([{ name: 'description', value: PN?.DESCRIPTION }]);
            form.setFields([{ name: 'UNIT', value: PN?.UNIT_OF_MEASURE }]);
            form.setFields([{ name: 'remarks', value: PN?.PART_REMARKS }]);
          }}
          name={'partNumber'}
          initialFormPN={selectedSinglePN?.PART_NUMBER || initialFormPN}
          width={'lg'}
        ></ContextMenuPNSearchSelect>
        <ProFormText
          disabled
          name="description"
          label={t('DESCRIPTION')}
          width="xl"
          tooltip={t('PART DESCRIPTION')}
        ></ProFormText>
        <ProFormTextArea
          disabled
          fieldProps={{ style: { resize: 'none' } }}
          // colSize={5}
          name="remarks"
          label={t('REMARKS')}
          width="lg"
          tooltip={t('PART REMARKS')}
        ></ProFormTextArea>
      </ProFormGroup>
    </ProForm>
  );
};

export default SearchPartForm;
