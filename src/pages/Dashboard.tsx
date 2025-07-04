
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Phone } from 'lucide-react';

const Dashboard = () => {
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.isAuthenticated) {
        setUserName(parsed.name || 'User');
      } else {
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleVideoCall = () => {
    navigate('/video-call');
  };

  const handleAudioCall = () => {
    // Do nothing as requested
    console.log('Audio call clicked - no action');
  };

  const handleSignOut = () => {
    localStorage.removeItem('userData');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-black">
            Hey {userName}
          </h1>
          <p className="text-xl text-blue-600">
            Let's talk to Julia
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleVideoCall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
          >
            <Video className="mr-3" size={24} />
            Video Call
          </Button>

          <Button
            onClick={handleAudioCall}
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg"
          >
            <Phone className="mr-3" size={24} />
            Audio Call
          </Button>
        </div>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="text-gray-500 hover:text-gray-700"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
