import { Excel } from 'antd-table-saveas-excel';

import { IProjectTaskAll } from '@/models/IProjectTask';

import {
  ITaskType,
  IDTO,
  IMatData,
  IMatData1,
  IInstData1,
  IPanelDTO,
  IPanelDTO1,
  IAreaDTO,
  IInspectionScopeDTO,
  ITaskTypeUpdate,
  IAmtossNewData,
} from '@/types/TypesData';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MenuProps } from 'antd';
import { getFileFromServer } from '@/utils/api/thunks';

export const includeTasks = (
  arrayOfAllObjectsData: ITaskType[],
  arrayOfCheakObjectData: IDTO[]
) => {
  const includeTaskFilter: string[] = [];
  arrayOfCheakObjectData.forEach((task: IDTO) => {
    includeTaskFilter.push(
      String(
        task.taskNumber
          // ?.trim()
          ?.replace(/Изм.00/g, '')
          ?.replace(/Изм. 00/g, '')
          ?.replace(/Изм.03/g, '')
          ?.replace(/,Изм.00/g, '')
          ?.replace(/, Изм.00/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.trim()
      )
    );
    // includeTaskFilter.push(task.taskNumber?.replace(/ Изм.00/g, '').trim());
  });

  const findDuplicates = (arr: any) =>
    arr.filter((item: any, index: any) => arr.indexOf(item) !== index);
  const duplicates = findDuplicates(includeTaskFilter);

  const includeFilterSet = new Set(includeTaskFilter);
  const includeDuplicatesSet = new Set(duplicates);

  const filteredItemsUnic = arrayOfAllObjectsData.filter((e) =>
    includeFilterSet.has(
      String(e.taskNumber)
        ?.replace(/Изм.00/g, '')
        ?.replace(/Изм. 00/g, '')
        ?.replace(/Изм.03/g, '')
        ?.replace(/Изм.01/g, '')
        ?.replace(/,Изм.00/g, '')
        ?.replace(/, Изм.00/g, '')
        ?.replace(/Изм. 01/g, '')
        .trim()
    )
  );
  const filteredItemsDuplicates = arrayOfAllObjectsData.filter((e) =>
    includeDuplicatesSet.has(String(e.taskNumber))
  );

  const filteredItems = [...filteredItemsUnic, ...filteredItemsDuplicates];

  return filteredItems;
};

export const notIncludeTasks = (
  arrayOfAllObjectsData: ITaskType[],
  arrayOfCheakObjectData: IDTO[]
) => {
  const notIncludeTaskFilter: string[] = [];
  arrayOfAllObjectsData.forEach((task: ITaskType) => {
    notIncludeTaskFilter.push(
      String(
        task.taskNumber
          ?.replace(/Изм.00/g, '')
          ?.replace(/Изм.03/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.replace(/, Изм.00/g, '')
          ?.replace(/Изм. 00/g, '')
          ?.trim()
      )
    );
  });
  const notIncludeFilterSet = new Set(notIncludeTaskFilter);
  const unKnownTasks = arrayOfCheakObjectData.filter(
    (e) =>
      !notIncludeFilterSet.has(
        String(e.taskNumber)
          ?.replace(/Изм.00/g, '')
          ?.replace(/Изм. 00/g, '')
          ?.replace(/Изм.03/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/, Изм.00/g, '')
          ?.trim()
      )
  );
  // console.log(notIncludeTaskFilter);
  // console.log(unKnownTasks);
  return unKnownTasks;
};

export const saveExls = (columns: any, dataSource: any, fileName: string) => {
  const excel = new Excel();
  excel
    .addSheet('test')
    .addColumns(columns)
    .addDataSource(dataSource, {
      str2Percent: true,
    })
    .saveAs(`${fileName}.xlsx`);
};
export const saveNewData = (data: ITaskType[]) => {
  let taskAsccessArrAll: string[][] = [];
  const tasksAccessArr: string[] = [];
  const newData: ITaskType[] = [];

  data.forEach((task: ITaskType) => {
    if (task !== undefined) {
      tasksAccessArr.push(task?.access);
      let access = String(task?.access) || '';
      let zones = String(task?.area) || '';
      let amtoss = String(task?.amtoss) || '';
      let amtossNewRev = task.ammtossArrNew.join('\n');
      let re = /\s*;\s*|\s*,\s*|\s*\r\n\s*|\s*\n\s*/;
      let accessList = access.split(re);
      let zonesList = zones.split(re);
      let amtossList = amtoss.split(re);
      let Obj: ITaskType = JSON.parse(JSON.stringify(task));
      Obj['accessArr'] = accessList.filter(
        (x) => /^[1-8]/.exec(x) && x.length > 2
      );
      Obj['hardAccess'] = accessList.filter(
        (x) =>
          !/^[1-8]/.exec(x) &&
          x.length > 2 &&
          !/(ПРЯМОЙ)/.exec(x) &&
          !/(ПРИМЕЧАНИЕ)/.exec(x)
      );
      Obj['zonesArr'] = zonesList;
      Obj['ammtossArr'] = amtossList;
      Obj['amtossNewRev'] = amtossNewRev;
      delete Obj.id;

      newData.push(Obj);
    }
  });
  return newData;
};

export const arrayToCSV = (arr: any[], delimiter = ',') =>
  arr
    .map((v) =>
      v
        .map((x: any) => (isNaN(x) ? `"${x.replace(/"/g, '""')}"` : x))
        .join(delimiter)
    )
    .join('\n');
export const filteredInstrument = (
  currentProjectTask: IProjectTaskAll,
  allInstruments: IInstData1[]
) => {
  const dataArr: any[] = [2];

  const arrayOfAllObjectsData: IInstData1[] = allInstruments;
  const includeTaskFilter: string[] = [];
  dataArr.forEach((task: any) => {
    // includeTaskFilter.push(taskNumber);
    includeTaskFilter.push(
      String(
        currentProjectTask.optional?.taskNumber
          // ?.trim()
          ?.replace(/Изм.00/g, '')
          ?.replace(/Изм. 00/g, '')
          ?.replace(/Изм.03/g, '')
          ?.replace(/,Изм.00/g, '')
          ?.replace(/, Изм.00/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.trim()
      )
    );
  });

  const includeFilterSet = new Set(includeTaskFilter);

  const filteredItems = arrayOfAllObjectsData.filter((e) =>
    // includeFilterSet.has(e.taskNumber)
    includeFilterSet.has(
      String(e.taskNumber)
        ?.replace(/Изм.00/g, '')
        ?.replace(/Изм. 00/g, '')
        ?.replace(/Изм.03/g, '')
        ?.replace(/Изм.01/g, '')
        ?.replace(/,Изм.00/g, '')
        ?.replace(/, Изм.00/g, '')
        ?.replace(/Изм. 01/g, '')
        .trim()
    )
  );

  const allInstrCopy: IInstData1[] = JSON.parse(JSON.stringify(filteredItems));
  const instruments = allInstrCopy.reduce((acc: IInstData1[], entry) => {
    const code = entry.code;
    const instName = entry.nameOfInstrument;
    const pn = entry.PN;

    let sameInstr = acc.find(
      (element: IInstData1) =>
        (element.code === code &&
          element.PN === pn &&
          element.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfInstrument === instName) ||
        (element.PN === 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfInstrument === instName) ||
        (element.PN === 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfInstrument === instName &&
          element.code === code)
    );

    if (sameInstr && sameInstr.amout && entry.amout) {
      sameInstr.amout += Number(entry.amout);
    } else acc.push(entry);

    return acc;
  }, []);
  return instruments;
};
export const filterMaterial = (
  currentProjectTask: IProjectTaskAll,
  allMaterials: IMatData1[]
) => {
  const dataArr: any[] = [2];

  //отфильтрованные материалы по задачам
  const arrayOfAllObjectsData: IMatData1[] = allMaterials;
  const includeTaskFilter: string[] = [];
  dataArr.forEach((task: any) => {
    // includeTaskFilter.push(taskNumber);
    includeTaskFilter.push(
      String(
        currentProjectTask.optional?.taskNumber
          //       // ?.trim()
          ?.replace(/Изм.00/g, '')
          ?.replace(/Изм. 00/g, '')
          ?.replace(/Изм.03/g, '')
          ?.replace(/,Изм.00/g, '')
          ?.replace(/, Изм.00/g, '')
          ?.replace(/Изм.01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.replace(/Изм. 01/g, '')
          ?.trim()
      )
    );
  });

  const includeFilterSet = new Set(includeTaskFilter);

  const filteredItems = arrayOfAllObjectsData.filter((e) =>
    // includeFilterSet.has(e.taskNumber)
    includeFilterSet.has(
      String(e.taskNumber)
        ?.replace(/Изм.00/g, '')
        ?.replace(/Изм. 00/g, '')
        ?.replace(/Изм.03/g, '')
        ?.replace(/Изм.01/g, '')
        ?.replace(/,Изм.00/g, '')
        ?.replace(/, Изм.00/g, '')
        ?.replace(/Изм. 01/g, '')
        .trim()
    )
  );

  const allMatCopy: IMatData1[] = JSON.parse(JSON.stringify(filteredItems));
  const materials = allMatCopy.reduce((acc: IMatData1[], entry) => {
    const code = entry.code;
    const matName = entry.nameOfMaterial;
    const pn = entry.PN;

    let sameMaterial = acc.find(
      (element: IMatData1) =>
        (element.code === code &&
          element.PN === pn &&
          element.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfMaterial === matName) ||
        (element.PN === 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfMaterial === matName) ||
        (element.PN === 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
          element.nameOfMaterial === matName &&
          element.code === code)
    );

    if (sameMaterial && sameMaterial.amout && entry.amout) {
      sameMaterial.amout += Number(entry.amout);
    } else acc.push(entry);

    return acc;
  }, []);
  return materials;
  // console.log(materials);
  // dispatch(setCurrentProjectTaskMaterial(materials));
};

export const filteredIncludePanels = (
  currentProjectTask: IProjectTaskAll,
  allPanels: IPanelDTO[]
) => {
  const includeFilterSet = new Set(currentProjectTask.taskId?.accessArr);
  const includeFilterZonesSet = new Set(currentProjectTask.taskId?.zonesArr);

  // const { allPanels, allZones } = useTypedSelector((state) => state.tasks);
  const notIncludeFilter: string[] = [];

  allPanels.forEach((item: IPanelDTO) => {
    notIncludeFilter.push(item.panel.trim());
  });
  const notIncludeFilterSet = new Set(notIncludeFilter);
  const filteredPanels = allPanels.filter((e: IPanelDTO) =>
    includeFilterSet.has(e?.panel)
  );

  // const filteredZones = allZones.filter((e: IAreaDTO) =>
  //   includeFilterZonesSet.has(e.zone)
  // );

  // const objArr: IPanelDTO1[] | [] = currentProjectTask.taskId?.accessArr.map(
  //   (e: string) => ({
  //     access: e,
  //   })
  // );
  interface IAmtossDTO1 {
    amtoss: string;
  }
  // const objArrAmtoss = currentProjectTask.taskId?.ammtossArr?.map(
  //   (e: string) => ({
  //     amtoss: e,
  //   })
  // );
  // const notFilteredPanels = objArr.filter(
  //   (e: IPanelDTO1) => !notIncludeFilterSet.has(e.access)
  // );

  let panelsIncludeArr = filteredPanels.map((item) => {
    let newObj = {
      panel: item.panel,
      description: item.description,
    };

    return newObj;
  });

  return panelsIncludeArr;
};
export const filteredNotIncludePanels = (
  currentProjectTask: IProjectTaskAll,
  allPanels: IPanelDTO[]
) => {
  const notIncludeFilter: string[] = [];
  allPanels.forEach((item: IPanelDTO) => {
    notIncludeFilter.push(item.panel.trim());
  });

  const notIncludeFilterSet = new Set(notIncludeFilter);

  const objArr: IPanelDTO1[] | [] = currentProjectTask.taskId?.accessArr.map(
    (e: string) => ({
      access: e || '',
    })
  );
  interface IAmtossDTO1 {
    amtoss: string;
  }

  const notFilteredPanels = objArr.filter(
    (e: IPanelDTO1) => !notIncludeFilterSet.has(e.access)
  );

  let panelsNotIncludeArr = notFilteredPanels.map((item) => {
    let newObj = {
      panel: item.access,
      description: '',
    };

    return newObj;
  });

  return panelsNotIncludeArr;
};
export const filteredZones = (
  currentProjectTask: IProjectTaskAll,
  allZones: IAreaDTO[]
) => {
  const includeFilterZonesSet = new Set(currentProjectTask.taskId?.zonesArr);
  const filteredZones = allZones.filter((e: IAreaDTO) =>
    includeFilterZonesSet.has(e.zone)
  );

  let zonesIncludeArr = filteredZones.map((item) => {
    let newObj = {
      zone: item.zone,
      description: item.description?.toLocaleUpperCase(),
    };
    return newObj;
  });

  return zonesIncludeArr;
};

export const inspectionScopes = (
  currentProjectTask: IProjectTaskAll,
  allInspectionScopes: IInspectionScopeDTO[]
) => {
  const includeFilterInspectionScopeSet = new Set([
    currentProjectTask.taskId?.taskNumber || '',
  ]);
  const filteredInspectionScopes = allInspectionScopes.filter(
    (e: IInspectionScopeDTO) =>
      includeFilterInspectionScopeSet.has(e.taskNumber)
  );

  let inspectionScopeIncludeArr = filteredInspectionScopes.map((item) => {
    let newObj = {
      taskNumber: item.taskNumber,
      inspectionScope: item.inspectionScope,
    };
    return newObj;
  });

  return inspectionScopeIncludeArr;
};

export const compareArrays = (arr1: ITaskType[], arr2: IDTO[]) => {
  const updatedArr = arr1.map((obj1) => {
    const obj2 = arr2.find(
      (obj2) =>
        obj2.taskNumber ===
        String(
          obj1.taskNumber
            ?.replace(/Изм.00/g, '')
            ?.replace(/Изм. 00/g, '')
            ?.replace(/Изм.03/g, '')
            ?.replace(/Изм.01/g, '')
            ?.replace(/,Изм.00/g, '')
            ?.replace(/, Изм.00/g, '')
            ?.replace(/Изм. 01/g, '')
            .trim()
        )
    );
    if (obj2) {
      return {
        ...obj1,
        WOCustomer: obj2.WOCustomer || '',
        MJSSNumber: obj2.id || '',
        WOPackageType: obj2.WOPackageType || '',
        position: obj2.position || '',
        amtoss: obj2.amtoss || '',
      };
    } else {
      return obj1;
    }
  });
  return updatedArr;
};

export const compareForPrint = (arr1: any[]) => {
  const updatedArr = arr1.map((obj1) => {
    return {
      PART_NUMBER: obj1.PN.toUpperCase() || '',
      NAME_OF_MATERIAL: obj1.description.toUpperCase() || '',
      QUANTITY: obj1.quantity || 0,
      UNIT_OF_MEASURE: obj1.unit.toUpperCase() || '',
    };
  });
  return updatedArr;
};

export const compareAndAdd = (arr1: ITaskType[], arr2: IAmtossNewData[]) => {
  arr1.forEach((obj1) => {
    if (obj1.ammtossArr && Array.isArray(obj1.ammtossArr)) {
      obj1.ammtossArrNew = [];
      obj1.ammtossArr.forEach((amtoss) => {
        arr2.forEach((obj2) => {
          if (obj2.ammtossOld === amtoss) {
            obj1.ammtossArrNew.push(obj2.ammtossNew);
          }
        });
      });
    }
  });
  //console.log(arr1);
};

export const getUniqueAmtossArrNew = (
  arr: IProjectTaskAll[],
  arr2: IAmtossNewData[]
) => {
  const sumArr: string[] = [];
  const uniqueAmtossArrNew: string[] = [];
  const amtossArrNewSet = new Set();

  arr.forEach((obj1) => {
    if (
      obj1.taskId?.ammtossArrNew &&
      Array.isArray(obj1.taskId.ammtossArrNew)
    ) {
      obj1.taskId?.ammtossArrNew.forEach((amtoss) => {
        sumArr.push(amtoss);
      });
    }
  });

  uniqueAmtossArrNew.push(...new Set(sumArr));

  return arr2.filter((obj2) => uniqueAmtossArrNew.includes(obj2.ammtossNew));
};

export const calculateTime = (
  currentTime: string,
  interval: string
): string => {
  let [currentHours, currentMinutes] = currentTime.split(':').map(Number);
  let [intervalHours, intervalMinutes] = interval.split(':').map(Number);
  let totalMinutes = currentMinutes + intervalMinutes;
  let totalHours = currentHours + intervalHours + Math.floor(totalMinutes / 60);
  let remainingMinutes = totalMinutes % 60;
  return `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;
};

export const exportToExcel = (
  exportAllRows: boolean,
  selectedRowKeys: React.Key[],
  selectedColumns: any,
  data: any,
  title: string,
  column?: any
) => {
  // Filter the data to only include the selected rows (if exportAllRows is false) and columns
  const filteredData = data
    .filter(
      (row: any) => exportAllRows || selectedRowKeys.includes(row._id || row.id)
    )
    .map((row: any) =>
      Object.fromEntries(
        Object.entries(row).filter(([key]) => selectedColumns.includes(key))
      )
    );
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    `${title}.xlsx`
  );
};

export const tagInfo: { [key: string]: { color: string; tagShort: string } } = {
  'AC/DC ON': { color: 'green', tagShort: 'AC/DC' },
  'AC/DC OFF': { color: 'red', tagShort: 'AC/DC' },
  'A/C ON JACKs': { color: 'yellow', tagShort: 'jack' },
  'AIRCRAFT JACKING': { color: 'yellow', tagShort: 'jack' },
  'ENG RUN': { color: 'yellow', tagShort: 'ERUN' },
  'APU RUN': { color: 'yellow', tagShort: 'ARUN' },
  ACT: { color: 'yellow', tagShort: 'ACT' },
  DEFUELING: { color: 'yellow', tagShort: 'DEFL' },
  'FUEL TANKS': { color: 'yellow', tagShort: 'DEFL' },
  'HYD ON': { color: 'green', tagShort: 'HYD' },
  'HYD OFF': { color: 'red', tagShort: 'HYD' },
  'GROUND CART': { color: 'yellow', tagShort: 'GRC' },
  'SLATS EXTENDED': { color: 'yellow', tagShort: 'SEXT' },
  'SPOILERS EXTENDED': { color: 'yellow', tagShort: 'SPEXT' },
  'FLAPS EXTENDED': { color: 'yellow', tagShort: 'FEXT' },
  WATER: { color: 'yellow', tagShort: 'WAT' },
  WASTE: { color: 'yellow', tagShort: 'WAS' },
  // Добавьте остальные теги здесь...
  // Добавьте остальные теги здесь...
};

export type MenuItem = Required<MenuProps>['items'][number];

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  // path?: any,
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    // path,
    type,
  } as MenuItem;
}

export async function handleFileSelect(file: {
  id: string;
  name: string;
}): Promise<void> {
  try {
    const companyID = localStorage.getItem('companyID') || '';
    const fileData = await getFileFromServer(companyID, file.id);

    // Определите MIME-тип на основе расширения файла
    const extension = file.name.split('.').pop();
    let type = '';
    switch (extension) {
      case 'pdf':
        type = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg';
        break;
      case 'png':
        type = 'image/png';
        break;
      case 'gif':
        type = 'image/gif';
        break;
      case 'txt':
        type = 'text/plain';
        break;
      case 'doc':
      case 'docx':
        type = 'application/msword';
        break;
      case 'xls':
      case 'xlsx':
        type = 'application/vnd.ms-excel';
        break;
      case 'ppt':
      case 'pptx':
        type = 'application/vnd.ms-powerpoint';
        break;
      case 'zip':
        type = 'application/zip';
        break;
      case 'rar':
        type = 'application/x-rar-compressed';
        break;
      // добавьте больше случаев для других типов файлов...
      default:
        type = 'application/octet-stream'; // общий тип для двоичных файлов
    }

    // Создайте Blob из файла
    const blob = new Blob([fileData], { type: type });

    // Создайте временный URL для Blob
    const fileURL = window.URL.createObjectURL(blob);

    // Выведите URL файла в консоль
    console.log(fileURL);

    // Создайте ссылку для скачивания файла
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = file.name; // Используйте имя файла
    link.click();
  } catch (error) {
    console.error('Не удалось получить файл', error);
  }
}

// export const valueEnumCurrency = {
//   USD: `USD/${t('USD/US Dollar').toUpperCase()}`,
//   EUR: `EUR/${t('EUR/Euro').toUpperCase()}`,
//   GBP: `GBP/${t('GBP/British Pound').toUpperCase()}`,
//   JPY: `JPY/${t('JPY/Japanese Yen').toUpperCase()}`,
//   AUD: `AUD/${t('AUD/Australian Dollar').toUpperCase()}`,
//   CAD: `CAD/${t('CAD/Canadian Dollar').toUpperCase()}`,
//   CHF: `CHF/${t('CHF/Swiss Franc').toUpperCase()}`,
//   CNY: `CNY/${t('CNY/Chinese Yuan').toUpperCase()}`,
//   HKD: `HKD/${t('HKD/Hong Kong Dollar').toUpperCase()}`,
//   NZD: `NZD/${t('NZD/New Zealand Dollar').toUpperCase()}`,
//   SEK: `SEK/${t('SEK/Swedish Krona').toUpperCase()}`,
//   KRW: `KRW/${t('KRW/South Korean Won').toUpperCase()}`,
//   SGD: `SGD/${t('SGD/Singapore Dollar').toUpperCase()}`,
//   NOK: `NOK/${t('NOK/Norwegian Krone').toUpperCase()}`,
//   MXN: `MXN/${t('MXN/Mexican Peso').toUpperCase()}`,
//   INR: `INR/${t('INR/Indian Rupee').toUpperCase()}`,
//   RUB: `RUB/${t('RUB/Russian Ruble').toUpperCase()}`,
//   ZAR: `ZAR/${t('ZAR/South African Rand').toUpperCase()}`,
//   BRL: `BRL/${t('BRL/Brazilian Real').toUpperCase()}`,
//   TWD: `TWD/${t('TWD/New Taiwan Dollar').toUpperCase()}`,
// };

// export const valueEnumUnit = {
//   EA: `EA/${t('EA/EACH').toUpperCase()}`,
//   M: `M/${t('Meters').toUpperCase()}`,
//   ML: `ML/${t('Milliliters').toUpperCase()}`,
//   SI: `SI/${t('Sq Inch').toUpperCase()}`,
//   CM: `CM/${t('Centimeters').toUpperCase()}`,
//   GM: `GM/${t('Grams').toUpperCase()}`,
//   YD: `YD/${t('Yards').toUpperCase()}`,
//   FT: `FT/${t('Feet').toUpperCase()}`,
//   SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
//   IN: `IN/${t('Inch').toUpperCase()}`,
//   SH: `SH/${t('Sheet').toUpperCase()}`,
//   SM: `SM/${t('Sq Meters').toUpperCase()}`,
//   RL: `RL/${t('Roll').toUpperCase()}`,
//   KT: `KT/${t('Kit').toUpperCase()}`,
//   LI: `LI/${t('Liters').toUpperCase()}`,
//   KG: `KG/${t('Kilograms').toUpperCase()}`,
//   JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
// };
