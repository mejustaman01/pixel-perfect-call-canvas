
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Stuti Mishra',
      text: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 2,
      sender: 'You',
      text: 'Good! Thanks for asking',
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={onClose} />
      )}
      
      {/* Chat Window */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100vh - 140px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-xs">
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'You'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {message.sender} • {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
