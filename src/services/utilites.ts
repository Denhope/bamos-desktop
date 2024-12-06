// @ts-nocheck

import { Excel } from 'antd-table-saveas-excel';
import { v4 as uuidv4 } from 'uuid';
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
import { $authHost } from '@/utils/api/http';
import { IPartNumber } from '@/models/IUser';
import { ITask } from '@/models/ITask';
import { IOrderItem, IRequirement } from '@/models/IRequirement';
// import { fileTypeFromBuffer } from 'file-type';
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

    const extensionMatch = file.name.match(/\.([^.]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : '';
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

      default:
        type = 'application/octet-stream';
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

export async function handleFileOpen(file: any): Promise<void> {
  try {
    const companyID = localStorage.getItem('companyID') || '';
    const fileData = await getFileFromServer(companyID, file.id);

    // Определяем MIME-тип на основе расширения файла
    const mimeType = getMimeType(file.name);

    // Проверяем, можно ли файл открыть внутри браузера
    if (isInlineViewable(mimeType)) {
      // Создаем Blob из файла с соответствующим MIME-типом
      const blob = new Blob([fileData], { type: mimeType });

      // Создаем временный URL для Blob
      const fileURL = window.URL.createObjectURL(blob);

      // Открываем файл в новом окне или вкладке браузера
      const newWindow = window.open(fileURL, '_blank');

      // if (newWindow && mimeType.startsWith('image/')) {
      //   newWindow.print();
      // }

      // Если браузер блокирует открытие файла, предлагаем сохранить его
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === 'undefined'
      ) {
        alert('Заблокировано открытие файла. Пожалуйста, сохраните файл.');
      } else {
        newWindow.focus();
      }

      // Не забываем очищать URL после открытия файла
      window.URL.revokeObjectURL(fileURL);
    } else {
      // Если файл нельзя открыть внутри браузера, предлагаем сохранить его
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([fileData]));
      link.download = file.name;
      link.click();
    }
  } catch (error) {
    console.error('Не удалось открыть файл', error);
  }
}

export async function handleFileOpenTask(
  fileID: any,
  prop?: string,
  name: string
): Promise<void> {
  try {
    const companyID = localStorage.getItem('companyID') || '';
    const fileData = await getFileFromServer(companyID, fileID, prop);

    const mimeType = getMimeType(name);

    // Проверяем, можно ли файл открыть внутри браузера
    if (isInlineViewable(mimeType)) {
      // Создаем Blob из файла с соответствующим MIME-типом
      const blob = new Blob([fileData], { type: mimeType });

      // Создаем временный URL для Blob
      const fileURL = window.URL.createObjectURL(blob);

      // Открываем файл в новом окне или вкладке браузера
      const newWindow = window.open(fileURL, '_blank');

      // if (newWindow && mimeType.startsWith('image/')) {
      //   newWindow.print();
      // }

      // Если браузер блокирует открытие файла, предлагаем сохранить его
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === 'undefined'
      ) {
        alert('Заблокировано открытие файла. Пожалуйста, сохраните файл.');
      } else {
        newWindow.focus();
      }

      // Не забываем очищать URL после открытия файла
      window.URL.revokeObjectURL(fileURL);
    } else {
      // Если файл нельзя открыть внутри браузера, предлагаем сохранить его
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([fileData]));
      link.download = fileID;
      link.click();
    }
  } catch (error) {
    // console.error('Не удалось открыть файл', error);
  }
}

export async function handleOpenReport(
  fileData: any,
  linkD?: any,
  loading?: boolean
): Promise<void> {
  try {
    const mimeType = getMimeType('pdf');
    if (isInlineViewable(mimeType)) {
      // Create a Blob from the file data with the MIME type 'application/pdf'
      const blob = new Blob([fileData], { type: mimeType });

      // Create a URL for the Blob
      const fileURL = URL.createObjectURL(blob);

      // Open the PDF in a new window or tab
      const newWindow = window.open(fileURL, '_blank');

      // If the window was blocked, alert the user to save the file
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === 'undefined'
      ) {
        alert('The PDF file could not be opened. Please save the file.');
      } else {
        newWindow.focus();
      }

      // Revoke the URL to free up memory
      URL.revokeObjectURL(fileURL);
    } else {
      // Если файл нельзя открыть внутри браузера, предлагаем сохранить его
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([fileData]));
      link.download = fileData.name;
      link.click();
    }
  } catch (error) {
    // console.error('Failed to open PDF file', error);
  }
}

function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return `image/${extension}`;
    case 'txt':
    case 'doc':
    case 'docx':
    case 'rtf':
      return `text/${extension}`;
    // Добавьте здесь другие расширения и соответствующие MIME-типы
    default:
      return 'application/octet-stream'; // По умолчанию для неизвестных типов
  }
}

