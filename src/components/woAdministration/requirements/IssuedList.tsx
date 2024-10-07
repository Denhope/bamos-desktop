// ts-nocheck
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import PartsTable from '@/components/shared/Table/PartsTable';
import { IPartNumber } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import { notification } from 'antd';
import {
  useAddRequirementMutation,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';

type ExampleComponentProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[] | [];
  taskId?: string;
  fetchData?: any[] | [];
  onUpdateData: (data: any[]) => void;
  isTool?: string;
  isAddVisiable?: boolean;
  isButtonVisiable?: boolean;
  isVisible?: boolean;
  isButtonColumn?: boolean;
  isChekboxColumn?: boolean;
  height: string;
  isEditable?: boolean;
  pagination?: boolean;
  order?: any;
  isIssueVisibale?: boolean;
};

const IssuedList: React.FC<ExampleComponentProps> = ({
  columnDefs,
  partNumbers,
  taskId,
  fetchData,
  onUpdateData,
  isAddVisiable,
  isButtonVisiable = true,
  isVisible = false,
  isButtonColumn,
  height,
  isEditable,
  pagination,
  order,
}) => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const { t } = useTranslation();

  const [rowData, setRowData] = useState<any[]>([]);
  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();

  useEffect(() => {
    if (fetchData && fetchData.length > 0) {
      setRowData(fetchData);
      onUpdateData(fetchData);
    }
  }, [fetchData, onUpdateData]);

  const handleSubmit = useCallback(
    async (taskPart: any) => {
      try {
        if (!taskPart.partId || !taskPart.amout) {
          notification.error({
            message: t('ERROR'),
            description: t(
              'All fields must be filled and quantity must be greater than zero.'
            ),
          });
          return;
        }

        const reqData = {
          status: taskPart.createUserID ? 'open' : 'open', // Проверить логику, какой статус у новой записи
          plannedDate: taskPart?.plannedDate,
          projectID: order.projectID,
          projectTaskID: order.id,
          group: taskPart.GROUP,
          type: taskPart.TYPE,
          partNumberID: taskPart.partId,
          partNumber: taskPart.PART_NUMBER,
          description: taskPart.DESCRIPTION,
          amout: taskPart.amout,
        };

        if (taskPart.createUserID) {
          await updateRequirement({
            ...reqData,
            _id: taskPart._id,
            id: taskPart._id,
          }).unwrap();
          notification.success({
            message: t('STEP SUCCESSFULLY UPDATED'),
            description: t('The step has been successfully updated.'),
          });
        } else {
          await addRequirement({
            requirement: reqData,
          }).unwrap();
          notification.success({
            message: t('PART SUCCESSFULLY ADDED'),
            description: t('The part has been successfully added.'),
          });
        }
      } catch (error) {
        notification.error({
          message: t('ERROR'),
          description: t('Error saving part.'),
        });
      }
    },
    [t, addRequirement, updateRequirement, order]
  );

  const onCellValueChanged = useCallback(
    (params: any) => {
      const updatedRow = params;
      console.log(params);
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);
    },
    [rowData, onUpdateData]
  );

  const { data: usersGroups } = useGetGroupUsersQuery({});

  return (
    <div style={containerStyle} className="flex flex-col gap-5">
      <div style={gridStyle} className={'ag-theme-alpine'}>
        <PartsTable
          isVisible={isVisible}
          isButtonColumn={isButtonColumn}
          pagination={pagination}
          isEditable={isEditable}
          isAddVisiable={isAddVisiable}
          isButtonVisiable={isButtonVisiable}
          height={height}
          rowData={rowData}
          columnDefs={columnDefs}
          partNumbers={partNumbers}
          onCellValueChanged={onCellValueChanged}
          onAddRow={() => {}}
          onDelete={(id: string) => {}}
          onSave={(data: any) => {}}
          onRowSelect={(rowData: any) => {}}
          onCheckItems={(selectedKeys: React.Key[]) => {}}
        />
      </div>
    </div>
  );
};

export default IssuedList;
