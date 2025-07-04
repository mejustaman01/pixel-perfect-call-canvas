
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoTile from '../components/VideoTile';
import ControlPanel from '../components/ControlPanel';
import CurrentTime from '../components/CurrentTime';

const VideoCall = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isJuliaSpeaking, setIsJuliaSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/auth');
      return;
    }
    
    const parsed = JSON.parse(userData);
    if (!parsed.isAuthenticated) {
      navigate('/auth');
    }
  }, [navigate]);

  // Simulate Julia speaking randomly for demo purposes
  useEffect(() => {
    const juliaTimer = setInterval(() => {
      setIsJuliaSpeaking(prev => !prev);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => clearInterval(juliaTimer);
  }, []);

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

        // Set up audio analysis for voice activity detection
        setupAudioAnalysis(mediaStream);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    getUserMedia();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioAnalysis = (mediaStream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const checkAudioLevel = () => {
        if (analyser && !isMicMuted) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setIsUserSpeaking(average > 10); // Threshold for voice activity
        } else {
          setIsUserSpeaking(false);
        }
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

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
    // Navigate back to dashboard instead of just logging
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden relative" style={{ height: '100vh' }}>
      {/* Branding */}
      <div className="absolute top-4 left-4 z-20">
        <span className="text-black text-lg font-medium">Lemonn.ai</span>
      </div>

      {/* Current Time */}
      <CurrentTime />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Main Video Area - Julia */}
        <div className="w-[calc(70%-100px)] max-w-[820px] h-[80%] bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded-lg relative overflow-hidden shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.05))' }}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-600">J</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <span className="text-white text-sm font-medium">Julia</span>
          </div>
        </div>

        {/* User Video Tile */}
        <div className="absolute bottom-16 right-[220px] z-10 pt-[400px]">
          <div style={{ filter: 'drop-shadow(0 0 20px rgba(107, 114, 128, 0.05))' }}>
            <VideoTile
              videoRef={videoRef}
              isCameraOff={isCameraOff}
              isMicMuted={isMicMuted}
              name="You"
              fallbackLetter="Y"
              className="w-[240px] h-[160px]"
              isUserSpeaking={isUserSpeaking}
            />
          </div>
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

export default VideoCall;