// Функция для проверки, можно ли файл открыть внутри браузера
function isInlineViewable(mimeType: string): boolean {
  // Список MIME-типов, которые можно открывать внутри браузера
  const inlineViewableMimeTypes = [
    'application/pdf',
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',

    // 'text/plain',
    // 'text/txt',
    // 'text/doc',
    // Добавьте здесь другие типы, которые вы хотите открывать внутри браузера
  ];
  return inlineViewableMimeTypes.includes(mimeType);
}
export const transformToIPartNumber = (
  data: any[],
  isToolArray?: string[]
): any[] => {
  // console.log('Input data to transformToIPartNumber:', data); // Вывод входных данных

  const result = data
    .filter(
      (item) => isToolArray && !isToolArray.includes(item.partNumberID?.GROUP)
    )
    .map((item) => ({
      QUANTITY: item.quantity,
      id: item._id,
      status: '',
      _id: item._id,
      partId: item.partNumberID?._id,
      PART_NUMBER: item.partNumberID?.PART_NUMBER,
      DESCRIPTION:
        item.partNumberID?.DESCRIPTION || item.partNumberID?.NAME_OF_MATERIAL,
      TYPE: item.partNumberID?.TYPE,
      GROUP: item.partNumberID?.GROUP,
      UNIT_OF_MEASURE: item.partNumberID?.UNIT_OF_MEASURE,
      UNIT_OF_MEASURE_LONG: item.partNumberID?.UNIT_OF_MEASURE,
      ADD_DESCRIPTION: item.partNumberID?.ADD_DESCRIPTION,
      ADD_UNIT_OF_MEASURE: item.partNumberID?.ADD_UNIT_OF_MEASURE,
      companyID: item.companyID,
      createDate: item.createDate,
      createUserID: item.createUserID?._id,
      updateDate: item.updateDate,
      updateUserID: item.updateUserID?._id,
      acTypeID: '',
    }));

  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};
export const transformToIPart = (data: any[]): any[] => {
  // console.log('Input data to transformToIPartNumber:', data); // Вывод входных данных

  const result = data.map((item) => ({
    ...item,
    DESCRIPTION:
      item?.NAME_OF_MATERIAL?.toUpperCase() || item?.DESCRIPTION?.toUpperCase(),
    AC_TYPE: item?.acTypeID?.code || '',
  }));

  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};
export const transformToIAltPartNumber = (data: any[]): any[] => {
  // console.log('Input data to transformToIPartNumber:', data); // Вывод входных данных

  const result = data?.map((item) => ({
    id: item._id,
    _id: item._id,
    partId: item?.altPartNumberID?._id,
    altPartNumberID: item?.altPartNumberID,
    partNumberID: item?.partNumberID?._id,
    ALTERNATIVE: item?.altPartNumberID?.PART_NUMBER,
    ALTERNATIVE_REMARKS: item.ALTERNATIVE_REMARKS,
    ALTERNATIVE_DESCRIPTION: item?.altPartNumberID?.DESCRIPTION,
    PART_NUMBER: item.partNumberID?.PART_NUMBER,
    PART_DESCRIPTION: item.partNumberID?.DESCRIPTION,
    PART_GROUP: item.partNumberID?.GROUP,
    PART_TYPE: item.partNumberID?.TYPE,
    PART_UNIT_OF_MEASURE: item?.partNumberID?.UNIT_OF_MEASURE,
    ISTWOWAY: item.ISTWOWAY,
    TYPE: item.altPartNumberID?.TYPE,
    GROUP: item.altPartNumberID?.GROUP,
    APPROVED: item.createUserID?.name,
    UNIT_OF_MEASURE: item.altPartNumberID?.UNIT_OF_MEASURE,
    ADD_DESCRIPTION: item.altPartNumberID?.ADD_DESCRIPTION,
    ADD_UNIT_OF_MEASURE: item.altPartNumberID?.ADD_UNIT_OF_MEASURE,
    companyID: item.companyID,
    createDate: item?.createDate,
    createUserID: item.createUserID?._id,
    updateDate: item.updateDate,
    updateUserID: item.updateUserID?._id,
    AC_TYPE: item?.partNumberID?.acTypeID?.code || '',
  }));

  console.log('Output data from transformToALTIPartNumber:', result); // Вывод результата
  return result;
};

export const transformToIStockPartNumber = (data: any[]): any[] => {
  // console.log('Input data to transformToIPartNumber:', data); // Вывод входных данных

  const result = data.map((item) => ({
    ...item,
    STOCK: item?.storeID?.storeShortName,
    STORE_ID: item?.storeID?._id,
    LOCATION: item?.locationID?.locationName,

    files: item?.FILES || item?.files,
    OWNER: item?.locationID?.ownerID?.title,
    restrictionID: item?.locationID?.restrictionID,
    locationType: item?.locationID?.locationType,
    SUPPLIER_BATCH_NUMBER: item?.SUPPLIER_BATCH_NUMBER,
    PRODUCT_EXPIRATION_DATE: item?.PRODUCT_EXPIRATION_DATE || item?.nextDueMOS,
    SERIAL_NUMBER: item?.SERIAL_NUMBER,
    RECEIVING_NUMBER: item?.RECEIVING_ID?.receivingNumber,
    DOC_NUMBER: item?.RECEIVING_ID?.awbNumber || item?.DOC_NUMBER,
    DOC_TYPE: item?.RECEIVING_ID?.awbType || item?.DOC_TYPE,
    DOC_DATE: item?.RECEIVING_ID?.awbDate || item?.DOC_DATE,
    RECEIVING_DATE: item?.RECEIVING_ID?.receivingDate || item?.RECEIVING_DATE,
  }));

  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};

