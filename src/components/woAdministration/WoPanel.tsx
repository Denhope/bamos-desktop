import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { IProjectItemWO } from '@/models/AC';
import { Button, Col, Modal, Space, Spin, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import WODiscription from './WODiscription';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  AlertTwoTone,
  UsergroupAddOutlined,
  CheckCircleFilled,
  SwitcherFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import WOTree from './WOTree';
import WOAdminForm from './WOAdminForm';

import { Split } from '@geoffcox/react-splitter';
interface AdminPanelProps {
  projectSearchValues: any;
}
const WoPanel: React.FC<AdminPanelProps> = ({ projectSearchValues }) => {
  const [editingproject, setEditingproject] = useState<IProjectItemWO | null>(
    null
  );
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);
  const { data: projectTasks, isLoading } = useGetProjectItemsWOQuery(
    {
      status: projectSearchValues?.status,
      startDate: projectSearchValues?.startDate,
      finishDate: projectSearchValues?.endDate,
      projectID: projectSearchValues?.projectID,
      vendorID: projectSearchValues?.vendorID,
      partNumberID: projectSearchValues?.partNumberID,
      taskWO: projectSearchValues?.projectTaskWO,
    },
    {
      skip: !triggerQuery, // Skip the query if triggerQuery is false
    }
  );

  useEffect(() => {
    // Check if projectSearchValues is defined and not null
    if (projectSearchValues) {
      // Check if there are any search values
      const hasSearchParams = Object.values(projectSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      if (hasSearchParams) {
        setTriggerQuery(true);
      }
    }
  }, [projectSearchValues]);
  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }
  const handleEdit = (project: IProjectItemWO) => {
    setEditingproject(project);
  };
  const handleCreate = () => {
    setEditingproject(null);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS WORKORDER?'),
      onOk: async () => {
        try {
          // await deleteRequirement(companyId).unwrap();
          message.success(t('WORKORDER SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('WORKORDER DELETING REQUIREMENT'));
        }
      },
    });
  };
  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <WODiscription
            // onRequirementSearch={setRequirement}
            project={editingproject}
          ></WODiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD WORKORDER')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingproject && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingproject.id)}
            >
              {t('DELETE WORKORDER')}
            </Button>
          )}
        </Col>

        <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<UsergroupAddOutlined />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('ADD WORKER')}
            </Button>
          )}
        </Col>

        <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<AlertTwoTone />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('COMPLETE WORKORDER')}
            </Button>
          )}
        </Col>
        <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<CheckCircleFilled />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('CLOSE WORKORDER')}
            </Button>
          )}
        </Col>
        <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<SwitcherFilled />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('CLOSE MANY WORKORDER')}
            </Button>
          )}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingproject && (
            <Button
              size="small"
              icon={<PrinterOutlined />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('PRINT WORKORDER')}
            </Button>
          )}
        </Col>
      </Space>
      <div className="h-[77vh] flex flex-col">
        <Split initialPrimarySize="30%">
          <div className="h-[67vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            <WOTree
              onProjectSelect={handleEdit}
              projects={projectTasks || []}
            />
          </div>
          <div className="h-[67vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            <WOAdminForm />
          </div>
          {/* <Split horizontal initialPrimarySize="60%">
            <div>This is the right-top pane.</div>
            <div>This is the right-bottom pane.</div>
          </Split> */}
        </Split>
      </div>
    </div>
  );
};

export default WoPanel;
