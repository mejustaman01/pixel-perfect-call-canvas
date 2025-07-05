
import { useState, useEffect, useRef } from 'react';
import { HeyGenService } from '../services/heygenService';

export const useHeyGenAvatar = (avatarId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heygenServiceRef = useRef<HeyGenService | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    heygenServiceRef.current = new HeyGenService();
    
    return () => {
      if (heygenServiceRef.current) {
        heygenServiceRef.current.endSession();
      }
    };
  }, []);

  const startSession = async () => {
    if (!heygenServiceRef.current || !videoRef.current) {
      setError('Service or video element not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting HeyGen session...');
      const session = await heygenServiceRef.current.startSession(avatarId);
      console.log('Session started, setting up WebRTC...');
      
      await heygenServiceRef.current.setupWebRTC(session, videoRef.current);
      setIsConnected(true);
      console.log('HeyGen avatar connected successfully');
    } catch (err) {
      console.error('Failed to start HeyGen session:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const speak = async (text: string) => {
    if (!heygenServiceRef.current || !isConnected) {
      console.warn('HeyGen service not connected');
      return;
    }

    try {
      await heygenServiceRef.current.speak(text);
    } catch (err) {
      console.error('Failed to make avatar speak:', err);
    }
  };

  const endSession = async () => {
    if (heygenServiceRef.current) {
      await heygenServiceRef.current.endSession();
      setIsConnected(false);
    }
  };

  return {
    videoRef,
    isConnected,
    isLoading,
    error,
    startSession,
    speak,
    endSession
  };
};
