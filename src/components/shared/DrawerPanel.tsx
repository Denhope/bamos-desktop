import React, { Children } from "react";
import { Drawer } from "antd";
import "tailwindcss/tailwind.css";

interface Props {
  title: string;
  size: "small" | "medium" | "mediumL" | "large";
  placement: "top" | "right" | "bottom" | "left";
  open: boolean;
  onClose: (open: any) => void;
  children: any;
  extra?: any;
  getContainer?: string | HTMLElement | (() => HTMLElement) | false;
  className?: string;
}

const DrawerPanel: React.FC<Props> = ({
  title,
  size,
  placement,
  open,
  onClose,
  children,
  extra,
  getContainer,
  className,
}) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return 256;
      case "medium":
        return 512;
      case "mediumL":
        return 622;
      case "large":
        return 768;
      default:
        return 256;
    }
  };

  return (
    <Drawer
      title={title}
      placement={placement}
      width={getSize()}
      height={getSize()}
      onClose={() => onClose(false)}
      open={open}
      extra={extra}
      getContainer={getContainer}
      className={className}
    >
      {/* Drawer content */}
      {children}
    </Drawer>
  );
};

export default DrawerPanel;
