import React, { useState, useEffect } from 'react';

const UTCClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Форматирование времени в UTC
  const formatTimeUTC = (date: Date) => {
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcSeconds = date.getUTCSeconds();
    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes
      .toString()
      .padStart(2, '0')}:${utcSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, textAlign: 'right' }}>
      <span className="text-xl">{formatTimeUTC(time)}</span>
    </div>
  );
};

export default UTCClock;
