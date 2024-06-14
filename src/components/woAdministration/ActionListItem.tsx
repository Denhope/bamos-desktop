import React from 'react';
import { List, Space, Tag } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Action } from '@/models/IStep';

interface ActionListProps {
  actions: Action[];
  selectedItems: string[];
  handleItemClick: (
    event: React.MouseEvent<HTMLDivElement>,
    action: Action
  ) => void;
  setVisibleEdit: (visible: boolean) => void;
  setCurrentAction: (action: Action) => void;
}

const getActionColor = (type: string) => {
  switch (type) {
    case 'done':
      return 'bg-green-50';
    case 'inspect':
      return 'bg-orange-50';
    case 'doubleInspect':
      return 'bg-red-50';
    case 'close':
      return 'bg-gray-50';
    default:
      return 'bg-yellow-50';
  }
};

const ActionList: React.FC<ActionListProps> = ({
  actions,
  selectedItems,
  handleItemClick,
  setVisibleEdit,
  setCurrentAction,
}) => {
  const { t } = useTranslation();
  return (
    <List
      dataSource={actions}
      renderItem={(action) => (
        <List.Item
          style={{ padding: '5px 10px' }}
          className={`cursor-pointer flex rounded-sm ${
            action?._id && selectedItems.includes(action?._id)
              ? 'bg-blue-50'
              : ''
          }`}
        >
          <List.Item.Meta
            style={{ padding: 0 }}
            title={
              <div
                className={`cursor-pointer flex justify-between items-center rounded-sm ${
                  action?._id && selectedItems.includes(action?._id)
                    ? 'bg-blue-50'
                    : getActionColor(action.type)
                }`}
                onClick={(event) => handleItemClick(event, action)}
                onDoubleClick={() => {
                  setVisibleEdit(true);
                  setCurrentAction(action);
                }}
                style={{ padding: '5px', borderRadius: '4px' }}
              >
                <Space style={{ width: '100%' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {action?.type === 'done' && `${t('DONE')}`}
                    {action?.type === 'inspect' && `${t('INSPECTED')}`}
                    {action?.type === 'doubleInspect' && `${t('DINSPECTED')}`}
                    {action?.type === 'close' && `${t('CLOSE')}`}
                  </div>
                  <Space
                    className="ml-auto font-bold"
                    style={{ fontSize: '12px' }}
                  >
                    <div style={{ color: '#666' }}>{t('added by')}</div>
                    <Tag color="#ffbe69">
                      {action?.createUserID?.singNumber}
                    </Tag>
                    <Tag color="#ffbe69">{action?.createUserID?.name}</Tag>
                  </Space>
                  <Space className="font-bold" style={{ fontSize: '12px' }}>
                    {moment(action?.createDate || new Date()).format(
                      'YYYY-MM-DD HH:mm'
                    )}
                  </Space>
                </Space>
              </div>
            }
            description={
              <div
                className={`cursor-pointer flex rounded-sm flex-col ${
                  action?._id && selectedItems.includes(action._id)
                    ? 'bg-blue-50'
                    : ''
                }`}
                onClick={(event) => handleItemClick(event, action)}
                onDoubleClick={() => {
                  setVisibleEdit(true);
                  setCurrentAction(action);
                }}
                style={{
                  padding: '5px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <span
                  className="font-semibold my-0 py-0"
                  dangerouslySetInnerHTML={{ __html: action?.headline }}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <span
                  dangerouslySetInnerHTML={{ __html: action?.description }}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ActionList;
