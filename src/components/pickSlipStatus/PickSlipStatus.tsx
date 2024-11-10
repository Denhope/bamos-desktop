//@ts-nocheck

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Row, Switch, Typography, message } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { ColDef, ColGroupDef, RowClassParams } from 'ag-grid-community';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
import { differenceInSeconds, format } from 'date-fns';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { addTab } from '@/store/reducers/TabsSlice';
import { RouteNames } from '@/router';

const { Title, Text } = Typography;

// Обновленная схема валидации PickSlip с использованием Zod

// Типы данных
type PickSlip = z.infer<typeof PickSlipSchema> & {
  pickSlipNumber: number;
  project: {
    name: string;
    acRegistrationNumber: string;
    acType: string;
  };
  projectTask: {
    taskNumber: string;
    description: string;
  };
  createdBy: string;
  getFrom: {
    longName: string;
    shortName: string;
  };
  completedDate?: Date;
};

// Обновленная функция для преобразования данных PickSlip
// Обновленная схема валидации PickSlip с использованием Zod
const PickSlipSchema = z
  .object({
    id: z.string().optional(),
    pickSlipsItems: z.array(z.unknown()).optional(),
    plannedDate: z.string().datetime().optional(),
    state: z.string().optional(),
    companyID: z.string().optional(),
    createDate: z.string().datetime().optional(),
    createUserID: z
      .object({
        _id: z.string(),
        singNumber: z.string(),
        name: z.string(),
        organizationAuthorization: z.string().optional(),
        firstNameEnglish: z.string().optional(),
        lastNameEnglish: z.string().optional(),
      })
      .optional(),
    files: z.array(z.unknown()).optional(),
    projectID: z
      .object({
        _id: z.string(),
        projectName: z.string(),
        acRegistrationNumber: z.string().optional(),
        acType: z.string().optional(),
      })
      .nullable()
      .optional(),
    projectTaskID: z
      .object({
        _id: z.string(),
        taskNumber: z.string(),
        taskDescription: z.string(),
      })
      .nullable()
      .optional(),
    type: z.string().optional(),
    neededOnID: z
      .object({
        _id: z.string(),
        title: z.string(),
      })
      .nullable()
      .optional(),
    getFromID: z
      .object({
        _id: z.string(),
        storeLongName: z.string(),
        storeShortName: z.string(),
      })
      .optional(),
    pickSlipNumberNew: z.number().optional(),
  })
  .passthrough();

function transformPickSlipData(data: unknown): PickSlip[] {
  if (!Array.isArray(data)) {
    console.error('Received data is not an array:', data);
    return [];
  }

  return data
    .map((item: unknown) => {
      try {
        const parsedItem = PickSlipSchema.parse(item);
        return {
          id: parsedItem.id || '',
          pickSlipNumber: parsedItem.pickSlipNumberNew || 0,
          state: (parsedItem.state || '').toLowerCase(),
          plannedDate: parsedItem.plannedDate
            ? new Date(parsedItem.plannedDate)
            : new Date(),
          createDate: parsedItem.createDate
            ? new Date(parsedItem.createDate)
            : new Date(),
          project: {
            name: parsedItem.projectID?.projectName || 'N/A',
            acRegistrationNumber:
              parsedItem.projectID?.acRegistrationNumber || 'N/A',
            acType: parsedItem.projectID?.acType || 'N/A',
          },
          projectTask: {
            taskNumber: parsedItem.projectTaskID?.taskNumber || 'N/A',
            description: parsedItem.projectTaskID?.taskDescription || 'N/A',
          },
          createdBy:
            parsedItem.createUserID?.firstNameEnglish &&
            parsedItem.createUserID?.lastNameEnglish
              ? `${parsedItem.createUserID.firstNameEnglish} ${parsedItem.createUserID.lastNameEnglish}`
              : parsedItem.createUserID?.organizationAuthorization ||
                parsedItem.createUserID?.singNumber ||
                'N/A',
          getFrom: {
            longName: parsedItem.getFromID?.storeLongName || 'N/A',
            shortName: parsedItem.getFromID?.storeShortName || 'N/A',
          },
          type: parsedItem.type || 'N/A',
        };
      } catch (error) {
        console.error('Error parsing item:', error);
        return null;
      }
    })
    .filter((item): item is PickSlip => item !== null);
}

