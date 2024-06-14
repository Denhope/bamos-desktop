import React, { useEffect } from 'react';
import { Form, Select, Input, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '@/models/IUser';
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface UserDuration {
  id: string;
  userID: string;
  duration: number;
}

interface UserDurationListProps {
  users: User[];
  initialUserDurations?: UserDuration[];
  onUserDurationsChange?: (userDurations: UserDuration[]) => void;
}

const UserDurationList: React.FC<UserDurationListProps> = ({
  users,
  initialUserDurations = [],
  onUserDurationsChange = () => {},
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm(); // Использование Form.useForm

  const handleUserDurationChange = (values: any[]) => {
    // Преобразование данных в формат UserDuration
    const userDurations: UserDuration[] = values.map((value) => ({
      id: value.id || uuidv4(),
      userID: value.userID,
      duration: value.duration,
    }));
    onUserDurationsChange(userDurations);
  };

  useEffect(() => {
    // Получаем значения из формы
    const currentValues = form.getFieldsValue().userDurations;
    // Обновляем навык в соответствии с выбранным пользователем
    currentValues.forEach(
      (value: { userID: string }, index: string | number) => {
        const selectedUser = users.find((user) => user.id === value.userID);
        currentValues[index].skill = selectedUser
          ? selectedUser.skillID.code
          : '';
      }
    );
    // Устанавливаем обновленные значения в форму
    form.setFieldsValue({ userDurations: currentValues });
  }, [users]); // Зависимость useEffect от переменной users

  return (
    <Form form={form} initialValues={{ userDurations: initialUserDurations }}>
      <Form.List name="userDurations">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: 'flex', marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, 'userID', '_id']}
                  rules={[{ required: true, message: t('SELECT_USER') }]}
                >
                  <Select
                    showSearch
                    allowClear
                    size="small"
                    placeholder={t('SELECT_USER')}
                    style={{ width: 230 }}
                    onChange={(value) => {
                      const currentValues = form.getFieldsValue().userDurations;
                      currentValues[name].userID = value;
                      const selectedUser = users.find(
                        (user) => user.id === value
                      );
                      currentValues[name].skill = selectedUser
                        ? selectedUser.skillID.code
                        : '';
                      form.setFieldsValue({ userDurations: currentValues });
                      handleUserDurationChange(currentValues);
                    }}
                  >
                    {users.map((user) => (
                      <Option key={user.id} value={user.id}>
                        {`${user.firstName} ${user.lastName}`}
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
                      const currentValues = form.getFieldsValue().userDurations;
                      currentValues[name].duration = parseFloat(e.target.value);
                      form.setFieldsValue({ userDurations: currentValues });
                      handleUserDurationChange(currentValues);
                    }}
                  />
                </Form.Item>
                <span className="p-3">MHs</span>
                <Form.Item
                  {...restField}
                  name={[name, 'userID', 'skillID', 'code']}
                  rules={[{ required: true, message: t('ENTER_DURATION') }]}
                >
                  <Input
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
                    const currentValues = form.getFieldsValue().userDurations;
                    handleUserDurationChange(currentValues);
                  }}
                >
                  {t('DELETE')}
                </Button>
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  const newUserDuration = {
                    id: uuidv4(),
                    userID: '',
                    duration: 0,
                  };
                  add(newUserDuration);
                  const currentValues = form.getFieldsValue().userDurations;
                  handleUserDurationChange([...currentValues, newUserDuration]);
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

export default UserDurationList;
