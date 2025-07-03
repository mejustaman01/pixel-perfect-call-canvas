
import React from 'react';

interface AudioWaveProps {
  isActive: boolean;
  className?: string;
}

const AudioWave: React.FC<AudioWaveProps> = ({ isActive, className = "" }) => {
  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`w-0.5 bg-white rounded-full transition-all duration-150 ${
            isActive 
              ? 'h-3 animate-pulse' 
              : 'h-1'
          }`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export default AudioWave;
