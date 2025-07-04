
import React, { useState, useEffect } from 'react';

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <span className="text-black text-sm font-medium bg-white bg-opacity-30 px-2 py-1 rounded">
        {formatTime(currentTime)}
      </span>
    </div>
  );
};

export default CurrentTime;
