// import { ProDescriptions } from '@ant-design/pro-components';
// import { Button } from 'antd';
// import dayjs from 'dayjs';
// import { useTypedSelector } from '@/hooks/useTypedSelector';
// import React, { FC } from 'react';
// type LaborProps = { aplicationName: string; data: any };

// const LaborAplication: FC<LaborProps> = ({ aplicationName, data }) => {
//   return (
//     <div>
//       <ProDescriptions
//         column={2}
//         title={aplicationName}
//         tooltip={aplicationName}
//       >
//         <ProDescriptions.Item valueType="option">
//           <Button key="primary" type="primary">
//             Print Report
//           </Button>
//         </ProDescriptions.Item>

//         <ProDescriptions.Item label="AF" valueType="digit">
//           {data.totalTimeBySpecialization.AF}
//         </ProDescriptions.Item>
//         <ProDescriptions.Item label="AF/AV" valueType="digit">
//           {data.totalTimeBySpecialization.AF}
//         </ProDescriptions.Item>
//         <ProDescriptions.Item label="AV" valueType="digit">
//           {data.totalTimeBySpecialization.AV}
//         </ProDescriptions.Item>
//         <ProDescriptions.Item label="EN" valueType="digit">
//           {data.totalTimeBySpecialization.EN}
//         </ProDescriptions.Item>
//         <ProDescriptions.Item label="EN/AV" valueType="digit">
//           {data.totalTimeBySpecialization.EN}
//         </ProDescriptions.Item>

//         <ProDescriptions.Item label="FoundCount">
//           {data.foundCount}
//         </ProDescriptions.Item>
//         <ProDescriptions.Item label="NotFoundCount">
//           {data.notFoundCount}
//         </ProDescriptions.Item>
//       </ProDescriptions>
//     </div>
//   );
// };

// export default LaborAplication;

import React from "react";
import { Descriptions } from "antd";

interface DataDisplayProps {
  foundCount: number;
  notFoundCount: number;
  totalTimeBySpecialization: Record<string, number>;
  totalTimeWithoutSpecialization: number;
  totalPrepareTimeBySpecialization: Record<string, number>;
  totalMainWorkTimeBySpecialization: Record<string, number>;
  multipleMatches: string[];
}

const DataDisplay: React.FC<DataDisplayProps> = ({
  foundCount,
  notFoundCount,
  totalTimeBySpecialization,
  totalTimeWithoutSpecialization,
  totalPrepareTimeBySpecialization,
  totalMainWorkTimeBySpecialization,
  multipleMatches,
}) => {
  return (
    <div className="flex my-0 mx-auto flex-col h-[62vh] relative overflow-y-scroll">
      <Descriptions
        title="Tasks Found"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        <Descriptions.Item label="Tasks Found">{foundCount}</Descriptions.Item>
      </Descriptions>
      <Descriptions
        title="Tasks Not Found"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        <Descriptions.Item label="Tasks Not Found">
          {notFoundCount}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        title="Total Time Without Specialization"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        <Descriptions.Item label="Total Time Without Specialization">
          {totalTimeWithoutSpecialization}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        title="Total Time by Specialization"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        {Object.entries(totalTimeBySpecialization).map(([key, value]) => (
          <Descriptions.Item label={`Total Time for Specialization ${key}`}>
            {value}
          </Descriptions.Item>
        ))}
      </Descriptions>
      <Descriptions
        title="Total Preparation Time by Specialization"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        {Object.entries(totalPrepareTimeBySpecialization).map(
          ([key, value]) => (
            <Descriptions.Item
              label={`Total Preparation Time for Specialization ${key}`}
            >
              {value}
            </Descriptions.Item>
          )
        )}
      </Descriptions>
      <Descriptions
        title="Total Main Work Time by Specialization"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        {Object.entries(totalMainWorkTimeBySpecialization).map(
          ([key, value]) => (
            <Descriptions.Item
              label={`Total Main Work Time for Specialization ${key}`}
            >
              {value}
            </Descriptions.Item>
          )
        )}
      </Descriptions>
      <Descriptions
        title="Multiple Matches"
        bordered
        column={2}
        style={{
          backgroundColor: "#f0f2f5",
          padding: "16px",
          marginBottom: "0",
        }}
      >
        <Descriptions.Item label="Multiple Matches">
          {multipleMatches}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default DataDisplay;
