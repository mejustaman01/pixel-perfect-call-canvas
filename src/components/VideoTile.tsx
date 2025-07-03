import React, { useEffect } from 'react';
import { MicOff } from 'lucide-react';
import AudioWave from './AudioWave';

interface VideoTileProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  isCameraOff: boolean;
  isMicMuted?: boolean;
  name: string;
  fallbackLetter: string;
  className?: string;
  isUserSpeaking?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
  videoRef,
  isCameraOff,
  isMicMuted,
  name,
  fallbackLetter,
  className = "w-[240px] h-[160px]",
  isUserSpeaking = false
}) => {
  // Ensure video element updates when camera state changes
  useEffect(() => {
    if (videoRef?.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      
      videoTracks.forEach(track => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff, videoRef]);

  return (
    <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg relative overflow-hidden shadow-lg`}>
      {!isCameraOff && videoRef ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">{fallbackLetter}</span>
          </div>
        </div>
      )}
      
      {/* Mute indicator - only shows when muted */}
      {isMicMuted && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 p-1 rounded-full">
          <MicOff size={10} className="text-white" />
        </div>
      )}
      
      {/* Name label with audio wave */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <span className="text-white text-xs font-medium">{name}</span>
        <AudioWave isActive={isUserSpeaking && !isMicMuted} />
      </div>
    </div>
  );
};

export default VideoTile;