export const transformedAccessToIAssess = (data: any[]): any[] => {
  console.log('Input data to Access:', data); // Вывод входных данных

  const result = data.map((item) => ({
    ...item,
    accessNbr: item?.accessProjectID?.accessNbr,
    userName: item?.createUserID?.name,
  }));

  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};
export const transformedAccessToTable = (data: any[]): any[] => {
  // console.log('Input data to Access:', data); // Вывод входных данных

  const result = data.map((item) => ({
    ...item,
    ...item?.areaCodeID,
    status: item.status,
    _id: item?.id || item?._id,
    id: item?.id || item?._id,
  }));

  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};

export const transformToIRequirement = (data: any[]): any[] => {
  // console.log('Input data to transformToIPartNumber:', data); // Вывод входных данных
  const result = data?.map((item) => ({
    ...item,
    QUANTITY: item.quantity,

    availableAllStoreQTY: item?.availableAllStoreQTY,
    restrictedAllStoreQTY: item?.restrictedAllStoreQTY,
    requestQuantity: item?.requestQuantity,
    pickSlipNumber: item?.pickSlipID?.pickSlipNumberNew,
    amout: item.amout,
    availableQTY: item?.availableQTY,
    _id: item?.id || item?._id,
    plannedDate: item?.plannedDate,
    note: item?.note,
    status: item?.status,
    reqTypesID: item.reqTypesID,
    neededOnID: item?.neededOnID,
    neededOnIDTitle: item?.neededOnID?.title,
    projectID: item?.projectID,
    projectTaskID: item?.projectTaskID,
    partNumberID: item?.partNumberID,
    serialNumber: item?.serialNumber,
    partRequestNumberNew: item?.partRequestNumberNew,
    projectWO: item?.projectID?.projectWO,
    WONumber: item?.projectID?.WOReferenceID?.WONumber,
    projectTaskWO: item.projectTaskID?.taskWO,
    partId: item.partNumberID?._id,
    PART_NUMBER: item?.partNumberID?.PART_NUMBER,
    DESCRIPTION: item?.partNumberID?.DESCRIPTION,
    TYPE: item?.partNumberID?.TYPE,
    GROUP: item?.partNumberID?.GROUP,
    UNIT_OF_MEASURE: item?.partNumberID?.UNIT_OF_MEASURE,
    UNIT_OF_MEASURE_LONG: item?.partNumberID?.UNIT_OF_MEASURE,
    ADD_DESCRIPTION: '', // Добавить описание, если требуется
    ADD_UNIT_OF_MEASURE: item?.partNumberID?.ADD_UNIT_OF_MEASURE,
    companyID: item?.companyID,
    createDate: item?.createDate,
    createUserID: item?.createUserID?._id,
    updateDate: item?.updateDate,
    updateUserID: item?.updateUserID ? item.updateUserID?._id : '',

    acTypeID: item?.acTypeID, // Добавить тип AC, если требуется,
  }));
  console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};
