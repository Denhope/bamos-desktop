//@ts-nocheck

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Row, Switch, Typography, message } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { ColDef, ColGroupDef, RowClassParams } from 'ag-grid-community';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
import { differenceInSeconds, format } from 'date-fns';
import { z } from 'zod';

const { Title, Text } = Typography;

// Обновленная схема валидации PickSlip с использованием Zod
const PickSlipSchema = z.object({
  id: z.string(),
  pickSlipsItems: z.array(z.unknown()),
  plannedDate: z.string().datetime(),
  state: z.string(),
  companyID: z.string(),
  createDate: z.string().datetime(),
  createUserID: z.object({
    _id: z.string(),
    singNumber: z.string(),
    name: z.string(),
    organizationAuthorization: z.string().optional(),
    firstNameEnglish: z.string().optional(),
    lastNameEnglish: z.string().optional(),
  }),
  files: z.array(z.unknown()),
  projectID: z.object({
    _id: z.string(),
    projectName: z.string(),
    acRegistrationNumber: z.string().optional(),
    acType: z.string().optional(),
  }).nullable(),
  projectTaskID: z.object({
    _id: z.string(),
    taskNumber: z.string(),
    taskDescription: z.string(),
  }).nullable(),
  type: z.string(),
  neededOnID: z.object({
    _id: z.string(),
    title: z.string(),
  }).nullable(),
  getFromID: z.object({
    _id: z.string(),
    storeLongName: z.string(),
    storeShortName: z.string(),
  }),
  pickSlipNumberNew: z.number(),
});

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
function transformPickSlipData(data: unknown): PickSlip[] {
  const parsedData = z.array(PickSlipSchema).parse(data);
  
  return parsedData.map((pickSlip: any) => ({
    ...pickSlip,
    pickSlipNumber: pickSlip.pickSlipNumberNew,
    state: pickSlip.state.toLowerCase(),
    plannedDate: new Date(pickSlip.plannedDate),
    createDate: new Date(pickSlip.createDate),
    project: {
      name: pickSlip.projectID?.projectName || 'N/A',
      acRegistrationNumber: pickSlip.projectID?.acRegistrationNumber || 'N/A',
      acType: pickSlip.projectID?.acType || 'N/A',
    },
    projectTask: {
      taskNumber: pickSlip.projectTaskID?.taskNumber || 'N/A',
      description: pickSlip.projectTaskID?.taskDescription || 'N/A',
    },
    createdBy: pickSlip.createUserID?.firstNameEnglish && pickSlip.createUserID?.lastNameEnglish
      ? `${pickSlip.createUserID.firstNameEnglish} ${pickSlip.createUserID.lastNameEnglish}`
      : pickSlip.createUserID?.organizationAuthorization || pickSlip.createUserID.singNumber,
    getFrom: {
      longName: pickSlip.getFromID.storeLongName,
      shortName: pickSlip.getFromID.storeShortName,
    },
  }));
}

