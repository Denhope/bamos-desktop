import React, { FC } from 'react';
import { Card, Tag, Space } from 'antd';
import { IStep } from '@/models/IStep'; // Подключите свой интерфейс IStep, если таковой имеется
import { useTranslation } from 'react-i18next';

interface Props {
  steps: IStep[]; // Указываем тип для свойства steps
}

const SkillTimeAggregate: FC<Props> = ({ steps }) => {
  // Создаем объект для хранения времени по навыкам
  const skillTimes: { [key: string]: number } = {}; // Указываем явно тип объекта

  // Проходимся по всем степам
  steps.forEach((step) => {
    // Проверяем, существует ли actions у текущего степа
    if (step.actions && step.actions.length > 0) {
      // Проходимся по всем действиям в текущем степе
      step.actions.forEach((action) => {
        // Проверяем, существует ли userDurations у текущего действия
        if (action.userDurations && action.userDurations.length > 0) {
          // Проходимся по всем userDurations в текущем действии
          action.userDurations.forEach((userDuration) => {
            // Получаем skillID.code для текущего userDuration
            const skillCode = userDuration.userID.skillID?.code || 'Unknown'; // Обрабатываем случаи, когда skillID отсутствует

            // Получаем время текущего userDuration
            const stepDuration = userDuration.duration;

            // Если этот skillCode уже есть в объекте skillTimes, добавляем время к существующему значению
            if (skillTimes.hasOwnProperty(skillCode)) {
              skillTimes[skillCode] += stepDuration;
            } else {
              // Иначе создаем новую запись в объекте skillTimes
              skillTimes[skillCode] = stepDuration;
            }
          });
        }
      });
    }
  });

  // Преобразуем объект skillTimes в массив для отображения
  const skillTimeArray = Object.entries(skillTimes);
  const { t } = useTranslation();
  return (
    <Card
      title={t('Skill Time Aggregate')}
      style={{ width: '100%', textAlign: 'center' }}
      headStyle={{ backgroundColor: '#fafafa' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Space>
        {skillTimeArray.map(([skillCode, totalTime]) => (
          <Tag
            key={skillCode}
            color="blue"
            style={{ fontSize: '14px', padding: '4px 8px' }}
          >
            {skillCode}: {totalTime} hours
          </Tag>
        ))}
      </Space>
    </Card>
  );
};

export default SkillTimeAggregate;