export const transformToIPickSlip = (data: any[]): any[] => {
  console.log('Input data to transformToIPickslipr:', data); // Вывод входных данных
  const result = data?.map((item) => ({
    ...item,
    status: item?.state,
    getFromID: item?.getFromID?._id,
    store: item?.getFromID?.storeShortName,
    // neededOnID: item?.neededOnID?._id,
    neededOnIDTitle: item?.neededOnID?.title,
    // projectID: item?.projectID?._id,
    // projectTaskID: item?.projectTaskID?._id,
    projectWO: item?.projectID?.projectWO,
    projectTaskWO: item.projectTaskID?.taskWO,
    companyID: item?.companyID,
    createDate: item?.createDate,
    createUserID: item?.createUserID,
    createUserName: item?.createUserID?.name,
    updateDate: item?.updateDate,
    updateUserID: item?.updateUserID ? item.updateUserID : '',
    WONumber: item?.projectID?.WOReferenceID?.WONumber,
    // id: item.id,
  }));
  // console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};
export interface ValueEnumType {
  onQuatation: string;
  partlyCanceled?: string;
  open?: string;
  closed: string;
  canceled: string;
  CLOSED?: string;
  cancelled?: string;
  onOrder: string;
  onShort: string;
  draft: string;
  issued: string;
  inProgress?: string;
  complete: string;
  RECEIVED?: string;
  PARTLY_RECEIVED?: string;
  CANCELLED?: string;
  partyCancelled?: string;
  partlyClosed?: string;
  inspect?: string;
  performed?: string;
  inspected?: string;
  DRAFT?: string;
  OPEN?: string;
  progress?: string;
  nextAction?: string;
  needInspection?: string;
  COMPLETED?: string;
}
export interface ValueEnumType {
  onQuatation: string;
  partlyCanceled?: string;
  open?: string;
  closed: string;
  canceled: string;
  cancelled: string;
  onOrder: string;
  onShort: string;
  draft: string;
  issued: string;
  inProgress?: string;
  complete: string;
  RECEIVED?: string;
  PARTLY_RECEIVED?: string;
  CANCELLED?: string;
  partyCancelled?: string;
  partlyClosed?: string;
  inspect?: string;
  performed?: string;
  inspected?: string;
  DRAFT?: string;
  OPEN?: string;
  progress?: string;
  test?: string;
}
export interface ValueEnumTypeTask {
  RC: string;
  CR_TASK: string;
  NRC: string;
  MJC: string;
  CMJC: string;
  FC: string;
  NRC_ADD: string;
  PART_PRODUCE?: string;
  SMC?: string;
  HARD_ACCESS?: string;
}
export interface ValueEnumTypeOrder {
  PURCHASE_ORDER: string;
  QUOTATION_ORDER: string;
}
// export const getTypeOrderColor = (
//   projectItemType: keyof ValueEnumTypeOrder
// ): string => {
//   switch (projectItemType) {
//     case 'PURCHASE_ORDER':
//       return '#D3D3D3'; // Light Gray

//       return '#D3D3D3'; // Light Gray
//     case 'QUOTATION_ORDER':
//       return '#FFD700'; // Light Gray

//     default:
//       return ''; // Default color
//   }
// };
// export const getTaskTypeColor = (
//   projectItemType: keyof ValueEnumTypeTask
// ): string => {
//   switch (projectItemType) {
//     case 'RC':
//       return '#D3D3D3'; // Light Gray
//     case 'CR_TASK':
//       return '#800080'; // Light Gray
//     case 'SB':
//       return '#800080'; // Light Gray

//     case 'MJC':
//       return '#D3D3D3'; // Light Gray
//     case 'CMJC':
//       return '#D3D3D3'; // Light Gray
//     case 'FC':
//       return '#FFA07A'; // Light Salmon
//     case 'SMC':
//       return '#FFA07A'; // Light Salmon
//     case 'PART_PRODUCE':
//       return '#FFA07A'; // Light Salmon

//     case 'NRC':
//       return '#FF6347'; // Tomato Red
//     case 'NRC_ADD':
//       return '#FF6347'; // Tomato Red

//     default:
//       return ''; // Default color
//   }
// };
export const getTypeOrderColor = (
  projectItemType: keyof ValueEnumTypeOrder
): string => {
  switch (projectItemType) {
    case 'PURCHASE_ORDER':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'QUOTATION_ORDER':
      return 'rgba(255, 215, 0, 0.6)'; // Gold with less transparency
    default:
      return ''; // Default color
  }
};

export const getTaskTypeColor = (
  projectItemType: keyof ValueEnumTypeTask
): string => {
  switch (projectItemType) {
    case 'RC':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'CR_TASK':
      return 'rgba(128, 0, 128, 0.6)'; // Dark Blue with less transparency
    case 'SB':
      return 'rgba(128, 0, 128, 0.6)'; // Dark Blue with less transparency
    case 'MJC':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'CMJC':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'FC':
      return 'rgba(255, 160, 122, 0.6)'; // Light Salmon with less transparency
    case 'SMC':
      return 'rgba(255, 160, 122, 0.6)'; // Light Salmon with less transparency
    case 'PART_PRODUCE':
      return 'rgba(255, 160, 122, 0.6)'; // Light Salmon with less transparency
    case 'NRC':
      return 'rgba(255, 99, 71, 0.6)'; // Tomato Red with less transparency
    case 'NRC_ADD':
      return 'rgba(255, 99, 71, 0.6)';
    case 'HARD_ACCESS':
      return 'rgba(255, 215, 0, 0.6)'; // // Tomato Red with less transparency
    default:
      return ''; // Default color
  }
};
export const getStatusColor = (status: keyof ValueEnumType): string => {
  switch (status) {
    case 'draft':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'DRAFT':
      return 'rgba(211, 211, 211, 0.6)'; // Light Gray with less transparency
    case 'onShort':
      return 'rgba(255, 160, 122, 0.6)'; // Light Salmon with less transparency
    case 'inspect':
      return 'rgb(255, 182, 46)'; // Light Salmon with less transparency
    case 'inspected':
      return 'rgb(255, 182, 46)'; // Light Salmon with less transparency
    case 'progress':
      return 'rgb(252, 252, 60)'; // Dark Blue with less transparency
    case 'inProgress':
      return 'rgb(252, 252, 60)'; // Dark Blue with less transparency
    case 'onQuatation':
      return 'rgba(255, 215, 0, 0.6)'; // Gold with less transparency
    case 'complete':
      return 'rgba(255, 215, 0, 0.6)'; // Gold with less transparency
    case 'open':
      return 'rgb(52, 155, 240)'; // Sky Blue with less transparency
    case 'OPEN':
      return 'rgb(52, 155, 240)'; // Sky Blue with less transparency
    case 'closed':
      return 'rgb(112, 255, 84)'; // Lime Green with less transparency
    case 'CLOSED':
      return 'rgb(112, 255, 84)'; // Lime Green with less transparency
    case 'RECEIVED':
      return 'rgba(50, 205, 50, 0.6)'; // Lime Green with less transparency
    case 'PARTLY_RECEIVED':
      return 'rgba(144, 238, 144, 0.6)'; // Light Green with less transparency
    case 'performed':
      return 'rgba(144, 238, 144, 0.6)'; // Light Green with less transparency

    case 'COMPLETED':
      return 'rgba(144, 238, 144, 0.6)'; // Light Green with less transparency
    case 'canceled':
      return 'rgb(255, 82, 82)'; // Tomato Red with less transparency
    case 'cancelled':
      return 'rgb(255, 82, 82)'; // Tomato Red with less transparency
    case 'partlyCanceled':
      return 'rgb(255, 82, 82)'; // Tomato Red with less transparency
    case 'CANCELLED':
      return 'rgb(255, 82, 82)'; // Tomato Red with less transparency
    case 'partyCancelled':
      return 'rgb(255, 82, 82)'; // Tomato Red with less transparency
    case 'onOrder':
      return 'rgba(255, 160, 122, 0.6)'; // Light Salmon with less transparency
    case 'transfer':
      return 'rgba(255, 215, 0, 0.6)'; // Dark Blue with less transparency

    case 'needInspection':
      return 'rgba(255, 215, 0, 0.6)'; // Dark Blue with less transparency
    case 'nextAction':
      return 'rgb(217, 148, 248)'; // Dark Blue with less transparency
    case 'issued':
      return 'rgba(128, 0, 128, 0.6)';
    case 'test':
      return 'rgb(127, 251, 255)'; // Dark Blue with less transparency
    default:
      return ''; // Default color
  }
};
// export const getStatusColor = (status: keyof ValueEnumType): string => {
//   switch (status) {
//     case 'draft':
//       return '#D3D3D3'; // Light Gray
//     case 'DRAFT':
//       return '#D3D3D3'; // Light Gray
//     case 'onShort':
//       return '#FFA07A'; // Light Salmon
//     case 'inspect':
//       return '#FFA07A'; // Light Salmon
//     case 'inspected':
//       return '#FFA07A'; // Light Salmon
//     case 'progress':
//       return '#800080'; // Dark Blue
//     case 'inProgress':
//       return '#800080'; // Dark Blue
//     case 'onQuatation':
//       return '#FFD700'; // Gold
//     case 'complete':
//       return '#FFD700'; // Gold
//     case 'open':
//       return '#00008B'; // Sky Blue
//     case 'OPEN':
//       return '#00008B'; // Sky Blue
//     case 'closed':
//       return '#32CD32'; // Lime Green
//     case 'RECEIVED':
//       return '#32CD32'; // Lime Green
//     case 'PARTLY_RECEIVED':
//       return '#90EE90'; // Light Green
//     case 'performed':
//       return '#90EE90'; // Light Green
//     case 'partlyClosed':
//       return '#90EE90'; // Light Green
//     case 'canceled':
//       return '#FF6347'; // Tomato Red
//     case 'cancelled':
//       return '#FF6347'; // Tomato Red
//     case 'partlyCanceled':
//       return '#FF6347'; // Tomato Red
//     case 'CANCELLED':
//       return '#FF6347'; // Tomato Red
//     case 'partyCancelled':
//       return '#FF6347'; // Tomato Red
//     case 'onOrder':
//       return '#FFA07A'; // Light Salmon
//     case 'transfer':
//       return '#FFD700'; // Dark Blue
//     case 'issued':
//       return '#800080'; // Dark Blue
//     default:
//       return ''; // Default color
//   }
// };

export const transformToITask = (data: ITask[]): any[] => {
  const result = data.map((item: ITask) => ({
    ...item,
    QUANTITY: item.quantity,
    id: item._id || item?.id,
    status: item?.status,
    _id: item._id || item?.id,
    taskNumber: item?.taskNumber,
    description: item?.taskDescription,
    allTaskTime: item?.allTaskTime,
    mainWorkTime: item?.mainWorkTime,
    partId: item.partNumberID?._id,
    PART_NUMBER: item.partNumberID?.PART_NUMBER,
    DESCRIPTION: item.partNumberID?.DESCRIPTION,
    REVISION: item.partNumberID?.REVISION,
    TYPE: item.partNumberID?.TYPE,
    GROUP: item.partNumberID?.GROUP,
    UNIT_OF_MEASURE: item.partNumberID?.UNIT_OF_MEASURE,
    UNIT_OF_MEASURE_LONG: item.partNumberID?.UNIT_OF_MEASURE,
    ADD_DESCRIPTION: item.partNumberID?.ADD_DESCRIPTION,
    ADD_UNIT_OF_MEASURE: item.partNumberID?.ADD_UNIT_OF_MEASURE,
    companyID: item.companyID,
    createDate: item.createDate,
    createUserID: item.createUserID?._id,
    updateDate: item.updateDate,
    updateUserID: item.updateUserID?._id,
    acTypeID: item?.acTypeId,
    partNumberID: item?.partNumberID,
  }));

  console.log('Output data from transformToIPartNumber:', result); // Вывод результата
  return result;
};

export const transformToIORderItem = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    id: item._id || item.id,
    status: item?.state,
    _id: item._id || item.id,
    orderNumber: item.orderID?.orderNumberNew,
    orderID: item?.orderID,
    orderType: item?.orderID?.orderType,
    index: item?.index + 1,
    PART_NUMBER: item?.partID?.PART_NUMBER,
    DESCRIPTION: item.partID?.DESCRIPTION,
    TYPE: item?.partID?.TYPE,
    GROUP: item.partID?.GROUP,
    UNIT_OF_MEASURE: item.partID?.UNIT_OF_MEASURE,
    vendorCode: item?.vendorID?.CODE,
    companyID: item?.companyID,
    createDate: item?.createDate,
    createUserID: item?.createUserID?._id,
    createUserName: item?.createUserID?.name,
    updateDate: item.updateDate,
    updateUserID: item?.updateUserID?._id,
    partNumberID: item?.partID,
    amout: item?.amout,
    allPrice: item?.allPrice,
    currency: item.currency,
    backorderQty: item?.backorderQty,
    paymentTerms: item?.paymentTerms,
    leadTime: item?.leadTime,
    requirementsID: item?.requirementsID,
    nds: item?.nds,
    price: item?.price,
    files: item?.files,
  }));

  return result;
};
export const transformToPickSlipItemItem = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    ...item,
    // id: item?._id || item?.id,
    status: item?.state,
    // _id: item?._id || item?.id,
    orderID: item?.orderID,
    orderType: item?.orderID?.orderType,
    index: item?.index,
    PART_NUMBER: item.partNumberID?.PART_NUMBER,
    DESCRIPTION: item.partNumberID?.DESCRIPTION,
    TYPE: item.partNumberID?.TYPE,
    GROUP: item.partNumberID?.GROUP,
    UNIT_OF_MEASURE: item.partNumberID?.UNIT_OF_MEASURE,

    companyID: item.companyID,
    createDate: item.createDate,
    createUserID: item.createUserID?._id,
    createUserName: item.createUserID?.name,
    updateDate: item.updateDate,
    updateUserID: item.updateUserID?._id,
    partNumberID: item?.partNumberID,
    requirementsID: item?.requirementsID,

    files: item?.files,
  }));

  return result;
};

