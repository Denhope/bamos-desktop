import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';

import { Button, Col, Modal, Space, Spin, Switch, message } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import WODiscription from './PartAdminDiscription';
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
import WOTree from './PartAdminTree';
import WOAdminForm from './PartAdminForm';

import { Split } from '@geoffcox/react-splitter';
import PartAdminTree from './PartAdminTree';
import PartAdminForm from './PartAdminForm';
import FileUploader from '../shared/FileUploader';
import {
  useAddMultiPartNumberMutation,
  useAddPartNumberMutation,
  useDeletePartNumberMutation,
  useGetPartNumbersQuery,
  useUpdatePartNumberMutation,
} from '@/features/partAdministration/partApi';
import { IPartNumber } from '@/models/IUser';
import PartList from '../woAdministration/PartList';
import { ColDef } from 'ag-grid-community';
import AutoCompleteEditor from '../shared/Table/ag-grid/AutoCompleteEditor';
import PartContainer from '../woAdministration/PartContainer';
import {
  transformToIAltPartNumber,
  transformToIPart,
} from '@/services/utilites';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import PartsTable from '../shared/Table/PartsTable';

interface AdminPanelProps {
  projectSearchValues: any;
}
const PartAdminPanel: React.FC<AdminPanelProps> = ({ projectSearchValues }) => {
  const [editingproject, setEditingproject] = useState<IPartNumber | null>(
    null
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);
  const {
    data: projectTasks,
    isLoading,
    isFetching,
  } = useGetPartNumbersQuery(projectSearchValues, {
    skip: !projectSearchValues, // Skip the query if triggerQuery is false
  });

  const [addPartNumber] = useAddPartNumberMutation({});
  const [updatePartNumber] = useUpdatePartNumberMutation();
  const [deletePartNumber] = useDeletePartNumberMutation();

  const [addMultiPpartItems] = useAddMultiPartNumberMutation({});
  const transformedTasks = useMemo(() => {
    return transformToIPart(projectTasks || []);
  }, [projectTasks]);
  const handleAddMultiItems = async (data: any) => {
    try {
      {
        await addMultiPpartItems({
          partNumberDTO: data,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        // setEditingReqCode(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };
  const handleSubmit = async (part: any) => {
    try {
      if (editingproject) {
        await updatePartNumber(part).unwrap();
        message.success(t('УСПЕШНО ОБНОВЛЕНО'));
        // setEditingproject(null);
      } else {
        await addPartNumber({
          partNumber: part,
          // storeID: storeID,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        // setEditingproject(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };

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
  // if (isLoading) {
  //   return (
  //     <div>
  //       <Spin />
  //     </div>
  //   );
  // }
  const handleEdit = (project: any) => {
    project && project?.length
      ? setEditingproject(project[0])
      : setEditingproject(project);
  };
  const handleCreate = () => {
    setEditingproject(null);
    setSelectedKeys([]);
  };
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      cellEditor: AutoCompleteEditor,
      cellEditorParams: {
        options: projectTasks,
      },
      cellDataType: 'text',
      filter: true,
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
      filter: true,
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
      filter: true,
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
      filter: true,
    },

    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: true,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    // Добавьте другие колонки по необходимости
  ]);

  const handleDelete = async (partID: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PART NUMBER?'),
      onOk: async () => {
        try {
          await deletePartNumber(partID).unwrap();
          setSelectedKeys([]);
          message.success(t('WORKORDER SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('WORKORDER DELETING REQUIREMENT'));
        }
      },
    });
  };
  const [isTreeView, setIsTreeView] = useState(false);
  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      {/* {isLoading ? (
        <div>
          <Spin />
        </div>
      ) : ( */}
      <>
        <Space>
          <Col
            className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
            sm={24}
          >
            <WODiscription part={editingproject}></WODiscription>
          </Col>
        </Space>
        <Space className="">
          <Col>
            <PermissionGuard
              requiredPermissions={[Permission.PART_NUMBER_EDIT]}
            >
              <Button
                size="small"
                icon={<PlusSquareOutlined />}
                onClick={handleCreate}
              >
                {t('ADD PART NUMBER')}
              </Button>
            </PermissionGuard>
          </Col>
          <Col span={20}>
            <PermissionGuard
              requiredPermissions={[Permission.PART_NUMBER_EDIT]}
            >
              <FileUploader
                onFileProcessed={function (data: any[]): void {
                  handleAddMultiItems(data);
                }}
                requiredFields={[
                  'PART_NUMBER',
                  'DESCRIPTION',
                  'GROUP',
                  'TYPE',
                  'ADD_UNIT_OF_MEASURE',
                  'UNIT_OF_MEASURE',
                ]}
              ></FileUploader>
            </PermissionGuard>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <PermissionGuard
              requiredPermissions={[
                Permission.DELETE_PART_NUMBER,
                Permission.PART_NUMBER_EDIT,
              ]}
            >
              <Button
                danger
                disabled={!selectedKeys.length}
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(String(selectedKeys))}
              >
                {t('DELETE PART NUMBER')}
              </Button>
            </PermissionGuard>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <PermissionGuard
              requiredPermissions={[Permission.PART_NUMBER_EDIT]}
            >
              <Button
                disabled={!selectedKeys.length}
                size="small"
                icon={<PrinterOutlined />}
              >
                {t('PRINT PART NUMBER')}
              </Button>
            </PermissionGuard>
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
        <div className="h-[77vh] flex flex-col">
          <Split initialPrimarySize="30%" splitterSize="20px">
            <div className="h-[77vh]  bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
              {isTreeView ? (
                <PartAdminTree
                  isLoading={isLoading || isFetching}
                  onProjectSelect={handleEdit}
                  parts={transformedTasks || []}
                  onCheckItems={(selectedKeys) => {
                    setSelectedKeys(selectedKeys);
                  }}
                />
              ) : (
                <div style={containerStyle}>
                  <div style={gridStyle} className={'ag-theme-alpine'}>
                    <PartsTable
                      isLoading={isLoading || isFetching}
                      isFilesVisiable={true}
                      isVisible={true}
                      pagination={true}
                      isAddVisiable={true}
                      isButtonVisiable={false}
                      height={'64vh'}
                      rowData={transformedTasks}
                      columnDefs={columnDefs}
                      onAddRow={function (): void {}}
                      onDelete={function (id: string): void {}}
                      onSave={function (data: any): void {}}
                      onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
                      onRowSelect={handleEdit}
                      // onCheckItems={true}
                      partNumbers={[]}
                      isChekboxColumn={true}
                      onCheckItems={function (
                        selectedKeys: React.Key[]
                      ): void {}}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
              <PartAdminForm
                order={editingproject}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
              />
            </div>
          </Split>
        </div>
      </>
      {/* )} */}
    </div>
  );
};

export default PartAdminPanel;
