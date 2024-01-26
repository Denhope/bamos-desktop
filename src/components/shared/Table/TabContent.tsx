import React from 'react';
import { Tabs } from 'antd';
import { Content } from 'antd/es/layout/layout';
const { TabPane } = Tabs;

interface TabContent {
  title: string;
  content: React.ReactNode;
  closable?: boolean;
}

interface TabContentProps {
  tabs: TabContent[];
}

const TabContent: React.FC<TabContentProps> = ({ tabs }) => {
  return (
    <Content>
      <Tabs size="small" type="card">
        {tabs.map((tab, index) => (
          <TabPane
            animated
            tab={tab?.title || ''}
            key={index}
            closable={tab?.closable || false}
          >
            {tab ? tab.content : null}
          </TabPane>
        ))}
      </Tabs>
    </Content>
  );
};

export default TabContent;
