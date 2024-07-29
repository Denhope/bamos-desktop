import React, { useEffect } from 'react';
import { Form, Select, Input, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '@/models/IUser';
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TaskAllocation {
  id: string;
  userID: string;
  duration: number;
}

interface UserTaskAllocationProps {
  users: User[];
  initialTaskAllocations?: TaskAllocation[];
  onTaskAllocationsChange?: (taskAllocations: TaskAllocation[]) => void;
}

const UserTaskAllocation: React.FC<UserTaskAllocationProps> = ({
  users,
  initialTaskAllocations = [],
  onTaskAllocationsChange = () => {},
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleTaskAllocationChange = (values: any[]) => {
    const taskAllocations: TaskAllocation[] = values.map((value) => ({
      id: value.id || uuidv4(),
      userID: value.userID,
      duration: value.duration,
    }));
    onTaskAllocationsChange(taskAllocations);
    // console.log(taskAllocations);
  };

  useEffect(() => {
    const currentValues = form.getFieldsValue().taskAllocations || [];
    currentValues.forEach((value: { userID: string }, index: number) => {
      const selectedUser = users.find((user) => user.id === value.userID);
      currentValues[index].skill = selectedUser
        ? selectedUser.skillID.code
        : '';
    });
    form.setFieldsValue({ taskAllocations: currentValues });
  }, [users, form]);

  return (
    <Form
      form={form}
      initialValues={{ taskAllocations: initialTaskAllocations }}
    >
      <Form.List name="taskAllocations">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              const currentValues = form.getFieldsValue().taskAllocations || [];
              const selectedUser = users.find(
                (user) => user.id === currentValues[name]?.userID
              );
              const skill = selectedUser ? selectedUser?.skillID?.code : '';

              return (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'userID']}
                    rules={[{ required: true, message: t('SELECT_USER') }]}
                  >
                    <Select
                      showSearch
                      allowClear
                      size="small"
                      placeholder={t('SELECT_USER')}
                      style={{ width: 230 }}
                      onChange={(value) => {
                        currentValues[name].userID = value;
                        const selectedUser = users.find(
                          (user) => user.id === value
                        );
                        currentValues[name].skill = selectedUser
                          ? selectedUser.skillID.code
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
                            `${user.singNumber} ${user.firstName} ${user.lastName}`.toLowerCase();
                          return searchText.indexOf(input.toLowerCase()) >= 0;
                        }
                        return false;
                      }}
                    >
                      {users.map((user) => (
                        <Option key={user.id} value={user.id}>
                          {`(${user.singNumber})${user.firstName} ${user.lastName}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'duration']}
                    rules={[{ required: true, message: t('ENTER_DURATION') }]}
                  >
                    <Input
                      size="small"
                      placeholder={t('DURATION_HOURS')}
                      type="number"
                      style={{ width: 70 }}
                      onChange={(e) => {
                        currentValues[name].duration = parseFloat(
                          e.target.value
                        );
                        form.setFieldsValue({ taskAllocations: currentValues });
                        handleTaskAllocationChange(currentValues);
                      }}
                    />
                  </Form.Item>
                  <span className="p-3">MHs</span>
                  <Form.Item
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
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="link"
                    onClick={() => {
                      remove(name);
                      handleTaskAllocationChange(currentValues);
                    }}
                  >
                    {t('DELETE')}
                  </Button>
                </Space>
              );
            })}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  const newTaskAllocation = {
                    id: uuidv4(),
                    userID: '',
                    duration: 0,
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
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default UserTaskAllocation;
