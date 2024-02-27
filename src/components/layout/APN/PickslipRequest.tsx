import React, { FC } from 'react';
import PickslipRequestForm from '../pickslipRequest/PickslipRequestForm';

const PickslipRequest: FC = () => {
  return (
    <div className="h-[82vh]  bg-white px-4 py-3  overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col">
        <div className="py-4">
          <PickslipRequestForm
            onFilterPickSlip={function (record: any): void {}}
            onCurrentPickSlip={function (data: any): void {}}
          />
        </div>
      </div>
    </div>
  );
};

export default PickslipRequest;
