//@ts-nocheck

import {
  ProFormDigit,
  ProFormGroup,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Modal, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { IOrder, IRequirement } from '@/models/IRequirement';

type RowState = {
  _id: any;
  partNumberID: any;
  amout: number;
  unit?: any;
  reqCodesID?: string;
  requirementsID?: string;
};

// Пропсы компонента
type Props = {
  order?: IOrder | null;
  partValueEnum: Record<string, string>;
  requirements?: IRequirement[];
  requirementCodesValueEnum: Record<string, string>;
  onDataChange: (rows: RowState[]) => void; // Функция обратного вызова для родителя
};

const PartList: React.FC<Props> = ({
  partValueEnum,
  onDataChange,
  requirementCodesValueEnum,
  requirements,
  order,
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<RowState[]>([
    {
      partNumberID: '',
      amout: 0,
      unit: '',
      reqCodesID: '',
      _id: '',
    }, // Начальная пустая строка
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<RowState[]>([]);
  useEffect(() => {
    if (order) {
      setRows(order?.parts);
    } else {
      setRows([]);
      setSelectedRows([]);
    }
  }, [order]);
  // Функция для обработки добавления строки
  const handleAddRow = () => {
    const newRows = [
      ...rows,
      {
        partNumberID: '',
        amout: 0,
        unit: '',
        reqCodesID: '',
        _id: '',
      },
    ];
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  // Функция для обработки выбора строки в таблице
  // Функция для обработки выбора строки в таблице
  const handleRowSelection = (
    selectedRowKeys: React.Key[],
    selectedRows: RowState[]
  ) => {
    // Преобразуем выбранные строки в новый формат, содержащий только необходимые данные
    const newSelectedRows: RowState[] = selectedRows.map((row) => ({
      requirementsID: row._id,
      partNumberID: row.partNumberID._id, // Идентификатор partNumberID
      amout: row.amout,
      unit: row.partNumberID.UNIT_OF_MEASURE, // Единица измерения из partNumberID
      reqCodesID: row.reqCodesID,
    }));

    setSelectedRows(newSelectedRows);
  };

  // Функция для обновления значения селекта
  const handleSelectChange = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index].partNumberID = value;
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  const handleSelectCode = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index].reqCodesID = value;
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };
  const handleSelectUnit = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index].unit = value;
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  // Функция для обновления количества
  const handleQuantityChange = (index: number, value: number) => {
    const newRows = [...rows];
    newRows[index].amout = value;
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  // Функция для удаления строки
  const handleRemoveRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  // Функция для открытия модального окна
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Функция для закрытия модального окна
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Функция для добавления выбранных строк в таблицу
  const handleAddSelectedRows = () => {
    const newRows = [...rows, ...selectedRows];
    setRows(newRows);
    setIsModalVisible(false);
    onDataChange(newRows); // Вызываем функцию обратного вызова с новыми данными
  };

  // Колонки для таблицы в модальном окне
  const columns = [
    {
      title: `${t('PART No')}`,
      dataIndex: 'partNumberID',
      key: 'partNumberID',
      render: (partNumberID: { PART_NUMBER: string }) =>
        partNumberID?.PART_NUMBER, // Функция для отображения PART_NUMBER
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'partNumberID',
      key: 'UNIT_OF_MEASURE',
      render: (partNumberID: { UNIT_OF_MEASURE: string }) =>
        partNumberID.UNIT_OF_MEASURE, // Функция для отображения UNIT_OF_MEASURE
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'amout',
      key: 'amout',
    },
  ];

  return (
    <div>
      <ProFormItem>
        <Button onClick={showModal}>{t('SELECT REQUIREMENT')}</Button>
      </ProFormItem>
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ProFormGroup size={'small'}>
            <ProFormSelect
              // rules={[{ required: true }]}
              // name="partNumberID"
              label={t('PART')}
              width="sm"
              valueEnum={partValueEnum}
              value={row.partNumberID}
              onChange={(value: string) =>
                handleSelectChange(index, value as string)
              }
            />
            <ProFormDigit
              width="xs"
              type="number"
              value={row.amout}
              onChange={(e: number) => handleQuantityChange(index, Number(e))}
              style={{ marginRight: '10px' }}
            />
            <ProFormSelect
              // rules={[{ required: true }]}
              label={t('UNIT')}
              // disabled
              // name="unit"
              value={row.unit}
              width="xs"
              onChange={(value: string) =>
                handleSelectUnit(index, value as string)
              }
              valueEnum={{
                EA: `EA/${t('EACH').toUpperCase()}`,
                M: `M/${t('Meters').toUpperCase()}`,
                ML: `ML/${t('Milliliters').toUpperCase()}`,
                SI: `SI/${t('Sq Inch').toUpperCase()}`,
                CM: `CM/${t('Centimeters').toUpperCase()}`,
                GM: `GM/${t('Grams').toUpperCase()}`,
                YD: `YD/${t('Yards').toUpperCase()}`,
                FT: `FT/${t('Feet').toUpperCase()}`,
                SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                IN: `IN/${t('Inch').toUpperCase()}`,
                SH: `SH/${t('Sheet').toUpperCase()}`,
                SM: `SM/${t('Sq Meters').toUpperCase()}`,
                RL: `RL/${t('Roll').toUpperCase()}`,
                KT: `KT/${t('Kit').toUpperCase()}`,
                LI: `LI/${t('Liters').toUpperCase()}`,
                KG: `KG/${t('Kilograms').toUpperCase()}`,
                JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
              }}
            ></ProFormSelect>
            <ProFormSelect
              showSearch
              // name="reqCodesID"
              label={t('CODE')}
              width="xs"
              value={row.reqCodesID}
              valueEnum={requirementCodesValueEnum || []}
              onChange={(value: string) =>
                handleSelectCode(index, value as string)
              }
            />
            <ProFormItem>
              <Button
                // size="small"
                icon={<MinusOutlined />}
                onClick={() => handleRemoveRow(index)}
                style={{ marginRight: '10px' }}
              ></Button>
            </ProFormItem>{' '}
            <ProFormItem>
              {index === rows.length - 1 && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddRow}
                  style={{ marginRight: '10px' }}
                ></Button>
              )}
            </ProFormItem>
          </ProFormGroup>
        </div>
      ))}

      <Modal
        title="Выберите строки"
        visible={isModalVisible}
        onOk={handleAddSelectedRows}
        onCancel={handleCancel}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: handleRowSelection,
          }}
          dataSource={requirements}
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default PartList;