import React, { useEffect } from 'react';
import { Button, List, Empty } from 'antd';
import PdfGeneratorWP from './PdfGeneratorWP'; // Убедитесь, что путь к компоненту корректен

interface Action {
  key: string;
  label: string;
}

interface ActionHistory {
  [key: string]: {
    user?: string;
    date?: string;
    userName?: string;
  };
}

interface ActionsComponentProps {
  onActionClick: (actionKey: string) => void;
  actionHistory: ActionHistory;
  wo: any | null;
  t: (key: string) => string;
  selectedKeys?: string[]; // Добавляем пропс для выбранных ключей
  htmlTemplate: string; // Добавляем пропс для HTML-шаблона
}

const actions: Action[] = [
  { key: 'generateWP', label: 'CREATE TASKS' },

  { key: 'createRequirements', label: 'CREATE REQUIREMENTS' },
  { key: 'linkRequirements', label: 'LINK REQUIREMENTS' },
  { key: 'cancelLink', label: 'CANCEL LINK' },
  { key: 'generateAccess', label: 'GENERATE ACCESS' },
];

const ActionsComponent: React.FC<ActionsComponentProps> = ({
  onActionClick,
  actionHistory,
  wo,
  t,
  selectedKeys,
  htmlTemplate,
}) => {
  useEffect(() => {
    console.log('actionHistory updated:', actionHistory);
  }, [actionHistory]);

  return (
    <div>
      {wo ? (
        <div>
          <List
            itemLayout="horizontal"
            dataSource={actions}
            renderItem={(action) => (
              <List.Item className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
                <Button
                  type="primary"
                  onClick={() => onActionClick(action.key)}
                  className="mr-4"
                >
                  {t(action.label)}
                </Button>
                <span className="text-sm text-gray-600">
                  {actionHistory[action.key]
                    ? `${t('Performed by')} ${
                        actionHistory[action.key]?.userName ||
                        actionHistory[action.key]?.user
                      } ${t('on')} ${actionHistory[action.key]?.date}`
                    : t('Not performed yet')}
                </span>
              </List.Item>
            )}
          />
          <div className="mt-4 flex justify-start">
            <PdfGeneratorWP
              disabled={!selectedKeys || !selectedKeys?.length}
              ids={selectedKeys || []}
              htmlTemplate={htmlTemplate}
              data={[]} // Здесь могут быть ваши данные
            />
          </div>
        </div>
      ) : (
        <Empty description={t('No data available')} className="mt-6" />
      )}
    </div>
  );
};

export default ActionsComponent;