export const transformToPartBooking = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    ...item,
    ...item.MATERIAL_STORE_ID,
    QUANTITY:
      parseInt(
        `${item.qyantityMode === 'minus' ? '-' : ''}${
          item.MATERIAL_STORE_ID?.QUANTITY ||
          item?.MATERIAL_STORE_ID?.ADD_QUANTITY
        }`,
        10
      ) || item.QUANTITY,
    SERIAL_NUMBER:
      item?.MATERIAL_STORE_ID?.SERIAL_NUMBER || item?.SERIAL_NUMBER,
    SHELF_NUMBER:
      item.MATERIAL_STORE_ID?.locationID?.locationName || item?.SHELF_NUMBER,
    files: item.MATERIAL_STORE_ID?.FILES,
    CREATE_BY: item?.createUserID?.name || item?.userID?.name,

    // index: item?.index,
    // PART_NUMBER: item.MATERIAL_STORE_ID?.PART_NUMBER,
    // DESCRIPTION: item.MATERIAL_STORE_ID?.NAME_OF_MATERIAL,
    // TYPE: item.MATERIAL_STORE_ID?.TYPE,
    // GROUP: item.MATERIAL_STORE_ID?.GROUP,
    // UNIT_OF_MEASURE: item.MATERIAL_STORE_ID?.UNIT_OF_MEASURE,

    // companyID: item.companyID,
    // createDate: item.createDate,
    // createUserID: item.createUserID?._id,
    // createUserName: item.createUserID?.name,
    // updateDate: item.updateDate,
    // updateUserID: item.updateUserID?._id,
    // partNumberID: item?.partNumberID,
    // requirementsID: item?.requirementsID,

    // files: item?.files,
  }));

  return result;
};
export const transformToIRecevingItems = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    ...item,
    ...item?.MATERIAL_STORE_ID,
  }));

  return result;
};

