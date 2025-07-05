
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoTile from '../components/VideoTile';
import ControlPanel from '../components/ControlPanel';
import CurrentTime from '../components/CurrentTime';
import { useHeyGenAvatar } from '../hooks/useHeyGenAvatar';
import { Button } from '@/components/ui/button';

const VideoCall = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const navigate = useNavigate();

  // HeyGen avatar integration
  const {
    videoRef: heygenVideoRef,
    isConnected: isHeyGenConnected,
    isLoading: isHeyGenLoading,
    error: heyGenError,
    startSession: startHeyGenSession,
    speak: makeAvatarSpeak,
    endSession: endHeyGenSession
  } = useHeyGenAvatar('Anastasia_Chair_Sitting_public');

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

  // Start HeyGen session when component mounts
  useEffect(() => {
    startHeyGenSession();
  }, []);

  // Demo avatar speaking
  useEffect(() => {
    if (isHeyGenConnected) {
      const speakingTexts = [
        "Hello! I'm Anastasia, your AI assistant.",
        "How can I help you today?",
        "I'm excited to chat with you!",
        "What would you like to talk about?"
      ];
      
      let textIndex = 0;
      const speakingTimer = setInterval(() => {
        makeAvatarSpeak(speakingTexts[textIndex]);
        textIndex = (textIndex + 1) % speakingTexts.length;
      }, 8000); // Speak every 8 seconds

      return () => clearInterval(speakingTimer);
    }
  }, [isHeyGenConnected, makeAvatarSpeak]);

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
      endHeyGenSession();
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
    endHeyGenSession();
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
        {/* Main Video Area - HeyGen Avatar */}
        <div className="w-[calc(70%-100px)] max-w-[820px] h-[80%] bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded-lg relative overflow-hidden shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.05))' }}>
          {isHeyGenConnected ? (
            <video
              ref={heygenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              {isHeyGenLoading ? (
                <>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-purple-600">A</span>
                  </div>
                  <p className="text-lg mb-2">Connecting to Anastasia...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </>
              ) : heyGenError ? (
                <>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-purple-600">A</span>
                  </div>
                  <p className="text-lg mb-2">Failed to connect to avatar</p>
                  <p className="text-sm mb-4">{heyGenError}</p>
                  <Button 
                    onClick={startHeyGenSession}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Retry Connection
                  </Button>
                </>
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-600">A</span>
                </div>
              )}
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <span className="text-white text-sm font-medium">
              {isHeyGenConnected ? 'Anastasia (Live)' : 'Anastasia'}
            </span>
            {isHeyGenConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
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
