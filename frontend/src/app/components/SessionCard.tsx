import { Video, Calendar, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

interface SessionCardProps {
  session: {
    id: number;
    title: string;
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
    role: 'teacher' | 'student';
  };
}

export function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();
  
  const isActive = session.startedAt && !session.endedAt;
  const isPast = !!session.endedAt;
  
  let statusColor = '#0085FF'; // upcoming
  let statusText = 'Upcoming';
  if (isActive) {
    statusColor = '#00C851'; // active
    statusText = 'Live Now';
  } else if (isPast) {
    statusColor = '#CCC'; // past
    statusText = 'Completed';
  }

  const handleJoin = () => {
    // In actual implementation, we'd check token then navigate
    // Here we'll just navigate to the corresponding room role
    navigate(`/room/${session.id}/${session.role}`);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        padding: '16px',
        boxShadow: '4px 4px 0px #000',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: statusColor }} />
      
      <div className="ml-2 flex justify-between items-start">
        <h3 style={{ ...SG, fontSize: '18px', fontWeight: 700 }}>{session.title}</h3>
        <span
          style={{
            ...SM, fontSize: '11px', fontWeight: 700, padding: '2px 8px',
            background: isActive ? '#E6FFF0' : isPast ? '#F5F5F5' : '#E6F4FF',
            color: isActive ? '#00A040' : isPast ? '#666' : '#0066CC',
            border: `1px solid ${statusColor}`, borderRadius: '4px', textTransform: 'uppercase'
          }}
        >
          {statusText}
        </span>
      </div>

      <div className="ml-2 flex flex-col gap-2">
        {session.scheduledAt && (
          <div className="flex items-center gap-2" style={{ ...IN, fontSize: '13px', color: '#555' }}>
            <Calendar size={14} />
            <span>{new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        )}
        {(session.startedAt && !session.scheduledAt) && (
          <div className="flex items-center gap-2" style={{ ...IN, fontSize: '13px', color: '#555' }}>
            <Clock size={14} />
            <span>Started: {new Date(session.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        )}
      </div>

      {!isPast && (
        <button
          onClick={handleJoin}
          className="ml-2 mt-2"
          style={{
            ...SG, height: '36px', background: isActive ? '#00C851' : '#fff', border: '2px solid #000',
            borderRadius: '4px', fontSize: '14px', fontWeight: 700, color: '#000',
            boxShadow: isActive ? '2px 2px 0px #000' : 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Video size={16} />
          {isActive ? 'Join Session' : 'Enter Waiting Room'}
        </button>
      )}
      
      {isPast && session.role === 'teacher' && (
        <button
          className="ml-2 mt-2"
          style={{
            ...SG, height: '36px', background: '#fff', border: '2px solid #000',
            borderRadius: '4px', fontSize: '14px', fontWeight: 700, color: '#000',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Users size={16} />
          View Attendance
        </button>
      )}
    </div>
  );
}
