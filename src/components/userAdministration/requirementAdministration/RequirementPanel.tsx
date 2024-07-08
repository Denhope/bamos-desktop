// import React, { useMemo, useState } from 'react';
// import {
//   Button,
//   Row,
//   Col,
//   Modal,
//   message,
//   Space,
//   Spin,
//   Switch,
//   Empty,
// } from 'antd';
// import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

// import { useTranslation } from 'react-i18next';

// import RequirementForm from './RequirementForm';

// import RequirementTree from './RequirementTree';
// import {
//   useGetFilteredRequirementsQuery,
//   useDeleteRequirementMutation,
//   useUpdateRequirementMutation,
//   useAddRequirementMutation,
// } from '@/features/requirementAdministration/requirementApi';
// import { IRequirement } from '@/models/IRequirement';
// import RequirementsDiscription from './RequirementsDiscription';
// import { Split } from '@geoffcox/react-splitter';
// import RequarementsList from '@/components/woAdministration/requirements/RequarementsList';
// import { ColDef } from 'ag-grid-community';
// import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
// import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
// import {
//   ValueEnumType,
//   getStatusColor,
//   transformToIRequirement,
// } from '@/services/utilites';

// interface AdminPanelProps {
//   requirementsSearchValues?: any;
// }

// const RequirementPanel: React.FC<AdminPanelProps> = ({
//   requirementsSearchValues,
// }) => {
//   const [editingRequirement, setEditingRequirement] =
//     useState<IRequirement | null>(null);
//   const [isCreating, setIsCreating] = useState<boolean>(false);
//   const { data: requirements, isLoading } = useGetFilteredRequirementsQuery(
//     {
//       projectID: requirementsSearchValues?.projectID
//         ? requirementsSearchValues?.projectID
//         : '',
//       projectTaskID: requirementsSearchValues?.projectTaskID
//         ? requirementsSearchValues?.projectTaskID
//         : '',
//       partNumberID: requirementsSearchValues?.partNumberID
//         ? requirementsSearchValues?.partNumberID
//         : '',
//       reqTypesID: requirementsSearchValues?.reqTypesID
//         ? requirementsSearchValues?.reqTypesID
//         : '',
//       reqCodesID: requirementsSearchValues?.reqCodesID
//         ? requirementsSearchValues?.reqCodesID
//         : '',

//       startDate: requirementsSearchValues?.startDate
//         ? requirementsSearchValues?.startDate
//         : '',

//       endDate: requirementsSearchValues?.endDate
//         ? requirementsSearchValues?.endDate
//         : '',

//       status: requirementsSearchValues?.status || 'open',
//       partRequestNumberNew: requirementsSearchValues?.partRequestNumber,

//       neededOnID: requirementsSearchValues?.neededOnID
//         ? requirementsSearchValues?.neededOnID
//         : '',
//     },
//     {
//       skip: !requirementsSearchValues,
//     }
//   );

//   const [addRequirement] = useAddRequirementMutation();
//   const [updateRequirement] = useUpdateRequirementMutation();
//   const [deleteRequirement] = useDeleteRequirementMutation();
//   const [isTreeView, setIsTreeView] = useState(true);
//   const handleCreate = () => {
//     setEditingRequirement(null);
//     setIsCreating(true);
//   };

//   const handleEdit = (requierement: IRequirement) => {
//     setEditingRequirement(requierement);
//   };

//   const handleDelete = async (companyId: string) => {
//     Modal.confirm({
//       title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
//       onOk: async () => {
//         try {
//           await deleteRequirement(companyId).unwrap();
//           message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
//         } catch (error) {
//           message.error(t('ERROR DELETING REQUIREMENT'));
//         }
//       },
//     });
//   };
//   const { data: partNumbers, isError } = useGetPartNumbersQuery({});
//   const handleSubmit = async (requirement: IRequirement) => {
//     try {
//       if (editingRequirement) {
//         await updateRequirement(requirement).unwrap();
//         message.success(t('REQUIREMENT SUCCESSFULLY UPDATED'));
//       } else {
//         await addRequirement({ requirement }).unwrap();
//         message.success(t('REQUIREMENT SUCCESSFULLY ADDED'));
//       }
//       setEditingRequirement(null);
//     } catch (error) {
//       message.error(t('ERROR SAVING REQUIREMENT'));
//     }
//   };

