// import React, { useState, useEffect } from 'react';
// import { Form, Input } from 'antd';
// import {
//   ProForm,
//   ProFormGroup,
//   ProFormSelect,
//   ProFormText,
//   ProFormTextArea,
//   ProFormDateTimePicker,
// } from '@ant-design/pro-components';
// import { Split } from '@geoffcox/react-splitter';
// import { useTranslation } from 'react-i18next';
// import dayjs from 'dayjs';
// // import ElectronWindow from '../window/ElectronWindow';
// import TemplateSelector from './TemplateSelector';
// import UserTaskAllocation from './UserTaskAllocation';
// // import { useElectronWindow } from '../../hooks/useElectronWindow';

// interface StepFormProps {
//   task: any;
//   templates: any[];
//   users: any[];
//   skillOptions: any[];
//   zonesValueEnum: Record<string, string>;
//   optionsT: any[];
//   options: any[];
// }

// const StepForm: React.FC<StepFormProps> = () => {
//   // const { submitWindow, windowData } = useElectronWindow();
//   const [form] = Form.useForm();
//   const { t } = useTranslation();

//   const {
//     task,
//     templates,
//     users,
//     skillOptions,
//     zonesValueEnum,
//     optionsT,
//     options,
//   } = windowData || {};

//   // Используем данные, переданные в окно
//   useEffect(() => {
//     if (windowData) {
//       console.log('Setting form values:', windowData); // Для отладки
//       form.setFieldsValue({
//         stepHeadLine: 'mainWork',
//         projectItemType: task?.projectItemType,
//         taskNumber: task?.taskNumber,
//         amtoss: task?.amtoss,
//         status: task?.status,
//         zonesID: task?.zonesID,
//         ata: task?.ata,
//         externalNumber: task?.externalNumber,
//         defectCodeID: task?.defectCodeID,
//       });
//     }
//   }, [windowData, form, task]);

//   const handleSubmit = async (values: any) => {
//     await submitWindow(values);
//   };

//   if (!windowData) {
//     console.log('No window data available'); // Для отладки
//     return null;
//   }

//   console.log('Rendering with data:', {
//     // Для отладки
//     task,
//     templates,
//     users,
//     skillOptions,
//     zonesValueEnum,
//     optionsT,
//     options,
//   });

//   return (
//     <div className="p-4">
//       <Split initialPrimarySize="70%" splitterSize="10px">
//         <div>
//           <ProForm
//             // submitter={false}
//             form={form}
//             layout="horizontal"
//             initialValues={{
//               stepHeadLine: 'mainWork',
//               projectItemType: task?.projectItemType,
//               taskNumber: task?.taskNumber,
//               amtoss: task?.amtoss,
//               status: task?.status,
//               zonesID: task?.zonesID,
//               ata: task?.ata,
//               externalNumber: task?.externalNumber,
//               defectCodeID: task?.defectCodeID,
//               // performedDate: step.createDate,
//             }}
//           >
//             {/* <Form.Item
//                 name="stepType"
//                 label={`${t('STEP_TYPE')}`}
//                 rules={[{ required: true }]}
//               >
//                 <Select>
//                   <Option value="incomingInspection">
//                     {t('INCOMING_INSPECTION')}
//                   </Option>
//                   <Option value="mechanicsProcess">
//                     {t('MECHANIC_PROCESS')}
//                   </Option>

//                   <Option value="inspection">{t('INSPECTION')}</Option>
//                   <Option value="diInspection">{t('DI_INSPECTION')}</Option>

//                   <Option value="technicalControl">
//                     {t('TECHNICAL_CONTROL')}
//                   </Option>
//                   <Option value="coating">{t('COATING')}</Option>
//                   <Option value="marking">{t('MARKERING')}</Option>
//                   <Option value="package">{t('PACKAGE')}</Option>
//                   <Option value="additionalWorks">{t('ADD_WORKS')}</Option>
//                   <Option value="store">{t('STORE')}</Option>
//                   <Option value="mainWork">{t('MAIN WORK')}</Option>
//                 </Select>
//               </Form.Item> */}

//             {/* <ProFormSelect
//                 name="userGroupID"
//                 mode="multiple"
//                 label={t('GROUP')}
//                 options={groupOptions}
//                 // rules={[{ required: true, message: t('PLEASE SELECT A GROUP') }]}
//               /> */}

//             <ProFormGroup>
//               <ProFormText
//                 disabled
//                 // disabled={!order?.projectTaskReferenceID}
//                 width={'md'}
//                 name="taskNumber"
//                 label={t('NUMBER')}
//               />
//               <ProFormSelect
//                 disabled
//                 showSearch
//                 name="projectItemType"
//                 label={t('TYPE')}
//                 width={'md'}
//                 valueEnum={{
//                   RC: {
//                     text: t(
//                       'TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
//                     ),
//                   },
//                   CR_TASK: {
//                     text: t('CR TASK (CRITICAL TASK/DI)'),
//                   },

//                   NRC: { text: t('NRC (Defect)') },
//                   NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
//                   MJC: { text: t('MJC (Extended MPD)') },

//                   CMJC: { text: t('CMJC (Component maintenance) ') },
//                   FC: { text: t('FC (Fabrication card)') },
//                 }}
//               />
//             </ProFormGroup>

