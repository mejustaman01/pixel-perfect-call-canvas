
import React, { useState, useRef, useEffect } from 'react';
import VideoTile from '../components/VideoTile';
import ControlPanel from '../components/ControlPanel';

const Index = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    getUserMedia();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
  };

  const toggleCamera = () => {
    const newCameraState = !isCameraOff;
    setCameraOff(newCameraState);
    
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !newCameraState;
      });
    }
  };

  const endCall = () => {
    console.log('Call ended');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden relative" style={{ height: '100vh' }}>
      {/* Branding */}
      <div className="absolute top-4 left-4 z-20">
        <span className="text-white text-sm font-medium">Lemonn.ai</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Main Video Area - Julia - increased height by 25px and changed to purple */}
        <div className="w-[70%] max-w-[920px] h-[80%] bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded-lg relative overflow-hidden shadow-2xl">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-600">J</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="text-white text-sm font-medium">Julia</span>
          </div>
        </div>

        {/* User Video Tile - decreased height by 25px and added 300px top padding */}
        <div className="absolute bottom-16 right-[150px] z-10 pt-[300px]">
          <VideoTile
            videoRef={videoRef}
            isCameraOff={isCameraOff}
            isMicMuted={isMicMuted}
            name="You"
            fallbackLetter="Y"
            className="w-[240px] h-[160px]"
          />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onEndCall={endCall}
      />
    </div>
  );
};

export default Index;
