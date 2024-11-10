//ts-nocheck

import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Tabs, Checkbox, Spin, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
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
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

import Alternates from './tabs/mainView/Alternates';
import { IPartNumber } from '@/models/IUser';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetFilteredMaterialsReportQuery } from '@/features/pickSlipAdministration/pickSlipItemsApi';

// Импортируем dayjs для работы с датами
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// Инициализируем плагины
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

interface UserFormProps {
  order?: IPartNumber | null;
  orderItem?: any;
  onSubmit: (company: any) => void;
  onDelete?: (orderID: string) => void;
  onOrderItemUpdate?: (orderItem: any) => void;
}

interface UsageDataPoint {
  date: string;
  issued: number;
  received: number;
  price: number;
}

const initialUsageData: UsageDataPoint[] = [
  { date: '2023-01', issued: 5, received: 3, price: 100 },
  { date: '2023-02', issued: 8, received: 6, price: 110 },
  { date: '2023-03', issued: 12, received: 10, price: 105 },
  { date: '2023-04', issued: 7, received: 8, price: 115 },
  { date: '2023-05', issued: 15, received: 12, price: 120 },
  { date: '2023-06', issued: 10, received: 9, price: 125 },
  { date: '2023-07', issued: 9, received: 11, price: 130 },
  { date: '2023-08', issued: 14, received: 13, price: 128 },
  { date: '2023-09', issued: 11, received: 10, price: 135 },
  { date: '2023-10', issued: 13, received: 15, price: 140 },
  { date: '2023-11', issued: 16, received: 14, price: 138 },
  { date: '2023-12', issued: 12, received: 11, price: 142 },
];

interface DateRange {
  startDate: string;
  endDate: string;
}

type DateRangeState = [dayjs.Dayjs, dayjs.Dayjs] | null;

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

// Add after other interfaces
interface MaterialsReportQueryParams {
  partNumberID: string;
  startDate?: string;
  endDate?: string;
}

function isGroupedData(item: unknown): item is GroupedData {
  return (
    typeof item === 'object' &&
    item !== null &&
    'date' in item &&
    'weekStart' in item &&
    'weekEnd' in item
  );
}

function isDayjsArray(value: unknown): value is [dayjs.Dayjs, dayjs.Dayjs] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    dayjs.isDayjs(value[0]) &&
    dayjs.isDayjs(value[1])
  );
}

