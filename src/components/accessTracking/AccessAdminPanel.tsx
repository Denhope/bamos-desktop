import {
  useGetProjectGroupPanelsQuery,
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
  useUpdateProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import { IProjectItemWO } from '@/models/AC';
import { Button, Col, Modal, Space, Spin, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';
// import data from '../../data/reports/label.xml';

// Читаем содержимое файла label.xml

import AccessDiscription from './AccessDiscription';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  AlertTwoTone,
  UsergroupAddOutlined,
  CheckCircleFilled,
  SwitcherFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { Split } from '@geoffcox/react-splitter';
import AccessCodeTree from './AccessCodeTree';
import AccessCodeForm from './AccessCodeForm';
import { IAccessCode } from '@/models/ITask';
import ReportGenerator from '../shared/ReportPrintLabel';
import ReportEXEL from '../shared/ReportEXEL';
import ReportPrintTag from '../shared/ReportPrintTag';
import {
  useAddBookingMutation,
  useGetFilteredBookingsQuery,
} from '@/features/bookings/bookingApi';
import TableComponent from '../shared/TableComponent';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { USER_ID } from '@/utils/api/http';
import AccessCodeOnlyPanelTree from './AccessCodeOnlyPanelTree';
interface AdminPanelProps {
  projectSearchValues: any;
}
const AccessAdminPanel: React.FC<AdminPanelProps> = ({
  projectSearchValues,
}) => {
  const [editingproject, setEditingproject] = useState<any | null>(null);
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [updateAccess] = useUpdateProjectPanelsMutation({});
  const [addAccessBooking] = useAddBookingMutation({});

  const [triggerQueryBook, setTriggerQueryBook] = useState(false);

  // Проверяем, есть ли accessProjectID и устанавливаем триггер для запроса
  useEffect(() => {
    if (
      (editingproject?.id || editingproject?._id) &&
      editingproject?.accessNbr
    ) {
      setTriggerQueryBook(true);
    }
  }, [editingproject?.id, editingproject?._id]);

  // Запускаем запрос, если triggerQuery true
  const { data: bookings } = useGetFilteredBookingsQuery(
    {
      accessProjectID: editingproject?.id || editingproject?._id,
    },
    {
      skip: !triggerQueryBook, // Пропускаем запрос, если триггер false
    }
  );

  const { data: projectTasks } = useGetProjectTasksQuery(
    { projectId: projectSearchValues?.projectID || '' },
    { skip: !projectSearchValues?.projectID }
  );

  const [pdfData, setPdfData] = useState<string | null>(null);
  // const {
  //   data: accesses,
  //   isLoading,
  //   refetch,
  // } = useGetProjectGroupPanelsQuery(
  //   {
  //     accessProjectNumber: projectSearchValues?.accessProjectNumber,
  //     status: projectSearchValues?.status,
  //     createStartDate: projectSearchValues?.startDate,
  //     createFinishDate: projectSearchValues?.endDate,
  //     projectID: projectSearchValues?.projectID,
  //     // accessType: projectSearchValues?.projectID,
  //     removeUserId: projectSearchValues?.removeUserId,
  //     createUserID: projectSearchValues?.removeUserId,
  //     installUserId: projectSearchValues?.installUserId,
  //     inspectedUserID: projectSearchValues?.inspectedUserID,
  //     acTypeID: projectSearchValues?.acTypeID,
  //     isOnlyWithPanels: projectSearchValues?.isOnlyWithPanels,
  //     userID: projectSearchValues?.userID,
  //   },
  //   {
  //     skip: !triggerQuery, // Skip the query if triggerQuery is false
  //   }
  // );

  const {
    data: accesses,
    isLoading,
    refetch,
  } = projectSearchValues?.isOnlyPanels
    ? useGetProjectPanelsQuery(
        {
          // accessProjectNumber: projectSearchValues?.accessProjectNumber,
          status: projectSearchValues?.status,
          createStartDate: projectSearchValues?.startDate,
          createFinishDate: projectSearchValues?.endDate,
          projectID: projectSearchValues?.projectID,
          // accessType: projectSearchValues?.projectID,
          removeUserId: projectSearchValues?.removeUserId,
          createUserID: projectSearchValues?.removeUserId,
          installUserId: projectSearchValues?.installUserId,
          inspectedUserID: projectSearchValues?.inspectedUserID,
          acTypeID: projectSearchValues?.acTypeID,
          isOnlyWithPanels: projectSearchValues?.isOnlyWithPanels,
          userID: projectSearchValues?.userID,
        },
        { skip: !triggerQuery }
      )
    : useGetProjectGroupPanelsQuery(
        {
          accessProjectNumber: projectSearchValues?.accessProjectNumber,
          status: projectSearchValues?.status,
          createStartDate: projectSearchValues?.startDate,
          createFinishDate: projectSearchValues?.endDate,
          projectID: projectSearchValues?.projectID,
          // accessType: projectSearchValues?.projectID,
          removeUserId: projectSearchValues?.removeUserId,
          createUserID: projectSearchValues?.removeUserId,
          installUserId: projectSearchValues?.installUserId,
          inspectedUserID: projectSearchValues?.inspectedUserID,
          acTypeID: projectSearchValues?.acTypeID,
          isOnlyWithPanels: projectSearchValues?.isOnlyWithPanels,
          userID: projectSearchValues?.userID,
        },
        { skip: !triggerQuery }
      );

  useEffect(() => {
    if (accesses) {
      refetch();
    }
  }, [accesses, refetch, projectSearchValues]);
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: accesses && accesses?.length && accesses[0]?.acTypeID },
    { skip: accesses && !accesses[0]?.acTypeID }
  );

  // const [xmlTemplate, setXmlTemplate] = useState<string>('');

  // useEffect(() => {
  //   const fetchXmlTemplate = async () => {
  //     try {
  //       const response = await fetch('../data/reports/label.xml'); // Путь к вашему файлу label.xml
  //       const xmlTemplate = await response.text();
  //       setXmlTemplate(xmlTemplate);
  //     } catch (error) {
  //       console.error('Ошибка загрузки файла label.xml:', error);
  //     }
  //   };

  //   fetchXmlTemplate();
  // }, []);
  const products = [
    {
      name: 'Ноутбук',
      price: '$1000',
      description:
        'Мощный ноутбук с процессором Core i7 и дискретной графикой.',
      barcode: '1234567890123',
    },
    {
      name: 'Смартфон',
      price: '$500',
      description: 'Смартфон с камерой на 48 Мп и батареей на 5000 мАч.',
      barcode: '9876543210987',
    },
    // Добавьте другие товары по аналогии
  ];
  const xmlTemplate = `
  <Document>
    ${products
      .map(
        (product) => `
      <Label>
        <title>Product Labels</title>
        <Name>${product.name}</Name>
        <Price>${product.price}</Price>
        <Description>${product.description}</Description>
        <Barcode>${product.barcode}</Barcode>
      </Label>
    `
      )
      .join('\n')}
  </Document>
`;

  useEffect(() => {
    // Check if projectSearchValues is defined and not null
    if (projectSearchValues) {
      // Check if there are any search values
      const hasSearchParams = Object.values(projectSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      if (hasSearchParams) {
        setTriggerQuery(true);
      }
    }
  }, [projectSearchValues]);
  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }
  const handleEdit = (project: any) => {
    setEditingproject(project);
  };
  const handleCreate = () => {
    setEditingproject(null);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ACCESS?'),
      onOk: async () => {
        try {
          // await deleteRequirement(companyId).unwrap();
          message.success(t('ACCESS SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ACCESS DELETING ERROR'));
        }
      },
    });
  };
  const handleUpdateOpen = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO OPEN SELECTED ACCESS?'),
      onOk: async () => {
        try {
          const updateResponse = await updateAccess({
            accessIds: selectedKeys,
            status: 'open',
            removeUserId: USER_ID,
          });

          console.log('Update Access Response:', updateResponse);

          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'OPEN_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'OPEN',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();

          console.log('Add Booking Response:', addBookingResponse);

          message.success(t('ACCESS SUCCESSFULLY OPEN'));
          refetch();
        } catch (error) {
          console.error('Error updating access or adding booking:', error);
          message.error(t('ACCESS OPEN ERROR'));
        }
      },
    });
  };
  const handleUpdateClosed = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CLOSED SELECTED ACCESS?'),
      onOk: async () => {
        try {
          await updateAccess({
            accessIds: selectedKeys,
            status: 'closed',
            installUserId: USER_ID,
          });
          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'CLOSE_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'CLOSED',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();
          console.log('Add Booking Response:', addBookingResponse);
          message.success(t('ACCESS SUCCESSFULLY CLOSED'));
          refetch();
        } catch (error) {
          message.error(t('ACCESS CLOSE ERROR'));
        }
      },
    });
  };
  const handleUpdateInspected = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO INSPECT SELECTED ACCESS?'),
      onOk: async () => {
        try {
          await updateAccess({
            accessIds: selectedKeys,
            status: 'inspected',
            inspectedUserID: USER_ID,
          }).unwrap();
          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'INSPECT_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'INSPECTED',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();
          console.log('Add Booking Response:', addBookingResponse);
          message.success(t('ACCESS SUCCESSFULLY INSPECT'));
          refetch();
        } catch (error) {
          message.error(t('ACCESS CLOSE ERROR'));
        }
      },
    });
  };

  // const generatePdf = () => {
  //   // Загрузка XML-шаблона с сервера
  //   // fetch('http://example.com/path/to/label.xml')
  //   //   .then((response) => response.text())
  //   //   .then((data) =>
  //   setPdfData(logoImage);
  //   // )
  //   // .catch((error) => console.error('Ошибка загрузки XML-шаблона:', error));
  // };
  // const generatePdf = () => {
  //   // Загрузка XML-шаблона с сервера
  //   // fetch('file:///D:/dev/bamos/bamos-desktop/src/data/reports/') // Указываем полный путь к файлу
  //   // .then((response) => response.text())
  //   // .then((data) =>
  //   setPdfData(data);
  //   // )
  //   // .catch((error) => console.error('Ошибка загрузки XML-шаблона:', error));
  // };
  const columns = [
    {
      title: t('ACCESS No'),
      dataIndex: ['accessProjectID', 'accessNbr'],
      key: 'accessProjectID.accessNbr',
    },
    {
      title: t('BOOKING TYPE'),
      dataIndex: 'voucherModel',
      key: 'voucherModel',
    },
    {
      title: t('STATUS'),
      dataIndex: 'accessProjectStatus',
      key: 'accessProjectStatus',
    },
    {
      title: t('DATE'),
      dataIndex: 'createDate',
      key: 'createDate',
      render: (text: string | number | Date) => new Date(text).toLocaleString(), // Преобразование даты в строку
    },
    {
      title: t('USER'),
      dataIndex: ['createUserID', 'lastName'],
      key: 'createUserID',
    },
  ];

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <AccessDiscription
            // onRequirementSearch={setRequirement}
            project={editingproject}
          ></AccessDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD ACCESS')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {/* {selectedKeys && ( */}
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<MinusSquareOutlined />}
            onClick={() => handleDelete(editingproject.id || '')}
          >
            {t('DELETE ACCESS')}
          </Button>
          {/* )} */}
        </Col>

        <Col>
          {/* {editingproject && ( */}
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<AlertTwoTone />}
            onClick={() => handleUpdateOpen(selectedKeys)}
          >
            {t('OPEN ACCESS')}
          </Button>
          {/* )} */}
        </Col>
        <Col>
          {/* {editingproject && ( */}
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<CheckCircleFilled />}
            onClick={() => handleUpdateClosed(selectedKeys)}
          >
            {t('CLOSE ACCESS')}
          </Button>
          {/* )} */}
        </Col>
        <Col>
          {/* {editingproject && ( */}
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<CheckCircleFilled />}
            onClick={() => handleUpdateInspected(selectedKeys)}
          >
            {t('INSPECT CLOSE ACCESS')}
          </Button>
          {/* )} */}
        </Col>
        {/* <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<SwitcherFilled />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('CLOSE MANY WORKORDER')}
            </Button>
          )}
        </Col> */}
        <Col style={{ textAlign: 'right' }}>
          {selectedKeys.length > 0 && (
            <>
              <ReportPrintTag
                xmlTemplate={xmlTemplate}
                data={products}
                ids={selectedKeys}
              ></ReportPrintTag>
              {/* <ReportEXEL
                headers={{
                  name: 'Название',
                  price: 'Цена',
                  description: 'Описание',
                  barcode: 'Штрих-код',
                }}
                data={products}
              ></ReportEXEL> */}
            </>
          )}
        </Col>
      </Space>
      <div className="h-[77vh] flex flex-col">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[71vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            {!projectSearchValues?.isOnlyPanels && (
              <AccessCodeTree
                onZoneCodeSelect={handleEdit}
                zoneCodesGroup={accesses || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            )}
            {projectSearchValues?.isOnlyPanels && (
              <AccessCodeOnlyPanelTree
                onZoneCodeSelect={handleEdit}
                accessCode={accesses || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            )}
          </div>
          <div className="h-[69vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col overflow-y-auto">
            {/* <WOAdminForm /> */}
            <Split horizontal initialPrimarySize="60%">
              <div className="overflow-auto h-[57vh]">
                <AccessCodeForm
                  accessesData={accessesData || []}
                  projectTasks={projectTasks || []}
                  accessCode={editingproject}
                  onSubmit={function (accessCode: IAccessCode): void {
                    console.log(accessCode);
                  }}
                ></AccessCodeForm>
              </div>
              <div className="py-5">
                <TableComponent
                  columns={columns}
                  data={editingproject?.accessNbr ? bookings : []}
                ></TableComponent>
              </div>
            </Split>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default AccessAdminPanel;
