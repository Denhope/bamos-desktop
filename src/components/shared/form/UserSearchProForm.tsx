import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

import { AutoComplete, Col, Form, Row, Input } from 'antd';

import { UserResponce } from '@/models/IUser';
import React, { FC, useEffect, useRef, useState } from 'react';
import { getFilteredUsers } from '@/utils/api/thunks';

interface UserSearchFormProps {
  onUserSelect: (user: UserResponce) => void;
  performedName?: string | null;
  performedSing?: string | null;
  reset: boolean;
  actionNumber: number | null;
  disabled?: boolean;
}

const UserSearchForm: FC<UserSearchFormProps> = ({
  onUserSelect,
  performedName,
  performedSing,
  reset,
  actionNumber,
  disabled,
}) => {
  const [form] = Form.useForm();
  const inputRef = useRef<any>(null);
  const timeoutRefWO = useRef<NodeJS.Timeout | null>(null);
  const [optionsUsers, setOptionsUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>(null);
  const companyID = localStorage.getItem('companyID');
  const handleSearchUser = async (value: any) => {
    if (timeoutRefWO.current) {
      clearTimeout(timeoutRefWO.current);
    }
    timeoutRefWO.current = setTimeout(async () => {
      if (companyID) {
        setOptionsUsers(
          await getFilteredUsers({
            companyID: companyID,
            singNumber: value,
          })
        );
      }
    }, 400);
  };
  const handleSelectUser = (value: string) => {
    const user = optionsUsers.find(
      (user: UserResponce) => user.singNumber === value
    );
    if (user) {
      setSelectedUser(user);
      handleSelectChangeUser(user);
    }
  };
  const handleSelectChangeUser = (user: UserResponce) => {
    form.setFieldsValue({
      performedSing: user.singNumber,
      performedName: user.name,
    });
    onUserSelect(user);
  };

  const handleSearch = async (value: string) => {
    if (companyID) {
      await getFilteredUsers({
        companyID: companyID,
        pass: Number(value),
      }).then((data) => {
        form.setFieldsValue({
          performedSing: data[0].singNumber,
          performedName: data[0].name,
        });
        onUserSelect(data[0]);
      });
    }
  };

  const handleChangePass = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassValue(value);
    handleSearch(value);
  };
  const [passValue, setPassValue] = useState('');

  useEffect(() => {
    form.setFieldsValue({
      performedSing,
      performedName,
    });
  }, [performedName, performedSing]);

  useEffect(() => {
    if (reset) {
      form.resetFields();
    }
  }, [reset]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [!performedSing]);

  return (
    <ProForm
      className="mb-5"
      size="middle"
      form={form}
      layout="inline"
      autoComplete="off"
      submitter={false}
      onFinish={async (values: any) => {}}
    >
      <ProForm.Group>
        <ProFormText
          name="pass"
          label="PASS"
          fieldProps={{
            width: 'sm',
            allowClear: true,
            disabled: disabled,
            value: passValue,
            onChange: handleChangePass,
            ref: inputRef,
          }}
        />
        <ProFormSelect
          showSearch
          name="performedSing"
          label="SING"
          rules={[{ required: true }]}
          fieldProps={{
            disabled: disabled,
            allowClear: true,
            onSelect: handleSelectUser,
            options: optionsUsers.map((user: UserResponce) => ({
              value: `${user.singNumber}`,
              label: `${user.singNumber}`, // Добавьте это
            })),
            onSearch: handleSearchUser,
          }}
        />
        <ProFormText
          name="performedName"
          label={t('NAME')}
          rules={[{ required: true }]}
          fieldProps={{
            width: 'sm',
            allowClear: true,
            disabled: disabled,
          }}
        />
      </ProForm.Group>
    </ProForm>
  );
};
export default UserSearchForm;