//   const { t } = useTranslation();

//   if (isLoading) {
//     return (
//       <div>
//         <Spin />
//       </div>
//     );
//   }
//   type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

//   interface ExtendedColDef extends ColDef {
//     cellDataType: CellDataType; // Обязательное свойство
//   }

//   const valueEnum: ValueEnumType = {
//     onShort: t('ON SHORT'),
//     onQuatation: t('QUATATION'),
//     open: t('OPEN'),
//     closed: t('CLOSED'),
//     canceled: t('CANCELLED'),
//     onOrder: t('ISSUED'),
//     draft: t('DRAFT'),
//   };

//   const columnRequirements = [
//     {
//       field: 'readyStatus',
//       headerName: ``,
//       cellDataType: 'text',
//       width: 50,
//       filter: false,
//     },
//     {
//       field: 'partRequestNumberNew',
//       headerName: `${t('REQUIREMENT No')}`,
//       cellDataType: 'number',
//     },
//     {
//       field: 'status',
//       headerName: `${t('Status')}`,
//       cellDataType: 'text',
//       width: 150,
//       filter: true,
//       valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
//         params.data.status,
//       valueFormatter: (params: { value: keyof ValueEnumType }) => {
//         const status = params.value;
//         return valueEnum[status] || '';
//       },
//       cellStyle: (params: { value: keyof ValueEnumType }) => ({
//         backgroundColor: getStatusColor(params.value),
//         color: '#ffffff', // Text color
//       }),
//     },
//     {
//       field: 'projectTaskWO',
//       headerName: `${t('WO No')}`,
//       cellDataType: 'number',
//     },
//     {
//       field: 'projectWO',
//       headerName: `${t('PROJECT')}`,
//       cellDataType: 'number',
//     },
//     {
//       headerName: `${t('PART No')}`,
//       field: 'PART_NUMBER',
//       editable: true,
//       cellEditor: AutoCompleteEditor,
//       cellEditorParams: {
//         options: partNumbers,
//       },
//     },
//     {
//       field: 'DESCRIPTION',
//       headerName: `${t('DESCRIPTION')}`,
//       cellDataType: 'text',
//     },
//     {
//       field: 'GROUP',
//       headerName: `${t('GROUP')}`,
//       cellDataType: 'text',
//     },
//     {
//       field: 'TYPE',
//       headerName: `${t('TYPE')}`,
//       cellDataType: 'text',
//       editable: false,
//     },
//     {
//       field: 'amout',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('QUANTITY')}`,
//     },
//     {
//       field: 'UNIT_OF_MEASURE',
//       editable: false,
//       filter: false,
//       headerName: `${t('UNIT OF MEASURE')}`,
//       cellDataType: 'text',
//     },
//     {
//       field: 'plannedDate',
//       editable: false,
//       cellDataType: 'date',
//       headerName: `${t('PLANNED DATE')}`,
//     },
//     {
//       field: 'issuedQuantity',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('REQUESTED QTY')}`,
//     },
//     {
//       field: 'bookedQuantity',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('BOOKED QTY')}`,
//     },
//     {
//       field: 'reservationQTY',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('LINK QTY')}`,
//     },
//     {
//       field: 'availableQTY',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('AVAIL QTY')}`,
//     },
//     {
//       field: 'materialAplicationNumber',
//       editable: false,
//       cellDataType: 'number',
//       headerName: `${t('PICKSLIP No')}`,
//     },
//     // Добавьте другие колонки по необходимости
//   ];

