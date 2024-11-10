//@ts-nocheck

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  ColumnMovedEvent,
  ColumnVisibleEvent,
  ColumnResizedEvent,
  CellContextMenuEvent,
  SelectionChangedEvent,
  GridApi,
  RowDoubleClickedEvent,
} from 'ag-grid-community';
import { Button, Checkbox, Space, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  setColumnOrder,
  setColumnVisibility,
  setColumnWidth,
  initializeTableState,
  setPagination,
} from '@/store/reducers/columnStateSlice';
import { SettingOutlined, CloseOutlined } from '@ant-design/icons';
import { RootState } from '@/store';
import copy from 'copy-to-clipboard';
import { utils, writeFile } from 'xlsx';

interface UniversalAgGridProps {
  gridId: string;
  rowData: any[];
  columnDefs: ColDef[];
  onRowSelect?: (selectedRows: any[]) => void;
  onCellValueChanged?: (params: any) => void;
  height?: string;
  width?: string;
  pagination?: boolean;
  rowSelection?: 'single' | 'multiple';
  isLoading?: boolean;
  isVisible?: boolean;
  isChekboxColumn?: boolean;
  onAddRow?: () => void;
  onCheckItems?: (selectedData: any[]) => void;
  selectedRowId?: string | null;
  onRowDoubleClicked?: (params: RowDoubleClickedEvent) => void;
  additionalButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  };
  gridRef?: React.RefObject<{ api: GridApi }>;
  isRowSelectable?: (params: any) => boolean;
  isRowValid?: (row: any) => boolean;
}

