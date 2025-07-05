
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
    const response = await fetch(`${HEYGEN_API_BASE}/streaming.new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quality: 'high',
        avatar_name: avatarId,
        voice: {
          voice_id: 'clara',
          rate: 1.0,
          emotion: 'happy'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start HeyGen session: ${response.statusText}`);
    }

    const data: HeyGenStartSessionResponse = await response.json();
    this.sessionId = data.data.session_id;
    return data.data;
  }

  async setupWebRTC(session: HeyGenSession, videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;
    
    // Create peer connection with ICE servers from HeyGen
    this.peerConnection = new RTCPeerConnection({
      iceServers: session.ice_servers
    });

    // Handle incoming media stream
    this.peerConnection.ontrack = (event) => {
      if (this.videoElement && event.streams[0]) {
        this.videoElement.srcObject = event.streams[0];
      }
    };

    // Set remote description from HeyGen
    await this.peerConnection.setRemoteDescription({
      type: 'offer',
      sdp: session.sdp
    });

    // Create and set local description
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Send answer back to HeyGen
    await this.sendAnswer(answer.sdp!);
  }

  private async sendAnswer(sdp: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    await fetch(`${HEYGEN_API_BASE}/streaming.start`, {
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
  }

  async speak(text: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    await fetch(`${HEYGEN_API_BASE}/streaming.task`, {
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
  }

  async endSession(): Promise<void> {
    if (this.sessionId) {
      await fetch(`${HEYGEN_API_BASE}/streaming.stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId
        }),
      });
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.sessionId = null;
    this.videoElement = null;
  }
}
