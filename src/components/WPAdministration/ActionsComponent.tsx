//@ts-nocheck

import React, { useEffect, useState } from 'react';
import { Button, List, Empty, Tabs } from 'antd';
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
  { key: 'appendTOWO', label: 'APPEND TO WO ITEMS FROM WP' },
  // { key: 'generateWP', label: 'GENERATE WO' },
  { key: 'rebuildWO', label: 'REBUILD WO' },
];
const accessActions: Action[] = [
  { key: 'generateAccess', label: 'GENERATE ACCESS' },
];

const recuirementActions: Action[] = [
  { key: 'createRequirements', label: 'CREATE REQUIREMENTS' },
  { key: 'linkRequirements', label: 'LINK REQUIREMENTS' },
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

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const handleActionClick = (actionKey: string) => {
    console.log(`Button clicked: ${actionKey}`);
    if (activeAction) {
      console.log('Another action is already active:', activeAction);
      return; // Если уже есть активное действие, ничего не делаем
    }
    setActiveAction(actionKey);
    setIsActionInProgress(true);
    onActionClick(actionKey);
  };

  const handleActionComplete = () => {
    setIsActionInProgress(false);
    setActiveAction(null);
  };

  useEffect(() => {
    if (isActionInProgress) {
      // Предполагаем, что действие выполняется асинхронно и завершается через некоторое время
      const timer = setTimeout(() => {
        handleActionComplete();
      }, 1000); // Установите подходящее время для вашего действия
      return () => clearTimeout(timer);
    }
  }, [isActionInProgress]);

  const handlePdfGeneratorClick = () => {
    handleActionClick('generateTaskCard');
  };

  return (
    <Tabs
      onChange={(key) => {
        // setActiveTabKey(key);
      }}
      defaultActiveKey="1"
      type="card"
    >
      <Tabs.TabPane tab={t('WO GENERATE')} key="1">
        {wo ? (
          <div>
            <List
              itemLayout="horizontal"
              dataSource={actions}
              renderItem={(action) => (
                <List.Item
                  disabled={wo.status == 'CLOSED' || wo.status == 'COMPLETED'}
                  className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200"
                >
                  <Button
                    disabled={
                      (action.key !== 'rebuildWO' &&
                        action.key !== 'appendTOWO' &&
                        (actionHistory[action.key] || activeAction !== null)) ||
                      wo.status == 'CLOSED' ||
                      wo.status == 'COMPLETED'
                    }
                    onClick={() => handleActionClick(action.key)}
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
            <div className="mt-4 flex justify-between items-center">
              <PdfGeneratorWP
                disabled={
                  !selectedKeys ||
                  !selectedKeys?.length ||
                  wo.status == 'CLOSED' ||
                  wo.status == 'COMPLETED'
                }
                ids={selectedKeys?.length ? selectedKeys : null}
                onClick={handlePdfGeneratorClick}
                wo={wo}
              />
              <span className="text-sm text-gray-600 ml-4">
                {actionHistory['generateTaskCard']
                  ? `${t('Performed by')} ${
                      actionHistory['generateTaskCard']?.userName ||
                      actionHistory['generateTaskCard']?.user
                    } ${t('on')} ${actionHistory['generateTaskCard']?.date}`
                  : t('Not performed yet')}
              </span>
            </div>
          </div>
        ) : (
          <Empty description={t('No data available')} className="mt-6" />
        )}
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('REQUIREMENT')} key="2">
        {wo ? (
          <div>
            <List
              disabled={wo.status == 'CLOSED' || wo.status == 'COMPLETED'}
              itemLayout="horizontal"
              dataSource={recuirementActions}
              renderItem={(action) => (
                <List.Item className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
                  <Button
                    disabled={wo.status == 'CLOSED' || wo.status == 'COMPLETED'}
                    // disabled={
                    //   (action.key === 'createRequirements' &&
                    //     actionHistory['createRequirements']) ||
                    //   // (action.key === 'linkRequirements' &&
                    //   //   actionHistory['linkRequirements']) ||
                    //   activeAction !== null
                    // }
                    onClick={() => handleActionClick(action.key)}
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
          </div>
        ) : (
          <Empty description={t('No data available')} className="mt-6" />
        )}
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('ACCESS')} key="3">
        {wo ? (
          <div>
            <List
              itemLayout="horizontal"
              dataSource={accessActions}
              renderItem={(action) => (
                <List.Item className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
                  <Button
                    disabled={wo.status == 'CLOSED' || wo.status == 'COMPLETED'}
                    // disabled={
                    //   // actionHistory[action.key] ||
                    //   actionHistory['generateAccess']
                    // }
                    onClick={() => handleActionClick(action.key)}
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
          </div>
        ) : (
          <Empty description={t('No data available')} className="mt-6" />
        )}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default ActionsComponent;
