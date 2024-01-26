import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import React, { FC } from 'react';

const PickSlipIssuedForm: FC = () => {
  return (
    <div>
      <ProForm>
        <ProFormGroup>
          <ProFormSelect
            tooltip="SELECT STORE  "
            options={[
              { value: 'MSQ', label: 'MSQ' },
              { value: 'AVJ', label: 'AVJ' },
              { value: 'PBD', label: 'PBD' },
            ]}
            label={'Get From'}
          ></ProFormSelect>
          <ProFormSelect
            options={[
              { value: 'MSQ', label: 'MSQ' },
              { value: 'AVJ', label: 'AVJ' },
              { value: 'PBD', label: 'PBD' },
              { value: 'MCC', label: 'MCC' },
            ]}
            label={'Needed On'}
          ></ProFormSelect>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default PickSlipIssuedForm;
