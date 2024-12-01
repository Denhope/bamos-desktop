// @ts-nocheck

import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useId, useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox, Radio, DatePicker, Spin, Button } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import { useGetFilteredMaterialsReportQuery } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { RangePicker } = DatePicker;

import StockGridNew from './StockGridNew';
import StockDetailsNew from './StockDetailsNew';
import { IPartNumber } from '@/models/IUser';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { transformToIStockPartNumber } from '@/services/utilites';
export interface IGroupTaskListPrors {
  partNumber: IPartNumber;
  searchValues: {
    isAllDate?: boolean;
    isAlternates?: boolean;
    stockID?: string;
  };
}

// Добавляем типы для данных статистики
interface UsageStats {
  averageIssued: number;
  averageReceived: number;
  totalIssued: number;
  totalReceived: number;
}

interface UsageData {
  date: string;
  issued: number;
  received: number;
  weekStart?: string;
  weekEnd?: string;
}

interface GroupedData {
  date: string;
  weekStart: string;
  weekEnd: string;
  issued: number;
  received: number;
  price: number;
  transactions: Array<{
    qty: number;
    status: string;
    date: string;
  }>;
}

// Добавляем интерфейсы для типизации данных
interface StockItem {
  id: string;
  RECEIVED_DATE: string;
  LOCAL_ID: string;
  PART_NUMBER: string;
  NAME_OF_MATERIAL: string;
  GROUP: string;
  TYPE: string;
  QUANTITY: number;
  UNIT_OF_MEASURE: string;
  STOCK: string;
  LOCATION: string;
  SUPPLIER_BATCH_NUMBER: string;
  SERIAL_NUMBER: string;
  PRODUCT_EXPIRATION_DATE: string;
  PRICE?: number;
  STATUS?: string;
  isAlternative?: boolean;
  DESCRIPTION?: string;
  partID: string;
}

