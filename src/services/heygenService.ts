
const HEYGEN_API_BASE = 'https://api.heygen.com/v1';
const API_TOKEN = 'Mzg5MDgyOTA0MjY5NDA1OGE4MjkwZDk2ZmMyODkxODktMTc1MTcwMzc2OQ==';

export interface HeyGenSession {
  session_id: string;
  ice_servers: RTCIceServer[];
  sdp: string;
}

export interface HeyGenStartSessionResponse {
  data: HeyGenSession;
}

export class HeyGenService {
  private sessionId: string | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async startSession(avatarId: string): Promise<HeyGenSession> {
    console.log('Starting HeyGen session with avatar:', avatarId);
    console.log('Using API base:', HEYGEN_API_BASE);
    
    try {
      // Use the correct HeyGen Interactive Avatar API endpoint
      const response = await fetch(`${HEYGEN_API_BASE}/streaming.new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality: 'medium',
          avatar_name: avatarId,
          voice: {
            voice_id: 'b7d50908-b17c-442d-ad8d-810c63997ed9', // Clara voice ID
            rate: 1.0,
            emotion: 'happy'
          }
        }),
      });

      console.log('HeyGen API response status:', response.status);
      console.log('HeyGen API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HeyGen API error response:', errorText);
        
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('HeyGen API endpoint not found. Please check the API configuration.');
        } else if (response.status === 401) {
          throw new Error('Invalid API token. Please check your HeyGen API credentials.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please verify your HeyGen account permissions.');
        } else {
          throw new Error(`HeyGen API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const data: HeyGenStartSessionResponse = await response.json();
      console.log('HeyGen session data received:', data);
      
      this.sessionId = data.data.session_id;
      console.log('Session ID set:', this.sessionId);
      
      return data.data;
    } catch (error) {
      console.error('Error in startSession:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to HeyGen API. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async setupWebRTC(session: HeyGenSession, videoElement: HTMLVideoElement): Promise<void> {
    console.log('Setting up WebRTC with session:', session);
    this.videoElement = videoElement;
    
    try {
      // Create peer connection with ICE servers from HeyGen
      this.peerConnection = new RTCPeerConnection({
        iceServers: session.ice_servers || [{
          urls: ['stun:stun.l.google.com:19302']
        }]
      });

      console.log('Peer connection created with ICE servers:', session.ice_servers);

      // Handle incoming media stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received media track:', event);
        if (this.videoElement && event.streams[0]) {
          console.log('Setting video source to received stream');
          this.videoElement.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('WebRTC connection state:', this.peerConnection?.connectionState);
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
      };

      // Set remote description from HeyGen
      console.log('Setting remote description with SDP length:', session.sdp.length);
      await this.peerConnection.setRemoteDescription({
        type: 'offer',
        sdp: session.sdp
      });

      // Create and set local description
      console.log('Creating answer...');
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('Local description set, SDP length:', answer.sdp?.length);

      // Send answer back to HeyGen
      console.log('Sending answer to HeyGen...');
      await this.sendAnswer(answer.sdp!);
      console.log('WebRTC setup completed successfully');
    } catch (error) {
      console.error('Error in setupWebRTC:', error);
      throw error;
    }
  }

  private async sendAnswer(sdp: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    console.log('Sending answer with session ID:', this.sessionId);
    
    try {
      const response = await fetch(`${HEYGEN_API_BASE}/streaming.start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          sdp: {
            type: 'answer',
            sdp: sdp
          }
        }),
      });

      console.log('Answer response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error sending answer:', errorText);
        throw new Error(`Failed to send answer: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Answer accepted by HeyGen:', result);
    } catch (error) {
      console.error('Error in sendAnswer:', error);
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    console.log('Making avatar speak:', text);

    try {
      const response = await fetch(`${HEYGEN_API_BASE}/streaming.task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          text: text
        }),
      });

      console.log('Speak response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error making avatar speak:', errorText);
        throw new Error(`Failed to make avatar speak: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Avatar speech task created:', result);
    } catch (error) {
      console.error('Error in speak:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    console.log('Ending HeyGen session...');
    
    if (this.sessionId) {
      try {
        const response = await fetch(`${HEYGEN_API_BASE}/streaming.stop`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: this.sessionId
          }),
        });

        console.log('End session response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error ending session:', errorText);
        }
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    if (this.peerConnection) {
      console.log('Closing peer connection...');
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.sessionId = null;
    this.videoElement = null;
    console.log('HeyGen session cleanup completed');
  }
}
