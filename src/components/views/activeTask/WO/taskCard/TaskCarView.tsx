import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Skeleton,
  Table,
} from "antd";

import { ColumnsType } from "antd/es/table";

import Title from "antd/es/typography/Title";
import InstrumentListActiveTask from "@/components/projectask/projectTaskForm/InstrumentListActiveTask";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import moment from "moment";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";

import { setCurrentProjectTaskMaterialRequest } from "@/store/reducers/ProjectTaskSlise";
import { IAreaDTO, IMatData1, IPanelDTO } from "@/types/TypesData";
import { fetchTotalQuantity } from "@/utils/api/thunks";
import { useTranslation } from "react-i18next";
const TaskCardView: FC = () => {
  const { t } = useTranslation();
  const onSearch = (value: string) => console.log(value);
  const [inputSearchValue, setSerchedText] = useState("");
  const [searchIsVisible, setSearchIsVisible] = useState(false);
  const { allMaterials } = useTypedSelector((state) => state.material);
  const dispatch = useAppDispatch();
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const { searchedItemQuantity } = useTypedSelector(
    (state) => state.materialStore
  );
  const [openMaterialList, setOpenMateialList] = useState(false);

  const { currentProject } = useTypedSelector((state) => state.projects);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IMatData1 | null>(null);
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);
  // const label = `${checked ? 'Подтверждаю, что материалы указанные в заявке собраны и готовы к выдаче' : 'Не проверено'}`;
  const label = "Подтверждаю информацию, указанную в заявке";
  const [dataSource, setDataSource] = useState(
    currentProjectTask.materialReuest
  );
  const { searchedAllItemsQuantity, searchedSameItemsQuantity, isLoading } =
    useTypedSelector((state) => state.materialStore);
  // const columnsAplications: ColumnsType<any> = [
  //   {
  //     title: <p className=" my-0 py-0">Номер Заявки</p>,
  //     dataIndex: 'materialAplicationNumber',
  //     key: 'materialAplicationNumber',
  //     responsive: ['sm'],
  //   },

  //   {
  //     title: <p className="text- my-0 py-0">Заказчик</p>,
  //     dataIndex: 'user',
  //     key: 'user',
  //     responsive: ['sm'],
  //   },
  //   {
  //     title: 'Дата создания',
  //     dataIndex: 'createDate',
  //     key: 'createDate',
  //     responsive: ['sm'],
  //     render(text: Date) {
  //       return moment(text).format('Do MMM  YYYY, HH:mm');
  //     },
  //   },
  //   {
  //     title: 'Статус',
  //     dataIndex: 'status',
  //     key: 'status',
  //     responsive: ['sm'],
  //   },
  // ];
  const columnsMat: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: "code",
      key: "code",
      responsive: ["sm"],
    },
    {
      title: "P/N",
      dataIndex: "PN",
      key: "PN",
      responsive: ["sm"],
      // render: (record) => {
      //   return <Paragraph copyable>{record}</Paragraph>;
      // },
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: "Альтернатива",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
    {
      key: "5",
      title: `${t("Actions")}`,
      render: (record: any) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditStudent(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDeleteStudent(record);
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];

  const onDeleteStudent = (record: IMatData1) => {
    Modal.confirm({
      title: "Вы уверены что хотите удалить запись?",
      okText: "Да",
      cancelText: "Отмена",
      okType: "danger",
      onOk: () => {
        dispatch(
          setCurrentProjectTaskMaterialRequest(
            currentProjectTask.materialReuest.filter(
              (item: IMatData1) => item.id !== record.id
            ) || []
          )
        );
      },
      onCancel: () => {
        // setDataSource(currentProjectTask?.material);
        resetEditing();
      },
    });
  };
  const onEditStudent = (record: IMatData1) => {
    setIsEditing(true);
    setEditingStudent({ ...record });
    if (record.PN && record.PN !== "НЕ РЕГЛАМЕНТИРУЕТСЯ") {
      dispatch(
        fetchTotalQuantity(
          String(record.PN || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
    } else
      dispatch(
        fetchTotalQuantity(
          String(record.nameOfMaterial || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
  };
  const resetEditing = () => {
    setIsEditing(false);
    setEditingStudent(null);
    // dispatch(
    // setCurrentProjectTaskMaterialRequest(currentProjectTask.materialReuest);
    // );
  };
  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const [open, setOpen] = useState(false);
  const [openAplications, setOpenAplications] = useState(false);

  // const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  // const { currentProject } = useTypedSelector((state) => state.projects);
  const includeFilterSet = new Set(currentProjectTask.taskId?.accessArr);
  const includeFilterZonesSet = new Set(currentProjectTask.taskId?.zonesArr);

  const { allPanels, allZones } = useTypedSelector((state) => state.tasks);
  const notIncludeFilter: string[] = [];

  allPanels.forEach((item: IPanelDTO) => {
    notIncludeFilter.push(item.panel.trim());
  });
  const notIncludeFilterSet = new Set(notIncludeFilter);
  const filteredPanels = allPanels.filter((e: IPanelDTO) =>
    includeFilterSet.has(e.panel)
  );

  const filteredZones = allZones.filter((e: IAreaDTO) =>
    includeFilterZonesSet.has(e.zone)
  );

  // const objArr: IPanelDTO1[] | [] = currentProjectTask.taskId?.accessArr.map(
  //   (e: string) => ({
  //     access: e,
  //   })
  // );
  interface IAmtossDTO1 {
    amtoss: string;
  }
  const objArrAmtoss = currentProjectTask.taskId?.ammtossArr?.map(
    (e: string) => ({
      amtoss: e,
    })
  );
  // const notFilteredPanels =
  //   objArr.filter((e: IPanelDTO1) => !notIncludeFilterSet.has(e.access)) || [];

  return (
    <div className="flex p-3 flex-col mt-2 mx-auto border-8 border-indigo-600 bg-slate-50  h-[70vh] overflow-y-scroll ">
      <Descriptions
        size="small"
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 2 }}
      >
        <Descriptions.Item label="Taskcard / Задача №">
          <p className="text-l text-center font-semibold my-0">
            {currentProjectTask.optional?.taskNumber}
          </p>
        </Descriptions.Item>

        <Descriptions.Item label="Check / Форма ТО">
          <p className="text-l text-center font-semibold my-0">
            {currentProject.aplicationId.serviceType}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <p className="text-l text-center my-0">
              A/C Registration / Рег. Номер ВС
            </p>
          }
        >
          <p className="text-l text-center font-semibold my-0">
            {currentProject.aplicationId.planeNumber}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label="A/C Type / Тип ВС">
          <p className="text-l text-center font-semibold my-0">
            {currentProject.aplicationId.planeType}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l text-center my-0">Workorder / Заказ №</p>}
        >
          <p className="text-l text-center font-semibold my-0">
            {currentProjectTask.projectTaskWO}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l text-center my-0">Пакет</p>}
        >
          <p className="font-semibold align-middle my-0">
            {`${currentProject.aplicationId.aplicationName}-${currentProjectTask.optional?.WOPackageType}` ||
              ""}
          </p>
        </Descriptions.Item>

        <Descriptions.Item label="Interval /Интервал">
          {currentProjectTask.taskId?.workInterval}
        </Descriptions.Item>
      </Descriptions>
      <Divider className="my-0"></Divider>
      <Descriptions
        size="small"
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 2 }}
      >
        {/* <Descriptions.Item
          label="Operator Revision /
Ревизия программы ТО"
        >
          00
        </Descriptions.Item>
        <Descriptions.Item label="MRB Revision / ИТПТО">-/-</Descriptions.Item> */}
        <Descriptions.Item label="Type Codes / Код Задачи">
          <p className="font-semibold align-middle my-0">
            {currentProjectTask.taskId?.code}
          </p>
        </Descriptions.Item>
      </Descriptions>
      <Divider className="my-0"></Divider>
      <Title className="my-0" level={5}>
        {currentProjectTask.optional?.taskDescription}
      </Title>
      <Descriptions
        size="small"
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Zones / Зона">
          {
            <div className="flex flex-col">
              <List>
                {filteredZones.map((item) => (
                  <li className="">
                    {item.zone} - {item.description}
                  </li>
                ))}
              </List>
            </div>
          }
        </Descriptions.Item>
        <Descriptions.Item label="Panels / Панели доступа">
          {
            <div className="flex flex-col">
              <List>
                {filteredPanels.map((item) => (
                  <li className="">
                    {item.panel} - {item.description}
                  </li>
                ))}
              </List>
              <div>
                {/* {notFilteredPanels &&
                  notFilteredPanels.map((item) => (
                    <div className="inline ">{item.access}, </div>
                  ))} */}
              </div>
            </div>
          }
        </Descriptions.Item>
        <Descriptions.Item label="References / Ссылки">
          <List>
            <div>
              {currentProjectTask.workStepReferencesLinks?.map(
                (item: IReferencesLinkType) => (
                  <li className="uppercase">
                    {item.type}:{item.reference}
                    {item.description && `-${item.description}`}
                  </li>
                )
              ) || [<></>]}
            </div>
          </List>
        </Descriptions.Item>
      </Descriptions>
      <Divider className="my-0"></Divider>

      {/* <div className="flex">
        <Title className="my-0" level={5}>
          Materials / Необходимые материалы
        </Title>
      </div> */}

      {/* <MaterialListActiveTask
        taskNumber={currentProjectTask.taskId?.taskNumber || ''}
      ></MaterialListActiveTask> */}
      <Title className="my-0" level={5}>
        Tools / Необходимое оборудование/инструмент
      </Title>
      <InstrumentListActiveTask
        taskNumber={currentProjectTask.taskId?.taskNumber || ""}
      ></InstrumentListActiveTask>

      {/* <JobDescriptionList data={currentProjectTask.actions} /> */}
      {/* <Divider className="my-0"></Divider> */}
      {/* <Descriptions
        className=" my-0 py-0"
        layout="vertical"
        size="small"
        title={
          <div className="flex justify-between">
            <p className="my-0 py-0">
              Planning Qualifications / Плановые трудозатраты
            </p>
            <p className="px-10 my-0 py-0">Times / Фактические трудозатраты</p>
          </div>
        }
        bordered
        column={{ xxl: 6, xl: 6, lg: 3, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item
          label="PSkill / Scope
Категории исполнителей"
        >
          {null}
        </Descriptions.Item>
        <Descriptions.Item
          label="Est. Man
План. кол-во исполн."
        >
          {currentProjectTask.taskId?.workerNumber}
        </Descriptions.Item>
        <Descriptions.Item
          label="Est. MHRS
          План. трудозатраты"
        >
          <p className="h-2">{currentProjectTask.taskId?.mainWorkTime}</p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="py-3 my-0">Sign / Подпись</p>}>
          <p className="h-1"></p>
          {null}
        </Descriptions.Item>
        <Descriptions.Item
          label="Duration /
            Продолжительность"
        >
          {currentProjectTask.optional?.finalAction?.timeUsed}
        </Descriptions.Item>
        <Descriptions.Item
          label="Date /
            Дата"
        >
          {null}
        </Descriptions.Item>
      </Descriptions> */}

      {/* <Descriptions
        className="w-full mt-2 py-0"
        layout="vertical"
        size="small"
        title="Work Performed / Работа выполнена Заказ закрыт"
        bordered
        column={{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 2 }}
      >
        <Descriptions.Item label="Date(UTC) Time / Дата Время(UTC)">
          {(currentProjectTask.optional?.finalAction?.closingDate &&
            moment(
              currentProjectTask.optional?.finalAction?.closingDate
            ).format('Do MMM  YYYY, h:mm:a')) ||
            null}
        </Descriptions.Item>
        <Descriptions.Item label="Place / Station Место / Станция">
          MSQ
        </Descriptions.Item>
        <Descriptions.Item label="Closing Sign / Stamp Закрыл (Подпись / Штамп)">
          <p className="h-2">
            {currentProjectTask.optional?.finalAction?.closingSing}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label="Double Inspection / Двойной контроль">
          <p className="h-2">
            {currentProjectTask.optional?.finalAction?.DIClosingSing}
          </p>
        </Descriptions.Item>
      </Descriptions> */}
      {/* <div className="flex justify-between">
        <p>
          Time used to perform above Step [HRS:MIN] / Время затраченное на
          выполнение [час.:мин]
        </p>
        <p className="px-1">________ : ________</p>
      </div> */}

      {/*  */}
    </div>
  );
};

export default TaskCardView;