const UniversalAgGrid: React.FC<UniversalAgGridProps> = ({
  gridId,
  rowData,
  columnDefs: initialColumnDefs,
  onRowSelect,
  onCellValueChanged,
  height = '500px',
  width = '100%',
  pagination = false,
  rowSelection = 'multiple',
  isLoading = false,
  isVisible = true,
  isChekboxColumn = false,
  onAddRow,
  onCheckItems,
  selectedRowId,
  onRowDoubleClicked,
  additionalButton,
  gridRef: externalGridRef,
  isRowSelectable,
  isRowValid,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const columnState = useSelector(
    (state: RootState) => state?.columnState[gridId]
  );
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const [isColumnSettingsVisible, setIsColumnSettingsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedCell, setSelectedCell] = useState<CellContextMenuEvent | null>(
    null
  );
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(pagination);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnState) {
      dispatch(
        initializeTableState({ tableId: gridId, columnDefs: initialColumnDefs })
      );
    }
  }, [dispatch, gridId, initialColumnDefs, columnState]);

  useEffect(() => {
    if (columnState?.pagination !== undefined) {
      setIsPaginationEnabled(columnState.pagination);
    }
  }, [columnState]);

  const visibleColumnDefs = useMemo(() => {
    if (!columnState) return initialColumnDefs;
    return initialColumnDefs
      .filter((col) => col.field && columnState.visibility[col.field] !== false)
      .map((col) => ({
        ...col,
        width:
          col.field && columnState.widths && columnState.widths[col.field]
            ? columnState.widths[col.field]
            : col.width,
      }))
      .sort((a, b) => {
        if (a.field && b.field && columnState.order) {
          return (
            columnState.order.indexOf(a.field) -
            columnState.order.indexOf(b.field)
          );
        }
        return 0;
      });
  }, [initialColumnDefs, columnState]);

  const updateColumnVisibility = useCallback(
    (field: string, isVisible: boolean) => {
      dispatch(
        setColumnVisibility({ tableId: gridId, columnId: field, isVisible })
      );
    },
    [dispatch, gridId]
  );

  const handleColumnMoved = useCallback(
    (event: ColumnMovedEvent) => {
      const newOrder = event.columnApi
        .getAllGridColumns()
        .map((column) => column.getColId());
      dispatch(setColumnOrder({ tableId: gridId, order: newOrder }));
    },
    [dispatch, gridId]
  );

  const handleColumnResized = useCallback(
    (event: ColumnResizedEvent) => {
      const { column } = event;
      if (column && column.getColId()) {
        dispatch(
          setColumnWidth({
            tableId: gridId,
            columnId: column.getColId(),
            width: column.getActualWidth(),
          })
        );
      }
    },
    [dispatch, gridId]
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);

      const gridDiv = document.querySelector(`#${gridId}`);
      if (gridDiv) {
        gridDiv['api'] = params.api;
        gridDiv['columnApi'] = params.columnApi;
      }

      if (externalGridRef && 'current' in externalGridRef) {
        externalGridRef.current = { api: params.api };
      }

      if (columnState && columnState.order.length) {
        params.columnApi.applyColumnState({
          state: columnState.order.map((colId) => ({
            colId,
            hide: columnState.visibility[colId] === false,
            width: columnState.widths[colId],
          })),
          applyOrder: true,
        });
      }
    },
    [columnState, gridId, externalGridRef]
  );

  useEffect(() => {
    if (gridApi && selectedRowId) {
      gridApi.forEachNode((node) => {
        if (node.data && (node.data.id || node.data?._id) === selectedRowId) {
          node.setSelected(true);
          gridApi.ensureNodeVisible(node);
        } else {
          node.setSelected(false);
        }
      });
    }
  }, [gridApi, selectedRowId, rowData]);

  const handleRowSelection = useCallback(() => {
    if (!gridRef.current?.api) return;

    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);

    if (onRowSelect) {
      onRowSelect(selectedData);
    }

    if (onCheckItems) {
      const validatedData = isRowValid
        ? selectedData.filter((row) => isRowValid(row))
        : selectedData;

      onCheckItems(validatedData);
    }

    setSelectedRowCount(selectedData.length);
  }, [onRowSelect, onCheckItems, isRowValid]);

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    const mouseEvent = event.event as MouseEvent;
    if (mouseEvent) {
      mouseEvent.preventDefault();
      setSelectedCell(event);
      setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      setContextMenuVisible(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenuVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyCell = useCallback(() => {
    if (selectedCell) {
      copy(selectedCell.value?.toString() || '');
    }
    setContextMenuVisible(false);
  }, [selectedCell]);

  const copySelectedRows = useCallback(() => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      if (selectedNodes.length === 0) {
        console.warn('No rows selected to copy.');
        return;
      }
      const columnHeaders = visibleColumnDefs.map(
        (column) => column.headerName
      );
      const selectedRowData = selectedNodes.map((node) => node.data);
      const tableHtml = `
        <table>
          <thead>
            <tr>${columnHeaders
              .map((header) => `<th>${header}</th>`)
              .join('')}</tr>
          </thead>
          <tbody>
            ${selectedRowData
              .map(
                (rowData) =>
                  `<tr>
                    ${visibleColumnDefs
                      .map(
                        (column) =>
                          `<td>${
                            rowData[column.field] !== undefined
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
  }, [visibleColumnDefs]);

  const exportToExcel = useCallback(() => {
    if (gridRef.current) {
      const columnHeaders = visibleColumnDefs.map(
        (column) => column.headerName
      );
      const worksheetData = [
        columnHeaders,
        ...rowData.map((rowData) =>
          visibleColumnDefs.map((column) =>
            rowData[column.field] !== undefined ? rowData[column.field] : ''
          )
        ),
      ];
      const worksheet = utils.aoa_to_sheet(worksheetData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Data');
      writeFile(workbook, `${gridId}.xlsx`);
    }
  }, [gridId, visibleColumnDefs, rowData]);

  const checkboxColumn = useMemo(
    () => ({
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
    }),
    []
  );

  const updatedColumnDefs = useMemo(
    () =>
      isChekboxColumn
        ? [checkboxColumn, ...visibleColumnDefs]
        : visibleColumnDefs,
    [isChekboxColumn, checkboxColumn, visibleColumnDefs]
  );

  const handlePaginationChange = useCallback(
    (checked: boolean) => {
      setIsPaginationEnabled(checked);
      dispatch(
        setPagination({ tableId: gridId, isPaginationEnabled: checked })
      );
    },
    [dispatch, gridId]
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gridRef.current) return;
    const gridApi: GridApi = gridRef.current.api;

    // Обработка Escape
    if (event.code === 'Escape') {
      gridApi.deselectAll();
      return;
    }

    // Обработка Ctrl+A
    if (event.ctrlKey && event.code === 'KeyA') {
      event.preventDefault();
      gridApi.selectAll();
      return;
    }

    // // Обработка Ctrl+C
    // if (event.ctrlKey && event.code === 'KeyC') {
    //   event.preventDefault();
    //   const selectedNodes = gridApi.getSelectedNodes();
    //   if (selectedNodes.length > 0) {
    //     const copiedData = selectedNodes.map((node) => node.data);
    //     const jsonString = JSON.stringify(copiedData);
    //     navigator.clipboard.writeText(jsonString).then(
    //       () => console.log('Данные успешно скопированы'),
    //       (err) => console.error('Ошибка при копировании: ', err)
    //     );
    //   }
    //   return;
    // }

    // Обработка Ctrl+V
    // if (event.ctrlKey && event.code === 'KeyV') {
    //   event.preventDefault();
    //   navigator.clipboard.readText().then(
    //     (text) => {
    //       try {
    //         const pastedData = JSON.parse(text);
    //         if (Array.isArray(pastedData)) {
    //           console.log('Данные для вставки:', pastedData);
    //           // Здесь вы можете реализовать логику вставки данных в таблицу
    //           // Например:
    //           // gridApi.applyTransaction({ add: pastedData });
    //         }
    //       } catch (error) {
    //         console.error('Ошибка при разборе вставленных данных:', error);
    //       }
    //     },
    //     (err) => console.error('Ошибка при чтении из буфера обмена: ', err)
    //   );
    //   return;
    // }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent) => {
      if (onRowDoubleClicked) {
        onRowDoubleClicked(event);
      }
    },
    [onRowDoubleClicked]
  );

  const onGridReady = (params) => {
    const gridDiv = document.querySelector(`#${gridId}`);
    if (gridDiv) {
      gridDiv['api'] = params.api;
      gridDiv['columnApi'] = params.columnApi;
    }
  };

  useEffect(() => {
    if (gridApi) {
      if (isLoading) {
        gridApi.showLoadingOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  }, [isLoading, gridApi]);

  const handleCellValueChanged = useCallback(
    (params: any) => {
      if (onCellValueChanged) {
        onCellValueChanged(params);
      }

      // Перепроверяем выделенные строки после изменения значения
      if (isRowValid && gridRef.current?.api) {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);

        // Фильтруем только валидные строки
        const validatedData = selectedData.filter((row) => isRowValid(row));

        // Обновляем выделение
        gridRef.current.api.forEachNode((node) => {
          const shouldBeSelected = validatedData.some(
            (row) => (row.id || row._id) === (node.data.id || node.data._id)
          );
          node.setSelected(shouldBeSelected);
        });

        // Вызываем onCheckItems с обновленными данными
        if (onCheckItems) {
          onCheckItems(validatedData);
        }

        setSelectedRowCount(validatedData.length);
      }
    },
    [onCellValueChanged, isRowValid, onCheckItems]
  );

  return (
    <div
      className="ag-theme-alpine flex flex-col gap-2 relative"
      style={{ height, width }}
    >
      {isVisible && (
        <div className="pb-2 flex justify-between items-center bg-white shadow-md p-2 rounded-t-lg">
          <div className="mr-5 font-semibold">
            {t('Total Selected Rows')}: {selectedRowCount}
          </div>
          <div className="flex w-full items-center gap-2">
            <Input
              allowClear
              size="small"
              placeholder={t('Search')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 min-w-0"
            />
            {additionalButton && (
              <Button
                size="small"
                onClick={additionalButton.onClick}
                disabled={additionalButton.disabled}
                className="flex-shrink-0"
              >
                {additionalButton.text}
              </Button>
            )}
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() =>
                setIsColumnSettingsVisible(!isColumnSettingsVisible)
              }
              className="flex-shrink-0"
            />
          </div>
        </div>
      )}
      <div
        className="relative flex-grow"
        style={{ height: 'calc(100% - 60px)' }}
      >
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={updatedColumnDefs}
            onGridReady={handleGridReady}
            onColumnMoved={handleColumnMoved}
            onColumnResized={handleColumnResized}
            onSelectionChanged={handleRowSelection}
            onCellValueChanged={handleCellValueChanged}
            onCellContextMenu={handleCellContextMenu}
            onRowDoubleClicked={handleRowDoubleClicked}
            pagination={isPaginationEnabled}
            rowSelection={rowSelection}
            quickFilterText={searchText}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              menuTabs: ['filterMenuTab', 'generalMenuTab'],
            }}
            rowHeight={30}
            headerHeight={35}
            paginationPageSize={50}
            suppressCopyRowsToClipboard={true}
            suppressRowDeselection={true}
            getRowId={(params) => params.data.id || params.data._id}
            loadingOverlayComponentParams={{
              loadingMessage: t('Loading...'),
            }}
            overlayLoadingTemplate={`
              <span class="ag-overlay-loading-center" style="background: white; padding: 10px; border-radius: 5px;">
                ${t('Loading...')}
              </span>
            `}
          />
        </div>
        {isColumnSettingsVisible && (
          <div
            className="absolute top-0 right-0 bg-white border-l border-gray-200 p-3 h-full overflow-y-auto shadow-lg transition-all duration-300 ease-in-out"
            style={{ width: '220px', zIndex: 1000, fontSize: '12px' }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">{t('SETTINGS')}</h3>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setIsColumnSettingsVisible(false)}
                type="text"
                size="small"
              />
            </div>
            <div className="mb-3">
              <Switch
                checked={isPaginationEnabled}
                onChange={handlePaginationChange}
                size="small"
              />
              <span className="ml-2 text-xs">{t('Enable Pagination')}</span>
            </div>
            {initialColumnDefs.map((col) => (
              <div key={col.field} className="mb-1">
                <Checkbox
                  checked={
                    col.field
                      ? columnState?.visibility[col.field] !== false
                      : true
                  }
                  onChange={(e) =>
                    col.field &&
                    updateColumnVisibility(col.field, e.target.checked)
                  }
                >
                  <span className="ml-1 text-xs">
                    {col.headerName || col.field}
                  </span>
                </Checkbox>
              </div>
            ))}
          </div>
        )}
      </div>
      {onAddRow && (
        <Button type="primary" size="small" onClick={onAddRow} className="mt-2">
          {t('ADD ITEM')}
        </Button>
      )}
      {contextMenuVisible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <div
            onClick={copyCell}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {t('COPY CELL')}
          </div>
          <div
            onClick={copySelectedRows}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {t('COPY SELECTED ROWS')}
          </div>
          <div
            onClick={exportToExcel}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {t('EXPORT EXCEL')}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalAgGrid;
