//@ts-nocheck
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Button,
  Col,
  Modal,
  Space,
  Switch,
  notification,
  Checkbox,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { Split } from '@geoffcox/react-splitter';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import {
  useGetPartNumbersQuery,
  useAddMultiPartNumberMutation,
  useAddPartNumberMutation,
  useUpdatePartNumberMutation,
  useDeletePartNumberMutation,
} from '@/features/partAdministration/partApi';
import { transformToIPart } from '@/services/utilites';
import { IPartNumber } from '@/models/IUser';

import WODiscription from './PartAdminDiscription';
import PartAdminTree from './PartAdminTree';
import PartAdminForm from './PartAdminForm';
import FileUploader from '../shared/FileUploader';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import UniversalAgGrid from '../shared/UniversalAgGrid';

import { useColumnDefs } from './hooks/useColumnDefs';

interface AdminPanelProps {
  projectSearchValues: Record<string, unknown>;
}

function PartAdminPanel({ projectSearchValues }: AdminPanelProps) {
  const [editingProject, setEditingProject] = useState<IPartNumber | null>(
    null
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [isTreeView, setIsTreeView] = useState(false);
  const [isColumnSettingsVisible, setIsColumnSettingsVisible] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const { t } = useTranslation();

  const {
    data: projectTasks,
    isLoading,
    isFetching,
  } = useGetPartNumbersQuery(projectSearchValues, {
    skip: !projectSearchValues,
  });

  const [addPartNumber] = useAddPartNumberMutation();
  const [updatePartNumber] = useUpdatePartNumberMutation();
  const [deletePartNumber] = useDeletePartNumberMutation();
  const [addMultiPartItems] = useAddMultiPartNumberMutation();

  const transformedTasks = useMemo(
    () => transformToIPart(projectTasks || []),
    [projectTasks]
  );

  const columnDefs = useColumnDefs(projectTasks, t);

  useEffect(() => {
    const savedColumnVisibility = localStorage.getItem('columnVisibility');
    if (savedColumnVisibility) {
      setColumnVisibility(JSON.parse(savedColumnVisibility));
    }
  }, []);

  const updateColumnVisibility = useCallback(
    (field: string, visible: boolean) => {
      setColumnVisibility((prev) => {
        const updated = { ...prev, [field]: visible };
        localStorage.setItem('columnVisibility', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const visibleColumnDefs = useMemo(
    () => columnDefs.filter((col) => columnVisibility[col.field] !== false),
    [columnDefs, columnVisibility]
  );

  const handleAddMultiItems = useCallback(
    async (data: any[]) => {
      try {
        await addMultiPartItems({ partNumberDTO: data }).unwrap();
        notification.success({ message: 'Successfully added' });
      } catch (error) {
        notification.error({ message: 'Error saving' });
      }
    },
    [addMultiPartItems]
  );

  const handleSubmit = useCallback(
    async (part: any) => {
      try {
        if (editingProject) {
          await updatePartNumber(part).unwrap();
          notification.success({ message: 'Successfully updated' });
        } else {
          await addPartNumber({ partNumber: part }).unwrap();
          notification.success({ message: 'Successfully added' });
        }
      } catch (error) {
        notification.error({ message: 'Error saving' });
      }
    },
    [editingProject, updatePartNumber, addPartNumber]
  );
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const handleEdit = useCallback((selectedRows: any[]) => {
    console.log('Selected rows:', selectedRows);
    const selectedProject =
      selectedRows && selectedRows.length ? selectedRows[0] : null;
    console.log('Setting editing project:', selectedProject);
    setEditingProject(selectedProject);
    setSelectedRowId(selectedProject?.id || selectedProject?._id);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingProject(null);
    setSelectedKeys([]);
  }, []);

  const handleDelete = useCallback(
    async (partIDs: React.Key[]) => {
      if (partIDs.length === 0) {
        notification.warning({ message: 'No part numbers selected' });
        return;
      }

      Modal.confirm({
        title: 'Are you sure you want to delete selected part numbers?',
        onOk: async () => {
          try {
            for (const partID of partIDs) {
              await deletePartNumber(partID.toString()).unwrap();
            }
            setSelectedKeys([]);
            notification.success({ message: 'PN successfully deleted' });
          } catch (error) {
            notification.error({ message: 'PN deleting requirement' });
          }
        },
      });
    },
    [deletePartNumber]
  );

  const handleCellValueChanged = useCallback((params: any) => {
    console.log('Cell value changed:', params);
  }, []);

  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const handleColumnSettingsClick = useCallback(() => {
    setIsColumnSettingsVisible(true);
  }, []);

  const handleColumnSettingsClose = useCallback(() => {
    setIsColumnSettingsVisible(false);
  }, []);

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className="bg-white px-4 py-3 rounded-md brequierement-gray-400"
          sm={24}
        >
          <WODiscription part={editingProject} />
        </Col>
      </Space>
      <Space className="">
        <PermissionGuard requiredPermissions={[Permission.PART_NUMBER_EDIT]}>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD PART NUMBER')}
          </Button>
        </PermissionGuard>
        <PermissionGuard requiredPermissions={[Permission.PART_NUMBER_EDIT]}>
          <FileUploader
            onFileProcessed={handleAddMultiItems}
            requiredFields={[
              'PART_NUMBER',
              'DESCRIPTION',
              'GROUP',
              'TYPE',
              'ADD_UNIT_OF_MEASURE',
              'UNIT_OF_MEASURE',
            ]}
          />
        </PermissionGuard>
        <PermissionGuard
          requiredPermissions={[
            Permission.DELETE_PART_NUMBER,
            Permission.PART_NUMBER_EDIT,
          ]}
        >
          <Button
            danger
            size="small"
            icon={<MinusSquareOutlined />}
            onClick={() => handleDelete(selectedKeys)}
            disabled={selectedKeys.length === 0}
          >
            {t('DELETE PART NUMBER')}
          </Button>
        </PermissionGuard>
        {/* <PermissionGuard requiredPermissions={[Permission.PART_NUMBER_EDIT]}>
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<PrinterOutlined />}
          >
            {t('PRINT PART NUMBER')}
          </Button>
        </PermissionGuard> */}
        <Switch
          checkedChildren="Table"
          unCheckedChildren="Tree"
          defaultChecked
          onChange={() => setIsTreeView(!isTreeView)}
        />
      </Space>
      <div className="h-[77vh] flex flex-col">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[77vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            {isTreeView ? (
              <PartAdminTree
                isLoading={isLoading || isFetching}
                onProjectSelect={handleEdit}
                parts={transformedTasks}
                onCheckItems={setSelectedKeys}
              />
            ) : (
              <UniversalAgGrid
                selectedRowId={selectedRowId}
                gridId="partAdminPanel"
                rowData={transformedTasks}
                columnDefs={columnDefs}
                onRowSelect={handleEdit}
                onCellValueChanged={handleCellValueChanged}
                height="64vh"
                pagination={true}
                isLoading={isLoading || isFetching}
                isChekboxColumn={true}
                onCheckItems={setSelectedKeys}
              />
            )}
          </div>
          <div className="h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <PartAdminForm order={editingProject} onSubmit={handleSubmit} />
          </div>
        </Split>
      </div>
      {/* <Modal
        title={t('COLUMN SETTINGS')}
        visible={isColumnSettingsVisible}
        onCancel={handleColumnSettingsClose}
        footer={null}
      >
        {columnDefs.map((col) => (
          <div key={col.field}>
            <Checkbox
              checked={columnVisibility[col.field] !== false}
              onChange={(e) =>
                updateColumnVisibility(col.field, e.target.checked)
              }
            >
              {col.headerName}
            </Checkbox>
          </div>
        ))}
      </Modal> */}
    </div>
  );
}

export default PartAdminPanel;
