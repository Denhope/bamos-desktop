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
import {
  useAddRequirementMutation,
  useDeleteRequirementMutation,
  useGetFilteredRequirementsQuery,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { IRequirement } from '@/models/IRequirement';

type ExampleComponentProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[] | [];
  taskId?: string;
  fetchData?: any[] | [];
  onUpdateData: (data: any[]) => void;
  isTool?: string;
  isAddVisiable?: boolean;
  isButtonVisiable?: boolean;
  height: string;
  isEditable?: boolean;
  pagination?: boolean;
  onRowSelect: (rowData: IRequirement | null) => void;
  onCheckItems: (selectedKeys: React.Key[]) => void;
};

const RequarementsList: React.FC<ExampleComponentProps> = ({
  columnDefs,
  partNumbers,
  taskId,
  fetchData,
  isTool,
  onUpdateData,
  isAddVisiable,
  isButtonVisiable = true,
  height,
  isEditable,
  onRowSelect,
  onCheckItems,
  pagination,
}) => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const { t } = useTranslation();
  const { data: requirements, isLoading } = useGetFilteredRequirementsQuery(
    { projectTaskID: taskId },
    {
      skip: !taskId,
    }
  );

  const [rowData, setRowData] = useState<any[]>([]);
  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  // Use effect to update rowData when partsTask changes

  const transformToIPartNumber = (data: any[]): IPartNumber[] => {
    return (
      data
        // Фильтруем объекты с GROUP не равным "TOOL"
        .map((item) => ({
          QUANTITY: item.quantity,
          id: item?.id || item?._id,
          amout: item.amout,
          // Здесь можно добавить нужный статус, если требуется
          _id: item?.id || item?._id,
          status: item.status,
          projectID: item.projectID,
          projectTaskID: item.projectTaskID,
          partRequestNumberNew: item.partRequestNumberNew,
          projectWO: item.projectID?.projectWO,
          projectTaskWO: item.projectTaskID?.taskWO,
          partId: item.partNumberID._id,
          PART_NUMBER: item.partNumberID.PART_NUMBER,
          DESCRIPTION: item.partNumberID.DESCRIPTION,
          TYPE: item.partNumberID.TYPE,
          GROUP: item.partNumberID.GROUP,
          UNIT_OF_MEASURE: item.partNumberID.UNIT_OF_MEASURE,
          UNIT_OF_MEASURE_LONG: item.partNumberID.UNIT_OF_MEASURE,
          ADD_DESCRIPTION: '', // Добавить описание, если требуется
          ADD_UNIT_OF_MEASURE: item.partNumberID.ADD_UNIT_OF_MEASURE,
          companyID: item.companyID,
          createDate: item.createDate,
          createUserID: item.createUserID._id,
          updateDate: item.updateDate,
          updateUserID: item.updateUserID ? item.updateUserID._id : '',
          acTypeID: '', // Добавить тип AC, если требуется
        }))
    );
  };
  // fetchData

  useEffect(() => {
    if (requirements && !fetchData?.length) {
      const transformedData = transformToIPartNumber(requirements);
      setRowData(transformedData);
      onUpdateData(transformedData);
    } else if (fetchData) {
      const transformedData = transformToIPartNumber(fetchData);
      setRowData(transformedData);
      onUpdateData(transformedData);
    }
  }, [requirements, onUpdateData]);

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
      onOk: async () => {
        try {
          await deleteRequirement(vendorId).unwrap();
          const updatedData = rowData.filter((row) => row._id !== vendorId);
          setRowData(updatedData);
          onUpdateData(updatedData);
          notification.success({
            message: t('PART SUCCESSFULLY DELETE'),
            description: t('The step has been successfully added.'),
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
    console.log(taskPart);
    try {
      // Проверка на наличие всех необходимых полей
      if (!taskPart.partId || !taskPart.QUANTITY) {
        notification.error({
          message: t('ERROR'),
          description: t(
            'All fields must be filled and quantity must be greater than zero.'
          ),
        });
        return;
      }

      if (taskPart.createUserID) {
        console.log(taskPart);
        // await updateRequirement({
        //   // requirement: {
        //   //   partNumberID: taskPart.partId,
        //   //   quantity: taskPart.QUANTITY,
        //   //   id: taskPart.id,
        //   // },
        // }).unwrap();

        notification.success({
          message: t('STEP SUCCESSFULLY UPDATED'),
          description: t('The step has been successfully updated.'),
        });
      } else {
        // await addRequirement({
        //   requirement: {},
        // })
        // .unwrap();
        console.log(taskPart);

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
          pagination
          isEditable={isEditable}
          isAddVisiable={isAddVisiable}
          isButtonVisiable={isButtonVisiable}
          height={height}
          isLoading={isLoading}
          rowData={rowData}
          columnDefs={columnDefs}
          partNumbers={partNumbers}
          onAddRow={onAddRow}
          onDelete={onDelete}
          onSave={onSave}
          onCellValueChanged={onCellValueChanged}
          onRowSelect={onRowSelect}
          onCheckItems={onCheckItems}
        />
      </div>
    </div>
  );
};

export default RequarementsList;
