// @ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import copy from 'copy-to-clipboard';
import { CellContextMenuEvent, DomLayoutType } from 'ag-grid-community';
import { IProjectItemWO } from '@/models/AC';
import { Input, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import localeTextRu from '@/locales/localeTextRu';
import localeTextEn from '@/locales/localeTextEn';
import * as XLSX from 'xlsx';
import { utils } from 'xlsx';
import { ITask } from '@/models/ITask';
import FileModalList from '../FileModalList';
import { handleFileSelect, handleFileOpen } from '@/services/utilites';
import {
  setColumnOrder,
  setColumnState,
  setColumnVisible,
} from '@/store/reducers/columnSlice';

interface ColumnDef {
  field: keyof IProjectItemWO;
  headerName: string;
  resizable?: boolean;
  filter?: boolean;
  hide?: boolean;
}

interface MyTableProps {
  height: string;
  columnDefs: ColumnDef[];
  rowData: ITask[];
  onRowSelect: (rowData: ITask | null) => void;
  onCheckItems: (selectedKeys: React.Key[]) => void;
  pagination?: boolean;
  isChekboxColumn?: boolean;
  isLoading?: boolean;
  isFilesVisiable?: boolean;
  gridKey: string; // Уникальный ключ таблицы
  wo?: any;
}

const TaskList: React.FC<MyTableProps> = ({
  columnDefs,
  rowData,
  onRowSelect,
  onCheckItems,
  height,
  pagination = false,
  isChekboxColumn = false,
  isLoading,
  isFilesVisiable,
  gridKey,
  wo,
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const { t, i18n } = useTranslation();
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedCell, setSelectedCell] = useState<CellContextMenuEvent | null>(
    null
  );
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [localColumnState, setLocalColumnState] = useState<any[]>([]);
  const [localColumnVisible, setLocalColumnVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [localColumnOrder, setLocalColumnOrder] = useState<any[]>([]);

  const dispatch = useDispatch();
  const columnState = useSelector(
    (state: any) => state.columns[gridKey]?.columnState
  );
  const columnVisible = useSelector(
    (state: any) => state.columns[gridKey]?.columnVisible
  );
  const columnOrder = useSelector(
    (state: any) => state.columns[gridKey]?.columnOrder
  );

  useEffect(() => {
    if (columnState) {
      setLocalColumnState(columnState);
    }
  }, [columnState]);

  useEffect(() => {
    if (columnVisible) {
      setLocalColumnVisible(columnVisible);
    }
  }, [columnVisible]);

  useEffect(() => {
    if (columnOrder) {
      setLocalColumnOrder(columnOrder);
    }
  }, [columnOrder]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.columnApi && localColumnState) {
      // console.log('Setting column state:', localColumnState);
      gridRef.current.columnApi.applyColumnState({ state: localColumnState });
    }
  }, [localColumnState]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.columnApi && localColumnVisible) {
      // console.log('Setting column visibility:', localColumnVisible);
      Object.keys(localColumnVisible).forEach((key) => {
        gridRef.current?.columnApi.setColumnVisible(
          key,
          localColumnVisible[key]
        );
      });
    }
  }, [localColumnVisible]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.columnApi && localColumnOrder) {
      // console.log('Setting column order:', localColumnOrder);
      gridRef.current.columnApi.applyColumnState({ state: localColumnOrder });
    }
  }, [localColumnOrder]);

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    const mouseEvent = event.event as MouseEvent;
    if (mouseEvent) {
      mouseEvent.preventDefault();
      setSelectedCell(event);
      setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setContextMenuVisible(true);
    }
  }, []);

  const copyCell = useCallback(() => {
    if (selectedCell) {
      copy(selectedCell.value?.toString() || '');
    }
    setContextMenuVisible(false);
  }, [selectedCell]);

  const copyTable = useCallback(() => {
    if (gridRef.current) {
      const columnHeaders = columnDefs.map((column) => column.headerName);
      const allRowData = gridRef.current.api
        .getRenderedNodes()
        .map((node) => node.data);

      const tableHtml = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            border: 1px solid #000;
          }
          td {
            border: 1px solid #000;
          }
        </style>
        <table>
          <thead>
            <tr>
              ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${allRowData
              .map(
                (rowData) =>
                  `<tr>
                    ${columnDefs
                      .map(
                        (column) =>
                          `<td>${
                            rowData[column?.field] !== undefined
                              ? rowData[column.field]
                              : ''
                          }</td>`
                      )
                      .join('')}
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;

      copy(tableHtml, { format: 'text/html' });
    }
    setContextMenuVisible(false);
  }, [columnDefs]);

  const copyRow = useCallback(() => {
    if (selectedCell) {
      const rowData = selectedCell.node?.data;
      if (rowData) {
        const columnHeaders = columnDefs.map((column) => column.headerName);
        const rowDataHtml = `<tr>${columnDefs
          .map(
            (column) =>
              `<td>${
                rowData[column?.field] !== undefined
                  ? rowData[column.field]
                  : ''
              }</td>`
          )
          .join('')}</tr>`;
        const tableHtml = `
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              text-align: left;
              padding: 8px;
            }
            th {
              background-color: #f2f2f2;
              border: 1px solid #000;
            }
            td {
              border: 1px solid #000;
            }
          </style>
          <table>
            <thead><tr>${columnHeaders
              .map((header) => `<th>${header}</th>`)
              .join('')}</tr></thead>
            <tbody>${rowDataHtml}</tbody>
          </table>
        `;
        copy(tableHtml, { format: 'text/html' });
      }
    }
    setContextMenuVisible(false);
  }, [selectedCell, columnDefs]);

  const exportToExcel = useCallback(() => {
    if (gridRef.current) {
      const columnHeaders = columnDefs.map((column) => column.headerName);
      const allRowData = gridRef.current.api
        .getRenderedNodes()
        .map((node) => node.data);

      const worksheetData = [
        columnHeaders,
        ...allRowData.map((rowData) =>
          columnDefs.map((column) =>
            rowData[column?.field] !== undefined ? rowData[column.field] : ''
          )
        ),
      ];
      const worksheet = utils.aoa_to_sheet(worksheetData);

      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Data');

      XLSX.writeFile(workbook, 'table.xlsx');
    }
  }, [columnDefs]);

  useEffect(() => {
    setSelectedRowCount(0);
  }, [rowData]);

  useEffect(() => {
    const handleWindowClick = () => setContextMenuVisible(false);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleRowSelection = useCallback(() => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedKeys = selectedNodes?.map((node) => node.data.id) || [];
    onRowSelect(
      selectedNodes?.length && selectedNodes.length > 0
        ? selectedNodes[0].data
        : null
    );
    onCheckItems(selectedKeys);
    setSelectedRowCount(selectedNodes?.length || 0);
  }, [onRowSelect, onCheckItems]);

  const checkboxColumn = useMemo(
    () => ({
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
    }),
    []
  );

  const localeText = useMemo(() => {
    switch (i18n.language) {
      case 'ru':
        return localeTextRu;
      case 'en':
      default:
        return localeTextEn;
    }
  }, [i18n.language]);

  const updatedColumnDefs = useMemo(
    () => [checkboxColumn, ...columnDefs],
    [checkboxColumn, columnDefs]
  );

  const gridOptions = useMemo(
    () => ({
      domLayout: 'autoHeight' as DomLayoutType,
    }),
    []
  );

  const copySelectedRows = useCallback(() => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();

      if (selectedNodes.length === 0) {
        console.warn('No rows selected to copy.');
        return;
      }

      const columnHeaders = columnDefs.map((column) => column.headerName);

      const selectedRowData = selectedNodes.map((node) => node.data);

      const tableHtml = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            border: 1px solid #000;
          }
          td {
            border: 1px solid #000;
          }
        </style>
        <table>
          <thead>
            <tr>
              ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${selectedRowData
              .map(
                (rowData) =>
                  `<tr>
                    ${columnDefs
                      .map(
                        (column: any) =>
                          `<td>${
                            rowData[column?.field] !== undefined
                              ? rowData[column.field]
                              : ''
                          }</td>`
                      )
                      .join('')}
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;

      copy(tableHtml, { format: 'text/html' });
    }
    setContextMenuVisible(false);
  }, [columnDefs]);

  const filesColumnDef = useMemo(
    () =>
      isFilesVisiable
        ? [
            {
              field: 'files',
              headerName: `${t('DOC')}`,
              cellRenderer: (params: any) => (
                <FileModalList
                  files={params?.data?.files || params?.data?.FILES}
                  onFileSelect={(file) => {
                    console.log('Selected file:', file);
                    handleFileSelect({
                      id: file?.id,
                      name: file?.name,
                    });
                  }}
                  onFileOpen={(file) => {
                    console.log('Opened file:', file);
                    handleFileOpen(file);
                  }}
                />
              ),
            },
          ]
        : [],
    [isFilesVisiable, t]
  );

  useEffect(() => {
    if (gridRef.current && gridRef.current.columnApi) {
      const columnState = gridRef.current.columnApi.getColumnState();
      const columnVisible = columnDefs.reduce((acc, column) => {
        acc[column.field] = gridRef.current?.columnApi
          .getColumn(column.field)
          ?.isVisible();
        return acc;
      }, {} as { [key: string]: boolean });
      const columnOrder = gridRef.current.columnApi
        .getColumnState()
        .map((col) => ({
          colId: col.colId,
          sort: col.sort,
          aggFunc: col.aggFunc,
        }));
      dispatch(setColumnState({ gridKey, columnState }));
      dispatch(setColumnVisible({ gridKey, columnVisible }));
      dispatch(setColumnOrder({ gridKey, columnOrder }));
    }
  }, [columnDefs, dispatch, gridKey]);

  const onGridReady = useCallback(
    (params: any) => {
      if (gridRef.current && gridRef.current.columnApi && columnState) {
        console.log('Setting column state onGridReady:', columnState);
        gridRef.current.columnApi.applyColumnState({ state: columnState });
      }
      if (gridRef.current && gridRef.current.columnApi && columnOrder) {
        console.log('Setting column order onGridReady:', columnOrder);

        gridRef.current.columnApi.applyColumnState({ state: columnOrder });
      }
    },
    [columnState]
  );

  return (
    <div
      className="pb-5 ag-theme-alpine"
      style={{ height: height, width: '100%' }}
    >
      <div className="pb-2 flex justify-between">
        <div className="mr-5">
          {t('Total Selected Rows')}: {selectedRowCount}
        </div>
        <div style={{ flexGrow: 1 }}>
          <Input
            allowClear
            size="small"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <AgGridReact
          columnHoverHighlight={true}
          localeText={localeText}
          ref={gridRef}
          defaultColDef={{
            menuTabs: ['filterMenuTab', 'generalMenuTab'],
            resizable: true,
          }}
          columnDefs={[
            ...(isChekboxColumn ? updatedColumnDefs : columnDefs),
            ...filesColumnDef,
          ]}
          rowHeight={30}
          rowData={rowData}
          rowSelection="multiple"
          onCellContextMenu={handleCellContextMenu}
          onSelectionChanged={handleRowSelection}
          clipboardDelimiter={'\t'}
          pagination={pagination}
          quickFilterText={searchText}
          paginationPageSize={50}
          sideBar={{
            toolPanels: [
              {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                  suppressRowGroups: true,
                  suppressValues: true,
                  suppressPivots: true,
                  suppressPivotMode: true,
                },
              },
            ],
            defaultToolPanel: 'columns',
          }}
          onGridReady={onGridReady}
        />
      )}

      {contextMenuVisible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={copyCell}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              transition: 'background-color 0.2s ease-in-out',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'white')
            }
          >
            {t('COPY CELL')}
          </div>
          <div
            onClick={copySelectedRows}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              transition: 'background-color 0.2s ease-in-out',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'white')
            }
          >
            {t('COPY SELECTED ROWS')}
          </div>

          <div
            onClick={exportToExcel}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              transition: 'background-color 0.2s ease-in-out',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'white')
            }
          >
            {t('EXPORT EXCEL')}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TaskList);
