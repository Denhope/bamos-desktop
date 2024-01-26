import { Descriptions, Divider, List, Space, Tag } from "antd";
import { IAdditionalTaskMTBCreate } from "@/models/IAdditionalTaskMTB";

import { IProjectTask } from "@/models/IProjectTaskMTB";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";

type TaskDetailsProps = {
  task?: IAdditionalTaskMTBCreate | null;
};
const TaskDetails: FC<TaskDetailsProps> = ({ task }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex p-3 flex-col mt-2 mx-auto border-8  overflow-hidden ">
        <Descriptions
          size="small"
          column={{ xxl: 1, xl: 1, lg: 1, md: 2, sm: 2, xs: 2 }}
        >
          <Descriptions.Item label="Taskcard">
            <p className="text-l text-center font-semibold my-0">
              {task?.additionalNumberId || ""}
            </p>
          </Descriptions.Item>

          <Descriptions.Item label={`${t("TYPE")}`}>
            <p className="text-l text-center font-semibold my-0">
              {task?.nrcType?.toUpperCase()}
            </p>
          </Descriptions.Item>

          <Descriptions.Item label="A/C Type ">
            <p className="text-l text-center font-semibold my-0">
              {task?.plane?.type.toUpperCase()}
            </p>
          </Descriptions.Item>

          <Descriptions.Item
            label={<p className="text-l text-center my-0">A/C Registration</p>}
          >
            <p className="text-l text-center font-semibold my-0">
              {task?.plane?.registrationNumber}
            </p>
          </Descriptions.Item>
          <Descriptions.Item
            label={<p className="text-l text-center my-0">Workorder</p>}
          >
            <p className="text-l text-center font-semibold my-0">
              {task?.projectWO}
            </p>
          </Descriptions.Item>
        </Descriptions>
        <Divider className="my-0"></Divider>
        <Descriptions
          size="small"
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Operator Revision">{""}</Descriptions.Item>
          <Descriptions.Item label="MRB Revision">{""}</Descriptions.Item>
        </Descriptions>
        <Divider className="my-0"></Divider>
        <Descriptions
          size="small"
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="References">
            <List>
              <div>
                {task?.workStepReferencesLinks?.map((item: any) => (
                  <li className="uppercase">
                    {item.type}:{item.reference}
                    {item.description && `-${item.description}`}
                  </li>
                )) || [<></>]}
              </div>
            </List>
          </Descriptions.Item>
          <Descriptions.Item label="Zones">
            <List>
              {task?.zoneNbr && (
                <List.Item key={task._id}>
                  <Space>
                    <div>Zone: {task?.zoneNbr}</div>
                    <div>{/* {task.majoreZone} {task.subZone} */}</div>
                  </Space>
                </List.Item>
              )}
            </List>
          </Descriptions.Item>
        </Descriptions>
        <Divider className="my-0"></Divider>
      </div>
    </div>
  );
};

export default TaskDetails;
