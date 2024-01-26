import React, { useState } from 'react';
import { Button } from 'antd';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
}

const ButtonArea: React.FC<Props> = ({ onClick, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        display: 'inline-block',
        // border: '1px solid #d9d9d9',
        padding: '4px 15px',
        borderRadius: '2px',
        cursor: 'pointer',
        backgroundColor: isHovered ? '#f5f5f5' : 'transparent',
      }}
    >
      {children}
    </div>
  );
};

export default ButtonArea;
