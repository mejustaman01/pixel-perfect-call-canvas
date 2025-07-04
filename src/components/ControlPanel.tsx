
import React from 'react';
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from 'lucide-react';

interface ControlPanelProps {
  isMicMuted: boolean;
  isCameraOff: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isMicMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onEndCall
}) => {
  return (
    <div className="flex justify-center pb-4">
      <div className="flex space-x-3">
        {/* Microphone Button */}
        <button
          onClick={onToggleMic}
          className={`p-2 rounded-full border-2 transition-all duration-200 ${
            isMicMuted
              ? 'bg-gray-400 border-gray-400 text-white'
              : 'bg-white border-black text-black hover:bg-gray-50'
          }`}
        >
          {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`p-2 rounded-full border-2 transition-all duration-200 ${
            isCameraOff
              ? 'bg-gray-400 border-gray-400 text-white'
              : 'bg-white border-black text-black hover:bg-gray-50'
          }`}
        >
          {isCameraOff ? <CameraOff size={24} /> : <Camera size={24} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
