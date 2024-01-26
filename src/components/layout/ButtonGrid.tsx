import React from 'react';
import { Button, Row, Col, MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const ButtonGrid: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
      }}
    >
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        {items.map((item, index) => (
          <Row gutter={[16, 16]} key={index}>
            <Col span={12}>
              <Button block>
                {item && 'label' in item && item.label ? item.label : null}
              </Button>
            </Col>
            <Col span={12}>
              <Button block>
                {item &&
                'children' in item &&
                item.children &&
                item.children[0] &&
                'label' in item.children[0]
                  ? item.children[0].label
                  : null}
              </Button>
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};

export default ButtonGrid;
