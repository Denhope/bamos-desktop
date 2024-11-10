// @ts-nocheck
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { IPartNumber } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import { notification } from 'antd';
import {
  useAddRequirementMutation,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

type IssuedListProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[];
  taskId?: string;
  fetchData?: any[];
  onUpdateData: (data: any[]) => void;
  isTool?: string;
  isAddVisible?: boolean;
  isButtonVisible?: boolean;
  isVisible?: boolean;
  isButtonColumn?: boolean;
  isCheckboxColumn?: boolean;
  height: string;
  isEditable?: boolean;
  pagination?: boolean;
  order?: any;
  isIssueVisible?: boolean;
};

const IssuedList: React.FC<IssuedListProps> = ({
  columnDefs,
  partNumbers,
  fetchData,
  onUpdateData,
  isCheckboxColumn,
  height,
  pagination,
  order,
}) => {
  const { t } = useTranslation();

  const [rowData, setRowData] = useState<any[]>([]);
  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();

  const calculateToBookedQuantity = useCallback((row) => {
    const amount = row.amount ?? row.amout ?? 0;
    const requestQuantity = row.requestQuantity ?? row.requestedQuantity ?? 0;
    return Math.max(0, amount - requestQuantity - (row.bookedQuantity || 0));
  }, []);

  const memoizedRowData = useMemo(() => {
    if (fetchData && fetchData.length > 0) {
      return fetchData.map((row) => ({
        ...row,
        toBookedQuantity: calculateToBookedQuantity(row),
      }));
    }
    return [];
  }, [fetchData, calculateToBookedQuantity]);

  useEffect(() => {
    if (memoizedRowData.length > 0) {
      console.log('Setting row data:', memoizedRowData);
      setRowData(memoizedRowData);
      onUpdateData(memoizedRowData);
    }
  }, [memoizedRowData, onUpdateData]);

  const handleSubmit = useCallback(
    async (taskPart: any) => {
      try {
        if (!taskPart.partId) {
          notification.error({
            message: t('ERROR'),
            description: t('Part ID is missing.'),
          });
          return;
        }

        const toBookedQuantity =
          taskPart.toBookedQuantity ?? calculateToBookedQuantity(taskPart);

        const reqData = {
          status: taskPart.createUserID ? 'open' : 'open',
          plannedDate: taskPart?.plannedDate,
          projectID: order.projectID,
          projectTaskID: order.id,
          group: taskPart.GROUP,
          type: taskPart.TYPE,
          partNumberID: taskPart.partId,
          partNumber: taskPart.PART_NUMBER,
          description: taskPart.DESCRIPTION,
          amount: taskPart.amount ?? taskPart.amout,
          bookedQuantity: taskPart.bookedQuantity,
          requestQuantity:
            taskPart.requestQuantity ??
            taskPart.requestedQuantity + toBookedQuantity,
        };

        if (taskPart) {
          // await updateRequirement({
          //   ...reqData,
          //   _id: taskPart._id,
          //   id: taskPart._id,
          // }).unwrap();
          console.log(reqData);
          notification.success({
            message: t('REQUIREMENT SUCCESSFULLY UPDATED'),
            description: t('The requirement has been successfully updated.'),
          });
        } else {
          console.log(reqData);
          // await addRequirement({
          //   requirement: reqData,
          // }).unwrap();
          notification.success({
            message: t('REQUIREMENT SUCCESSFULLY ADDED'),
            description: t('The requirement has been successfully added.'),
          });
        }
      } catch (error) {
        notification.error({
          message: t('ERROR'),
          description: t('Error saving requirement.'),
        });
      }
    },
    [t, addRequirement, updateRequirement, order, calculateToBookedQuantity]
  );

  const onCellValueChanged = useCallback(
    (params: any) => {
      const { data, colDef, newValue } = params;
      if (colDef.field === 'toBookedQuantity') {
        const maxValue = calculateToBookedQuantity(data);
        const validatedValue = Math.min(
          Math.max(0, Number(newValue)),
          maxValue
        );
        const updatedRow = { ...data, toBookedQuantity: validatedValue };
        const updatedData = rowData.map((row) =>
          row._id === updatedRow._id ? updatedRow : row
        );
        console.log('Updating row data:', updatedData);
        setRowData(updatedData);
        onUpdateData(updatedData);
      }
    },
    [rowData, onUpdateData, calculateToBookedQuantity]
  );

  const updatedColumnDefs = useMemo(
    () =>
      columnDefs.map((col) => {
        if (col.field === 'toBookedQuantity') {
          return {
            ...col,
            editable: true,
            cellStyle: () => ({ backgroundColor: '#FFCCCB' }),
            valueParser: (params: any) => {
              const value = Number(params.newValue);
              const maxValue = calculateToBookedQuantity(params.data);
              return isNaN(value)
                ? undefined
                : Math.min(Math.max(0, value), maxValue);
            },
            valueFormatter: (params: any) => {
              console.log('toBookedQuantity value:', params.value);
              return params.value !== undefined ? params.value : '';
            },
            valueGetter: (params: any) => {
              const value =
                params.data.toBookedQuantity ??
                calculateToBookedQuantity(params.data);
              console.log('toBookedQuantity valueGetter:', value);
              return value;
            },
          };
        }
        return col;
      }),
    [columnDefs, calculateToBookedQuantity]
  );

  return (
    <div style={{ width: '100%', height }} className="flex flex-col gap-5">
      <div style={{ height, width: '100%' }} className="ag-theme-alpine">
        <UniversalAgGrid
          gridId="issuedList"
          isVisible={true}
          pagination={pagination}
          isCheckboxColumn={isCheckboxColumn}
          height={height}
          rowData={rowData}
          columnDefs={updatedColumnDefs}
          onCellValueChanged={onCellValueChanged}
          onSave={handleSubmit}
        />
      </div>
    </div>
  );
};

export default IssuedList;
