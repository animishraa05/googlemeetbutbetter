import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { LogOut } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

interface ProximaNavProps {
  showTabs?: boolean;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProximaNav({ showTabs = false, tabs = [], activeTab, onTabChange }: ProximaNavProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="flex items-center w-full"
      style={{
        background: '#fff',
        borderBottom: '2px solid #000',
        height: '56px',
        padding: '0 20px',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Wordmark */}
      <span style={{ ...SG, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px', flexShrink: 0, color: '#000' }}>
        PROXIMA
      </span>

      {/* Tabs */}
      {showTabs && (
        <div className="flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              style={{
                ...SG,
                fontSize: '13px',
                fontWeight: 700,
                padding: '6px 14px',
                border: '2px solid #000',
                borderRadius: '4px',
                background: activeTab === tab ? '#FFD600' : '#fff',
                boxShadow: activeTab === tab ? 'none' : '4px 4px 0px #000',
                transform: activeTab === tab ? 'translate(2px, 2px)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: '#000',
                transition: 'all 0.1s',
              }}
            >
              {tab}
            </button>
          ))}
          <button
            style={{
              ...SG,
              fontSize: '13px',
              fontWeight: 700,
              padding: '6px 14px',
              border: '2px dashed #000',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              color: '#FF6B35',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.color = '#FF6B35'; }}
          >
            + New Class
          </button>
        </div>
      )}

      {!showTabs && <div className="flex-1" />}

      {/* User info */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid #000',
            background: user?.role === 'teacher' ? '#FF6B35' : '#7B61FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...SG,
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {user?.initials || '??'}
        </div>
        <span style={{ ...IN, fontSize: '14px', fontWeight: 700 }}>{user?.name}</span>
        <span
          style={{
            ...SM,
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            border: '2px solid #000',
            borderRadius: '4px',
            background: user?.role === 'teacher' ? '#FF6B35' : '#7B61FF',
            color: '#000',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            ...IN,
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#666'; }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
}