export const transformToPickSlipItemBooked = (data: any[]): any[] => {
  const result = data.flatMap((item: any) => {
    // Создаем новый объект с теми же свойствами, что и item

    const newItem = { ...item };

    // Проверяем, пустой ли bookedItems
    if (!newItem.bookedItems || newItem.bookedItems.length === 0) {
      newItem.bookedItems = [
        {
          id: uuidv4(), // Добавляем уникальный идентификатор
          requestedPartNumberID: newItem.partNumberID._id,
          PART_NUMBER_REQUEST: newItem.partNumberID?.PART_NUMBER,
          requestedQty: newItem.requestedQty,
          pickSlipItemID: newItem.id,
          pickSlipID: newItem.pickSlipID,
          projectID: newItem.projectID?._id,
          projectTaskID: newItem.projectTaskID?._id,
          requirementID: newItem?.requirementID?._id,
          projectWO: newItem?.projectID?.projectWO,
          projectTaskWO: newItem.projectTaskID?.taskWO,
          registrationNumber: newItem?.projectID?.acRegistrationNumber,

          status: 'progress',
        },
      ];
    } else {
      // Если bookedItems не пустой, добавляем уникальный идентификатор к каждому элементу
      newItem.bookedItems = newItem.bookedItems.map((bookedItem: any) => ({
        ...bookedItem,
        ...bookedItem?.storeItemID,
        // ...bookedItem?.projectID,
        // ...bookedItem.projectTaskID,
        id: bookedItem._id || bookedItem.id,

        PART_NUMBER_REQUEST: bookedItem?.requestedPartNumberID?.PART_NUMBER,
        requestedPartNumberID: bookedItem?.requestedPartNumberID?._id,
        requestedQty: bookedItem?.requestedQty || newItem.requestedQty,
        canceledQty: bookedItem.canceledQty,
        // projectID: bookedItem.projectID?._id,
        // projectTaskID: bookedItem.projectTaskID?._id,
        projectWO: bookedItem?.projectID?.projectWO,
        projectTaskWO: bookedItem.projectTaskID?.taskWO,
        registrationNumber: bookedItem?.projectID?.acRegistrationNumber,
        PART_NUMBER_BOOKED: bookedItem?.storeItemID?.PART_NUMBER,
        DESCRIPTION: bookedItem?.storeItemID?.NAME_OF_MATERIAL,
        GROUP: bookedItem?.storeItemID?.GROUP,
        CONDITION: bookedItem?.storeItemID?.CONDITION,
        TYPE: bookedItem?.storeItemID?.TYPE,
        SERIAL_NUMBER:
          bookedItem?.storeItemID?.SERIAL_NUMBER ||
          bookedItem?.storeItemID?.SUPPLIER_BATCH_NUMBER,
        PRODUCT_EXPIRATION_DATE:
          bookedItem?.storeItemID?.PRODUCT_EXPIRATION_DATE,
        UNIT_OF_MEASURE: bookedItem?.storeItemID?.UNIT_OF_MEASURE,
        LOCAL_ID: bookedItem?.storeItemID?.LOCAL_ID,
        OWNER: bookedItem?.storeItemID?.locationID?.ownerID?.title,
        STORE: bookedItem?.storeItemID?.storeID?.storeShortName,
        LOCATION: bookedItem?.storeItemID?.locationID?.locationName,
        state: bookedItem.status,
        files: bookedItem?.storeItemID?.files || bookedItem?.storeItemID?.FILES,
      }));
    }

    return newItem.bookedItems;
  });
  console.log(result);
  return result;
};