//             <ProFormGroup>
//               <ProFormTextArea
//                 disabled
//                 // disabled={!order?.projectTaskReferenceID}
//                 width={'md'}
//                 fieldProps={{
//                   rows: 1, // Устанавливаем количество строк равным 2
//                   // Пример дополнительного стиля
//                 }}
//                 name="amtoss"
//                 label={t('REFERENCE')}
//               />
//               <ProFormSelect
//                 // disabled
//                 name="status"
//                 label={t('STATUS')}
//                 width="sm"
//                 rules={[{ required: true }]}
//                 // initialValue={'draft'}
//                 options={[
//                   { value: 'closed', label: t('CLOSE'), disabled: true },
//                   { value: 'inspect', label: t('INSPECTION') },
//                   { value: 'nextAction', label: t('NEXT ACTION') },
//                   {
//                     value: 'inProgress',
//                     label: t('IN PROGRESS'),
//                   },
//                   { value: 'test', label: t('TEST') },
//                   { value: 'open', label: t('OPEN') },

//                   { value: 'cancelled', label: t('CANCEL'), disabled: true },
//                 ]}
//               />
//             </ProFormGroup>
//             <ProFormGroup>
//               <ProFormText
//                 disabled
//                 // disabled={!order?.projectTaskReferenceID}
//                 width={'md'}
//                 name="externalNumber"
//                 label={t('EXTERNAL NUMBER')}
//               />
//             </ProFormGroup>
//             <ProFormGroup>
//               {task?.projectItemType == 'NRC' && (
//                 <ProFormSelect
//                   disabled
//                   showSearch
//                   rules={[{ required: true }]}
//                   name="ata"
//                   label={t('ATA CHAPTER')}
//                   width="lg"
//                   // initialValue={'draft'}
//                   options={optionsT}
//                 />
//               )}
//               {task?.projectItemType == 'NRC' && (
//                 <ProFormSelect
//                   disabled
//                   rules={[{ required: true }]}
//                   showSearch
//                   name="zonesID"
//                   // mode={'multiple'}
//                   label={t('ZONE')}
//                   width="sm"
//                   valueEnum={zonesValueEnum}

//                   // disabled={!acTypeID}
//                 />
//               )}
//               {task?.projectItemType !== 'NRC' && (
//                 <ProFormSelect
//                   disabled
//                   // rules={[{ required: true }]}
//                   showSearch
//                   name="zonesID"
//                   mode={'multiple'}
//                   label={t('ZONES')}
//                   width="sm"
//                   valueEnum={zonesValueEnum}
//                   // disabled={!acTypeID}
//                 />
//               )}
//             </ProFormGroup>

//             <ProFormGroup>
//               <ProFormSelect
//                 rules={[{ required: true }]}
//                 mode="multiple"
//                 width={'md'}
//                 name="skillID"
//                 label={t('RESPONSIABLE')}
//                 options={skillOptions}
//                 // rules={[{ required: true, message: t('PLEASE SELECT A SKILL') }]}
//               />
//               {task?.projectItemType == 'NRC' && (
//                 <ProFormSelect
//                   showSearch
//                   width={'md'}
//                   // mode="multiple"
//                   name="defectCodeID"
//                   label={t('DEFECT TYPE')}
//                   options={options}
//                   rules={[{ required: true }]}
//                 />
//               )}
//             </ProFormGroup>

//             {/* <Form.Item
//                 name="stepHeadLine"
//                 label="Step Headline"
//                 rules={[{ required: true }]}
//               >
//                 <Input />
//               </Form.Item> */}
//             <Form.Item
//               name="stepDescription"
//               label={t('WORK STEP')}
//               rules={[{ required: true }]}
//             >
//               <Input.TextArea rows={14} />
//             </Form.Item>
//             <ProFormGroup title="PERFORMED">
//               <ProFormGroup>
//                 <ProFormDateTimePicker
//                   // disabled
//                   width={'sm'}
//                   name="performedDate"
//                   label={`${t('DATE & TIME')}`}
//                   // rules={[
//                   //   {
//                   //     required: true,
//                   //     message: t('Please select date and time'),
//                   //   },
//                   // ]}
//                   fieldProps={{
//                     format: 'YYYY-MM-DD HH:mm', // формат без секунд
//                     showTime: {
//                       defaultValue: dayjs('00:00', 'HH:mm'),
//                       format: 'HH:mm',
//                       // disabledHours: disabledDateTime().disabledHours,
//                       // disabledMinutes: disabledDateTime().disabledMinutes,
//                     },
//                     defaultValue: dayjs().utc().startOf('minute'), // Текущее время UTC без секунд
//                     // disabledDate,
//                   }}
//                 />
//               </ProFormGroup>
//               <div className="disabled">
//                 <UserTaskAllocation
//                   isTime
//                   isSingle={true}
//                   users={users}
//                   initialTaskAllocations={[]}
//                   onTaskAllocationsChange={() => {}}
//                   onlyWithOrganizationAuthorization={true}
//                 />
//               </div>
//             </ProFormGroup>
//           </ProForm>
//         </div>
//         <TemplateSelector
//           templates={templates}
//           onSelectTemplate={function (
//             templateId: string,
//             description: string
//           ): void {
//             throw new Error('Function not implemented.');
//           }} // onSelectTemplate={handleSelectTemplate}
//         />
//       </Split>
//     </div>
//   );
// };

// export default StepForm;
