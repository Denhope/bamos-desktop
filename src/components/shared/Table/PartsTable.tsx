import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  CellContextMenuEvent,
  ColDef,
  DomLayoutType,
  ICellRendererParams,
} from 'ag-grid-community';
import { saveAs } from 'file-saver';
import { IPartNumber } from '@/models/IUser';
import AutoCompleteEditor from './ag-grid/AutoCompleteEditor';
import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import localeTextRu from '@/locales/localeTextRu';
import localeTextEn from '@/locales/localeTextEn';
import copy from 'copy-to-clipboard';
import { utils, writeFile } from 'xlsx';
import { Input } from 'antd';
import { handleFileSelect, handleFileOpen } from '@/services/utilites';
import FileModalList from '../FileModalList';
type PartsTableProps = {
  isLoading?: boolean;
  rowData: any[];
  columnDefs: ColDef[];
  partNumbers: IPartNumber[];
  onAddRow: () => void;
  onDelete: (id: string) => void;
  onSave: (data: any) => void;
  onCellValueChanged: (params: any) => void;
  height: string;
  isAddVisiable?: boolean;
  isButtonVisiable?: boolean;
  isEditable?: boolean;
  onRowSelect: (rowData: any) => void;
  onCheckItems: (selectedKeys: React.Key[]) => void;
  pagination?: boolean;
  isChekboxColumn?: boolean;
  isButtonColumn?: boolean;
  isVisible?: boolean;
  isFilesVisiable?: boolean;
  isRowSelectable?: any;
  rowClassRules?: any;
};

