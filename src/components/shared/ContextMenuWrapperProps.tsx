import React, { FC, useState, useEffect, useRef } from 'react';
import { Menu } from 'antd';
import { RightOutlined } from '@ant-design/icons';

interface ContextMenuWrapperProps {
  items: {
    label: string;
    action: (target: EventTarget | null) => void;
    submenu?: ContextMenuWrapperProps['items'];
  }[];
  children: React.ReactNode;
}

const ContextMenuWrapper: FC<ContextMenuWrapperProps> = ({
  items,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [target, setTarget] = useState<EventTarget | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setX(event.clientX);
    const offsetHeight = ref.current?.offsetHeight;
    setY(event.clientY - (offsetHeight ? offsetHeight : 0)); // Измените это значение в зависимости от размера вашего меню
    setTarget(event.target);
    setVisible(true);
  };

  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const renderMenuItems = (
    items: {
      label: string;
      action: (target: EventTarget | null) => void;
      submenu?: typeof items;
    }[]
  ) => {
    return items.map((item, index: number) => {
      if (item.submenu) {
        return (
          <Menu.SubMenu
            theme="dark"
            key={index}
            title={item.label}
            //icon={<RightOutlined />}
          >
            {renderMenuItems(item.submenu)}
          </Menu.SubMenu>
        );
      } else {
        return (
          <Menu.Item
            key={index}
            onClick={() => {
              item.action(target);
              setVisible(false); // Добавьте эту строку
            }}
          >
            {item.label}
          </Menu.Item>
        );
      }
    });
  };

  return (
    <div onContextMenu={handleContextMenu} style={{ position: 'relative' }}>
      {children}
      {visible && (
        <div
          ref={ref}
          style={{
            position: 'fixed',
            top: y,
            left: x,
            zIndex: 9999,
            backgroundColor: 'white', // Измените этот цвет на желаемый
            color: 'black', // Измените этот цвет на желаемый
          }}
        >
          <Menu theme="dark">{renderMenuItems(items)}</Menu>
        </div>
      )}
    </div>
  );
};

export default ContextMenuWrapper;
