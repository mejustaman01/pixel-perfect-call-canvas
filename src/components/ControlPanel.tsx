
import React from 'react';
import { Mic, MicOff, Camera, CameraOff, MessageSquare, PhoneOff } from 'lucide-react';

interface ControlPanelProps {
  isMicMuted: boolean;
  isCameraOff: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isMicMuted,
  isCameraOff,
  isChatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onEndCall
}) => {
  return (
    <div className="flex justify-center pb-4">
      <div className="flex space-x-3">
        {/* Microphone Button */}
        <button
          onClick={onToggleMic}
          className={`p-2 rounded-full transition-all duration-200 ${
            isMicMuted
              ? 'bg-white hover:bg-gray-100 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`p-2 rounded-full transition-all duration-200 ${
            isCameraOff
              ? 'bg-white hover:bg-gray-100 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isCameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
        </button>

        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          className={`p-2 rounded-full transition-all duration-200 ${
            isChatOpen
              ? 'bg-white hover:bg-gray-100 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          <MessageSquare size={20} />
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
