//@ts-nocheck

import React, { useMemo, useEffect, useState } from 'react';
import { Button, Space, Card, Tabs } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { utils, writeFile } from 'xlsx';
import { useTranslation } from 'react-i18next';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { columnDefs } from './columns';
import { IMaterialsReportProps } from './types';
import { useGetFilteredMaterialsReportQuery } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const MaterialsReport: React.FC<IMaterialsReportProps> = ({
  results,
  filterParams,
}) => {
  const { t } = useTranslation();
  const queryParams = useMemo(
    () => ({
      projectID: Array.isArray(filterParams?.projectID)
        ? filterParams.projectID
        : filterParams?.projectID
        ? [filterParams.projectID]
        : undefined,
      pickSlipNumberNew: filterParams?.pickSlipNumberNew,
      partNumberID: filterParams?.partNumber,
      projectTaskID: filterParams?.projectTaskID,
      neededOnID: filterParams?.neededOnID
        ? [filterParams.neededOnID]
        : undefined,
      WOReferenceID: filterParams?.WOReferenceID,
      state: ['ACTIVE', 'COMPLETED'],
      forceRefresh: Date.now(),
    }),
    [filterParams]
  );

  // Добавляем логирование
  useEffect(() => {
    console.log('Query Params:', queryParams);
  }, [queryParams]);

  const {
    data: materialsData,
    isLoading,
    error,
  } = useGetFilteredMaterialsReportQuery(queryParams, {
    skip: !filterParams?.WOReferenceID,
    refetchOnMountOrArgChange: true,
  });

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('Materials Data:', {
      isLoading,
      error,
      dataLength: materialsData?.length,
      filterParams,
    });
  }, [materialsData, isLoading, error, filterParams]);

  // Добавляем состояние для хранения данных
  const [tableData, setTableData] = useState<any[]>([]);

  // Обновляем эффект для обработки данных
  useEffect(() => {
    if (materialsData) {
      // Создаем уникальный ключ для каждой записи
      const processedData = materialsData.map((item: any) => ({
        id: `${item.pickSlipItemID?._id || ''}_${
          item.storeItemID?._id || ''
        }_${Date.now()}`, // Уникальный ключ
        createDate: item.createDate,
        label: item.storeItemID?.LOCAL_ID,
        pickSlipNumber: item.pickSlipItemID?.pickSlipID?.pickSlipNumberNew,
        partNumber: item.requestedPartNumberID?.PART_NUMBER,
        description: item.requestedPartNumberID?.DESCRIPTION,
        batchNumber:
          item.storeItemID?.SERIAL_NUMBER ||
          item.storeItemID?.SUPPLIER_BATCH_NUMBER,
        serialNumber: item.storeItemID?.SERIAL_NUMBER,
        store: item.storeItemID?.STOCK,
        location: item.storeItemID?.SHELF_NUMBER,
        condition: item.storeItemID?.CONDITION,
        orderNumber: item.storeItemID?.ORDER_NUMBER,
        projectWO: item.projectWO,
        projectTaskWO: item.projectTaskWO,
        taskNumber: item.projectTaskID?.taskNumber,
        externalNumber: item?.projectTaskID.externalNumber,
        taskDescription: item.projectTaskID?.taskDescription,
        taskType: item.projectTaskID?.projectItemType,
        refTask: item.projectTaskID?.refTask,
        projectName: item.projectID?.customerWO,
        quantity: item.bookedQty,
        cancelledQty: item.canceledQty,
        unitOfMeasure: item.requestedPartNumberID?.UNIT_OF_MEASURE,
        createdBy: item.createUserID?.name,
      }));

      // Фильтруем дубликаты по id
      const uniqueData = Array.from(
        new Map(processedData.map((item) => [item.id, item])).values()
      );
      setTableData(uniqueData);
    } else {
      setTableData([]);
    }
  }, [materialsData]);

  // Добавляем запрос проектов
  const { data: projects } = useGetProjectsQuery(
    { WOReferenceID: filterParams?.WOReferenceID },
    { skip: !filterParams?.WOReferenceID }
  );

  const exportToExcel = () => {
    if (!tableData.length) return;

    const wb = utils.book_new();

    // Первый лист - информация о самолете и WO
    const workOrderInfo = [
      [t('Aircraft Information')],
      [t('AC Reg'), results.workOrder?.planeId?.regNbr || ''],
      [t('AC Type'), results.workOrder?.planeId?.acTypeId?.[0]?.code || ''],
      [t('MSN'), results.workOrder?.planeId?.serialNbr || ''],
      [t('Effectivity'), results.workOrder?.planeId?.efectivityNumber || ''],
      [
        t('Manufactory date'),
        results.workOrder?.planeId?.manafacturesDate || '',
      ],
      [t('Engine Type'), results.workOrder?.planeId?.engineType || ''],
      [t('APU Type'), results.workOrder?.planeId?.apuType || ''],
      [t('Total Frame Hours'), results.workOrder?.planeId?.airFrameHours || ''],
      [
        t('Total Frame Cycles'),
        results.workOrder?.planeId?.airFrameLandings || '',
      ],
      [],
      [t('Work Order Information')],
      [t('WO Number'), results.workOrder?.WONumber],
      [t('WO Name'), results.workOrder?.WOName],
      [t('Status'), results.workOrder?.status],
      [t('WO Type'), results.workOrder?.WOType],
      [
        t('Creation Date'),
        results.workOrder?.createDate
          ? new Date(results.workOrder.createDate).toLocaleString()
          : '',
      ],
      [
        t('Start Date'),
        results.workOrder?.startDate
          ? new Date(results.workOrder.startDate).toLocaleString()
          : '',
      ],
      [
        t('Planned Finish Date'),
        results.workOrder?.planedFinishDate
          ? new Date(results.workOrder.planedFinishDate).toLocaleString()
          : '',
      ],
      [],
      [t('Work Packages')],
    ];

    // Добавляем информацию о WP
    const projectIdsSet = new Set(filterParams?.projectID?.map(String) || []);
    const selectedProjects =
      projects?.filter((project: any) => {
        const projectId = String(project.id || project._id);
        return projectIdsSet.has(projectId);
      }) || [];

    selectedProjects.forEach((project: any) => {
      workOrderInfo.push([
        t('WP Number'),
        project.projectWO || '',
        t('WP Name'),
        project.projectName || '',
      ]);
    });

    const infoSheet = utils.aoa_to_sheet(workOrderInfo);

    // Применяем стили к первому листу
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: { fgColor: { rgb: 'E0E0E0' } },
      alignment: { horizontal: 'left' },
    };

    const dataStyle = {
      font: { size: 11 },
      alignment: { horizontal: 'left' },
    };

    // Применяем стили к заголовкам секций
    [0, 11, 20].forEach((row) => {
      const cell = utils.encode_cell({ r: row, c: 0 });
      if (infoSheet[cell]) {
        infoSheet[cell].s = headerStyle;
      }
    });

    // Устанавливаем ширину колонок для первого листа
    infoSheet['!cols'] = [
      { wch: 20 }, // Первая колонка
      { wch: 30 }, // Вторая колонка
      { wch: 20 }, // Третья колонка
      { wch: 30 }, // Четвертая колонка
    ];

    // Добавляем первый лист
    utils.book_append_sheet(wb, infoSheet, t('Aircraft Info'));

    // Второй лист - детальный отчет материалов
    const detailedData = tableData.map((item) => ({
      [t('Label')]: item.label || '',
      [t('Pick Slip')]: item.pickSlipNumber || '',
      [t('Description')]: item.description || '',
      [t('Part Number')]: item.partNumber || '',
      [t('Batch Number')]: item.batchNumber || '',
      [t('Store')]: item.store || '',
      [t('Trace No')]: item.projectTaskWO || '',
      [t('Quantity')]: item.quantity || 0,
      [t('Cancelled Qty')]: item.cancelledQty || 0,
      [t('Unit')]: item.unitOfMeasure || '',
      [t('Task Type')]: getTaskTypeLabel(item.taskType || ''),
      [t('Task Number')]: item.taskNumber || '',
      [t('Reference')]: item.refTask || '',
      [t('EXTERNAL No')]: item.externalNumber || '',
      [t('Customer WO')]: item.projectName || '',
    }));

    const detailedSheet = utils.json_to_sheet(detailedData);
    utils.book_append_sheet(wb, detailedSheet, t('Materials by Tasks'));

    // Третий лист - сводный отчет
    const summaryData = getSummaryData().map((item) => ({
      [t('Part Number')]: item.partNumber,
      [t('Description')]: item.description,
      [t('Total Quantity')]: item.totalQuantity,
      [t('Total Cancelled')]: item.totalCancelled,
      [t('Unit')]: item.unitOfMeasure,
      [t('Used in Tasks')]: item.usedInTasks,
    }));

    const summarySheet = utils.json_to_sheet(summaryData);
    utils.book_append_sheet(wb, summarySheet, t('Materials Summary'));

    // Применяем стили для листов с материалами
    [detailedSheet, summarySheet].forEach((sheet) => {
      const cols = [];
      for (let i = 0; i < Object.keys(sheet).length; i++) {
        cols.push({ wch: 15 });
      }
      sheet['!cols'] = cols;

      const range = utils.decode_range(sheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; C++) {
        const address = utils.encode_cell({ r: 0, c: C });
        if (!sheet[address]) continue;
        sheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'CCCCCC' } },
          alignment: { horizontal: 'center' },
        };
      }
    });

    // Сохраняем файл
    writeFile(
      wb,
      `materials_report_${results.workOrder?.WOName || 'report'}_${
        new Date().toISOString().split('T')[0]
      }.xlsx`
    );
  };

  // Вспомогательная функция для преобразования типа задачи
  const getTaskTypeLabel = (type: string) => {
    const valueEnumTask = {
      RC: t('TC'),
      CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
      NRC: t('NRC (DEFECT)'),
      NRC_ADD: t('ADHOC (ADHOC TASK)'),
      MJC: t('MJC'),
      CMJC: t('CMJC'),
      FC: t('FC'),
      HARD_ACCESS: t('HARD_ACCESS'),
    };
    return valueEnumTask[type as keyof typeof valueEnumTask] || type;
  };

  // Добавляем функцию экспорта в PDF
  const exportToPdf = () => {
    if (!tableData.length) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Функция преобразования taskType
    const getTaskTypeLabel = (type: string) => {
      const valueEnumTask = {
        RC: t('TC'),
        CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
        NRC: t('NRC (DEFECT)'),
        NRC_ADD: t('ADHOC (ADHOC TASK)'),
        MJC: t('MJC'),
        CMJC: t('CMJC'),
        FC: t('FC'),
        HARD_ACCESS: t('HARD_ACCESS'),
      };
      return valueEnumTask[type as keyof typeof valueEnumTask] || type;
    };

    // Заголовок отчета
    doc.setFontSize(16);
    doc.text('Materials Report', 14, 15);

    let yPosition = 25;

    // Добавляем информацию из заголовка Excel
    doc.setFontSize(11);

    // Maintenance event
    doc.text(
      `Maintenance event: ${results.workOrder?.WOName || ''}`,
      14,
      yPosition
    );
    yPosition += 7;

    // Station
    doc.text(`Station: ${results.workOrder?.station || ''}`, 14, yPosition);
    yPosition += 7;

    // Aircraft info
    doc.text(
      `A/C type: ${results.workOrder?.planeId?.acTypeId?.[0]?.code || ''}`,
      14,
      yPosition
    );
    doc.text(
      `A/C Reg.: ${results.workOrder?.planeId?.regNbr || ''}`,
      90,
      yPosition
    );
    doc.text(
      `MSN: ${results.workOrder?.planeId?.serialNbr || ''}`,
      160,
      yPosition
    );
    yPosition += 7;

    // MJSS/WO
    doc.text(`MJSS/WO: ${results.workOrder?.WONumber || ''}`, 14, yPosition);
    yPosition += 7;

    // WP info
    const projectIdsSet = new Set(filterParams?.projectID?.map(String) || []);
    const selectedProjects =
      projects?.filter((project: any) => {
        const projectId = String(project.id || project._id);
        return projectIdsSet.has(projectId);
      }) || [];

    selectedProjects.forEach((project: any) => {
      doc.text(
        `WP: №:${project.projectWO || ''} / ${project.projectName || ''}`,
        14,
        yPosition
      );
      yPosition += 7;
    });

    // Dates
    doc.text(
      `Schedule start: ${new Date(
        results.workOrder?.startDate
      ).toLocaleDateString()}`,
      14,
      yPosition
    );
    yPosition += 7;
    doc.text(
      `Completion date: ${new Date(
        results.workOrder?.endDate
      ).toLocaleDateString()}`,
      14,
      yPosition
    );
    yPosition += 10;

    // Переименовываем переменную tableData в pdfTableData
    const pdfTableData = tableData.map((item) => [
      item.label || '',
      item.pickSlipNumber || '',
      item.description || '',
      item.partNumber || '',
      item.batchNumber || '',
      item.store || '',
      item.projectTaskWO || '',
      item.quantity?.toString() || '0',
      item.cancelledQty?.toString() || '0',
      item.unitOfMeasure || '',
      getTaskTypeLabel(item.taskType || ''),
      '', // Пустое поле для Stamp
    ]);

    // Используем переименованную переменную pdfTableData
    (doc as any).autoTable({
      startY: yPosition,
      head: [
        [
          'Label',
          'Pick Slip',
          'Description',
          'PN Used',
          'Batch №',
          'Store',
          'Trace No',
          'QTY',
          'Cancelled QTY',
          'Unit',
          'Task Type',
          'Stamp',
        ],
      ],
      body: pdfTableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        2: { cellWidth: 40 },
        10: { cellWidth: 25 },
        11: { cellWidth: 20 },
      },
    });

    // Сохранение файла
    doc.save(
      `materials_report_${results.workOrder?.WOName || 'report'}_${
        new Date().toISOString().split('T')[0]
      }.pdf`
    );
  };

  // Добавляем функцию для получения сводных данных
  const getSummaryData = () => {
    const summary = tableData.reduce((acc, item) => {
      const key = item.partNumber;
      if (!key) return acc; // Пропускаем записи без партномера

      if (!acc[key]) {
        acc[key] = {
          partNumber: item.partNumber,
          description: item.description,
          totalQuantity: 0,
          totalCancelled: 0,
          unitOfMeasure: item.unitOfMeasure,
          usedInTasks: new Set(),
        };
      }
      acc[key].totalQuantity += Number(item.quantity) || 0;
      acc[key].totalCancelled += Number(item.cancelledQty) || 0;
      if (item.taskNumber) {
        acc[key].usedInTasks.add(item.taskNumber);
      }
      return acc;
    }, {});

    return Object.values(summary)
      .filter((item) => item.partNumber) // Фильтруем пустые записи
      .map((item) => ({
        ...item,
        usedInTasks: Array.from(item.usedInTasks).join(', '),
        id: item.partNumber, // Добавляем id для уникальной идентификации
      }));
  };

  // Добавляем определение колонок для сводной таблицы
  const summaryColumnDefs = [
    {
      field: 'partNumber',
      headerName: t('Part Number'),
      // flex: 1,
    },
    {
      field: 'description',
      headerName: t('Description'),
      // flex: 2,
    },
    {
      field: 'totalQuantity',
      headerName: t('Total Quantity'),
      // type: 'numericColumn',
    },
    {
      field: 'totalCancelled',
      headerName: t('Total Cancelled'),
      // type: 'numericColumn',
    },
    {
      field: 'unitOfMeasure',
      // headerName: t('Unit'),
    },
    {
      field: 'usedInTasks',
      headerName: t('Used in Tasks'),
      // flex: 2,
    },
  ];

  // Добавляем ключ для Tabs и обработчик изменения вкладки
  const [activeTab, setActiveTab] = useState('1');

  // Общие пропсы для таблиц
  const gridProps = {
    pagination: true,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    },
    domLayout: 'normal',
    animateRows: true,
    enableRangeSelection: true,
    enableCellTextSelection: true,
    copyHeadersToClipboard: true,
    suppressScrollOnNewData: true,
    suppressPropertyNamesCheck: true,
    suppressDragLeaveHidesColumns: true,
    onGridReady: (params) => {
      params.api.sizeColumnsToFit();
      params.api.resetRowHeights();
    },
    onFirstDataRendered: (params) => {
      params.api.sizeColumnsToFit();
    },
    onGridSizeChanged: (params) => {
      params.api.sizeColumnsToFit();
    },
    // Добавляем обработчик клика по строке
    onRowClicked: (params) => {
      const isSelected = params.node.isSelected();
      if (isSelected) {
        params.node.setSelected(false);
      } else {
        params.node.setSelected(true);
      }
    },
  };

  return (
    <div>
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{t('Materials Report')}</span>
            <Space>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                className="bg-green-600"
              >
                {t('Export to Excel')}
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={exportToPdf}
              >
                {t('Export to PDF')}
              </Button>
            </Space>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane // Добавляем это свойство для предотвращения дублирования
          items={[
            {
              key: '1',
              label: t('Materials by Tasks'),
              children: (
                <div
                  className="ag-theme-alpine"
                  // style={{ height: 'calc(100vh - 280px)' }}
                >
                  <UniversalAgGrid
                    key="materials-grid" // Добавляем уникальный ключ
                    columnDefs={columnDefs(t)}
                    rowData={tableData}
                    getRowId={(params) => params.data.id} // Убеждаемся, что у каждой строки есть уникальный id
                    {...gridProps}
                    height="62vh"
                    rowSelection="multiple"
                    suppressRowClickSelection={false} // Разрешаем выделение по клику
                    rowMultiSelectWithClick={true} // Разрешаем множественное выделение с Ctrl/Cmd
                  />
                </div>
              ),
            },
            {
              key: '2',
              label: t('Materials Summary'),
              children: (
                <div
                  className="ag-theme-alpine"
                  // style={{ height: 'calc(100vh - 80px)' }}
                >
                  <UniversalAgGrid
                    key="summary-grid" // Добавляем уникальный ключ
                    columnDefs={summaryColumnDefs}
                    rowData={getSummaryData()}
                    getRowId={(params) => params.data.partNumber} // Используем partNumber как уникальный идентификатор
                    {...gridProps}
                    height="62vh"
                    rowSelection="multiple"
                    suppressRowClickSelection={false}
                    rowMultiSelectWithClick={true}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MaterialsReport;