// Фукция для поучения цвета татуса
const getStatusColor = (state: string): string => {
  switch (state.toLowerCase()) {
    case 'issued':
      return 'rgba(255, 160, 122, 0.6)'; // Light Coral
    case 'open':
      return 'rgba(52, 155, 240, 0.6)'; // Light Blue
    case 'progress':
      return 'rgba(252, 252, 60, 0.6)'; // Yellow
    case 'complete':
      return 'rgba(144, 238, 144, 0.6)'; // Light Green
    case 'closed':
      return 'rgba(144, 238, 144, 0.6)'; // Light Green
    case 'tofix':
      return 'rgba(255, 0, 0, 0.6)'; // Red
    default:
      return 'rgba(128, 128, 128, 0.1)'; // Light Gray
  }
};

// Функция для получения цвета текста статуса
const getStatusTextColor = (state: string): string => {
  switch (state.toLowerCase()) {
    case 'issued':
      return '#d4380d'; // Dark Orange
    case 'open':
      return '#096dd9'; // Blue
    case 'progress':
      return '#7cb305'; // Green
    case 'complete':
      return '#389e0d'; // Dark Green
    case 'closed':
      return '#389e0d'; // Dark Green
    case 'tofix':
      return '#d4380d'; // Dark Orange
    default:
      return '#000000'; // Black
  }
};