export const transformToIProjectItem = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    ...item,
    ...item?.taskNumberID,
    zonesID: item?.zonesID,
    id: item?.id,
    ...item.createUserID,
    taskType: item.taskType,
    _id: item?.id || item._id,
    reference: item?.reference,
  }));

  console.log('Output data from transformToIProjectItem:', result); // Вывод результата
  return result;
};

export const transformToIProjectTask = (data: any[]): any[] => {
  const result = data.map((item: any) => ({
    ...item?.taskId,
    ...item,
    ...item?.partNumberID,
    // QUANTITY: item.quantity,
    id: item._id || item?.id,
    // status: item?.status,
    _id: item._id || item?.id,
    zonesID: item?.zonesID,
    accessID: item?.accessID,
    projectWO: item?.projectID?.projectWO,
    projectName: item?.projectID?.projectName,
    mainWorkTime: item?.mainWorkTime || item?.taskId?.mainWorkTime,
    files: item?.FILES || item?.files || [],
    taskDescription: item?.taskDescription,
    amtoss: item?.taskId?.amtoss || item?.refTask,

    // taskNumber: item?.taskNumber,
    // description: item?.taskDescription,
    // allTaskTime: item?.allTaskTime,
    // partId: item.partNumberID?._id,
    // PART_NUMBER: item.partNumberID?.PART_NUMBER,
    // DESCRIPTION: item.partNumberID?.DESCRIPTION,
    // TYPE: item.partNumberID?.TYPE,
    // GROUP: item.partNumberID?.GROUP,
    // UNIT_OF_MEASURE: item.partNumberID?.UNIT_OF_MEASURE,
    // UNIT_OF_MEASURE_LONG: item.partNumberID?.UNIT_OF_MEASURE,
    // ADD_DESCRIPTION: item.partNumberID?.ADD_DESCRIPTION,
    // ADD_UNIT_OF_MEASURE: item.partNumberID?.ADD_UNIT_OF_MEASURE,
    // companyID: item.companyID,
    // createDate: item.createDate,
    // createUserID: item.createUserID?._id,
    // updateDate: item.updateDate,
    // updateUserID: item.updateUserID?._id,
    // acTypeID: item?.acTypeId,
    // partNumberID: item?.partNumberID,
  }));

  return result;
};
type Role =
  | 'admin'
  | 'engineer'
  | 'planning'
  | 'logistic'
  | 'storeMan'
  | 'director'
  | 'technican';
export const rolePermissions: Record<Role, string[]> = {
  admin: [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24'
  ],
  technican: ['02', '05', '06', '08', '10', '12', '15', '21','22'],
  engineer: [
    '01',
    '02',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '12',
    '13',
    '15',
    '16',
    '20',
    '21',
    '22'
  ],
  planning: [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '12',
    '13',
    '15',
    '16',
    '20',
    '21',
    '22',
    '23'
  ],
  logistic: [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22'
  ],
  storeMan: [
    '01',
    '02',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '22'
  ],
  director: [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22'
  ],
};

