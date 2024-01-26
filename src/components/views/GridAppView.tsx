import React, { FC } from 'react';

import AccessTabView from './AccessTabView';
import AplicationViewList from './AplicationViewList';
import InstrumentTabsView from './InstrumentTabsView';
import LaborTabs from './LaborTabs';
import MaterialsTabView from './MaterialsTabView';
import TasksTabsView from './TasksTabsView';

const GridAppView: FC = () => {
  return (
    <div
      className="flex my-0 mx-auto flex-col h-[86vh]"
      style={{
        width: '95%',
      }}
    >
      <div className="flex gap-x-20">
        {' '}
        <div className="flex w-1/3">
          <AplicationViewList height={'h-1/3'} scroll={'calc(15vh)'} />
        </div>
        <div className="w-1/3 py-1">
          <LaborTabs />
        </div>
        <div className="w-1/3 py-1">
          <AccessTabView />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-1/3">{<TasksTabsView />}</div>

        <div className="w-1/3">
          <MaterialsTabView />
        </div>
        <div className="w-1/3">
          <InstrumentTabsView />
        </div>
      </div>
    </div>
  );
};

export default GridAppView;