// Функция для форматирования длительности
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Компонент для отображения длительности
const DurationDisplay: React.FC<{
  createDate: Date;
  completedDate?: Date;
  state: string;
}> = ({ createDate, completedDate, state }) => {
  const [duration, setDuration] = useState<number>(0);

  // Если статус closed, не показываем время
  if (state.toLowerCase() === 'closed') {
    return null;
  }

  useEffect(() => {
    // Вычисляем начальную длительность
    const calculateDuration = () => {
      const now = new Date();
      const start = new Date(createDate);
      const end =
        state.toLowerCase() === 'complete' ? completedDate || now : now;
      return differenceInSeconds(end, start);
    };

    // Устанавливаем начальное значение
    setDuration(calculateDuration());

    // Создаем интервал только если статус не 'complete'
    let intervalId: NodeJS.Timeout | null = null;
    if (!['complete', 'closed'].includes(state.toLowerCase())) {
      intervalId = setInterval(() => {
        setDuration(calculateDuration());
      }, 1000); // Обновляем каждую секунду
    }

    // Очищаем интервал при размонтировании
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [createDate, completedDate, state]);

  return (
    <span style={{ fontWeight: '500', fontSize: '16px' }}>
      {formatDuration(duration)}
    </span>
  );
};

// Обновленный компонент карточки PickSlip с условным рендерингом времени
interface PickSlipCardProps {
  pickSlip: PickSlip;
  onSelect: () => void;
  isSelected: boolean;
}

const PickSlipCard: React.FC<PickSlipCardProps> = ({
  pickSlip,
  onSelect,
  isSelected,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDoubleClick = () => {
    console.log(
      'Double-clicked pick slip number (card):',
      pickSlip.pickSlipNumber
    );
    dispatch(
      addTab({
        key: `${RouteNames.PICKSLIP_CONFIRMATIONS_NEW}-${pickSlip.pickSlipNumber}`,
        title: `${t('PICKSLIP CONFIRMATION')} ${pickSlip.pickSlipNumber}`,
        contentKey: RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
        closable: true,
        pickSlipNumber: pickSlip.pickSlipNumber,
      })
    );
  };

  return (
    <Card
      hoverable
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          onSelect();
        }
      }}
      styles={{
        body: { padding: '8px' },
      }}
      style={{
        width: '100%',
        margin: '0 0 8px 0',
        backgroundColor: getStatusColor(pickSlip.state),
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: isSelected ? '2px solid #1890ff' : undefined,
      }}
    >
      <div style={{ lineHeight: '1.3' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            paddingBottom: '4px',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {pickSlip.pickSlipNumber}
          </span>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            {pickSlip.createdBy}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: getStatusTextColor(pickSlip.state),
            }}
          >
            {t(pickSlip.state.toUpperCase())}
          </span>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            {pickSlip.getFrom.shortName}
          </span>
        </div>
        <div
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '3px',
            fontWeight: '500',
            fontSize: '16px',
          }}
        >
          {pickSlip.project.name}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px',
          }}
        >
          <span style={{ fontWeight: '500', fontSize: '16px' }}>
            {pickSlip.projectTask.taskNumber}
          </span>
          {pickSlip.state.toLowerCase() !== 'closed' && (
            <DurationDisplay
              createDate={pickSlip.createDate}
              completedDate={pickSlip.completedDate}
              state={pickSlip.state}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

// Основной компонент PickSlipStatus
export function PickSlipStatus() {
  const { t } = useTranslation();
  const [pickSlips, setPickSlips] = useState<PickSlip[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCardView, setIsCardView] = useState(true);
  const { isConnected, socket } = useTypedSelector((state) => state.socket);
  const gridRef = useRef<AgGridReact>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState('100%');
  const dispatch = useDispatch();
  const [hiddenPickSlips, setHiddenPickSlips] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenPickSlips');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPickSlips, setSelectedPickSlips] = useState<string[]>([]);

  const {
    data: pickSlipsData,
    isLoading,
    refetch,
  } = useGetPickSlipsQuery({}, { skip: false });

  useEffect(() => {
    if (isConnected && socket) {
      socket.on('pickSlipUpdate', handlePickSlipsData);
      return () => {
        socket.off('pickSlipUpdate', handlePickSlipsData);
      };
    }
  }, [isConnected, socket, refetch]);

  useEffect(() => {
    if (isLoading) {
      console.log('Loading data...');
    } else if (pickSlipsData) {
      console.log('Data received:', pickSlipsData);
      try {
        const transformedData = transformPickSlipData(pickSlipsData);
        console.log('All transformed data:', transformedData);

        const filteredData = transformedData.filter((slip) =>
          [
            'complete',
            'closed',
            'issued',
            'open',
            'progress',
            'tofix',
          ].includes(slip.state)
        );
        console.log('Filtered data:', filteredData);

        const sortedData = sortPickSlips(filteredData);
        console.log('Sorted data:', sortedData);

        setPickSlips(sortedData);
      } catch (error) {
        console.error('Error processing data:', error);
        message.error('Error processing data');
      }
    }
  }, [isLoading, pickSlipsData]);

  useEffect(() => {
    localStorage.setItem('hiddenPickSlips', JSON.stringify(hiddenPickSlips));
  }, [hiddenPickSlips]);

  const handlePickSlipsData = useCallback(
    async (updatedPickSlip: any) => {
      await refetch();
      setPickSlips((prevPickSlips) => {
        const updatedPickSlips = prevPickSlips.map((pickSlip) =>
          pickSlip.id === updatedPickSlip.id
            ? transformPickSlipData([updatedPickSlip])[0]
            : pickSlip
        );
        if (
          !updatedPickSlips.some(
            (pickSlip) => pickSlip.id === updatedPickSlip.id
          )
        ) {
          updatedPickSlips.push(transformPickSlipData([updatedPickSlip])[0]);
        }
        return sortPickSlips(updatedPickSlips);
      });
    },
    [refetch]
  );

  const filterVisiblePickSlips = useCallback(
    (pickSlips: PickSlip[]) => {
      return pickSlips.filter((slip) => !hiddenPickSlips.includes(slip.id));
    },
    [hiddenPickSlips]
  );

  const sortPickSlips = useCallback((pickSlips: PickSlip[]): PickSlip[] => {
    return pickSlips.sort((a, b) => {
      const stateOrder = [
        'progress',
        'issued',
        'open',
        'tofix',
        'complete',
        'closed',
      ];
      const stateA = a.state.toLowerCase();
      const stateB = b.state.toLowerCase();

      // Сначала сортируем по статусу
      const stateComparison =
        stateOrder.indexOf(stateA) - stateOrder.indexOf(stateB);
      if (stateComparison !== 0) {
        return stateComparison;
      }

      // Если статусы одинаковые, сортируем по времени создания (от новых к старым для closed)
      if (stateA === 'closed' && stateB === 'closed') {
        return (
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
      }

      // Для остальных статусов сортировка от старых к новым
      return (
        new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
      );
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const toggleView = useCallback(() => {
    setIsCardView((prev) => !prev);
  }, []);

  const inProgressPickSlips = useMemo(
    () =>
      filterVisiblePickSlips(
        pickSlips.filter((slip) =>
          ['issued', 'open', 'progress'].includes(slip.state)
        )
      ),
    [pickSlips, filterVisiblePickSlips]
  );

  const completedPickSlips = useMemo(
    () =>
      filterVisiblePickSlips(
        pickSlips.filter((slip) => slip.state === 'complete')
      ),
    [pickSlips, filterVisiblePickSlips]
  );

  const toFixedPickSlips = useMemo(
    () =>
      filterVisiblePickSlips(
        pickSlips.filter((slip) => ['tofix'].includes(slip.state))
      ),
    [pickSlips, filterVisiblePickSlips]
  );

  const issuedPickSlips = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return filterVisiblePickSlips(
      pickSlips.filter((slip) => {
        const createDate = new Date(slip.createDate);
        return slip.state === 'closed' && createDate >= twentyFourHoursAgo;
      })
    );
  }, [pickSlips, filterVisiblePickSlips]);

  const handleRowDoubleClick = useCallback(
    (params: any) => {
      const pickSlipNumber = params.data.pickSlipNumber;
      console.log('Double-clicked pick slip number:', pickSlipNumber);
      dispatch(
        addTab({
          key: `${RouteNames.PICKSLIP_CONFIRMATIONS_NEW}-${pickSlipNumber}`,
          title: `${t('PICKSLIP CONFIRMATION')} ${pickSlipNumber}`,
          contentKey: RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
          closable: true,
          pickSlipNumber: pickSlipNumber,
        })
      );
    },
    [dispatch, t]
  );

  const handleCardSelect = useCallback((id: string) => {
    setSelectedPickSlips((prev) => {
      if (prev.includes(id)) {
        return prev.filter((slipId) => slipId !== id);
      }
      return [...prev, id];
    });
  }, []);

  const columns = useMemo<(ColDef<PickSlip> | ColGroupDef<PickSlip>)[]>(
    () => [
      {
        headerName: t('PICKSLIP No'),
        field: 'pickSlipNumber',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
        flex: 1,
        minWidth: 120,
        onCellDoubleClicked: handleRowDoubleClick,
      },
      {
        headerName: t('STATUS'),
        field: 'state',
        cellStyle: {
          textAlign: 'center',
          fontSize: '18px',
          padding: '10px',
        },
        cellRenderer: (params: { value: string }) => {
          const status = params.value?.toLowerCase();
          switch (status) {
            case 'issued':
              return t('ISSUED');
            case 'open':
              return t('OPEN');
            case 'progress':
              return t('IN PROGRESS');
            case 'complete':
              return t('COMPLETE');
            case 'closed':
              return t('CLOSED');
            case 'tofix':
              return t('TO FIX');
            default:
              return '';
          }
        },
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: t('WP NAME'),
        field: 'project.name',
        cellStyle: { textAlign: 'left', fontSize: '18px', padding: '10px' },
        flex: 2,
        minWidth: 200,
        autoHeight: true,
        wrapText: true,
      },
      {
        headerName: t('TASK No'),
        field: 'projectTask.taskNumber',
        cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: t('CREATED BY'),
        field: 'createdBy',
        cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: t('CREATE DATE'),
        field: 'createDate',
        cellRenderer: (params: { value: Date }) =>
          format(new Date(params.value), 'dd.MM.yyyy HH:mm'),
        cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
        flex: 1,
        minWidth: 160,
      },
      {
        headerName: t('DURATION'),
        field: 'createDate',
        cellRenderer: (params: { data: PickSlip; value: Date }) => {
          const createDate = new Date(params.value);
          const duration = differenceInSeconds(
            params.data.state.toLowerCase() === 'complete'
              ? params.data.completedDate || new Date()
              : new Date(),
            createDate
          );
          return formatDuration(duration);
        },
        cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
        flex: 1,
        minWidth: 120,
      },
    ],
    [t, handleRowDoubleClick]
  );

  const getRowStyle = useCallback(
    (params: { data: PickSlip }) => {
      return {
        backgroundColor: getStatusColor(params.data.state),
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        opacity: hiddenPickSlips.includes(params.data.id) ? 0.5 : 1,
      };
    },
    [hiddenPickSlips]
  );

  const onSelectionChanged = useCallback((event: any) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedIds = selectedNodes.map((node: any) => node.data.id);
    setSelectedPickSlips(selectedIds);
  }, []);

  const handleHideSelected = useCallback(() => {
    if (selectedPickSlips.length === 0) return;

    setHiddenPickSlips((prev) => [...prev, ...selectedPickSlips]);
    setSelectedPickSlips([]);

    if (gridRef.current) {
      gridRef.current.api.deselectAll();
    }

    message.success(t('Selected pick slips have been hidden'));
  }, [selectedPickSlips, t]);

  const handleShowAll = useCallback(() => {
    setHiddenPickSlips([]);
    setSelectedPickSlips([]);

    if (gridRef.current) {
      gridRef.current.api.deselectAll();
    }

    message.success(t('All pick slips are now visible'));
  }, [t]);

  const renderContent = () => {
    if (isCardView) {
      const sortedInProgressPickSlips = sortPickSlips(inProgressPickSlips);
      const sortedCompletedPickSlips = sortPickSlips(completedPickSlips);
      const sortedIssuedPickSlips = sortPickSlips(issuedPickSlips);
      const sortedToFixPickSlips = sortPickSlips(toFixedPickSlips);

      return (
        <div
          style={{
            height: 'calc(100% - 40px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Row gutter={[8, 8]} style={{ marginBottom: '8px' }}>
            <Col span={6}>
              <Title level={4} style={{ margin: '0' }}>
                {t('IN PROGRESS')} ({sortedInProgressPickSlips.length})
              </Title>
            </Col>
            <Col span={6}>
              <Title level={4} style={{ margin: '0' }}>
                {t('COMPLETED')} ({sortedCompletedPickSlips.length})
              </Title>
            </Col>
            <Col span={6}>
              <Title level={4} style={{ margin: '0' }}>
                {t('CLOSED')} ({sortedIssuedPickSlips.length})
              </Title>
            </Col>
            <Col span={6}>
              <Title level={4} style={{ margin: '0' }}>
                {t('ATTENTION')} ({sortedToFixPickSlips.length})
              </Title>
            </Col>
          </Row>
          <Row gutter={[8, 0]} style={{ flex: 1, overflow: 'hidden' }}>
            <Col
              span={6}
              style={{ height: '100%', overflowY: 'auto', paddingRight: '4px' }}
            >
              {sortedInProgressPickSlips.map((pickSlip) => (
                <PickSlipCard
                  key={pickSlip.id}
                  pickSlip={pickSlip}
                  onSelect={() => handleCardSelect(pickSlip.id)}
                  isSelected={selectedPickSlips.includes(pickSlip.id)}
                />
              ))}
            </Col>
            <Col span={6} style={{ height: '100%', overflowY: 'auto' }}>
              {sortedCompletedPickSlips.map((pickSlip) => (
                <PickSlipCard
                  key={pickSlip.id}
                  pickSlip={pickSlip}
                  onSelect={() => handleCardSelect(pickSlip.id)}
                  isSelected={selectedPickSlips.includes(pickSlip.id)}
                />
              ))}
            </Col>
            <Col span={6} style={{ height: '100%', overflowY: 'auto' }}>
              {sortedIssuedPickSlips.map((pickSlip) => (
                <PickSlipCard
                  key={pickSlip.id}
                  pickSlip={pickSlip}
                  onSelect={() => handleCardSelect(pickSlip.id)}
                  isSelected={selectedPickSlips.includes(pickSlip.id)}
                />
              ))}
            </Col>
            <Col span={6} style={{ height: '100%', overflowY: 'auto' }}>
              {sortedToFixPickSlips.map((pickSlip) => (
                <PickSlipCard
                  key={pickSlip.id}
                  pickSlip={pickSlip}
                  onSelect={() => handleCardSelect(pickSlip.id)}
                  isSelected={selectedPickSlips.includes(pickSlip.id)}
                />
              ))}
            </Col>
          </Row>
        </div>
      );
    } else {
      const filteredPickSlips = filterVisiblePickSlips([
        ...inProgressPickSlips,
        ...completedPickSlips,
        ...issuedPickSlips,
        ...toFixedPickSlips,
      ]);

      const sortedPickSlips = sortPickSlips(filteredPickSlips);

      return (
        <div
          style={{ height: gridHeight, width: '100%' }}
          className="ag-theme-alpine"
        >
          <AgGridReact
            ref={gridRef}
            columnDefs={columns}
            rowData={sortedPickSlips}
            getRowStyle={getRowStyle}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onSelectionChanged={onSelectionChanged}
            headerHeight={50}
            rowHeight={50}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
            isRowSelectable={(params) =>
              !hiddenPickSlips.includes(params.data.id)
            }
            rowMultiSelectWithClick={true}
            suppressCellFocus={true}
            getRowId={(params) => params.data.id}
            isExternalFilterPresent={() => true}
            doesExternalFilterPass={(node) => {
              return !hiddenPickSlips.includes(node.data.id);
            }}
          />
        </div>
      );
    }
  };

  useEffect(() => {
    if (!isLoading && pickSlipsData) {
      console.log('All pickSlips:', pickSlips);
      console.log('In Progress:', inProgressPickSlips);
      console.log('Completed:', completedPickSlips);
      console.log('To Fix:', toFixedPickSlips);

      const unaccountedSlips = pickSlips.filter(
        (slip) =>
          !inProgressPickSlips.includes(slip) &&
          !completedPickSlips.includes(slip) &&
          !toFixedPickSlips.includes(slip)
      );
      console.log('Unaccounted slips:', unaccountedSlips);
    }
  }, [
    isLoading,
    pickSlipsData,
    pickSlips,
    inProgressPickSlips,
    completedPickSlips,
    toFixedPickSlips,
  ]);

  return (
    <div
      ref={containerRef}
      className={`p-4 bg-white shadow-md rounded-lg ${
        isFullscreen ? 'fixed top-0 left-0 w-full h-full z-50' : 'relative'
      }`}
      style={{
        height: isFullscreen ? '100vh' : '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Row gutter={16} className="mb-4" align="middle">
        <Col>
          <Button
            type="primary"
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={toggleFullscreen}
          >
            {isFullscreen ? t('Exit Fullscreen Mode') : t('Fullscreen Mode')}
          </Button>
        </Col>
        <Col>
          <Switch
            checkedChildren={t('Cards')}
            unCheckedChildren={t('Table')}
            checked={isCardView}
            onChange={toggleView}
          />
        </Col>
        <Col>
          <Button
            icon={<EyeInvisibleOutlined />}
            onClick={handleHideSelected}
            disabled={selectedPickSlips.length === 0}
          >
            {t('Hide Selected')} ({selectedPickSlips.length})
          </Button>
        </Col>
        <Col>
          <Button
            onClick={handleShowAll}
            disabled={hiddenPickSlips.length === 0}
          >
            {t('Show All')} ({hiddenPickSlips.length})
          </Button>
        </Col>
      </Row>
      {!isConnected && <div>{t('Connecting to server...')}</div>}
      {renderContent()}
    </div>
  );
}

export default PickSlipStatus;
