
import React, { useState, useRef, useEffect } from 'react';
import VideoTile from '../components/VideoTile';
import ControlPanel from '../components/ControlPanel';
import ChatWindow from '../components/ChatWindow';

const Index = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    setCameraOff(!isCameraOff);
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
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
        {/* Main Video Area - Stuti Mishra */}
        <div className="w-[60%] max-w-[720px] h-[70%] bg-gradient-to-br from-green-600 via-green-500 to-green-400 rounded-lg relative overflow-hidden shadow-2xl">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-green-600">S</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="text-white text-sm font-medium">Stuti Mishra</span>
          </div>
        </div>

        {/* User Video Tile */}
        <div className="absolute bottom-16 right-[150px] z-10">
          <VideoTile
            videoRef={videoRef}
            isCameraOff={isCameraOff}
            isMicMuted={isMicMuted}
            name="You"
            fallbackLetter="Y"
          />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        isChatOpen={isChatOpen}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleChat={toggleChat}
        onEndCall={endCall}
      />

      {/* Chat Window */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Index;
