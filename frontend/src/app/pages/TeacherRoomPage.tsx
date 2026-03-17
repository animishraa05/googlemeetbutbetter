
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ProximaNav } from '../components/ProximaNav';
import {
  Monitor, Mic, MicOff, Hand, Circle, Pencil, Trash2, ChevronLeft, Video, Eraser
} from 'lucide-react';
import { useLiveKitToken } from '../../hooks/useLiveKitToken';
import { LiveKitRoom, useTracks, VideoTrack, AudioTrack, useLocalParticipant, useParticipants, useDataChannel } from '@livekit/components-react';
import { Track, DataPacket_Kind } from 'livekit-client';
import '@livekit/components-styles';
import { LiveKitEvent } from '../../types/livekit-events';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

const ANNOTATION_COLORS = ['#FF6B35', '#7B61FF', '#00C851'];

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ borderBottom: '3px solid #000', paddingBottom: '6px', marginBottom: '12px' }}>
        <span style={{ ...SM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? '#00C851' : pct >= 40 ? '#FFD600' : '#FF3D57';
  return (
    <div style={{ width: '100%', height: '8px', border: '2px solid #000', background: '#fff', borderRadius: 0, marginTop: '4px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color }} />
    </div>
  );
}

function TeacherRoomContent() {
  const { currentRoom, user } = useApp();
  const navigate = useNavigate();

  const [annotColor, setAnnotColor] = useState('#FF6B35');
  const [isEraser, setIsEraser] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [muteAll, setMuteAll] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const sketchCanvasRef = useRef<ReactSketchCanvasRef>(null);

  const displayRoom = currentRoom;

  const { localParticipant } = useLocalParticipant();

  const [studentReactions, setStudentReactions] = useState<Map<string, LiveKitEvent[]>>(new Map());
  const [raiseHandStudents, setRaiseHandStudents] = useState<Set<string>>(new Set());
  const [attentionScores, setAttentionScores] = useState<Map<string, number>>(new Map());

  // Listen for LiveKit events
  useDataChannel('proxima_events', (msg: any) => {
    try {
      const text = new TextDecoder().decode(msg.data || msg.payload || msg);
      const event: any = JSON.parse(text);
      if (event.type === 'reaction') {
        const studentId = event.studentId;
        if (!studentId) return;
        setStudentReactions(prev => {
          const updated = new Map(prev);
          const studentEvents = updated.get(studentId) || [];
          updated.set(studentId, [event, ...studentEvents.slice(0, 4)]);
          return updated;
        });
      } else if (event.type === 'raiseHand') {
        const studentId = event.studentId;
        if (!studentId) return;
        setRaiseHandStudents(prev => new Set([...prev, studentId]));
      } else if (event.type === 'lowerHand') {
        const studentId = event.studentId;
        if (!studentId) return;
        setRaiseHandStudents(prev => {
          const updated = new Set(prev);
          updated.delete(studentId);
          return updated;
        });
      } else if (event.type === 'attention_score') {
        const studentId = event.studentId;
        const score = event.score;
        if (studentId && typeof score === 'number') {
          setAttentionScores(prev => {
            const up = new Map(prev);
            up.set(studentId, score);
            return up;
          });
        }
      }
    } catch (err) {
      console.error('Failed to parse LiveKit event:', err);
    }
  });

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(micEnabled).catch(console.error);
    }
  }, [micEnabled, localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(videoEnabled).catch(console.error);
    }
  }, [videoEnabled, localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setScreenShareEnabled(isSharing, { audio: false }).catch(console.error);
    }
  }, [isSharing, localParticipant]);

  useEffect(() => {
    if (localParticipant) {
      const event: LiveKitEvent = {
        type: 'mute_all',
        timestamp: Date.now(),
        isMuted: muteAll
      };
      localParticipant.publishData(new TextEncoder().encode(JSON.stringify(event)), { topic: 'proxima_events' }).catch(console.error);
    }
  }, [muteAll, localParticipant]);

  useEffect(() => {
    const broadcastDrawingState = async () => {
      if (localParticipant) {
        try {
          const event: LiveKitEvent = {
            type: 'whiteboard_state',
            timestamp: Date.now(),
            isDrawing
          };
          await localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify(event)),
            { topic: 'proxima_events' }
          );
        } catch (e) {
          console.error('Failed to broadcast whiteboard state', e);
        }
      }
    };
    broadcastDrawingState();
  }, [isDrawing, localParticipant]);

  useEffect(() => {
    // Force re-render every second to age out reactions
    const interval = setInterval(() => {
      setStudentReactions(prev => new Map(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const localIdentity = localParticipant?.identity ?? user?.name;

  // Read student videos
  const remoteCameraTracks = useTracks([Track.Source.Camera]).filter(t => t.participant.identity !== localIdentity);

  // My video and screen share (for preview/verification)
  const myCameraTracks = useTracks([Track.Source.Camera]).filter(t => t.participant.identity === localIdentity);
  const myVideoPublication = myCameraTracks[0]?.publication;
  const myScreenTracks = useTracks([Track.Source.ScreenShare]).filter(t => t.participant.identity === localIdentity);
  const myScreenPublication = myScreenTracks[0]?.publication;

  // Audio tracks
  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(t => t.participant.identity !== localIdentity);

  // Real participants instead of dummy students
  const participants = useParticipants().filter(p => p.identity !== localIdentity);

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#FFFBE6', overflow: 'hidden' }}>
      <ProximaNav />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ padding: '16px', gap: '12px' }}>

          {/* Room code badge */}
          <div className="flex items-center gap-3">
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
              <ChevronLeft size={14} /> Leave Class
            </button>
            {displayRoom && (
              <>
                <span style={{ ...SG, fontSize: '15px', fontWeight: 700, color: '#000' }}>{displayRoom.name}</span>
                <span style={{
                  ...SM, fontSize: '11px', fontWeight: 700,
                  background: '#FFD600', border: '2px solid #000',
                  borderRadius: '4px', padding: '2px 8px', letterSpacing: '0.05em', color: '#000',
                }}>
                  CODE: {displayRoom.code}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00C851', border: '2px solid #000' }} />
                  <span style={{ ...SM, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, color: '#000' }}>LIVE</span>
                </div>
              </>
            )}

            <div style={{ flex: 1 }} />
            
            {/* Camera toggle */}
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              style={{
                ...SG, fontSize: '13px', fontWeight: 700,
                height: '36px', padding: '0 14px',
                background: !videoEnabled ? '#FF3D57' : '#fff',
                border: '2px solid #000', borderRadius: '4px',
                boxShadow: '3px 3px 0px #000', cursor: 'pointer',
                color: !videoEnabled ? '#fff' : '#000',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={(e) => { if(videoEnabled) (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
              onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = !videoEnabled ? '#FF3D57' : '#fff'; }}
            >
              <Video size={14} />
              {!videoEnabled ? 'Start Video' : 'Stop Video'}
            </button>

            {/* Mic toggle */}
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              style={{
                ...SG, fontSize: '13px', fontWeight: 700,
                height: '36px', padding: '0 14px',
                background: !micEnabled ? '#FF3D57' : '#fff',
                border: '2px solid #000', borderRadius: '4px',
                boxShadow: '3px 3px 0px #000', cursor: 'pointer',
                color: !micEnabled ? '#fff' : '#000',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={(e) => { if(micEnabled) (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
              onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = !micEnabled ? '#FF3D57' : '#fff'; }}
            >
              {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
              {!micEnabled ? 'Unmute' : 'Mute'}
            </button>
          </div>

          {/* Screen share panel */}
          <div
            style={{
              flex: '0 0 55%',
              background: '#fff',
              border: '2px solid #000',
              boxShadow: '4px 4px 0px #000',
              borderRadius: '6px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Main Area Video/Screen */}
            {isDrawing ? (
              <ReactSketchCanvas
                ref={sketchCanvasRef}
                width="100%"
                height="100%"
                strokeColor={annotColor}
                strokeWidth={3}
                backgroundImage=""
                style={{ borderRadius: '4px' }}
                onChange={(updatedPaths) => {
                  if (!localParticipant) return;
                  try {
                    const event: LiveKitEvent = {
                      type: 'whiteboard_data',
                      timestamp: Date.now(),
                      paths: updatedPaths
                    };
                    const payload = new TextEncoder().encode(JSON.stringify(event));
                    // LiveKit data channel has limits, but for small drawings it should be fine
                    localParticipant.publishData(payload, { topic: 'proxima_events' }).catch(console.error);
                  } catch (e) {
                    console.error('Failed to send canvas updates', e);
                  }
                }}
              />
            ) : isSharing && myScreenPublication ? (
               <VideoTrack
                 trackRef={myScreenTracks[0]}
                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}
               />
            ) : videoEnabled && myVideoPublication ? (
               <VideoTrack
                 trackRef={myCameraTracks[0]}
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               />
            ) : isSharing ? (
              <div style={{ textAlign: 'center' }}>
                <Monitor size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ ...IN, fontSize: '15px', color: '#999' }}>Screen sharing active</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Monitor size={56} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p style={{ ...SG, fontSize: '18px', fontWeight: 700, color: '#bbb', marginBottom: '6px' }}>Screen share area</p>
                <p style={{ ...IN, fontSize: '14px', color: '#ccc' }}>Click "Share screen" to begin</p>
              </div>
            )}

            {/* Annotation toolbar — top right */}
            <div
              style={{
                position: 'absolute', top: '12px', right: '12px',
                display: 'flex', gap: '6px', alignItems: 'center',
                background: '#fff', border: '2px solid #000',
                borderRadius: '4px', padding: '6px 10px',
                boxShadow: '3px 3px 0px #000',
                zIndex: 10
              }}
            >
              {ANNOTATION_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setAnnotColor(c);
                    setIsEraser(false);
                    sketchCanvasRef.current?.eraseMode(false);
                  }}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: c, border: annotColor === c ? '3px solid #000' : '2px solid #000',
                    cursor: 'pointer', flexShrink: 0,
                    outline: annotColor === c ? '2px solid #FFD600' : 'none',
                    outlineOffset: '1px',
                  }}
                />
              ))}
              <div style={{ width: '2px', height: '20px', background: '#000', margin: '0 2px' }} />
              <button
                onClick={() => {
                  const newEraser = !isEraser;
                  setIsEraser(newEraser);
                  sketchCanvasRef.current?.eraseMode(newEraser);
                }}
                style={{
                  display: 'flex', alignItems: 'center',
                  border: '2px solid #000', borderRadius: '4px',
                  background: isEraser ? '#FFD600' : '#fff', padding: '3px 6px',
                  cursor: 'pointer',
                }}
                title="Eraser"
              >
                <Eraser size={14} />
              </button>
              <button
                onClick={() => {
                  sketchCanvasRef.current?.clearCanvas();
                  // Notify students to clear
                  if (localParticipant) {
                    const event: LiveKitEvent = {
                      type: 'clear_whiteboard',
                      timestamp: Date.now()
                    };
                    localParticipant.publishData(new TextEncoder().encode(JSON.stringify(event)), { topic: 'proxima_events' }).catch(console.log);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center',
                  border: '2px solid #000', borderRadius: '4px',
                  background: '#fff', padding: '3px 6px',
                  cursor: 'pointer',
                }}
                title="Clear all"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Bottom action buttons */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
              <button
                onClick={() => setIsDrawing((p) => !p)}
                style={{
                  ...SG, fontSize: '13px', fontWeight: 700,
                  height: '36px', padding: '0 14px',
                  background: isDrawing ? '#00C851' : '#fff',
                  border: '2px solid #000', borderRadius: '4px',
                  boxShadow: '3px 3px 0px #000', cursor: 'pointer',
                  color: isDrawing ? '#fff' : '#000',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = isDrawing ? '#00C851' : '#fff'; b.style.color = isDrawing ? '#fff' : '#000'; }}
              >
                <Pencil size={14} /> {isDrawing ? 'Hide Whiteboard' : 'Show Whiteboard'}
              </button>
              <button
                onClick={() => setIsSharing((p) => !p)}
                style={{
                  ...SG, fontSize: '13px', fontWeight: 700,
                  height: '36px', padding: '0 14px',
                  background: isSharing ? '#00C851' : '#0085FF',
                  border: '2px solid #000', borderRadius: '4px',
                  boxShadow: '3px 3px 0px #000', cursor: 'pointer',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = isSharing ? '#00C851' : '#0085FF'; b.style.color = '#fff'; }}
              >
                <Monitor size={14} /> {isSharing ? 'Stop sharing' : 'Share screen'}
              </button>
              <button
                onClick={() => setMuteAll((p) => !p)}
                style={{
                  ...SG, fontSize: '13px', fontWeight: 700,
                  height: '36px', padding: '0 14px',
                  background: muteAll ? '#FF3D57' : '#fff',
                  border: '2px solid #000', borderRadius: '4px',
                  boxShadow: '3px 3px 0px #000', cursor: 'pointer',
                  color: muteAll ? '#fff' : '#000',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = muteAll ? '#FF3D57' : '#fff'; b.style.color = muteAll ? '#fff' : '#000'; }}
              >
                {muteAll ? <MicOff size={14} /> : <Mic size={14} />}
                {muteAll ? 'Unmute all' : 'Mute all'}
              </button>
            </div>
          </div>

          {/* Student video tiles */}
          <div className="flex gap-3 flex-1 overflow-hidden" style={{ overflowX: 'auto', padding: '10px' }}>
            {participants.map((participant) => {
              const studentCameraTrack = remoteCameraTracks.find(t => t.participant.identity === participant.identity);
              
              const studentReactionList = studentReactions.get(participant.identity) || [];
              const recentReaction = studentReactionList.find(r => Date.now() - r.timestamp < 5000);
              
              const REACTION_EMOJIS: Record<string, string> = {
                gotIt: '👍 Got it',
                confused: '🤔 Confused',
                tooFast: '🐢 Too fast',
                repeat: '🔄 Repeat',
              };

              return (
                <div
                  key={participant.identity}
                  style={{
                    flex: '0 0 auto',
                    background: '#fff',
                    border: '2px solid #000',
                    boxShadow: '4px 4px 0px #000',
                    borderRadius: '6px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    minWidth: '200px',
                    width: '300px',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                  }}
                >
                  {studentCameraTrack && participant.isCameraEnabled ? (
                     <VideoTrack
                       trackRef={studentCameraTrack}
                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                     />
                  ) : (
                    <>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          border: '2px solid #000',
                          background: '#7B61FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          ...SG, fontSize: '14px', fontWeight: 700, color: '#fff',
                        }}
                      >
                        {participant.identity[0]?.toUpperCase() || '?'}
                      </div>
                    </>
                  )}

                  {/* Live dot */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', borderRadius: '50%', background: '#00C851', border: '2px solid #000', zIndex: 10 }} />

                  {/* Reaction Bubble */}
                  {recentReaction && recentReaction.reactionKey && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: '#fff', border: '2px solid #000',
                      borderRadius: '20px', padding: '4px 12px',
                      ...SG, fontSize: '18px', fontWeight: 700, color: '#000',
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
                      zIndex: 20,
                      animation: 'bounceIn 0.3s ease-out'
                    }}>
                      {REACTION_EMOJIS[recentReaction.reactionKey]}
                    </div>
                  )}

                  {/* Muted badge */}
                  {!participant.isMicrophoneEnabled && (
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      background: '#FF3D57', border: '2px solid #000',
                      borderRadius: '4px', padding: '2px 6px',
                      ...SM, fontSize: '9px', fontWeight: 700, color: '#fff',
                      zIndex: 10
                    }}>
                      MUTED
                    </div>
                  )}

                  {/* Action Overlay */}
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10 }}>
                     <button
                       onClick={() => {
                         if (window.confirm(`Are you sure you want to kick ${participant.identity}?`)) {
                           if (localParticipant) {
                             const event = {
                               type: 'kick',
                               targetId: participant.identity,
                               timestamp: Date.now()
                             };
                             localParticipant.publishData(new TextEncoder().encode(JSON.stringify(event)), { topic: 'proxima_events' }).catch(console.error);
                           }
                         }
                       }}
                       style={{
                         background: '#FF3D57', border: '2px solid #000',
                         borderRadius: '4px', padding: '4px 6px', cursor: 'pointer',
                         color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}
                       title="Kick Student"
                     >
                       <Trash2 size={12} />
                     </button>
                  </div>

                  {/* Name */}
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', ...SM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em', background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: '4px', zIndex: 10, color: '#000' }}>
                    {participant.identity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Listen to students audio */}
        <div style={{ display: 'none' }}>
          {remoteAudioTracks.map(track => (
            <AudioTrack key={track.publication.trackSid} trackRef={{ publication: track.publication, participant: track.participant, source: track.source }} />
          ))}
        </div>

        {/* Right sidebar */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            background: '#fff',
            borderLeft: '2px solid #000',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* LIVE REACTIONS */}
          <SidebarSection title="Live Reactions">
            <div className="flex flex-col gap-2">
              {displayRoom && ([
                { label: 'Got it', key: 'gotIt', color: '#00C851' },
                { label: 'Confused', key: 'confused', color: '#FF3D57' },
                { label: 'Too fast', key: 'tooFast', color: '#FF6B35' },
                { label: 'Repeat', key: 'repeat', color: '#0085FF' },
              ] as const).map(({ label, key, color }) => {
                const count = Array.from(studentReactions.values())
                  .flat()
                  .filter(e => e.reactionKey === key && Date.now() - e.timestamp < 10000).length;
                return (
                <div key={key} className="flex items-center justify-between">
                  <span style={{ ...IN, fontSize: '14px', color: '#000' }}>{label}</span>
                  <span
                    style={{
                      ...SM,
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      background: key === 'confused' ? '#FF3D57' : '#fff',
                      color: key === 'confused' ? '#fff' : '#000',
                      minWidth: '32px',
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                </div>
              )})}
            </div>
          </SidebarSection>

          <div style={{ height: '3px', background: '#000', flexShrink: 0 }} />

          {/* ENGAGEMENT */}
          <SidebarSection title="Engagement">
            <div className="flex flex-col gap-4">
              {participants.length === 0 ? (
                <p style={{ ...IN, fontSize: '13px', color: '#999' }}>No students in class</p>
              ) : (
                participants.map((p) => {
                  const score = attentionScores.get(p.identity) ?? 100;
                  const scoreColor = score >= 70 ? '#00C851' : score >= 40 ? '#FFD600' : '#FF3D57';
                  return (
                    <div key={p.identity}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ ...IN, fontSize: '13px' }}>{p.identity}</span>
                          {raiseHandStudents.has(p.identity) && <Hand size={14} color="#FF6B35" />}
                        </div>
                        <span style={{ ...SM, fontSize: '12px', fontWeight: 700, color: scoreColor }}>{score}%</span>
                      </div>
                      <ProgressBar pct={score} />
                    </div>
                  );
                })
              )}
            </div>
          </SidebarSection>

          <div style={{ height: '3px', background: '#000', flexShrink: 0 }} />

          {/* RAISED HANDS */}
          <SidebarSection title="Raised Hands">
            <div className="flex flex-col gap-2">
              {(displayRoom?.students || []).filter((s) => s.raisedHand).length === 0 ? (
                <p style={{ ...IN, fontSize: '13px', color: '#999' }}>No hands raised</p>
              ) : (
                (displayRoom?.students || []).filter((s) => s.raisedHand).map((s) => (
                  <span
                    key={s.id}
                    style={{
                      ...SM,
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      background: '#FFD600',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Hand size={10} /> {s.name}
                  </span>
                ))
              )}
            </div>
          </SidebarSection>

          <div style={{ height: '3px', background: '#000', flexShrink: 0 }} />

          {/* Room info */}
          <SidebarSection title="Room Info">
            <div className="flex flex-col gap-2">
              {displayRoom && (
                <>
                  <div className="flex items-center justify-between">
                    <span style={{ ...IN, fontSize: '13px', color: '#666' }}>Room code</span>
                    <span style={{ ...SM, fontSize: '12px', fontWeight: 700, background: '#FFD600', border: '2px solid #000', borderRadius: '4px', padding: '2px 8px' }}>
                      {displayRoom.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ ...IN, fontSize: '13px', color: '#666' }}>Students</span>
                    <span style={{ ...SM, fontSize: '12px', fontWeight: 700, color: '#000' }}>{participants.length}</span>
                  </div>
                </>
              )}
            </div>
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}

export default function TeacherRoomPage() {
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
      style={{ height: '100vh', width: '100vw' }}
    >
      <TeacherRoomContent />
    </LiveKitRoom>
  );
}