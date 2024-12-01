//@ts-nocheck
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import PartsTable from '@/components/shared/Table/PartsTable';
import { IPartNumber } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import {
  useAddPartTaskNumberMutation,
  useDeletePartTaskNumberMutation,
  useGetPartTaskNumbersQuery,
  useUpdatePartTaskNumberMutation,
} from '@/features/tasksAdministration/partApi';
import { Modal, notification } from 'antd';

type ExampleComponentProps = {
  columnDefs?: any[] | [];
  taskId?: string;
  fetchData?: IPartNumber[] | [];
  onUpdateData: (data: any[]) => void;
  isTool?: string;
  partNumbers?: any;
};

const PartList: React.FC<ExampleComponentProps> = ({
  columnDefs,
  partNumbers,
  taskId,
  fetchData,
  isTool,
  onUpdateData,
}) => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const { t } = useTranslation();
  const { data: partsTask, isLoading } = useGetPartTaskNumbersQuery(
    { taskId: taskId },
    {
      skip: !taskId,
    }
  );

  const [rowData, setRowData] = useState<any[]>([]);
  const [addPart] = useAddPartTaskNumberMutation({});
  const [updateTaskPart] = useUpdatePartTaskNumberMutation({});
  const [deleteTask] = useDeletePartTaskNumberMutation();
  // Use effect to update rowData when partsTask changes
  const isToolArray = isTool && isTool.split(',').map((item) => item.trim());
  const transformToIPartNumber = (data: any[]): IPartNumber[] => {
    return data
      .filter(
        (item) =>
          isToolArray && !isToolArray.includes(item?.partNumberID?.GROUP)
      ) // Фильтруем объекты с GROUP не равным "TOOL"
      .map((item) => ({
        QUANTITY: item?.quantity,
        id: item?.id || item?._id,
        status: '', // Здесь можно добавить нужный статус, если требуется
        _id: item?.id || item?._id,
        partId: item?.partNumberID?._id,
        PART_NUMBER: item?.partNumberID?.PART_NUMBER,
        DESCRIPTION: item?.partNumberID?.DESCRIPTION,
        TYPE: item?.partNumberID?.TYPE,
        GROUP: item?.partNumberID?.GROUP,
        UNIT_OF_MEASURE: item?.partNumberID?.UNIT_OF_MEASURE,
        UNIT_OF_MEASURE_LONG: item?.partNumberID?.UNIT_OF_MEASURE,
        ADD_DESCRIPTION: '', // Добавить описание, если требуется
        ADD_UNIT_OF_MEASURE: item?.partNumberID?.ADD_UNIT_OF_MEASURE,
        companyID: item?.companyID,
        createDate: item?.createDate,
        createUserID: item?.createUserID?._id,
        updateDate: item?.updateDate,
        updateUserID: item?.updateUserID ? item?.updateUserID?._id : '',
        acTypeID: item?.acTypeID, // Добавить тип AC, если требуется
        isRequred: item.isRequred,
      }));
  };

  useEffect(() => {
    if (partsTask) {
      const transformedData = transformToIPartNumber(partsTask);
      setRowData(transformedData);
      onUpdateData(transformedData);
    }
  }, [partsTask, onUpdateData]);
  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PART?'),
      onOk: async () => {
        try {
          await deleteTask(vendorId).unwrap();
          const updatedData = rowData.filter((row) => row._id !== vendorId);
          setRowData(updatedData);
          onUpdateData(updatedData);
          notification.success({
            message: t('PART SUCCESSFULLY DELETE'),
            description: t('The part has been successfully delete.'),
          });
          // setEditingvendor(null);
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('ERROR DELETE PART'),
          });
        }
      },
    });
  };
  const handleSubmit = async (taskPart: any) => {
    try {
      // Добавим логирование для отладки
      console.log('TaskPart data:', taskPart);
      console.log('isRequred value:', taskPart.isRequred);

      if (taskPart.createUserID) {
        const updateData = {
          partTaskNumber: {
            partNumberID: taskPart.partId,
            quantity: taskPart.QUANTITY,
            id: taskPart.id,
            isRequred: Boolean(taskPart.isRequred), // явно приводим к boolean
            taskId: taskId,
          },
        };

        console.log('Update payload:', updateData);
        await updateTaskPart(updateData).unwrap();

        notification.success({
          message: t('PART SUCCESSFULLY UPDATED'),
          description: t('The part has been successfully updated.'),
        });
      } else {
        await addPart({
          partNumber: {
            partNumberID: taskPart.partId,
            quantity: taskPart.QUANTITY,
            taskId: taskId,
            isRequred: taskPart.isRequred,
          },
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
  };

  const onAddRow = () => {
    const newRow = {
      _id: Date.now().toString(),
      PART_NUMBER: '',
      DESCRIPTION: '',
      GROUP: '',
      TYPE: '',
      QUANTITY: 0,
    };
    const updatedData = [...rowData, newRow];
    setRowData(updatedData);
    onUpdateData(updatedData);
  };

  const onDelete = (id: string) => {
    handleDelete(id);
  };

  const onSave = (data: any) => {
    handleSubmit(data);
  };

  const onCellValueChanged = useCallback(
    (params: any) => {
      const updatedRow = params.data;
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);
    },
    [rowData, onUpdateData]
  );

  return (
    <div style={containerStyle}>
      <div style={gridStyle} className={'ag-theme-alpine'}>
        <PartsTable
          isButtonVisiable={true}
          height="60vh"
          isLoading={isLoading}
          rowData={rowData}
          columnDefs={columnDefs}
          partNumbers={partNumbers}
          onAddRow={onAddRow}
          onDelete={onDelete}
          onSave={onSave}
          onCellValueChanged={onCellValueChanged}
          onRowSelect={function (rowData: any): void {}}
          onCheckItems={function (selectedKeys: React.Key[]): void {}}
        />
      </div>
    </div>
  );
};

export default PartList;
