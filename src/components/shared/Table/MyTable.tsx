import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import copy from 'copy-to-clipboard';

import { CellContextMenuEvent, DomLayoutType } from 'ag-grid-community';
import { IProjectItemWO } from '@/models/AC';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import localeTextRu from '@/locales/localeTextRu';
import localeTextEn from '@/locales/localeTextEn';
import { saveAs } from 'file-saver'; // Importing file-saver for saving PDF
import * as XLSX from 'xlsx'; // Importing xlsx for Excel export
import { utils } from 'xlsx';

interface ColumnDef {
  field: keyof IProjectItemWO;
  headerName: string;
  resizable?: boolean;
  filter?: boolean;
  hide?: boolean;
}

interface MyTableProps {
  height: string;
  isVisible?: boolean;
  columnDefs: ColumnDef[];
  rowData: IProjectItemWO[];
  onRowSelect: (rowData: IProjectItemWO | null) => void;
  onCheckItems: (selectedKeys: React.Key[]) => void;
}

const MyTable: React.FC<MyTableProps> = ({
  columnDefs,
  rowData,
  onRowSelect,
  onCheckItems,
  height,
  isVisible = true,
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

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    const mouseEvent = event.event as MouseEvent;
    if (mouseEvent) {
      mouseEvent.preventDefault();
      setSelectedCell(event);
      setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setContextMenuVisible(true);
    }
  }, []);

  const copyCell = () => {
    if (selectedCell) {
      copy(selectedCell.value?.toString() || '');
    }
    setContextMenuVisible(false);
  };

  const copyTable = () => {
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

      const blob = new Blob([tableHtml], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
      });
      // saveAs(blob, 'table.xlsx');
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
  };

  const exportToExcel = () => {
    if (gridRef.current) {
      // Получение заголовков столбцов
      const columnHeaders = columnDefs.map((column) => column.headerName);
      // Получение данных строк
      const allRowData = gridRef.current.api
        .getRenderedNodes()
        .map((node) => node.data);

      // Создание рабочего листа
      const worksheetData = [
        columnHeaders,
        ...allRowData.map((rowData) =>
          columnDefs.map((column) =>
            rowData[column?.field] !== undefined ? rowData[column.field] : ''
          )
        ),
      ];
      const worksheet = utils.aoa_to_sheet(worksheetData);

      // Создание книги
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Data');

      // Запись файла Excel
      XLSX.writeFile(workbook, 'table.xlsx');
    }
  };

  useEffect(() => {
    const handleWindowClick = () => setContextMenuVisible(false);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleRowSelection = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedKeys = selectedNodes?.map((node) => node.data.id) || [];
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
  const localeText = useMemo(() => {
    switch (i18n.language) {
      case 'ru':
        return localeTextRu;
      case 'en':
      default:
        return localeTextEn;
    }
  }, [i18n.language]);
  const updatedColumnDefs = [checkboxColumn, ...columnDefs];

  const gridOptions = {
    domLayout: 'autoHeight' as DomLayoutType, // Use a valid value for DomLayoutType
  };

  return (
    <div
      className="pb-5 ag-theme-alpine"
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
        columnHoverHighlight={true}
        localeText={localeText}
        ref={gridRef}
        defaultColDef={{
          menuTabs: ['filterMenuTab', 'generalMenuTab'],
          resizable: true,
        }}
        // gridOptions={gridOptions}
        columnDefs={updatedColumnDefs}
        rowHeight={30}
        rowData={rowData}
        rowSelection="multiple"
        onCellContextMenu={handleCellContextMenu}
        onSelectionChanged={handleRowSelection}
        clipboardDelimiter={'\t'}
        pagination
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
      />

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
          </div>
          <div
            onClick={copyTable}
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
            {t('COPY TABLE')}
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

export default MyTable;