//   const transformedREquirements = useMemo(() => {
//     return (
//       requirementsSearchValues && transformToIRequirement(requirements || [])
//     );
//   }, [requirementsSearchValues]);
//   return (
//     <>
//       <Space>
//         <Col
//           className=" bg-white px-4 py-3 w-full  rounded-md brequierement-gray-400 "
//           sm={24}
//         >
//           <RequirementsDiscription
//             // onRequirementSearch={setRequirement}
//             requirement={editingRequirement}
//           ></RequirementsDiscription>
//         </Col>
//       </Space>
//       <Space className="">
//         <Col>
//           <Button
//             size="small"
//             icon={<PlusSquareOutlined />}
//             onClick={handleCreate}
//           >
//             {t('ADD REQUIREMENT')}
//           </Button>
//         </Col>
//         <Col style={{ textAlign: 'right' }}>
//           {editingRequirement && (
//             <Button
//               size="small"
//               icon={<MinusSquareOutlined />}
//               onClick={() => handleDelete(editingRequirement._id)}
//             >
//               {t('DELETE REQUIREMENT')}
//             </Button>
//           )}
//         </Col>
//         <Col style={{ textAlign: 'right' }}>
//           {editingRequirement && (
//             <Button
//               disabled
//               size="small"
//               icon={<MinusSquareOutlined />}
//               // onClick={() => handleDelete(editingRequirement.id)}
//             >
//               {t('COPY REQUIREMENT')}
//             </Button>
//           )}
//         </Col>
//         <Col>
//           <Switch
//             checkedChildren="Table"
//             unCheckedChildren="Tree"
//             defaultChecked
//             onChange={() => setIsTreeView(!isTreeView)}
//           />
//         </Col>
//       </Space>

//       <div className="  flex gap-4 justify-between">
//         <Split initialPrimarySize="30%" splitterSize="20px">
//           <div
//             // sm={4}
//             className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
//           >
//             {isTreeView ? (
//               <RequirementTree
//                 onCompanySelect={function (rowData: any): void {
//                   // console.log(rowData);
//                   handleEdit(rowData);
//                 }}
//                 requirements={requirements || []}
//               />
//             ) : (
//               <RequarementsList
//                 pagination
//                 isEditable={false}
//                 height={'64vh'}
//                 isAddVisiable={true}
//                 isButtonVisiable={false}
//                 fetchData={transformedREquirements}
//                 columnDefs={columnRequirements}
//                 partNumbers={partNumbers || []}
//                 onUpdateData={function (data: any[]): void {}}
//                 onRowSelect={function (rowData: any): void {
//                   // console.log(rowData);
//                   handleEdit(rowData);
//                 }}
//                 onCheckItems={function (selectedKeys: React.Key[]): void {}}
//                 onDelete={function (reqID: string): void {
//                   throw new Error('Function not implemented.');
//                 }}
//                 onSave={function (rowData: IRequirement): void {
//                   throw new Error('Function not implemented.');
//                 }}
//               ></RequarementsList>
//             )}
//           </div>
//           <div
//             className="h-[67vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
//             // sm={19}
//           >
//             <RequirementForm
//               requierement={editingRequirement || undefined}
//               onSubmit={handleSubmit}
//               onDelete={handleDelete}
//             />
//           </div>
//         </Split>
//       </div>
//     </>
//   );
// };

// export default RequirementPanel;

