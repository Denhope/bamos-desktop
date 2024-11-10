//@ts-nocheck

import React, { useMemo, useEffect, useState } from 'react';
import { Button, Space } from 'antd';
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

    // Приведем ID к строкам и создадим Set для быстрого поиска
    const projectIdsSet = new Set(filterParams?.projectID?.map(String) || []);

    console.log('Debug projectIdsSet:', projectIdsSet);

    // Фильтруем проекты
    const selectedProjects =
      projects?.filter((project: any) => {
        const projectId = String(project.id || project._id);
        const isSelected = projectIdsSet.has(projectId);
        console.log('Checking project:', { projectId, isSelected });
        return isSelected;
      }) || [];

    console.log('Selected projects:', selectedProjects);

    // Создаем строки WP с дополнительной проверкой
    const wpRows =
      selectedProjects.length > 0
        ? selectedProjects.map((project: any) => {
            console.log('Creating WP row for project:', project);
            return [
              'WP:',
              `№:${project.projectWO || ''} / ${project.projectName || ''}`,
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ];
          })
        : [
            [
              'WP:',
              'No projects selected',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ],
          ];

    console.log('Generated wpRows:', wpRows);

    // Функция преобразования taskType
    const getTaskTypeLabel = (type: string) => {
      const valueEnumTask = {
        RC: 'TC',
        CR_TASK: 'CR TASK (CRITICAL TASK/DI)',
        NRC: 'NRC (DEFECT)',
        NRC_ADD: 'ADHOC (ADHOC TASK)',
        MJC: 'MJC',
        CMJC: 'CMJC',
        FC: 'FC',
        HARD_ACCESS: 'HARD_ACCESS',
      };

      return valueEnumTask[type as keyof typeof valueEnumTask] || type;
    };

    // Обновленная структура заголовка с новыми колонкми
    const headerData = [
      [
        'Maintenance event:',
        results.workOrder?.WOName || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        'Station:',
        results.workOrder?.station || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      ['', '', '', '', '', '', '', '', '', '', '', ''], // Добавлены два дополнительных пустых места
      [
        'A/C type:',
        results.workOrder?.planeId?.acTypeId?.[0]?.code || '',
        'A/C Reg.:',
        results.workOrder?.planeId?.regNbr || '',
        'MSN:',
        results.workOrder?.planeId?.serialNbr || '',
        '',
        '',
        '',
        '',
      ],
      ['', '', '', '', '', '', '', '', '', ''],
      [
        'MJSS/WO:',
        results.workOrder?.WONumber || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      // Добавляем строки WP
      ...wpRows,
      [
        'Schedule start:',
        new Date(results.workOrder?.startDate).toLocaleDateString(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        'Completion date:',
        new Date(results.workOrder?.endDate).toLocaleDateString(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      ['', '', '', '', '', '', '', '', '', ''],
      // Обновленные заголовки колонок
      [
        '№',
        'Label',
        'Pick Slip',
        'Part Description',
        'PN Used',
        'Batch (CofC) №',
        'Store', // Добавлена колонка
        'Trace No', // Добавлена колонка
        'QTY',
        'Cancelled QTY',
        'Unit Of Issue',
        'POBEDA QTY',
        'POBEDA Unit',
        'Maintenance records',
        'Task Type',
        'Reference',
        'Customer WO',
        'Stamp',
      ],
    ];

    // Обновленные данные материалов с форматированием
    const materialsData = tableData.map((item: any, index: number) => [
      { v: index + 1, t: 'n' },
      { v: item.label || '', t: 's' },
      { v: item.pickSlipNumber || '', t: 's' },
      { v: item.description || '', t: 's' },
      { v: item.partNumber || '', t: 's' },
      { v: item.batchNumber || '', t: 's' },
      { v: item.store || '', t: 's' }, // Добавлено поле store
      { v: item.projectTaskWO || '', t: 's' }, // Добавлено поле serialNumber как TRACE No
      { v: item.quantity || 0, t: 'n' },
      { v: item.cancelledQty || 0, t: 'n' },
      { v: item.unitOfMeasure || '', t: 's' },
      { v: '' || '', t: 'n' },
      { v: '' || '', t: 's' },
      { v: item.taskNumber || '', t: 's' },
      { v: getTaskTypeLabel(item.taskType || ''), t: 's' },
      { v: item.refTask || '', t: 's' },
      { v: item.projectName || '', t: 's' },
      // Добавлен преобразованный тип задачи
      { v: '' || '', t: 's' },
    ]);

    const ws = utils.aoa_to_sheet([...headerData, ...materialsData]);

    // Обновленные стили
    const headerStyle = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
      fill: { fgColor: { rgb: 'F2F2F2' } },
    };

    const dataStyle = {
      font: { size: 10 },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Применяем стили и форматирование
    const range = utils.decode_range(ws['!ref'] || 'A1');
    for (let R = 0; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellRef = utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        ws[cellRef].s = R < headerData.length ? headerStyle : dataStyle;
      }
    }

    // Обновленные размеры колонок
    ws['!cols'] = [
      { wch: 4 }, // №
      { wch: 15 }, // Label
      { wch: 15 }, // Pick Slip
      { wch: 35 }, // Description
      { wch: 15 }, // PN Used
      { wch: 15 }, // Batch
      { wch: 12 }, // STORE
      { wch: 15 }, // TRACE No
      { wch: 8 }, // QTY
      { wch: 8 }, // Cancelled QTY
      { wch: 12 }, // Unit Of Issue
      { wch: 12 }, // POBEDA QTY
      { wch: 12 }, // POBEDA Unit
      { wch: 35 }, // Maintenance records
      { wch: 20 }, // Task Type
      { wch: 20 }, // Stamp
    ];

    // Обновленные объединения ячеек
    const baseHeaderMerges = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 11 } },
      { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },
      { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } },
      { s: { r: 3, c: 5 }, e: { r: 3, c: 11 } },
      { s: { r: 5, c: 1 }, e: { r: 5, c: 11 } },
    ];

    // Добавляем объединения для каждой строки WP
    const wpMerges = wpRows.map((_, index) => ({
      s: { r: 6 + index, c: 1 },
      e: { r: 6 + index, c: 11 },
    }));

    // Добавляем оставшиеся объединения с учетом смещения
    const offset = wpRows.length;
    const remainingMerges = [
      { s: { r: 6 + offset, c: 1 }, e: { r: 6 + offset, c: 11 } },
      { s: { r: 7 + offset, c: 1 }, e: { r: 7 + offset, c: 11 } },
    ];

    ws['!merges'] = [...baseHeaderMerges, ...wpMerges, ...remainingMerges];

    // Добавляем лист в книгу
    utils.book_append_sheet(wb, ws, 'Materials Report');

    // Сохраняем файл
    writeFile(
      wb,
      `materials_report_${results.workOrder?.WOName || 'report'}_${
        new Date().toISOString().split('T')[0]
      }.xlsx`
    );
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

  return (
    <div
      style={{
        height: 'calc(100vh - 210px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="ag-theme-alpine"
        style={{
          flex: 1,
          width: '100%',
          height: '100%', // Используем всю доступную высоту
        }}
      >
        <UniversalAgGrid
          height={'73vh'}
          pagination
          columnDefs={columnDefs(t)}
          rowData={tableData}
          getRowId={(params) => params.data.id} // Указываем уникальный идентификатор строки
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1, // Добавляем flex для автоматического распределения ширины
            minWidth: 100, // Минимальная ширина колонки
          }}
          domLayout="normal" // Используем нормальный layout для лучшего распределения пространства
          animateRows={true}
          rowSelection="multiple"
          enableRangeSelection
          enableCellTextSelection
          copyHeadersToClipboard
          suppressScrollOnNewData
          suppressPropertyNamesCheck
          suppressDragLeaveHidesColumns
          // Добавляем настройки для автоматического размера
          onGridReady={(params) => {
            params.api.sizeColumnsToFit();
            // Устанавливаем высоту строк
            params.api.resetRowHeights();
          }}
          onFirstDataRendered={(params) => {
            params.api.sizeColumnsToFit();
          }}
          // Добавляем обработчик изменения размера окна
          onGridSizeChanged={(params) => {
            params.api.sizeColumnsToFit();
          }}
        />
      </div>
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '8px',
          background: '#fff',
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
        >
          {t('EXPORT TO EXCEL')}
        </Button>
        <Button size="small" icon={<DownloadOutlined />} onClick={exportToPdf}>
          {t('EXPORT TO PDF')}
        </Button>
      </div>
    </div>
  );
};

export default MaterialsReport;
