// columnSearch.ts
import { Button, Input, Popover, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

interface ColumnSearchProps<T> {
  dataIndex: string;
  onSearch: (value: string) => void;
  data: T[];
}

// export const useColumnSearchProps = <T extends object>({
//   dataIndex,
//   onSearch,
//   data,
// }: ColumnSearchProps<T>) => {
//   const [searchText, setSearchText] = useState('');
//   const [filteredData, setFilteredData] = useState(data);

//   const handleSearch = (value: string) => {
//     setSearchText(value);
//     onSearch(value);
//     if (value) {
//       // Отфильтруйте данные на основе поискового запроса
//       const filtered = data.filter((item) =>
//         Object.values(item).some((val) =>
//           val.toString().toLowerCase().includes(value.toLowerCase())
//         )
//       );
//       setFilteredData(filtered);
//     } else {
//       // Отобразите все данные, если поисковый запрос пуст
//       setFilteredData(data);
//     }
//   };

//   const handleReset = () => {
//     setSearchText('');
//     setFilteredData(data);
//     onSearch('');
//   };

//   return {
//     filterIcon: (
//       <SearchOutlined style={{ color: searchText ? 'blue' : undefined }} />
//     ),
//     filterDropdown: (
//       <>
//         <Input
//           value={searchText}
//           placeholder={`Search ${dataIndex}`}
//           onChange={(e) => handleSearch(e.target.value)}
//           style={{ marginBottom: 16 }}
//           suffix={
//             <SearchOutlined
//               style={{ color: searchText ? 'blue' : undefined }}
//             />
//           }
//         />
//         <Space>
//           <Button onClick={handleReset}>Reset</Button>
//           <Button type="primary" onClick={() => onSearch(searchText)}>
//             OK
//           </Button>
//         </Space>
//       </>
//     ),
//     dataIndex,
//     filteredData,
//   };
// };

// Измененная функция useColumnSearchProps
export const useColumnSearchProps = <T extends object>({
  dataIndex,
  onSearch,
  data,
}: ColumnSearchProps<T> & { dataIndex: string | string[] }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (value: string) => {
    setSearchText(value);
    onSearch(value);
    if (value) {
      const filtered = data.filter((item) =>
        Array.isArray(dataIndex)
          ? ((item as any)[dataIndex[0]][dataIndex[1]] as any)
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : ((item as any)[dataIndex] as any)
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleReset = () => {
    setSearchText('');
    setFilteredData(data);
    onSearch('');
  };

  return {
    filterIcon: (
      <SearchOutlined style={{ color: searchText ? 'blue' : undefined }} />
    ),
    filterDropdown: (
      <>
        <Input
          value={searchText}
          placeholder={`Search ${dataIndex}`}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          suffix={
            <SearchOutlined
              style={{ color: searchText ? 'blue' : undefined }}
            />
          }
        />
        <Space>
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary" onClick={() => handleSearch(searchText)}>
            OK
          </Button>
        </Space>
      </>
    ),
    filteredData,
  };
};
