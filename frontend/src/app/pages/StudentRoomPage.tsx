import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Hand, Users, ChevronLeft, Mic, MicOff, Video } from 'lucide-react';
import { useLiveKitToken } from '../../hooks/useLiveKitToken';
import { LiveKitRoom, useTracks, VideoTrack, AudioTrack, useLocalParticipant, useDataChannel, useParticipants } from '@livekit/components-react';
import { Track, DataPacket_Kind } from 'livekit-client';
import '@livekit/components-styles';
import { LiveKitEvent } from '../../types/livekit-events';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

interface ReactionBtn {
  label: string;
  key: 'gotIt' | 'confused' | 'tooFast' | 'repeat';
  color: string;
  bg?: string;
}

const REACTIONS: ReactionBtn[] = [
  { label: '✅ Got it', key: 'gotIt', color: '#00C851' },
  { label: '😕 Confused', key: 'confused', color: '#FF3D57' },
  { label: '⚡ Too fast', key: 'tooFast', color: '#FF6B35' },
  { label: '🔄 Repeat', key: 'repeat', color: '#0085FF' },
];

function StudentRoomContent() {
  const { currentRoom, user, sendReaction, toggleRaiseHand, handRaised } = useApp();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [reactionFlash, setReactionFlash] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [teacherDrawing, setTeacherDrawing] = useState(false);
  const [attentionScore, setAttentionScore] = useState(100);
  const sketchCanvasRef = useRef<ReactSketchCanvasRef>(null);

  const room = currentRoom;

  const { localParticipant } = useLocalParticipant();

  useDataChannel('proxima_events', (msg: any) => {
    try {
      const text = new TextDecoder().decode(msg.data || msg.payload || msg);
      const ev: LiveKitEvent & { targetId?: string } = JSON.parse(text);
      if (ev.type === 'whiteboard_state') {
        setTeacherDrawing(!!ev.isDrawing);
      } else if (ev.type === 'whiteboard_data' && ev.paths) {
        sketchCanvasRef.current?.loadPaths(ev.paths);
      } else if (ev.type === 'mute_all') {
        if (ev.isMuted !== undefined) {
          setMuted(ev.isMuted);
        }
      } else if (ev.type === 'clear_whiteboard') {
        sketchCanvasRef.current?.clearCanvas();
      } else if (ev.type === 'kick' && ev.targetId === localParticipant?.identity) {
        alert('You have been removed from the session by the teacher.');
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Attention Score Calculation Logic
  useEffect(() => {
    let focusTimer: any;
    let score = 100;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Decrease score rapidly while hidden
        focusTimer = setInterval(() => {
          score = Math.max(0, score - 5);
          setAttentionScore(score);
        }, 1000);
      } else {
        // Stop decreasing, slowly regenerate
        clearInterval(focusTimer);
        focusTimer = setInterval(() => {
          score = Math.min(100, score + 2);
          setAttentionScore(score);
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(focusTimer);
    };
  }, []);

  // Broadcast attention score
  useEffect(() => {
    const interval = setInterval(async () => {
      if (localParticipant) {
        const event = {
          type: 'attention_score',
          studentId: localParticipant.identity,
          score: attentionScore,
          timestamp: Date.now()
        };
        try {
          await localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify(event)),
            { topic: 'proxima_events' }
          );
        } catch (e) {
          console.error("Failed to publish attention score", e);
        }
      }
    }, 5000); // send every 5 seconds
    
    return () => clearInterval(interval);
  }, [attentionScore, localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!muted).catch(console.error);
    }
  }, [muted, localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(videoEnabled).catch(console.error);
    }
  }, [videoEnabled, localParticipant]);

  const localIdentity = localParticipant?.identity ?? user?.name;
  const participants = useParticipants();
  const teacherIdentity = room?.teacherName;

  const teacherParticipant = participants.find((p) => p.identity === teacherIdentity) ?? null;

  const handleReaction = async (key: 'gotIt' | 'confused' | 'tooFast' | 'repeat') => {
    sendReaction(key);
    setReactionFlash(key);
    setTimeout(() => setReactionFlash(null), 800);

    if (localParticipant) {
      const event: LiveKitEvent = {
        type: 'reaction',
        studentName: user?.name || 'Student',
        studentId: localParticipant.identity,
        reactionKey: key,
        timestamp: Date.now(),
      };
      await localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(event)),
        { topic: 'proxima_events' }
      );
    }
  };

  const handleToggleRaiseHand = async () => {
    const newState = !handRaised;
    toggleRaiseHand();
    if (localParticipant) {
      const event: LiveKitEvent = {
        type: newState ? 'raiseHand' : 'lowerHand',
        studentName: user?.name || 'Student',
        studentId: localParticipant.identity,
        timestamp: Date.now(),
      };
      await localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(event)),
        { topic: 'proxima_events' }
      );
    }
  };

  const remoteCameraTracks = useTracks([Track.Source.Camera]).filter(t => t.participant.identity !== localIdentity);
  const teacherCameraTrack = teacherParticipant
    ? remoteCameraTracks.find((t) => t.participant.identity === teacherParticipant.identity)
    : remoteCameraTracks[0];
  const teacherVideoPublication = teacherCameraTrack?.publication;
  
  const remoteScreenTracks = useTracks([Track.Source.ScreenShare]).filter(t => t.participant.identity !== localIdentity);
  const teacherScreenTrack = teacherParticipant
    ? remoteScreenTracks.find((t) => t.participant.identity === teacherParticipant.identity)
    : remoteScreenTracks[0];
  const teacherScreenPublication = teacherScreenTrack?.publication;

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(t => t.participant.identity !== localIdentity);
  const teacherAudioTrack = teacherParticipant
    ? remoteAudioTracks.find((t) => t.participant.identity === teacherParticipant.identity)
    : remoteAudioTracks[0];

  // My video
  const myCameraTracks = useTracks([Track.Source.Camera]).filter(t => t.participant.identity === localIdentity);
  const myVideoPublication = myCameraTracks[0]?.publication;

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#FFFBE6', overflow: 'hidden' }}>
      {/* Top bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '2px solid #000',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            border: '2px solid #000', borderRadius: '4px',
            padding: '4px 10px', background: '#fff', color: '#000',
            boxShadow: '3px 3px 0px #000', cursor: 'pointer',
            ...SG, fontSize: '13px', fontWeight: 700,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          <ChevronLeft size={14} /> Leave
        </button>

        <span style={{ ...SG, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px', color: '#000' }}>PROXIMA</span>

        <div style={{ height: '24px', width: '2px', background: '#000' }} />

        <span style={{ ...SG, fontSize: '15px', fontWeight: 700, color: '#000' }}>{room?.name || 'Classroom'}</span>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00C851', border: '2px solid #000' }} />
          <span style={{ ...SM, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000' }}>Live</span>
        </div>

        {/* Student count */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#fff', border: '2px solid #000', borderRadius: '4px',
          padding: '3px 10px', color: '#000',
          ...SM, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
        }}>
          <Users size={12} />
          {(room?.students.length || 0) + 1} students
        </div>

        <div style={{ flex: 1 }} />

        {/* Video toggle */}
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            border: '2px solid #000', borderRadius: '4px',
            padding: '5px 12px', background: !videoEnabled ? '#FF3D57' : '#fff',
            cursor: 'pointer', ...SG, fontSize: '13px', fontWeight: 700,
            color: !videoEnabled ? '#fff' : '#000',
            boxShadow: '3px 3px 0px #000',
          }}
          onMouseEnter={(e) => { if (videoEnabled) (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = !videoEnabled ? '#FF3D57' : '#fff'; }}
        >
          <Video size={14} />
          {videoEnabled ? 'Stop Video' : 'Start Video'}
        </button>

        {/* Mute toggle */}
        <button
          onClick={() => setMuted((p) => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            border: '2px solid #000', borderRadius: '4px',
            padding: '5px 12px', background: muted ? '#FF3D57' : '#fff',
            cursor: 'pointer', ...SG, fontSize: '13px', fontWeight: 700,
            color: muted ? '#fff' : '#000',
            boxShadow: '3px 3px 0px #000',
          }}
          onMouseEnter={(e) => { if (!muted) (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = muted ? '#FF3D57' : '#fff'; }}
        >
          {muted ? <MicOff size={14} /> : <Mic size={14} />}
          {muted ? 'Unmute' : 'Mute'}
        </button>

        {/* User avatar */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2px solid #000', background: '#7B61FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...SG, fontSize: '13px', fontWeight: 700, color: '#fff',
        }}>
          {user?.initials || '?'}
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative overflow-hidden" style={{ margin: '16px', marginBottom: '0' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#fff',
            border: '2px solid #000',
            boxShadow: '4px 4px 0px #000',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Main Content (Screen Share or Teacher Video or Placeholder) */}
          {teacherDrawing ? (
              <ReactSketchCanvas
                ref={sketchCanvasRef}
                width="100%"
                height="100%"
                strokeColor="#000"
                strokeWidth={3}
                backgroundImage=""
                style={{ borderRadius: '4px', pointerEvents: 'none' }}
              />
          ) : teacherScreenPublication ? (
             <VideoTrack
               trackRef={teacherScreenTrack!}
               style={{ width: '100%', height: '100%', objectFit: 'contain' }}
             />
          ) : teacherVideoPublication ? (
             <VideoTrack
               trackRef={teacherCameraTrack!}
               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: '2px solid #000', background: '#FF6B35',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                ...SG, fontSize: '28px', fontWeight: 700, color: '#fff',
              }}>
                {(room?.teacherName || 'T')[0]}
              </div>
              <p style={{ ...SG, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{room?.teacherName || 'Teacher'}</p>
              <p style={{ ...IN, fontSize: '14px', color: '#888' }}>Teacher's camera feed</p>
            </div>
          )}

          {/* Teacher name overlay — top left */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{
              background: '#fff', border: '2px solid #000',
              borderRadius: '4px', padding: '4px 10px',
              ...SG, fontSize: '13px', fontWeight: 700, color: '#000'
            }}>
              {room?.teacherName || 'Teacher'}
            </div>
            <div style={{
              background: '#FF6B35', border: '2px solid #000',
              borderRadius: '4px', padding: '4px 10px',
              ...SM, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#000',
            }}>
              Teacher
            </div>
          </div>

          {/* Reaction flash notification */}
          {reactionFlash && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#FFD600', border: '3px solid #000',
              borderRadius: '6px', padding: '16px 32px',
              ...SG, fontSize: '24px', fontWeight: 700,
              boxShadow: '6px 6px 0px #000',
              animation: 'fadeOut 0.8s ease-out',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              {REACTIONS.find(r => r.key === reactionFlash)?.label}
            </div>
          )}

          {/* Hand raised overlay */}
          {handRaised && (
            <div style={{
              position: 'absolute', top: '16px', right: '212px',
              background: '#FFD600', border: '2px solid #000',
              borderRadius: '4px', padding: '6px 12px', color: '#000',
              ...SG, fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '3px 3px 0px #000',
            }}>
              <Hand size={14} /> Hand raised
            </div>
          )}

          {/* Student PiP tile — bottom right */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              width: '180px',
              minHeight: '150px',
              border: '2px solid #000',
              boxShadow: '4px 4px 0px #000',
              borderRadius: '6px',
              background: '#fff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Yellow top bar — indicates "you" */}
            <div style={{ height: '4px', background: '#FFD600', borderBottom: '2px solid #000', flexShrink: 0 }} />
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              background: '#f5f5f5',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {myVideoPublication?.track && videoEnabled ? (
                 <VideoTrack
                   trackRef={{ publication: myVideoPublication, participant: myCameraTracks[0].participant, source: Track.Source.Camera }}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
              ) : (
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '2px solid #000', background: '#7B61FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...SG, fontSize: '16px', fontWeight: 700, color: '#fff',
                  margin: 'auto'
                }}>
                  {user?.initials || '?'}
                </div>
              )}
              {muted && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  ...SM, fontSize: '10px', fontWeight: 700, color: '#FF3D57', 
                  background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: '4px', zIndex: 2,
                  position: 'absolute', bottom: '4px'
                }}>
                  <MicOff size={10} /> MUTED
                </div>
              )}
            </div>
            <div style={{
              padding: '6px 8px',
              borderTop: '2px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff',
              flexShrink: 0,
              zIndex: 3
            }}>
              <span style={{ ...SM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em', color: '#000' }}>
                {user?.name?.split(' ')[0] || 'You'}
              </span>
              <span style={{ ...SM, fontSize: '9px', color: '#888', letterSpacing: '0.03em' }}>YOU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Put remote audio tracks onto the DOM so you can hear teacher */}
      <div style={{ display: 'none' }}>
        {teacherAudioTrack && (
          <AudioTrack
            key={teacherAudioTrack.publication.trackSid}
            trackRef={{
              publication: teacherAudioTrack.publication,
              participant: teacherAudioTrack.participant,
              source: teacherAudioTrack.source,
            }}
          />
        )}
      </div>

      {/* Bottom reaction bar */}
      <div
        style={{
          background: '#fff',
          borderTop: '2px solid #000',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <span style={{ ...SM, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#666', marginRight: '4px' }}>
          React:
        </span>

        {REACTIONS.map(({ label, key, color }) => (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            style={{
              ...SG,
              fontSize: '13px',
              fontWeight: 700,
              height: '36px',
              padding: '0 16px',
              border: `2px solid ${color}`,
              borderRadius: '4px',
              background: '#fff',
              color: color,
              boxShadow: `4px 4px 0px #000`,
              cursor: 'pointer',
              transition: 'all 0.1s',
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.background = color;
              t.style.color = '#fff';
              t.style.transform = 'translateY(-2px)';
              t.style.boxShadow = `4px 6px 0px #000`;
            }}
            onMouseOut={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.background = '#fff';
              t.style.color = color;
              t.style.transform = 'translateY(0)';
              t.style.boxShadow = `4px 4px 0px #000`;
            }}
            onMouseDown={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.transform = 'translate(2px, 2px)';
              t.style.boxShadow = `2px 2px 0px #000`;
            }}
            onMouseUp={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.transform = 'translateY(-2px)';
              t.style.boxShadow = `4px 6px 0px #000`;
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={handleToggleRaiseHand}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: handRaised ? '#FFD600' : '#fff', color: '#000',
            border: '2px solid #000', borderRadius: '4px',
            height: '40px', padding: '0 20px',
            ...SG, fontSize: '14px', fontWeight: 700,
            boxShadow: '4px 4px 0px #000', cursor: 'pointer',
            transition: 'all 0.1s',
          }}
          onMouseDown={(e) => {
            const t = e.currentTarget as HTMLButtonElement;
            t.style.transform = 'translate(2px, 2px)';
            t.style.boxShadow = `2px 2px 0px #000`;
          }}
          onMouseUp={(e) => {
            const t = e.currentTarget as HTMLButtonElement;
            t.style.transform = 'none';
            t.style.boxShadow = `4px 4px 0px #000`;
          }}
        >
          <Hand size={16} />
          {handRaised ? 'Hand raised' : 'Raise hand'}
        </button>
      </div>
    </div>
  );
}

export default function StudentRoomPage() {
  const { currentRoom, user } = useApp();
  const navigate = useNavigate();

  if (!currentRoom || !user) {
    if (typeof window !== 'undefined') {
      setTimeout(() => navigate('/dashboard'), 0);
    }
    return null;
  }

  const { token, serverUrl, error } = useLiveKitToken(currentRoom.id, user.name, user.role);

  if (error) {
    return <div style={{ padding: '20px' }}>Error connecting to classroom: {error}</div>;
  }

  if (!token || !serverUrl) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SG }}>
        Connecting to classroom...
      </div>
    );
  }

  return (
    <LiveKitRoom
      connect={true}
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
    >
      <StudentRoomContent />
    </LiveKitRoom>
  );
}