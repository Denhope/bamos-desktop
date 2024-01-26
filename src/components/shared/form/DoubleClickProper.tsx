import React, { ReactNode, useState } from 'react';
import { Popover } from 'antd';

interface DoubleClickPopoverProps {
  children: ReactNode;
  [key: string]: any;
}

const DoubleClickPopover: React.FC<DoubleClickPopoverProps> = ({
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setOpen(!open);
      }}
    >
      <Popover
        trigger="click"
        visible={open}
        onVisibleChange={setOpen}
        {...props}
      >
        {children}
      </Popover>
    </div>
  );
};

export default DoubleClickPopover;
