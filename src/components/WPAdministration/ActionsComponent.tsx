//@ts-nocheck

import React, { useEffect, useState } from 'react';
import { Button, List, Empty, Tabs } from 'antd';
import PdfGeneratorWP from './PdfGeneratorWP';

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
  selectedKeys?: string[];
  htmlTemplate: string;
}

const actions: Action[] = [
  { key: 'appendTOWO', label: 'APPEND TO WO ITEMS FROM WP' },
  { key: 'rebuildWO', label: 'REBUILD WO' },
];

const accessActions: Action[] = [
  { key: 'generateAccess', label: 'GENERATE ACCESS' },
];

const requirementActions: Action[] = [
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
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  useEffect(() => {
    console.log('actionHistory updated:', actionHistory);
  }, [actionHistory]);

  useEffect(() => {
    if (isActionInProgress) {
      const timer = setTimeout(() => {
        handleActionComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActionInProgress]);

  const handleActionClick = (actionKey: string) => {
    console.log(`Button clicked: ${actionKey}`);
    if (activeAction) {
      console.log('Another action is already active:', activeAction);
      return;
    }
    setActiveAction(actionKey);
    setIsActionInProgress(true);
    onActionClick(actionKey);
  };

  const handleActionComplete = () => {
    setIsActionInProgress(false);
    setActiveAction(null);
  };

  const handlePdfGeneratorClick = () => {
    handleActionClick('generateTaskCard');
  };

  const renderActionList = (actionList: Action[]) => (
    <List
      itemLayout="horizontal"
      dataSource={actionList}
      renderItem={(action) => (
        <List.Item
          disabled={wo.status === 'CLOSED' || wo.status === 'COMPLETED'}
          className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-200"
        >
          <Button
            disabled={
              wo.status === 'CLOSED' ||
              wo.status === 'COMPLETED' ||
              (action.key !== 'rebuildWO' &&
                action.key !== 'appendTOWO' &&
                action.key !== 'generateAccess' &&
                action.key !== 'createRequirements' &&
                (actionHistory[action.key] || activeAction !== null))
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
  );

  return (
    <Tabs defaultActiveKey="1" type="card">
      <Tabs.TabPane tab={t('WO GENERATE')} key="1">
        {wo ? (
          <div>
            {renderActionList(actions)}
            <div className="mt-4 flex justify-between items-center">
              <PdfGeneratorWP
                disabled={
                  !selectedKeys?.length ||
                  wo.status === 'CLOSED' ||
                  wo.status === 'COMPLETED'
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
          renderActionList(requirementActions)
        ) : (
          <Empty description={t('No data available')} className="mt-6" />
        )}
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('ACCESS')} key="3">
        {wo ? (
          renderActionList(accessActions)
        ) : (
          <Empty description={t('No data available')} className="mt-6" />
        )}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default ActionsComponent;
