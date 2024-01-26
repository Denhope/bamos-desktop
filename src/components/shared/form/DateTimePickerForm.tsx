import React from 'react';
import { Form, Row, Col, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Dayjs } from 'dayjs';

dayjs.extend(utc);

interface DateTimePickerProps {
  form: any;
  dateTime?: string | null;
  dateTimeName: string;
  onDateTimeChange: (dateTime: string | null) => void;
  disabled?: boolean;
  setToNow?: boolean; // новый пропс
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  form,
  dateTime,
  dateTimeName,
  onDateTimeChange,
  disabled,
  setToNow,
}) => {
  const [formDate, setFormDate] = React.useState<Dayjs | null>(
    dateTime ? dayjs(dateTime) : null
  );
  const [formTime, setFormTime] = React.useState<Dayjs | null>(
    dateTime ? dayjs(dateTime) : null
  );

  React.useEffect(() => {
    form.setFieldsValue({
      date: dateTime ? dayjs(dateTime).utc() : null,
      time: dateTime ? dayjs(dateTime).utc() : null,
    });
    if (setToNow && !dateTime) {
      const now = dayjs().utc();
      setFormDate(now);
      setFormTime(now);
      form.setFieldsValue({
        date: now,
        time: now,
      });
    }
  }, [dateTime, setToNow]);

  React.useEffect(() => {
    if (formDate && formTime) {
      const newDateTime = dayjs
        .utc()
        .year(formDate.year())
        .month(formDate.month())
        .date(formDate.date())
        .hour(formTime.hour())
        .minute(formTime.minute())
        .second(0)
        .millisecond(0);
      onDateTimeChange(newDateTime.toISOString());
    } else {
      onDateTimeChange(null);
    }
  }, [formDate, formTime]);

  const handleDateChange = (date: Dayjs | null) => {
    setFormDate(date);
  };

  const handleTimeChange = (time: Dayjs | null) => {
    setFormTime(time);
  };

  return (
    <Form.Item rules={[{ required: true }]} label="Date and Time(UTC)">
      {' '}
      <Row align={'middle'} gutter={[16, 16]}>
        <Col span={10}>
          <Form.Item rules={[{ required: true }]} name="date">
            <DatePicker
              value={formDate}
              onChange={handleDateChange}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item rules={[{ required: true }]} name="time">
            <TimePicker
              value={formTime}
              onChange={handleTimeChange}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );
};

export default DateTimePicker;

// import React, { useEffect } from 'react';
// import { Form, Row, Col, DatePicker, TimePicker } from 'antd';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import { Dayjs } from 'dayjs';

// dayjs.extend(utc);

// interface DateTimePickerProps {
//   form: any;
//   dateTime?: string | null;
//   dateTimeName: string;
//   onDateTimeChange: (dateTime: string | null) => void;
//   disabled?: boolean;
//   setToNow?: boolean; // новый пропс
// }

// const DateTimePicker: React.FC<DateTimePickerProps> = ({
//   form,
//   dateTime,
//   dateTimeName,
//   onDateTimeChange,
//   disabled,
//   setToNow, // новый пропс
// }) => {
//   const [formDate, setFormDate] = React.useState<Dayjs | null>(
//     dateTime ? dayjs(dateTime) : null
//   );
//   const [formTime, setFormTime] = React.useState<Dayjs | null>(
//     dateTime ? dayjs(dateTime) : null
//   );

//   // useEffect(() => {
//   //   if (setToNow) {
//   //     const now = dayjs().utc();
//   //     setFormDate(now);
//   //     setFormTime(now);
//   //   }
//   // }, [setToNow]);

//   useEffect(() => {
//     form.setFieldsValue({
//       date: formDate,
//       time: formTime,
//     });
//     if (formDate && formTime) {
//       const newDateTime = dayjs
//         .utc()
//         .year(formDate.year())
//         .month(formDate.month())
//         .date(formDate.date())
//         .hour(formTime.hour())
//         .minute(formTime.minute())
//         .second(0)
//         .millisecond(0);
//       onDateTimeChange(newDateTime.toISOString());
//     } else {
//       onDateTimeChange(null);
//     }
//   }, [formDate, formTime]);

//   const handleDateChange = (date: Dayjs | null) => {
//     setFormDate(date);
//   };

//   const handleTimeChange = (time: Dayjs | null) => {
//     setFormTime(time);
//   };

//   return (
//     <Form.Item rules={[{ required: true }]} label="Date and Time(UTC)">
//       {' '}
//       <Row align={'middle'} gutter={[16, 16]}>
//         <Col span={10}>
//           <Form.Item rules={[{ required: true }]} name="date">
//             <DatePicker
//               value={formDate}
//               onChange={handleDateChange}
//               disabled={disabled}
//             />
//           </Form.Item>
//         </Col>
//         <Col span={14}>
//           <Form.Item rules={[{ required: true }]} name="time">
//             <TimePicker
//               value={formTime}
//               onChange={handleTimeChange}
//               disabled={disabled}
//             />
//           </Form.Item>
//         </Col>
//       </Row>
//     </Form.Item>
//   );
// };

// export default DateTimePicker;