// Функция для получения цвета статуса
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
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Компонент карточки PickSlip
const PickSlipCard: React.FC<{ pickSlip: PickSlip }> = ({ pickSlip }) => {
  const { t } = useTranslation();
  const now = new Date();
  const duration = differenceInSeconds(
    pickSlip.state.toLowerCase() === 'complete' ? pickSlip.completedDate || now : now,
    new Date(pickSlip.createDate)
  );

  return (
    <Card
      hoverable
      styles={{
        body: { padding: '6px' }
      }}
      style={{ 
        width: '100%', 
        margin: '0 0 6px 0', 
        backgroundColor: getStatusColor(pickSlip.state),
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontSize: '14px', lineHeight: '1.2' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          paddingBottom: '2px'
        }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{pickSlip.pickSlipNumber}</span>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{pickSlip.createdBy}</span>
        </div>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: 'bold', 
          marginBottom: '2px', 
          color: getStatusTextColor(pickSlip.state)
        }}>
          {t(pickSlip.state.toUpperCase())}
        </div>
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          marginBottom: '1px',
          fontWeight: '500'
        }}>
          {pickSlip.project.name}
        </div>
        <div style={{ marginBottom: '1px', fontWeight: '500' }}>{pickSlip.projectTask.taskNumber}</div>
        <div style={{ fontWeight: '500' }}>{formatDuration(duration)}</div>
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

  const {
    data: pickSlipsData,
    isLoading,
    refetch
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
        
        const filteredData = transformedData.filter(slip => 
          ['complete', 'issued', 'open', 'progress', 'tofix'].includes(slip.state)
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

  const handlePickSlipsData = useCallback(async (updatedPickSlip: any) => {
    await refetch();
    setPickSlips((prevPickSlips) => {
      const updatedPickSlips = prevPickSlips.map((pickSlip) =>
        pickSlip.id === updatedPickSlip.id ? transformPickSlipData([updatedPickSlip])[0] : pickSlip
      );
      if (!updatedPickSlips.some((pickSlip) => pickSlip.id === updatedPickSlip.id)) {
        updatedPickSlips.push(transformPickSlipData([updatedPickSlip])[0]);
      }
      return sortPickSlips(updatedPickSlips);
    });
  }, [refetch]);

  const sortPickSlips = useCallback((pickSlips: PickSlip[]): PickSlip[] => {
    const statusOrder = ['complete', 'issued', 'open', 'progress','toFix'];
    return pickSlips.sort((a, b) => {
      const statusA = statusOrder.indexOf(a.state.toLowerCase());
      const statusB = statusOrder.indexOf(b.state.toLowerCase());
      if (statusA !== statusB) return statusA - statusB;
      return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleView = useCallback(() => {
    setIsCardView(prev => !prev);
  }, []);

  const inProgressPickSlips = useMemo(() => 
    pickSlips.filter(slip => 
      ['issued', 'open', 'progress'].includes(slip.state)
    ),
    [pickSlips]
  );

  const completedPickSlips = useMemo(() => 
    pickSlips.filter(slip => slip.state === 'complete'),
    [pickSlips]
  );

  const toFixedPickSlips = useMemo(() => 
    pickSlips.filter(slip => 
      ['tofix'].includes(slip.state)),
    [pickSlips]
  );

  const columns = useMemo<(ColDef<PickSlip> | ColGroupDef<PickSlip>)[]>(() => [
    {
      headerName: t('PICKSLIP No'),
      field: 'pickSlipNumber',
      cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: t('STATUS'),
      field: 'state',
      cellStyle: { 
        textAlign: 'center', 
        fontSize: '18px', 
        padding: '10px' 
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
      cellRenderer: (params: { value: Date }) => format(new Date(params.value), 'dd.MM.yyyy HH:mm'),
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
          params.data.state.toLowerCase() === 'complete' ? params.data.completedDate || new Date() : new Date(),
          createDate
        );
        return formatDuration(duration);
      },
      cellStyle: { textAlign: 'center', fontSize: '18px', padding: '10px' },
      flex: 1,
      minWidth: 120,
    },
  ], [t]);

  const getRowStyle = useCallback((params: { data: PickSlip }) => {
    return { backgroundColor: getStatusColor(params.data.state), borderBottom: '1px solid #f0f0f0' };
  }, []);

  const renderContent = () => {
    if (isCardView) {
      const columnCount = 3;
      const itemsPerColumn = Math.ceil(inProgressPickSlips.length / columnCount);
      
      return (
        <div style={{ height: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
          <Row gutter={[8, 8]} style={{ marginBottom: '8px' }}>
            <Col span={10}>
              <Title level={4} style={{ margin: '0' }}>{t('IN PROGRESS')}</Title>
            </Col>
            <Col span={10}>
              <Title level={4} style={{ margin: '0' }}>{t('COMPLETED')}</Title>
            </Col>
            <Col span={4}>
              <Title level={4} style={{ margin: '0' }}>{t('ATTENTION')}</Title>
            </Col>
          </Row>
          <Row gutter={[8, 0]} style={{ flex: 1, overflow: 'hidden' }}>
            <Col span={10} style={{ height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
              <Row gutter={[4, 4]}>
                {[...Array(columnCount)].map((_, columnIndex) => (
                  <Col span={8} key={columnIndex}>
                    {inProgressPickSlips
                      .slice(columnIndex * itemsPerColumn, (columnIndex + 1) * itemsPerColumn)
                      .map((pickSlip) => (
                        <PickSlipCard key={pickSlip.id} pickSlip={pickSlip} />
                      ))}
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={1} style={{ borderRight: '1px solid #f0f0f0', height: '100%' }} />
            <Col span={7} style={{ height: '100%', overflowY: 'auto', paddingLeft: '4px' }}>
              <Row gutter={[4, 4]}>
                {[...Array(2)].map((_, columnIndex) => (
                  <Col span={12} key={columnIndex}>
                    {completedPickSlips
                      .slice(columnIndex * Math.ceil(completedPickSlips.length / 2), (columnIndex + 1) * Math.ceil(completedPickSlips.length / 2))
                      .map((pickSlip) => (
                        <PickSlipCard key={pickSlip.id} pickSlip={pickSlip} />
                      ))}
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={1} style={{ borderRight: '1px solid #f0f0f0', height: '100%' }} />
            <Col span={5} style={{ height: '100%', overflowY: 'auto', paddingLeft: '4px' }}>
             <Row gutter={[4, 4]}>
                {[...Array(1)].map((_, columnIndex) => (
                  <Col span={17} key={columnIndex}>
                    {}
                    {toFixedPickSlips
                      .slice(columnIndex * Math.ceil(toFixedPickSlips.length / 2), (columnIndex + 1) * Math.ceil(toFixedPickSlips.length / 2))
                      .map((pickSlip) => (
                        
                        <PickSlipCard key={pickSlip.id} pickSlip={pickSlip} />
                      ))}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div style={{ height: gridHeight, width: '100%' }}>
          <AgGridReact<PickSlip>
            ref={gridRef}
            columnDefs={columns}
            rowData={pickSlips}
            getRowStyle={(params: RowClassParams<PickSlip>) => {
              if (params.data) {
                return { backgroundColor: getStatusColor(params.data.state), borderBottom: '1px solid #f0f0f0' };
              }
              return undefined;
            }}
            loadingOverlayComponentParams={{ loadingMessage: t('Загрузка...') }}
            overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Загрузка...</span>'}
            domLayout="autoHeight"
            rowHeight={50}
            headerHeight={50}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
            rowSelection="single"
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
      
      // Дополнительная проверка
      const unaccountedSlips = pickSlips.filter(slip => 
        !inProgressPickSlips.includes(slip) && 
        !completedPickSlips.includes(slip) && 
        !toFixedPickSlips.includes(slip)
      );
      console.log('Unaccounted slips:', unaccountedSlips);
    }
  }, [isLoading, pickSlipsData, pickSlips, inProgressPickSlips, completedPickSlips, toFixedPickSlips]);

  return (
    <div 
      ref={containerRef}
      className={`p-4 bg-white shadow-md rounded-lg ${isFullscreen ? 'fixed top-0 left-0 w-full h-full z-50' : 'relative'}`} 
      style={{ height: isFullscreen ? '100vh' : '100%', width: '100%', overflow: 'hidden' }}
    >
      <Row gutter={16} className="mb-4">
        <Col>
          <Button
            type="primary"
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
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
      </Row>
      {!isConnected && <div>{t('Connecting to server...')}</div>}
      {renderContent()}
    </div>
  );
}

export default PickSlipStatus;