export const filterAPNByRole = (apnList: any[], userRole: Role) => {
  const userPermissions = rolePermissions[userRole] || [];
  return apnList.filter((apn) => userPermissions.includes(apn.APNNBR));
};

export const getDefectTypes = (t: TFunction) => [
  { value: 'FINDING', label: t('FINDING') },
  { value: 'CLEANING', label: t('CLEANING') },
  { value: 'STRUCTURAL_DAMAGE', label: t('STRUCTURAL_DAMAGE') },
  { value: 'PAINTING', label: t('PAINTING') },
  { value: 'ADD ACCESS', label: t('ADD ACCESS') },
];

export const getAtaChapters = (t: TFunction) => [
  { value: '05', label: '05-TIME_LIMITS/MAINTENANCE_CHECKS' },
  { value: '06', label: '06-DIMENSIONS_AND_AREAS' },
  { value: '07', label: '07-LIFTING_AND_SHORING' },
  { value: '08', label: '08-LEVELING_AND_WEIGHING' },
  { value: '09', label: '09-TOWING_AND_TAXIING' },
  { value: '10', label: '10-PARKING_AND_MOORING' },
  { value: '11', label: '11-PLACARDS_AND_MARKINGS' },
  { value: '12', label: '12-SERVICING' },
  { value: '20', label: '20-STANDARD_PRACTICES' },
  { value: '21', label: '21-AIR_CONDITIONING' },
  { value: '22', label: '22-AUTOFLIGHT' },
  { value: '23', label: '23-COMMUNICATIONS' },
  { value: '24', label: '24-ELECTRICAL_POWER' },
  { value: '25', label: '25-EQUIPMENT/FURNISHINGS' },
  { value: '26', label: '26-FIRE_PROTECTION' },
  { value: '27', label: '27-FLIGHT_CONTROLS' },
  { value: '28', label: '28-FUEL' },
  { value: '29', label: '29-HYDRAULIC_POWER' },
  { value: '30', label: '30-ICE_AND_RAIN_PROTECTION' },
  { value: '31', label: '31-INDICATING/RECORDING_SYSTEMS' },
  { value: '32', label: '32-LANDING_GEAR' },
  { value: '33', label: '33-LIGHTS' },
  { value: '34', label: '34-NAVIGATION' },
  { value: '35', label: '35-OXYGEN' },
  { value: '36', label: '36-PNEUMATIC' },
  { value: '38', label: '38-WATER/WASTE' },
  { value: '44', label: '44-CABIN_SYSTEMS' },
  { value: '46', label: '46-INFORMATION_SYSTEMS' },
  { value: '47', label: '47-INERT_GAS_SYSTEM' },
  { value: '49', label: '49-AUXILIARY_POWER_UNIT' },
  { value: '51', label: '51-STRUCTURES' },
  { value: '52', label: '52-DOORS' },
  { value: '53', label: '53-FUSELAGE' },
  { value: '54', label: '54-NACELLES/PYLONS' },
  { value: '55', label: '55-STABILIZERS' },
  { value: '56', label: '56-WINDOWS' },
  { value: '57', label: '57-WINGS' },
  { value: '70', label: '70-STANDARD_PRACTICES' },
  { value: '71', label: '71-POWER_PLANT' },
  { value: '72', label: '72-ENGINE' },
  { value: '73', label: '73-ENGINE_FUEL_AND_CONTROL' },
  { value: '74', label: '74-IGNITION' },
  { value: '75', label: '75-AIR' },
  { value: '76', label: '76-ENGINE_CONTROLS' },
  { value: '77', label: '77-ENGINE_INDICATION' },
  { value: '78', label: '78-EXHAUST' },
  { value: '79', label: '79-OIL' },
  { value: '80', label: '80-STARTING' },
];
export enum SubscriptionType {
  NewPickslip = 'newPickSlip',
  OtherEventType = 'otherEventType',
  NewTask = 'newTask',
  NewRequirement = 'newRequirement',
  TechnicalRequest = 'technicalRequest',
  PickSlipUpdate = 'pickSlipUpdate',
  NewPartNumber = 'newPartNumber',
  AddAlternative = 'addAlternative',
  PickslipError = 'pickslipError',
  TaskError = 'taskError',
  BugReport = 'bugReport',
}

// Создание массива объектов с метками для каждого типа подписки
export const getSubscriptionTypes = (t) => [
  { value: SubscriptionType.NewTask, label: t('New Task') },
  { value: SubscriptionType.NewPickslip, label: t('New Pickslip') },
  { value: SubscriptionType.PickSlipUpdate, label: t('PickSlip Update') },
  { value: SubscriptionType.NewRequirement, label: t('New Requirement') },
  { value: SubscriptionType.TechnicalRequest, label: t('New Technical Request') },
  { value: SubscriptionType.NewPartNumber, label: t('New Part Number') },
  { value: SubscriptionType.AddAlternative, label: t('Add Alternative') },
  { value: SubscriptionType.PickslipError, label: t('Pickslip Error') },
  { value: SubscriptionType.TaskError, label: t('Task Error') },
  { value: SubscriptionType.BugReport, label: t('Bug Report') },
];

// Тип для типа подписки
export type SubscriptionTypeValue = SubscriptionType;