import React, { useMemo, useState } from 'react';
import { Button, Col, Modal, message, Space, Spin, Switch } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';
import RequirementForm from './RequirementForm';
import RequirementTree from './RequirementTree';
import RequarementsList from '@/components/woAdministration/requirements/RequarementsList';
import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
import {
  useGetFilteredRequirementsQuery,
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
  useAddRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { IRequirement } from '@/models/IRequirement';
import RequirementsDiscription from './RequirementsDiscription';
import { Split } from '@geoffcox/react-splitter';
import { ColDef } from 'ag-grid-community';
import {
  ValueEnumType,
  getStatusColor,
  transformToIRequirement,
} from '@/services/utilites';
import CircleRenderer from './CircleRenderer';

interface AdminPanelProps {
  requirementsSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  requirementsSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const {
    data: requirements,
    isLoading,
    isFetching,
  } = useGetFilteredRequirementsQuery(
    {
      projectID: requirementsSearchValues?.projectID || '',
      projectTaskID: requirementsSearchValues?.projectTaskID || '',
      partNumberID: requirementsSearchValues?.partNumberID || '',
      reqTypesID: requirementsSearchValues?.reqTypesID || '',
      reqCodesID: requirementsSearchValues?.reqCodesID || '',
      startDate: requirementsSearchValues?.startDate || '',
      endDate: requirementsSearchValues?.endDate || '',
      status: requirementsSearchValues?.status || 'open',
      partRequestNumberNew: requirementsSearchValues?.partRequestNumber || '',
      neededOnID: requirementsSearchValues?.neededOnID || '',
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !requirementsSearchValues,
      refetchOnMountOrArgChange: true,
    }
  );

  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  const [isTreeView, setIsTreeView] = useState(true);
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const { t } = useTranslation();

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = (requirement: IRequirement) => {
    setEditingRequirement(requirement);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
      onOk: async () => {
        try {
          await deleteRequirement(companyId).unwrap();
          message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT'));
        }
      },
    });
  };

  const handleSubmit = async (requirement: IRequirement) => {
    try {
      if (editingRequirement) {
        await updateRequirement(requirement).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY UPDATED'));
      } else {
        await addRequirement({ requirement }).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY ADDED'));
      }
      setEditingRequirement(null);
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT'));
    }
  };
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('PROGRESS'),
    complete: t('COMPLETE'),
    partlyClosed: t('PARTLY CLOSED'),
  };

  const columnRequirements = [
    {
      field: 'readyStatus',
      headerName: ``,
      cellRenderer: CircleRenderer, // Использование кастомного рендерера
      width: 60,
      filter: false,
      cellRendererParams: {
        color: '', // Параметры, если необходимы
      },
      cellDataType: 'number',
    },
    {
      field: 'partRequestNumberNew',
      headerName: `${t('REQUIREMENT No')}`,
      cellDataType: 'number',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('WO No')}`,
      cellDataType: 'number',
    },
    {
      field: 'projectWO',
      headerName: `${t('PROJECT')}`,
      cellDataType: 'number',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: true,
      cellEditor: AutoCompleteEditor,
      cellEditorParams: {
        options: partNumbers,
      },
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
      editable: false,
    },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'plannedDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'requestQuantity',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('REQUESTED QTY')}`,
    },
    {
      field: 'bookedQuantity',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('BOOKED QTY')}`,
    },
    {
      field: 'reservationQTY',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('LINK QTY')}`,
    },
    {
      field: 'availableQTY',

      cellDataType: 'number',
      headerName: `${t('STOCK QTY')}`,
    },
    {
      field: 'availableAllStoreQTY',

      cellDataType: 'number',
      headerName: `${t('AVAIL ALL STORES QTY')}`,
    },
    {
      field: 'restrictedAllStoreQTY',

      cellDataType: 'number',
      headerName: `${t('RESRICTED ALL STORES QTY')}`,
    },
    {
      field: 'pickSlipNumber',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('PICKSLIP No')}`,
    },
    {
      field: 'neededOnIDTitle',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('NEEDED ON')}`,
    },
    // Добавьте другие колонки по необходимости
  ];

  const transformedRequirements = useMemo(() => {
    return (
      requirementsSearchValues && transformToIRequirement(requirements || [])
    );
  }, [requirementsSearchValues, requirements]);

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Space>
        <Col
          className="bg-white px-4 py-3 w-full rounded-md brequierement-gray-400"
          sm={24}
        >
          <RequirementsDiscription
            requirement={editingRequirement}
          ></RequirementsDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD REQUIREMENT')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingRequirement._id)}
            >
              {t('DELETE REQUIREMENT')}
            </Button>
          )}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button disabled size="small" icon={<MinusSquareOutlined />}>
              {t('COPY REQUIREMENT')}
            </Button>
          )}
        </Col>
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <RequirementTree
                loading={isLoading || isFetching}
                onCompanySelect={(rowData: any) => handleEdit(rowData)}
                requirements={requirements || []}
              />
            ) : (
              <RequarementsList
                loading={isLoading || isFetching}
                pagination={false}
                isEditable={false}
                height={'64vh'}
                isAddVisiable={true}
                isButtonVisiable={false}
                fetchData={transformedRequirements}
                columnDefs={columnRequirements}
                partNumbers={partNumbers || []}
                onRowSelect={(rowData: any) => handleEdit(rowData)}
                onDelete={function (reqID: string): void {}}
                onSave={function (rowData: IRequirement): void {}}
                onUpdateData={function (data: any[]): void {}}
                onCheckItems={function (selectedKeys: React.Key[]): void {}}
              />
            )}
          </div>
          <div className="h-[68vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <RequirementForm
              requierement={editingRequirement || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default RequirementPanel;
