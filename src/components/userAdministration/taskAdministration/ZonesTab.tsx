import { Tabs, Collapse } from 'antd';
import { useMemo } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface ZonesTabProps {
  zones: any[]; // замените any на ваш тип для зон
}

const ZonesTab = ({ zones }: ZonesTabProps) => {
  const groupedZones = useMemo(() => {
    if (!zones) return {};

    return zones.reduce((acc: any, zone) => {
      const majorKey = zone.majoreZoneNbr;
      if (!acc[majorKey]) {
        acc[majorKey] = {
          description: zone.majoreZoneDescription,
          subZones: {},
        };
      }

      const subKey = zone.subZoneNbr;
      if (!acc[majorKey].subZones[subKey]) {
        acc[majorKey].subZones[subKey] = {
          description: zone.subZoneDescription,
          areas: [],
        };
      }

      if (zone.areaNbr) {
        acc[majorKey].subZones[subKey].areas.push({
          number: zone.areaNbr,
          description: zone.areaDescription,
        });
      }

      return acc;
    }, {});
  }, [zones]);

  return (
    <div className="flex h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Верхняя секция с инструкциями */}
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="text-lg font-medium mb-2">Формат ввода зон:</h4>
          <ul className="list-disc pl-5 mb-4">
            <li>
              Используйте запятую или плюс для разделения зон: "100,200+300"
            </li>
            <li>Можно указывать основные зоны (например: 100)</li>
          </ul>

          <h4 className="text-lg font-medium mb-2">Примеры:</h4>
          <ul className="list-disc pl-5">
            <li>
              ZONE: "100,200" - {groupedZones[100]?.description} и{' '}
              {groupedZones[200]?.description}
            </li>
            <li>
              ZONE: "300+400" - {groupedZones[300]?.description} и{' '}
              {groupedZones[400]?.description}
            </li>
            <li>
              ZONE: "500,600" - {groupedZones[500]?.description} и{' '}
              {groupedZones[600]?.description}
            </li>
          </ul>
        </div>

        {/* Скроллируемая секция с зонами */}
        <div className="flex-1 overflow-y-auto p-4">
          <Collapse
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
          >
            {Object.entries(groupedZones).map(
              ([majorNbr, majorData]: [string, any]) => (
                <Panel
                  key={majorNbr}
                  header={
                    <span className="font-medium">
                      {majorNbr} - {majorData.description}
                    </span>
                  }
                >
                  <Collapse ghost className="ml-4">
                    {Object.entries(majorData.subZones).map(
                      ([subNbr, subData]: [string, any]) => (
                        <Panel
                          key={`${majorNbr}-${subNbr}`}
                          header={
                            <span>
                              {subNbr} - {subData.description}
                            </span>
                          }
                        >
                          {subData.areas.length > 0 && (
                            <div className="ml-4">
                              {subData.areas.map((area: any) => (
                                <div
                                  key={`${majorNbr}-${subNbr}-${area.number}`}
                                  className="py-1"
                                >
                                  {area.number} - {area.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </Panel>
                      )
                    )}
                  </Collapse>
                </Panel>
              )
            )}
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default ZonesTab;