const StockTabNew: FC<IGroupTaskListPrors> = ({ partNumber, searchValues }) => {
  const { t } = useTranslation();

  // Создаем уникальные идентификаторы
  const componentId = useId();
  const sessionId = useMemo(() => uuidv4(), []);

  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    {
      partNumberID: partNumber?._id,
      storeID: searchValues?.stockID,
      includeAlternates: searchValues?.isAlternates,
      componentId,
      sessionId,
    },
    {
      skip: !partNumber?._id,
      refetchOnMountOrArgChange: true,
    }
  );

  // Добавляем эффект для отслеживания изменений данных
  useEffect(() => {
    console.log('StockTabNew Query:', {
      componentId,
      sessionId,
      partNumberID: partNumber?._id,
      storeID: searchValues?.stockID,
      partsCount: parts?.length,
    });
  }, [parts, partNumber, searchValues, componentId, sessionId]);

  const transformedPartNumbers = useMemo(() => {
    if (!parts) return [];
    console.log('Raw parts data:', parts);
    const transformed = transformToIStockPartNumber(parts);
    console.log('Transformed parts:', transformed);
    return transformed || [];
  }, [parts]);

  // Фильтрация данных для каждой вкладки
  const standardItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      const isStandard =
        !item.restrictionID || item.restrictionID === 'standart';
      const notReserved = !item.isReserved;
      return isStandard && notReserved;
    });
    console.log('Standard items:', items);
    return items;
  }, [transformedPartNumbers]);

  const transferItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      return item.locationType === 'transfer';
    });
    console.log('Transfer items:', items);
    return items;
  }, [transformedPartNumbers]);

  // Изменяем фильтрацию для unserviceItems
  const unserviceItems = useMemo(() => {
    const items = transformedPartNumbers.filter((item) => {
      if (!item) return false;
      return (
        item.restrictionID === 'inaccessible' ||
        item.locationType === 'unserviceable' ||
        item.LOCATION === 'SCRAP'
      );
    });
    console.log('Unservice items:', items);
    return items;
  }, [transformedPartNumbers]);

  // Для STOCK DETAIL используем все элементы, включая unserviceItems
  const allStockItems = useMemo(() => {
    return [...transformedPartNumbers];
  }, [transformedPartNumbers]);

  // Подсчет количества для каждой вкладки
  const getTotalQuantity = (items: any[]) => {
    if (!Array.isArray(items)) return 0;
    const total = items.reduce((sum, item) => {
      if (!item) return sum;
      const qty = Number(item.QUANTITY) || 0;
      console.log('Calculating quantity for item:', { item, qty });
      return sum + qty;
    }, 0);
    return total;
  };

  const stockInfoTotal = getTotalQuantity(standardItems);
  const transferTotal = getTotalQuantity(transferItems);
  const unserviceTotal = getTotalQuantity(unserviceItems);

  console.log('Totals:', {
    stockInfoTotal,
    transferTotal,
    unserviceTotal,
    standardItemsLength: standardItems.length,
    transferItemsLength: transferItems.length,
    unserviceItemsLength: unserviceItems.length,
  });
  // Добавляем новые состояния
  const [showIssued, setShowIssued] = useState(true);
  const [showReceived, setShowReceived] = useState(true);
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(1, 'year').startOf('month'),
    dayjs().endOf('month'),
  ]);

  // Добавляем запрос к API
  const { data: usageStats, isLoading: isLoadingStats } =
    useGetFilteredMaterialsReportQuery(
      {
        partNumberID: partNumber?._id || '',
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        finishDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      },
      {
        skip: !partNumber?._id || !dateRange?.[0] || !dateRange?.[1],
        refetchOnMountOrArgChange: true,
      }
    );

  // Обработка данных
  const currentData = useMemo(() => {
    if (!usageStats) return [];

    const groupData = usageStats.reduce(
      (acc: Record<string, GroupedData>, item: any) => {
        const date = dayjs(item.bookingDate || item.createDate);
        const key = (() => {
          switch (periodType) {
            case 'day':
              return date.format('YYYY-MM-DD');
            case 'week':
              return `${date.year()}-W${String(date.isoWeek()).padStart(
                2,
                '0'
              )}`;
            case 'month':
              return date.format('YYYY-MM');
            default:
              return date.format('YYYY-MM-DD');
          }
        })();

        if (!acc[key]) {
          acc[key] = {
            date: key,
            weekStart:
              periodType === 'day'
                ? date.format('YYYY-MM-DD')
                : periodType === 'week'
                ? date.startOf('isoWeek').format('YYYY-MM-DD')
                : date.startOf('month').format('YYYY-MM-DD'),
            weekEnd:
              periodType === 'day'
                ? date.format('YYYY-MM-DD')
                : periodType === 'week'
                ? date.endOf('isoWeek').format('YYYY-MM-DD')
                : date.endOf('month').format('YYYY-MM-DD'),
            issued: 0,
            received: 0,
            price: item.storeItemID?.PRICE || 0,
            transactions: [],
          };
        }

        if (
          item.bookedQty &&
          (item.status === 'closed' || item.status === 'complete')
        ) {
          acc[key].transactions.push({
            qty: Number(item.bookedQty),
            status: item.status,
            date: date.format('YYYY-MM-DD'),
          });
          acc[key].issued += Number(item.bookedQty);
        }

        return acc;
      },
      {}
    );

    return Object.values(groupData)
      .sort((a, b) => {
        const typedA = a as GroupedData;
        const typedB = b as GroupedData;
        return typedA.weekStart.localeCompare(typedB.weekStart);
      })
      .filter((item) => (item as GroupedData).issued > 0);
  }, [usageStats, periodType]);

  // Расчет статистики
  const stats = useMemo(() => {
    if (!currentData.length)
      return {
        averageIssued: 0,
        averageReceived: 0,
        totalIssued: 0,
        totalReceived: 0,
      };

    const totalIssued = currentData.reduce(
      (acc, curr: GroupedData) => acc + curr.issued,
      0
    );
    const totalReceived = currentData.reduce(
      (acc, curr: GroupedData) => acc + (curr.received || 0),
      0
    );
    const periodsWithIssues = currentData.filter(
      (item: GroupedData) => item.issued > 0
    ).length;

    return {
      averageIssued:
        periodsWithIssues > 0 ? totalIssued / periodsWithIssues : 0,
      averageReceived: 0,
      totalIssued,
      totalReceived,
    };
  }, [currentData]);

  // Функция для формирования и скачивания отчета
  const generateExcelReport = () => {
    // Определяем ширину столбцов (в символах)
    const columnWidths = {
      'Part Number': { wch: 25 },
      Description: { wch: 60 },
      'Add Description': { wch: 60 },
      Type: { wch: 15 },
      Group: { wch: 15 },
      Unit: { wch: 10 },
      Location: { wch: 25 },
      Quantity: { wch: 12 },
      'Serial Number': { wch: 25 },
      'Batch Number': { wch: 25 },
      'Expiry Date': { wch: 15 },
      Price: { wch: 15 },
      Status: { wch: 15 },
      Date: { wch: 15 },
      Issued: { wch: 12 },
      Received: { wch: 12 },
      'Total Stock': { wch: 15 },
      'Total Transfer': { wch: 15 },
      'Total Unservice': { wch: 15 },
      'Average Usage': { wch: 15 },
      'Total Usage': { wch: 15 },
      'Period Start': { wch: 15 },
      'Period End': { wch: 15 },
    };

    // Создаем массив для листов Excel
    const workSheets = [];

    // 1. Лист с общей информацией о детали
    const generalInfo = [
      {
        'Part Number': partNumber?.PART_NUMBER,
        Description: partNumber?.DESCRIPTION,
        'Add Description': partNumber?.ADD_DESCRIPTION,
        Type: partNumber?.TYPE,
        Group: partNumber?.GROUP,
        Unit: partNumber?.UNIT_OF_MEASURE,
      },
    ];
    workSheets.push({
      name: 'General Info',
      data: generalInfo,
    });

    // 2. Лист с информацией о наличии
    const stockInfo = standardItems.map((item: StockItem) => ({
      Location: item?.LOCATION || '',
      Quantity: item?.QUANTITY || 0,
      'Serial Number': item?.SERIAL_NUMBER || '',
      'Batch Number': item?.SUPPLIER_BATCH_NUMBER || '',
      'Expiry Date': item?.PRODUCT_EXPIRATION_DATE || '',
      Price: item?.PRICE || 0,
      Status: item?.STATUS || '',
    }));
    workSheets.push({
      name: 'Stock Info',
      data: stockInfo,
    });

    // 3. Лист с альтернативами
    const alternativesInfo = allStockItems
      .filter((item: StockItem) => item?.isAlternative)
      .map((item: StockItem) => ({
        'Part Number': item?.PART_NUMBER || '',
        Description: item?.DESCRIPTION || '',
        Quantity: item?.QUANTITY || 0,
        Location: item?.LOCATION || '',
      }));
    workSheets.push({
      name: 'Alternatives',
      data: alternativesInfo,
    });

    // 4. Лист со статистикой использования
    const usageInfo = currentData.map((item) => ({
      Date: item.date,
      Issued: item.issued,
      Received: item.received || 0,
    }));
    workSheets.push({
      name: 'Usage Statistics',
      data: usageInfo,
    });

    // 5. Лист с итоговой статистикой
    const summaryStats = [
      {
        'Total Stock': stockInfoTotal,
        'Total Transfer': transferTotal,
        'Total Unservice': unserviceTotal,
        'Average Usage': stats.averageIssued,
        'Total Usage': stats.totalIssued,
        'Period Start': dateRange?.[0]?.format('DD.MM.YYYY'),
        'Period End': dateRange?.[1]?.format('DD.MM.YYYY'),
      },
    ];
    workSheets.push({
      name: 'Summary',
      data: summaryStats,
    });

    // Создаем книгу Excel
    const workBook = XLSX.utils.book_new();

    // Добавляем все листы в книгу с настройкой ширины столбцов
    workSheets.forEach((sheet) => {
      const workSheet = XLSX.utils.json_to_sheet(sheet.data);

      // Устанавливаем ширину столбцов
      workSheet['!cols'] = Object.keys(sheet.data[0] || {}).map(
        (key) => columnWidths[key as keyof typeof columnWidths] || { wch: 15 }
      );

      // Добавляем стили для заголовков
      const range = XLSX.utils.decode_range(workSheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!workSheet[address]) continue;
        workSheet[address].s = {
          font: { bold: true, color: { rgb: '000000' } },
          fill: { fgColor: { rgb: 'CCCCCC' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      }

      XLSX.utils.book_append_sheet(workBook, workSheet, sheet.name);
    });

    // Сохраняем файл
    XLSX.writeFile(
      workBook,
      `${partNumber?.PART_NUMBER}_report_${dayjs().format('YYYY-MM-DD')}.xlsx`
    );
  };

  // Исправляем типизацию для RangePicker
  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2">
        <Button
          size="small"
          // type="primary"
          icon={<DownloadOutlined />}
          onClick={generateExcelReport}
        >
          {/* {t('Export to Excel') || 'Export to Excel'} */}
        </Button>
      </div>
      <TabContent
        tabs={[
          {
            content: (
              <div className="flex relative overflow-hidden">
                <StockGridNew
                  isLoading={partsQueryLoading || partsLoadingF}
                  transformedStokPartNumbers={standardItems}
                  partNumber={partNumber}
                  total={stockInfoTotal}
                />
              </div>
            ),
            title: `${t('STOCK INFO')} (${stockInfoTotal || 0})`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={allStockItems}
                isDescription={true}
                height="48vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
                total={stockInfoTotal}
              />
            ),
            title: `${t('STOCK DETAIL')} (${stockInfoTotal || 0})`,
          },
          {
            content: (
              <StockDetailsNew
                isLoading={partsQueryLoading || partsLoadingF}
                transformedStokPartNumbers={transferItems}
                isDescription={false}
                height="61vh"
                isAlternatives={searchValues.isAlternates}
                partNumberID={partNumber?._id}
                total={transferTotal}
              />
            ),
            title: `${t('TRANSFER')} (${transferTotal || 0})`,
          },
          {
            content: (
              <div className="flex flex-col w-full">
                <StockDetailsNew
                  isLoading={partsQueryLoading || partsLoadingF}
                  transformedStokPartNumbers={unserviceItems}
                  isDescription={false}
                  height="64vh"
                  total={unserviceTotal}
                  showInaccessibleOnly={true}
                  partNumberID={partNumber?._id}
                />
              </div>
            ),
            title: `${t('UNSERVICE PARTS')} (${unserviceTotal || 0})`,
          },

          {
            content: (
              <div className="flex flex-col gap-2 p-2 h-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-4">
                    <Checkbox
                      checked={showIssued}
                      onChange={(e) => setShowIssued(e.target.checked)}
                    >
                      {t('Show Booked')}
                    </Checkbox>
                    <Checkbox
                      checked={showReceived}
                      onChange={(e) => setShowReceived(e.target.checked)}
                    >
                      {t('Show Received')}
                    </Checkbox>
                  </div>
                  <div className="flex items-center gap-4">
                    <Radio.Group
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value)}
                      size="small"
                    >
                      <Radio.Button value="day">{t('Daily')}</Radio.Button>
                      <Radio.Button value="week">{t('Weekly')}</Radio.Button>
                      <Radio.Button value="month">{t('Monthly')}</Radio.Button>
                    </Radio.Group>
                    <RangePicker
                      size="small"
                      onChange={handleDateRangeChange}
                      picker={
                        periodType === 'month'
                          ? 'month'
                          : periodType === 'week'
                          ? 'week'
                          : 'date'
                      }
                      placeholder={[t('Start Date'), t('End Date')]}
                      format={
                        periodType === 'month'
                          ? 'YYYY-MM'
                          : periodType === 'week'
                          ? 'YYYY-[W]ww'
                          : 'YYYY-MM-DD'
                      }
                    />
                  </div>
                </div>

                <div style={{ height: '35vh', width: '100%' }}>
                  {isLoadingStats ? (
                    <div className="h-full flex items-center justify-center">
                      <Spin />
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <LineChart
                        data={currentData}
                        margin={{
                          top: 5,
                          right: 20,
                          left: 10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          fontSize={11}
                          tickFormatter={(value) => {
                            switch (periodType) {
                              case 'day':
                                return dayjs(value).format('DD.MM');
                              case 'week':
                                const [year, week] = value.split('-W');
                                return `${year} W${week}`;
                              case 'month':
                                return dayjs(value).format('YYYY-MM');
                              default:
                                return value;
                            }
                          }}
                        />
                        <YAxis fontSize={11} />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            value,
                            name === 'issued'
                              ? t('Booked Quantity')
                              : t('Received Quantity'),
                          ]}
                        />
                        <Legend />
                        {showIssued && (
                          <Line
                            type="monotone"
                            dataKey="issued"
                            stroke="#8884d8"
                            name={t('Booked Quantity')}
                            dot={{ r: 2 }}
                          />
                        )}
                        {showReceived && (
                          <Line
                            type="monotone"
                            dataKey="received"
                            stroke="#82ca9d"
                            name={t('Received Quantity')}
                            dot={{ r: 2 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                    <h4 className="text-xs">{t('Total Usage')}</h4>
                    <p className="text-lg font-bold text-blue-600">
                      {stats?.totalIssued || 0}
                    </p>
                  </div>
                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                    <h4 className="text-xs">{t('Average Booked')}</h4>
                    <p className="text-lg font-bold">
                      {(stats?.averageIssued || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                    <h4 className="text-xs">{t('Average Received')}</h4>
                    <p className="text-lg font-bold">
                      {(stats?.averageReceived || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                    <h4 className="text-xs">{t('Period')}</h4>
                    <p className="text-sm font-medium">
                      {dateRange?.[0]?.format('DD.MM.YY')} -{' '}
                      {dateRange?.[1]?.format('DD.MM.YY')}
                    </p>
                  </div>
                </div>
              </div>
            ),
            title: t('USAGE STATISTICS'),
          },
        ]}
      />
    </div>
  );
};

export default StockTabNew;
