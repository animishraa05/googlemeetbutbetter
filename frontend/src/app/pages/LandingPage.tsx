import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ProximaNav } from '../components/ProximaNav';
import { Play, Users } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function LandingPage() {
  const { user, createRoom, joinRoom } = useApp();
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCreateRoom = async () => {
    if (!className.trim()) return;
    const room = await createRoom(className);
    if (room) {
      navigate(`/room/${room.id}/teacher`);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    const room = await joinRoom(roomCode);
    if (room) {
      navigate(`/room/${room.id}/student`);
    } else {
      setJoinError('Room not found. Check the code and try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FFFBE6' }}>
      <ProximaNav />

      <div className="flex flex-col items-center" style={{ paddingTop: '80px', paddingBottom: '80px', flex: 1 }}>
        <div style={{ maxWidth: '860px', width: '100%', padding: '0 24px' }}>
          <h1 style={{ ...SG, fontSize: '48px', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: '48px', textAlign: 'center' }}>
            What do you want to do today?
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start a class — teacher card */}
            {user?.role === 'teacher' && (
              <div
                style={{
                  background: '#fff',
                  border: '2px solid #000',
                  boxShadow: '8px 8px 0px #000',
                  borderRadius: '6px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Orange top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#FF6B35' }} />

                <div className="flex items-center gap-3 mt-2">
                  <div
                    style={{
                      width: '44px', height: '44px',
                      background: '#FF6B35',
                      border: '2px solid #000',
                      borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Play size={20} fill="#000" />
                  </div>
                  <div>
                    <h2 style={{ ...SG, fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Start a class</h2>
                    <p style={{ ...IN, fontSize: '14px', color: '#555' }}>Create a live session for your students</p>
                  </div>
                </div>

                <div style={{ height: '2px', background: '#000', margin: '4px 0' }} />

                <div className="flex flex-col gap-2">
                  <label style={{ ...IN, fontSize: '13px', color: '#666' }}>Class name</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Physics 101"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                    style={{
                      ...IN,
                      height: '48px',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      padding: '0 14px',
                      fontSize: '15px',
                      outline: 'none',
                      background: '#fff',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleCreateRoom}
                  style={{
                    ...SG,
                    marginTop: 'auto',
                    height: '48px',
                    background: '#FF6B35',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000',
                    boxShadow: '4px 4px 0px #000',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#FFD600'; b.style.boxShadow = '2px 2px 0px #000'; b.style.transform = 'translate(2px,2px)'; }}
                  onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#FF6B35'; b.style.boxShadow = '4px 4px 0px #000'; b.style.transform = 'none'; }}
                >
                  Create and start →
                </button>
              </div>
            )}

            {/* Join a class */}
            <div
              style={{
                background: '#fff',
                border: '2px solid #000',
                boxShadow: '8px 8px 0px #000',
                borderRadius: '6px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
                gridColumn: user?.role === 'student' ? 'span 2' : 'auto',
              }}
            >
              {/* Purple top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#7B61FF' }} />

              <div className="flex items-center gap-3 mt-2">
                <div
                  style={{
                    width: '44px', height: '44px',
                    background: '#7B61FF',
                    border: '2px solid #000',
                    borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Users size={20} color="#fff" />
                </div>
                <div>
                  <h2 style={{ ...SG, fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Join a class</h2>
                  <p style={{ ...IN, fontSize: '14px', color: '#555' }}>Enter the room code your teacher shared</p>
                </div>
              </div>

              <div style={{ height: '2px', background: '#000', margin: '4px 0' }} />

              <div className="flex flex-col gap-2">
                <label style={{ ...IN, fontSize: '13px', color: '#666' }}>Room code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setJoinError(''); }}
                  placeholder="e.g. PHY101"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  style={{
                    ...IN,
                    height: '48px',
                    border: `2px solid ${joinError ? '#FF3D57' : '#000'}`,
                    borderRadius: '4px',
                    padding: '0 14px',
                    fontSize: '15px',
                    outline: 'none',
                    background: '#fff',
                    width: '100%',
                    boxSizing: 'border-box',
                    letterSpacing: '0.1em',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                  }}
                />
                {joinError && <p style={{ ...IN, fontSize: '13px', color: '#FF3D57' }}>{joinError}</p>}
              </div>

              <button
                onClick={handleJoinRoom}
                style={{
                  ...SG,
                  marginTop: 'auto',
                  height: '48px',
                  background: '#7B61FF',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '4px 4px 0px #000',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#FFD600'; b.style.color = '#000'; b.style.boxShadow = '2px 2px 0px #000'; b.style.transform = 'translate(2px,2px)'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#7B61FF'; b.style.color = '#fff'; b.style.boxShadow = '4px 4px 0px #000'; b.style.transform = 'none'; }}
              >
                Join class →
              </button>
            </div>

            {/* If student — also show demo codes */}
            {user?.role === 'student' && (
              <div
                style={{
                  gridColumn: 'span 2',
                  background: '#fff',
                  border: '2px solid #000',
                  borderRadius: '6px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
              {/* Removed hardcoded demo rooms logic for cleaner student dashboard UI */}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div
            className="flex gap-6 flex-wrap justify-center mt-16"
          >
            {[
              { label: 'Active Sessions', value: '3', color: '#FF6B35' },
              { label: 'Students Online', value: '24', color: '#7B61FF' },
              { label: 'Avg. Engagement', value: '74%', color: '#00C851' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#fff',
                  border: '2px solid #000',
                  borderRadius: '6px',
                  padding: '16px 24px',
                  boxShadow: '4px 4px 0px #000',
                  textAlign: 'center',
                  minWidth: '140px',
                }}
              >
                <div style={{ ...SG, fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ ...SM, fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#555', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