const PartAdminForm: FC<UserFormProps> = ({ order, orderItem, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [tabTitles, setTabTitles] = useState({
    '1': t('PART'),
    '2': t('ALTERNATIVES'),
    '3': t('STATISTICS'),
  });

  const { data: acTypes } = useGetACTypesQuery({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [additionalFields, setAdditionalFields] = useState({
    isShelfLifeExpired: false,
    isRepair: false,
    isOverhaul: false,
    isBenchCheck: false,
    isCalibration: false,
  });

  const acTypeValueEnum = useMemo(
    () =>
      acTypes?.reduce((acc, acType) => {
        if (acType.id && acType.name) {
          acc[acType.id] = acType.name;
        }
        return acc;
      }, {} as Record<string, string>) || {},
    [acTypes]
  );

  const getAvailableFields = (group: string) => {
    switch (group) {
      case 'ROT':
        return {
          isRepair: true,
          isOverhaul: true,
          isBenchCheck: true,
        };
      case 'TOOL':
        return {
          isBenchCheck: true,
          isCalibration: true,
        };
      case 'GSE':
        return {
          isBenchCheck: true,
        };
      case 'CONSREP':
        return {
          isShelfLifeExpired: true,
          isRepair: true,
        };
      case 'CONS':
        return {
          isShelfLifeExpired: true,
        };
      case 'CHEM':
        return {
          isShelfLifeExpired: true,
        };
      default:
        return {};
    }
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    const resetFields = {
      isShelfLifeExpired: false,
      isRepair: false,
      isOverhaul: false,
      isBenchCheck: false,
      isCalibration: false,
    };
    setAdditionalFields(resetFields);
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setAdditionalFields((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSubmit = useCallback(
    (values: any) => {
      const submitValues = { ...values, ...additionalFields };
      if (!submitValues.acTypeID) {
        delete submitValues.acTypeID;
      }
      const newUser = order
        ? { ...order, ...submitValues }
        : {
            ...submitValues,
            companyID: localStorage.getItem('companyID') || '',
          };
      onSubmit(newUser);
    },
    [order, onSubmit, additionalFields]
  );

  useEffect(() => {
    form.resetFields();
    if (order) {
      const formValues = { ...order };
      if (!formValues.acTypeID) {
        delete formValues.acTypeID;
      }
      form.setFieldsValue(formValues);

      // Устанавливаем выбранную группу и соответствующие поля
      if (formValues.GROUP) {
        setSelectedGroup(formValues.GROUP);
        // Устанавливаем значения чекбоксов из order, если они есть
        setAdditionalFields({
          isShelfLifeExpired: order.isShelfLifeExpired || false,
          isRepair: order.isRepair || false,
          isOverhaul: order.isOverhaul || false,
          isBenchCheck: order.isBenchCheck || false,
          isCalibration: order.isCalibration || false,
        });
      }
    }
  }, [order, form]);

  // Также добавим эффект для обновления полей при изменении группы в форме
  useEffect(() => {
    const currentGroup = form.getFieldValue('GROUP');
    if (currentGroup && currentGroup !== selectedGroup) {
      setSelectedGroup(currentGroup);
    }
  }, [form.getFieldValue('GROUP')]);

  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  const [usageData] = useState<UsageDataPoint[]>(initialUsageData);
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  const [dateRange, setDateRange] = useState<DateRangeState>([
    dayjs().subtract(1, 'year').startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [showIssued, setShowIssued] = useState(true);
  const [showReceived, setShowReceived] = useState(true);

  const getFilteredData = (data: UsageDataPoint[]): UsageDataPoint[] => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return initialUsageData;
    }

    // Проверяем, что dateRange уществует и со��ржит валидные даты
    if (
      !dateRange ||
      !dateRange[0] ||
      !dateRange[1] ||
      !Array.isArray(dateRange)
    ) {
      return data;
    }

    try {
      const startDate = new Date(dateRange[0].format('YYYY-MM')).getTime();
      const endDate = new Date(dateRange[1].format('YYYY-MM')).getTime();

      return data.filter((item) => {
        const itemDate = new Date(item.date).getTime();
        return itemDate >= startDate && itemDate <= endDate;
      });
    } catch (error) {
      console.error('Error filtering data:', error);
      return data;
    }
  };

  const calculateStats = (
    data: any[]
  ): {
    averagePrice: number;
    priceChange: number;
    maxPrice: number;
    minPrice: number;
    averageIssued: number;
    averageReceived: number;
  } => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        averagePrice: 0,
        priceChange: 0,
        maxPrice: 0,
        minPrice: 0,
        averageIssued: 0,
        averageReceived: 0,
      };
    }

    try {
      // Ситаем общее количество выданных предметов
      const totalIssued = data.reduce(
        (acc, curr) => acc + (curr.issued || 0),
        0
      );

      // Считаем количество периодов с ненулевыми выдачами
      const periodsWithIssues = data.filter((item) => item.issued > 0).length;

      // Среднее количество выданных предметов за период
      const averageIssued =
        periodsWithIssues > 0 ? totalIssued / periodsWithIssues : 0;

      // Для цен
      const prices = data
        .map((item) => item.price || 0)
        .filter((price) => price > 0);

      return {
        averageIssued,
        averageReceived: 0, // Пока оставляем 0 для поступлений
        averagePrice:
          prices.length > 0
            ? prices.reduce((acc, curr) => acc + curr, 0) / prices.length
            : 0,
        priceChange:
          prices.length > 1
            ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
            : 0,
        maxPrice: Math.max(...(prices.length > 0 ? prices : [0])),
        minPrice: Math.min(...(prices.length > 0 ? prices : [0])),
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        averagePrice: 0,
        priceChange: 0,
        maxPrice: 0,
        minPrice: 0,
        averageIssued: 0,
        averageReceived: 0,
      };
    }
  };

  // Перемещаем запрос к API выше
  const { data: usageStats, isLoading: isLoadingStats } =
    useGetFilteredMaterialsReportQuery(
      {
        partNumberID: order?._id || '',
        startDate: dateRange?.[0]?.format('YYYY-MM-DD') || '',
        finishDate: dateRange?.[1]?.format('YYYY-MM-DD') || '',
      },
      {
        skip: !order?._id || !dateRange?.[0] || !dateRange?.[1],
        refetchOnMountOrArgChange: true,
      }
    );

  // Затем определяем currentData
  const currentData = useMemo(() => {
    if (!usageStats) return [];

    const groupData = usageStats.reduce(
      (acc: Record<string, GroupedData>, item: any) => {
        const date = dayjs(item.bookingDate || item.createDate);

        // Изменяем формат ключа в зависимости от типа периода
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
        if (periodType === 'day') {
          return dayjs(typedA.date).valueOf() - dayjs(typedB.date).valueOf();
        }
        return typedA.weekStart.localeCompare(typedB.weekStart);
      })
      .filter((item) => (item as GroupedData).issued > 0);
  }, [usageStats, periodType]);

  // И после этого определяем stats
  const stats = useMemo(() => calculateStats(currentData), [currentData]);

  const handleDateRangeChange = (dates: DateRangeState) => {
    if (dates && dates[0] && dates[1]) {
      const [start, end] = dates;
      setDateRange([start.startOf(periodType), end.endOf(periodType)]);
    } else {
      setDateRange([
        dayjs().subtract(30, 'days').startOf('day'),
        dayjs().endOf('day'),
      ]);
    }
  };

  // Обновляем эффект для сброса dateRange при изменении periodType
  useEffect(() => {
    const defaultRange: DateRangeState = [
      dayjs()
        .subtract(
          periodType === 'day' ? 30 : periodType === 'week' ? 12 : 6,
          periodType
        )
        .startOf(periodType),
      dayjs().endOf(periodType),
    ];
    setDateRange(defaultRange);
  }, [periodType]);

  return (
    <ProForm
      key={order ? order.PART_NUMBER : 'new'}
      layout="horizontal"
      onReset={() => form.resetFields()}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => {
          setActiveTabKey(key);
          form.setFieldsValue({ activeTabKey: key });
        }}
        defaultActiveKey="1"
        type="card"
      >
        <Tabs.TabPane tab={tabTitles['1']} key="1">
          <div className="h-[55vh] flex flex-col overflow-auto">
            <ProFormText
              rules={[{ required: true }]}
              name="PART_NUMBER"
              label={t('PART No')}
              width="lg"
              tooltip={t('PART No')}
            />
            <ProFormText
              fieldProps={{ style: { resize: 'none' } }}
              rules={[{ required: true }]}
              name="DESCRIPTION"
              label={t('DESCRIPTION')}
              width="lg"
              tooltip={t('DESCRIPTION')}
            />
            <ProFormText
              fieldProps={{ style: { resize: 'none' } }}
              name="ADD_DESCRIPTION"
              label={t('ADD DESCRIPTION')}
              width="lg"
              tooltip={t('ADD DESCRIPTION')}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="TYPE"
              label={t('PART TYPE')}
              width="lg"
              tooltip={t('SELECT PART TYPE')}
              options={[
                { value: 'ROTABLE', label: t('ROTABLE') },
                { value: 'CONSUMABLE', label: t('CONSUMABLE') },
              ]}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="GROUP"
              label={t('PART GROUP')}
              width="lg"
              tooltip={t('SELECT SPECIAL GROUP')}
              options={[
                { value: 'CONS', label: t('CONS') },
                { value: 'TOOL', label: t('TOOL') },
                { value: 'CHEM', label: t('CHEM') },
                { value: 'ROT', label: t('ROT') },
                { value: 'GSE', label: t('GSE') },
                { value: 'CONSREP', label: t('CONSREP') },
              ]}
              onChange={handleGroupChange}
            />
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('UNIT')}
              name="UNIT_OF_MEASURE"
              width="lg"
              valueEnum={{
                EA: `EA/${t('EACH').toUpperCase()}`,
                M: `M/${t('Meters').toUpperCase()}`,
                ML: `ML/${t('Milliliters').toUpperCase()}`,
                SI: `SI/${t('Sq Inch').toUpperCase()}`,
                CM: `CM/${t('Centimeters').toUpperCase()}`,
                GM: `GM/${t('Grams').toUpperCase()}`,
                YD: `YD/${t('Yards').toUpperCase()}`,
                FT: `FT/${t('Feet').toUpperCase()}`,
                SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                IN: `IN/${t('Inch').toUpperCase()}`,
                SH: `SH/${t('Sheet').toUpperCase()}`,
                SM: `SM/${t('Sq Meters').toUpperCase()}`,
                RL: `RL/${t('Roll').toUpperCase()}`,
                KT: `KT/${t('Kit').toUpperCase()}`,
                LI: `LI/${t('Liters').toUpperCase()}`,
                KG: `KG/${t('Kilograms').toUpperCase()}`,
                JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
              }}
            />
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('ADD UNIT')}
              name="ADD_UNIT_OF_MEASURE"
              width="xl"
              valueEnum={{
                шт: t('шт').toUpperCase(),
                м: t('м').toUpperCase(),
                мл: t('мл').toUpperCase(),
                дюйм2: t('дюйм2').toUpperCase(),
                см: t('см').toUpperCase(),
                г: t('г').toUpperCase(),
                ярд: t('ярд').toUpperCase(),
                фут: t('фут').toUpperCase(),
                см2: t('см2').toUpperCase(),
                дюйм: t('дюйм').toUpperCase(),
                м2: t('м2').toUpperCase(),
                рул: t('рул').toUpperCase(),
                л: t('л').toUpperCase(),
                кг: t('кг').toUpperCase(),
              }}
            />
            <ProFormSelect
              showSearch
              name="acTypeID"
              label={t('AC TYPE')}
              width="lg"
              valueEnum={acTypeValueEnum}
            />

            {/* Чекбоксы в конце формы */}
            {selectedGroup && (
              <div className="mt-4 border-t pt-4">
                <div className="flex flex-wrap gap-4">
                  {getAvailableFields(selectedGroup).isShelfLifeExpired && (
                    <Checkbox
                      checked={additionalFields.isShelfLifeExpired}
                      onChange={(e) =>
                        handleCheckboxChange(
                          'isShelfLifeExpired',
                          e.target.checked
                        )
                      }
                    >
                      {t('Shelf Life Expired')}
                    </Checkbox>
                  )}
                  {getAvailableFields(selectedGroup).isRepair && (
                    <Checkbox
                      checked={additionalFields.isRepair}
                      onChange={(e) =>
                        handleCheckboxChange('isRepair', e.target.checked)
                      }
                    >
                      {t('Repair')}
                    </Checkbox>
                  )}
                  {getAvailableFields(selectedGroup).isOverhaul && (
                    <Checkbox
                      checked={additionalFields.isOverhaul}
                      onChange={(e) =>
                        handleCheckboxChange('isOverhaul', e.target.checked)
                      }
                    >
                      {t('Overhaul')}
                    </Checkbox>
                  )}
                  {getAvailableFields(selectedGroup).isBenchCheck && (
                    <Checkbox
                      checked={additionalFields.isBenchCheck}
                      onChange={(e) =>
                        handleCheckboxChange('isBenchCheck', e.target.checked)
                      }
                    >
                      {t('Bench Check')}
                    </Checkbox>
                  )}
                  {getAvailableFields(selectedGroup).isCalibration && (
                    <Checkbox
                      checked={additionalFields.isCalibration}
                      onChange={(e) =>
                        handleCheckboxChange('isCalibration', e.target.checked)
                      }
                    >
                      {t('Calibration')}
                    </Checkbox>
                  )}
                </div>
              </div>
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          <Alternates currentPart={order} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['3']} key="3">
          <Tabs defaultActiveKey="usage" className="h-[55vh]">
            <Tabs.TabPane tab={t('Usage')} key="usage">
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
                      onChange={(dates) => {
                        setDateRange(dates as DateRangeState);
                      }}
                      picker={
                        periodType === 'month'
                          ? 'month'
                          : periodType === 'week'
                          ? 'week'
                          : 'date'
                      }
                      placeholder={[t('Start Date'), t('End Date')]}
                      value={dateRange}
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
                                return dayjs(value).format('DD.MM'); // Показываем только день и месяц
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
                            name === 'received'
                              ? t('Received Quantity')
                              : t('Booked Quantity'),
                          ]}
                          labelFormatter={(label: string) => {
                            const item = currentData.find(
                              (d) => isGroupedData(d) && d.date === label
                            ) as GroupedData | undefined;

                            if (item && isGroupedData(item)) {
                              if (periodType === 'day') {
                                return dayjs(item.date).format('YYYY-MM-DD');
                              }
                              return `${item.weekStart} - ${item.weekEnd}`;
                            }
                            return label;
                          }}
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
                    <h4 className="text-xs">{t('Average Issued')}</h4>
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
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={t('Price')} key="price">
              <div className="flex flex-col gap-2 p-2 h-full">
                <div className="flex justify-end mb-2">
                  <RangePicker
                    size="small"
                    onChange={(dates: any) => setDateRange(dates)}
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

                <div style={{ height: '45vh', width: '100%' }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={getFilteredData(usageData)}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#ff7300"
                        name={t('Price')}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-4 gap-1 mt-1">
                  <div className="p-1 bg-gray-50 rounded text-sm">
                    <div className="text-[10px] text-gray-500">
                      {t('Average Price')}
                    </div>
                    <div className="text-sm font-semibold">
                      ${(stats?.averagePrice || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-1 bg-gray-50 rounded text-sm">
                    <div className="text-[10px] text-gray-500">
                      {t('Price Change')}
                    </div>
                    <div className="text-sm font-semibold">
                      {(stats?.priceChange || 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="p-1 bg-gray-50 rounded text-sm">
                    <div className="text-[10px] text-gray-500">
                      {t('Max Price')}
                    </div>
                    <div className="text-sm font-semibold text-red-500">
                      ${(stats?.maxPrice || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-1 bg-gray-50 rounded text-sm">
                    <div className="text-[10px] text-gray-500">
                      {t('Min Price')}
                    </div>
                    <div className="text-sm font-semibold text-green-500">
                      ${(stats?.minPrice || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default PartAdminForm;