const PartsTable: React.FC<PartsTableProps> = ({
  rowData,
  columnDefs,
  partNumbers,
  onAddRow,
  onDelete,
  onSave,
  onCellValueChanged,
  isLoading,
  isButtonVisiable = true,
  height,
  isAddVisiable,
  isEditable = true,
  onRowSelect,
  onCheckItems,
  pagination = false,
  isChekboxColumn = false,
  isButtonColumn = true,
  isVisible = false,
  isRowSelectable,
  isFilesVisiable = false,
  rowClassRules,
}) => {
  const { t, i18n } = useTranslation();
  const gridRef = useRef<AgGridReact>(null);

  // Состояние для отслеживания ID редактируемой строки
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const [selectedRowCount, setSelectedRowCount] = useState(0);
  // Обработка начала и завершения редактирования строки
  const handleRowEditingStarted = useCallback((event: any) => {
    setEditingRowId(event.node.data._id); // Устанавливаем ID редактируемой строки
  }, []);

  const handleRowEditingStopped = useCallback(() => {
    setEditingRowId(null); // Сбрасываем ID после завершения редактирования
  }, []);

  // Обработка удаления строки
  const handleDelete = useCallback(
    (params: ICellRendererParams) => {
      console.log('Params:', params);
      if (params.data) {
        onDelete(params.data._id);
      } else {
        console.error('Params does not contain expected data.');
      }
    },
    [onDelete]
  );

  // Обработка сохранения данных строки
  const handleSave = useCallback(
    (params: ICellRendererParams) => {
      if (params.data && gridRef.current) {
        gridRef.current.api.stopEditing(); // Прекращаем редактирование строки
        onSave(params.data); // Сохраняем данные
        gridRef.current.api.refreshCells({ force: true }); // Обновляем ячейки
      } else {
        console.error(
          'Params does not contain expected data or gridRef is not defined.'
        );
      }
    },
    [onSave]
  );

  // Обработка изменения значений ячеек
  const handleCellValueChanged = useCallback(
    (params: any) => {
      onCellValueChanged(params.data); // Убедитесь, что изменение сохраняется
    },
    [onCellValueChanged]
  );

  // const defaultColDef = useMemo(
  //   () => ({
  //     editable: false,
  //     sortable: true,
  //     filter: true,
  //   }),
  //   []
  // );

  const [selectedCell, setSelectedCell] = useState<CellContextMenuEvent | null>(
    null
  );
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const localeText = useMemo(() => {
    switch (i18n.language) {
      case 'ru':
        return localeTextRu;
      case 'en':
      default:
        return localeTextEn;
    }
  }, [i18n.language]);

  const copyCell = () => {
    if (selectedCell) {
      copy(selectedCell.value?.toString() || '');
    }
    setContextMenuVisible(false);
  };

  // const copyTable = () => {
  //   if (gridRef.current) {
  //     const columnHeaders = columnDefs.map((column) => column.headerName);
  //     const allRowData = gridRef.current.api
  //       .getRenderedNodes()
  //       .map((node) => node.data);

  //     const tableHtml = `
  //       <style>
  //         table {
  //           border-collapse: collapse;
  //           width: 100%;
  //         }
  //         th, td {
  //           border: 1px solid #ddd;
  //           text-align: left;
  //           padding: 8px;
  //         }
  //         th {
  //           background-color: #f2f2f2;
  //           border: 1px solid #000;
  //         }
  //         td {
  //           border: 1px solid #000;
  //         }
  //       </style>
  //       <table>
  //         <thead>
  //           <tr>
  //             ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${allRowData
  //             .map(
  //               (rowData) =>
  //                 `<tr>
  //                 ${columnDefs
  //                   .map(
  //                     (column: any) =>
  //                       `<td>${
  //                         rowData[column?.field] !== undefined
  //                           ? rowData[column.field]
  //                           : ''
  //                       }</td>`
  //                   )
  //                   .join('')}
  //               </tr>`
  //             )
  //             .join('')}
  //         </tbody>
  //       </table>
  //     `;

  //     const blob = new Blob([tableHtml], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  //     });
  //     // saveAs(blob, 'table.xlsx');
  //     copy(tableHtml, { format: 'text/html' });
  //   }
  //   setContextMenuVisible(false);
  // };
  const copySelectedRows = () => {
    if (gridRef.current) {
      // Получаем выделенные строки
      const selectedNodes = gridRef.current.api.getSelectedNodes();

      if (selectedNodes.length === 0) {
        console.warn('No rows selected to copy.');
        return;
      }

      // Получаем заголовки столбцов
      const columnHeaders = columnDefs.map((column) => column.headerName);

      // Формируем данные для копирования
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

      // Создаем Blob с HTML таблицей
      const blob = new Blob([tableHtml], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
      });

      // Копируем HTML в буфер обмена
      copy(tableHtml, { format: 'text/html' });
    }
    setContextMenuVisible(false);
  };

  const copyRow = () => {
    if (selectedCell) {
      const rowData = selectedCell.node?.data;
      if (rowData) {
        const columnHeaders = columnDefs.map((column) => column.headerName);
        const rowDataHtml = `<tr>${columnDefs
          .map(
            (column: any) =>
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
  };

  const exportToExcel = () => {
    if (gridRef.current) {
      const columnHeaders = columnDefs.map((column) => column.headerName);

      // Формируем данные для экспорта
      const worksheetData = [
        columnHeaders,
        ...rowData.map((rowData) =>
          columnDefs.map((column: any) =>
            rowData[column.field] !== undefined ? rowData[column.field] : ''
          )
        ),
      ];

      // Создаем рабочий лист и добавляем данные
      const worksheet = utils.aoa_to_sheet(worksheetData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Data');

      // Сохраняем файл Excel
      writeFile(workbook, 'table.xlsx');
    }
  };

  useEffect(() => {
    const handleWindowClick = () => setContextMenuVisible(false);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    const mouseEvent = event.event as MouseEvent;
    if (mouseEvent) {
      mouseEvent.preventDefault();
      setSelectedCell(event);
      setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setContextMenuVisible(true);
    }
  }, []);
  const handleRowSelection = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedKeys =
      selectedNodes?.map((node) => node?.data?._id || node?.data?.id) || [];
    onRowSelect(
      selectedNodes?.length && selectedNodes.length > 0
        ? selectedNodes[0].data
        : null
    );
    onCheckItems(selectedKeys);
    setSelectedRowCount(selectedNodes?.length || 0);
  };
  const checkboxColumn = {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 50,
  };
  const gridOptions = {
    domLayout: 'autoHeight' as DomLayoutType, // Use a valid value for DomLayoutType
  };
  const updatedColumnDefs = [checkboxColumn, ...columnDefs];

  const baseColumnDefs = isChekboxColumn ? updatedColumnDefs : columnDefs;
  const buttonColumnDef = isButtonVisiable
    ? [
        {
          cellRenderer: (params: any) => (
            <Space>
              <Button
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  handleSave(params);
                }}
                disabled={params.node.data._id !== editingRowId}
              >
                {t('SAVE')}
              </Button>
              <Button
                size="small"
                danger
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(params);
                }}
              >
                {t('DELETE')}
              </Button>
            </Space>
          ),
        },
      ]
    : [];
  const filesColumnDef = isFilesVisiable
    ? [
        {
          field: 'files',
          headerName: `${t('DOC')}`,
          cellRenderer: (params: any) => (
            <FileModalList
              files={params?.data?.files}
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
    : [];

  return (
    <div
      className="ag-theme-alpine flex flex-col gap-2"
      style={{ height: height, width: '100%' }}
    >
      {isVisible && (
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
      )}
      <AgGridReact
        rowClassRules={rowClassRules}
        columnHoverHighlight={true}
        defaultColDef={{
          menuTabs: ['filterMenuTab', 'generalMenuTab'],
          resizable: true,
        }}
        // gridOptions={gridOptions}
        localeText={localeText}
        paginationPageSize={50}
        clipboardDelimiter={'\t'}
        pagination={pagination}
        loadingOverlayComponent={isLoading}
        ref={gridRef}
        rowSelection="multiple"
        rowHeight={30}
        quickFilterText={searchText}
        // suppressRowClickSelection={true}
        // isRowSelectable={isRowSelectable}
        onSelectionChanged={handleRowSelection}
        onCellContextMenu={handleCellContextMenu}
        onRowEditingStarted={handleRowEditingStarted} // Обработчик начала редактирования
        onRowEditingStopped={handleRowEditingStopped} // Обработчик завершения редактирования
        columnDefs={[
          ...baseColumnDefs,
          ...buttonColumnDef,
          ...filesColumnDef, // Условно добавленная колонка
        ]}
        // defaultColDef={defaultColDef}
        rowData={rowData}
        editType={'fullRow'}
        onCellValueChanged={handleCellValueChanged}
      />
      {!isAddVisiable && (
        <Button type="primary" size="small" onClick={onAddRow}>
          {t('ADD PART')}
        </Button>
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
          {/* <div
            onClick={copyRow}
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
            {t('COPY ROW')}
          </div> */}
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

export default PartsTable;
