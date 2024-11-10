import React, { useEffect } from 'react';
import { Form, Select, Input, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '@/models/IUser';
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from '@ant-design/icons';
import { ProFormDigit } from '@ant-design/pro-components';

const { Option } = Select;

interface TaskAllocation {
  id: string;
  userID: string | { _id: string };
  duration: number;
  organizationAuthorization?: string;
  skill?: string;
}

interface UserTaskAllocationProps {
  users: User[];
  task?: any;
  initialTaskAllocations?: TaskAllocation[];
  onTaskAllocationsChange?: (taskAllocations: TaskAllocation[]) => void;
  onlyWithOrganizationAuthorization?: boolean;
}

const UserTaskAllocation: React.FC<UserTaskAllocationProps> = ({
  users,
  task,
  initialTaskAllocations = [],
  onTaskAllocationsChange = () => {},
  onlyWithOrganizationAuthorization = true,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // console.log(initialTaskAllocations);
  const handleTaskAllocationChange = (values: any[]) => {
    const taskAllocations: TaskAllocation[] = values.map((value) => ({
      id: value.id || uuidv4(),
      userID: value.userID,
      duration: value.duration,
      organizationAuthorization: value.organizationAuthorization,
      skill: value.skill,
    }));
    onTaskAllocationsChange(taskAllocations);
  };

  useEffect(() => {
    const currentValues = form.getFieldsValue().taskAllocations || [];
    currentValues.forEach(
      (value: { userID: string | { _id: string } }, index: number) => {
        const userID =
          typeof value.userID === 'object' ? value.userID._id : value.userID;
        const selectedUser = users.find((user) => user.id === userID);
        currentValues[index].skill = selectedUser
          ? selectedUser.skillID?.code
          : '';
        currentValues[index].organizationAuthorization = selectedUser
          ? selectedUser.organizationAuthorization || selectedUser.singNumber
          : '';
      }
    );
    form.setFieldsValue({ taskAllocations: currentValues });
  }, [users, form]);

  useEffect(() => {
    if (task && task.taskId && task.taskId.mainWorkTime) {
      const currentValues = form.getFieldsValue().taskAllocations || [];
      currentValues.forEach((value: { duration: number }, index: number) => {
        if (!value.duration) {
          currentValues[index].duration = task.taskId.mainWorkTime;
        }
      });
      form.setFieldsValue({ taskAllocations: currentValues });
      handleTaskAllocationChange(currentValues);
    }
  }, [task, form]);

  // Фильтрация пользователей
  const filteredUsers = onlyWithOrganizationAuthorization
    ? users.filter((user) => user.organizationAuthorization)
    : users;

  return (
    <Form
      form={form}
      initialValues={{
        taskAllocations: initialTaskAllocations.map((allocation) => {
          const userID =
            typeof allocation.userID === 'object'
              ? allocation.userID._id
              : allocation.userID;
          const selectedUser = users.find((user) => user.id === userID);
          return {
            ...allocation,
            userID: userID,
            organizationAuthorization: selectedUser
              ? selectedUser.organizationAuthorization ||
                selectedUser.singNumber
              : '',
            skill: selectedUser ? selectedUser.skillID?.code : '',
          };
        }),
      }}
    >
      <Form.List name="taskAllocations">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              const currentValues = form.getFieldsValue().taskAllocations || [];
              const userID =
                typeof currentValues[name]?.userID === 'object'
                  ? currentValues[name]?.userID._id
                  : currentValues[name]?.userID;
              const selectedUser = users?.find((user) => user?.id === userID);
              const skill = selectedUser ? selectedUser?.skillID?.code : '';
              const organizationAuthorization = selectedUser
                ? selectedUser.organizationAuthorization ||
                  selectedUser.singNumber
                : '';

              return (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 3 }}
                  align="baseline"
                >
                  <Form.Item
                    label={t('ID')}
                    {...restField}
                    name={[name, 'organizationAuthorization']}
                    initialValue={organizationAuthorization}
                    rules={[{ required: true, message: t('SELECT USER') }]}
                  >
                    <Select
                      disabled
                      showSearch
                      allowClear
                      size="small"
                      placeholder={t('SELECT USER')}
                      style={{ width: 150 }}
                      onChange={(value) => {
                        currentValues[name].userID = value;
                        const selectedUser = users.find(
                          (user) => user.id === value
                        );
                        currentValues[name].skill = selectedUser
                          ? selectedUser.skillID.code
                          : '';
                        currentValues[name].organizationAuthorization =
                          selectedUser
                            ? selectedUser.organizationAuthorization ||
                              selectedUser.singNumber
                            : '';
                        form.setFieldsValue({ taskAllocations: currentValues });
                        handleTaskAllocationChange(currentValues);
                      }}
                      filterOption={(input, option: any) => {
                        const user = users.find(
                          (user) => user.id === option.value
                        );
                        if (user) {
                          const searchText =
                            `${user?.organizationAuthorization}`.toLowerCase();
                          return searchText.indexOf(input.toLowerCase()) >= 0;
                        }
                        return false;
                      }}
                    >
                      {filteredUsers?.map((user) => (
                        <Option key={user.id} value={user.id}>
                          {String(
                            user?.organizationAuthorization || user?.singNumber
                          )?.toUpperCase()}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('NAME')}
                    {...restField}
                    name={[name, 'userID']}
                    initialValue={userID}
                    rules={[{ required: true, message: t('SELECT USER') }]}
                  >
                    <Select
                      disabled
                      showSearch
                      allowClear
                      size="small"
                      placeholder={t('SELECT USER')}
                      style={{ width: 250 }}
                      onChange={(value) => {
                        currentValues[name].userID = value;
                        const selectedUser = users.find(
                          (user) => user.id === value
                        );
                        currentValues[name].skill = selectedUser
                          ? selectedUser.skillID.code
                          : '';
                        currentValues[name].organizationAuthorization =
                          selectedUser
                            ? selectedUser.organizationAuthorization ||
                              selectedUser.singNumber
                            : '';
                        form.setFieldsValue({ taskAllocations: currentValues });
                        handleTaskAllocationChange(currentValues);
                      }}
                      filterOption={(input, option: any) => {
                        const user = users.find(
                          (user) => user.id === option.value
                        );
                        if (user) {
                          const searchText = `${
                            user.singNumber
                          } ${user.firstNameEnglish?.toUpperCase()} ${user.lastNameEnglish?.toUpperCase()}`.toLowerCase();
                          return searchText.indexOf(input.toLowerCase()) >= 0;
                        }
                        return false;
                      }}
                    >
                      {users?.map((user) => (
                        <Option key={user.id} value={user.id}>
                          {`${user.firstNameEnglish?.toUpperCase()} ${user.lastNameEnglish?.toUpperCase()}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <ProFormDigit
                    disabled
                    label={t('MHs')}
                    {...restField}
                    name={[name, 'duration']}
                    // rules={[{ required: true, message: t('ENTER_DURATION') }]}
                    placeholder={t('DURATION_HOURS')}
                    fieldProps={{
                      size: 'small',
                      style: { width: 70 },
                      step: 0.1,
                      onChange: (value) => {
                        currentValues[name].duration = value;
                        form.setFieldsValue({ taskAllocations: currentValues });
                        handleTaskAllocationChange(currentValues);
                      },
                    }}
                  />

                  <Form.Item
                    label={t('SKILL')}
                    {...restField}
                    name={[name, 'skill']}
                    initialValue={skill}
                    rules={[{ required: true, message: t('ENTER_DURATION') }]}
                  >
                    <Input
                      size="small"
                      disabled
                      placeholder={t('SKILL')}
                      type="string"
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                  {/* <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="link"
                    onClick={() => {
                      remove(name);
                      handleTaskAllocationChange(currentValues);
                    }}
                  >
                    {t('DELETE')}
                  </Button> */}
                </Space>
              );
            })}
            {/* <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  const newTaskAllocation = {
                    id: uuidv4(),
                    userID: '',
                    duration: task?.taskId?.mainWorkTime || 0,
                  };
                  add(newTaskAllocation);
                  handleTaskAllocationChange([
                    ...(form.getFieldsValue().taskAllocations || []),
                    newTaskAllocation,
                  ]);
                }}
                block
              >
                {t('ADD USER')}
              </Button>
            </Form.Item> */}
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default UserTaskAllocation;
