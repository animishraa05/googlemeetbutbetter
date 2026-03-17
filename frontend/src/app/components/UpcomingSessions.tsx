import { SessionCard } from './SessionCard';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };

interface UpcomingSessionsProps {
  sessions: {
    id: number;
    title: string;
    scheduledAt: string;
    startedAt?: string;
    role: 'teacher' | 'student';
  }[];
  onCreateSession?: () => void;
  isTeacher: boolean;
}

export function UpcomingSessions({ sessions, onCreateSession, isTeacher }: UpcomingSessionsProps) {
  const upcoming = sessions.filter(s => !s.startedAt).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        boxShadow: '4px 4px 0px #000',
        padding: '24px',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>Upcoming Sessions</h3>
        {isTeacher && onCreateSession && (
          <button
            onClick={onCreateSession}
            style={{ ...IN, fontSize: '13px', fontWeight: 700, background: '#FFD600', color: '#000', border: '2px solid #000', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(1px, 1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; }}
          >
            + SCHEDULE
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        {upcoming.length === 0 ? (
          <p style={{ ...IN, fontSize: '14px', color: '#666', textAlign: 'center', padding: '20px 0' }}>
            No upcoming sessions scheduled.
          </p>
        ) : (
          upcoming.map(s => (
            <SessionCard key={s.id} session={s} />
          ))
        )}
      </div>
    </div>
  );
}
