import { StatisticCard } from '@ant-design/pro-components';
import RcResizeObserver from 'rc-resize-observer';
import React from 'react';
import { useState } from 'react';

const { Statistic, Divider } = StatisticCard;

export default () => {
  const [responsive, setResponsive] = useState(false);

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <StatisticCard.Group direction={responsive ? 'column' : 'row'}>
        <StatisticCard
          statistic={{
            title: 'Items',
            value: 206,
          }}
        />
        <Divider type={responsive ? 'horizontal' : 'vertical'} />
        <StatisticCard
          statistic={{
            title: 'Items Complete',
            value: 3701928,
            description: <Statistic title="value" value="61.5%" />,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/ShNDpDTik/huan.svg"
              alt="value"
              width="100%"
            />
          }
          chartPlacement="left"
        />
        <StatisticCard
          statistic={{
            title: 'Finding Items',
            value: 18,
            description: <Statistic title="Value" value="38.5%" />,
          }}
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/6YR18tCxJ/huanlv.svg"
              alt="value"
              width="100%"
            />
          }
          chartPlacement="left"
        />
      </StatisticCard.Group>
    </RcResizeObserver>
  );
};
