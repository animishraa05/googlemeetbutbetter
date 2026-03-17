import { MessageSquare, Bell, FileText, Trash2 } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

interface FeedItemProps {
  item: {
    id: number;
    type: 'announcement' | 'assignment' | 'material' | 'discussion';
    title?: string;
    body?: string;
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
    author: { name: string; id: number };
  };
  currentUserIsTeacher: boolean;
  onDelete?: (id: number) => void;
}

export function FeedItem({ item, currentUserIsTeacher, onDelete }: FeedItemProps) {
  let icon = <MessageSquare size={20} color="#fff" />;
  let bgColor = '#0085FF'; // discussion
  let typeLabel = 'DISCUSSION';

  switch (item.type) {
    case 'announcement':
      icon = <Bell size={20} color="#000" />;
      bgColor = '#FFD600';
      typeLabel = 'ANNOUNCEMENT';
      break;
    case 'assignment':
      icon = <FileText size={20} color="#fff" />;
      bgColor = '#FF6B35';
      typeLabel = 'ASSIGNMENT';
      break;
    case 'material':
      icon = <FileText size={20} color="#fff" />;
      bgColor = '#7B61FF';
      typeLabel = 'MATERIAL';
      break;
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        boxShadow: '4px 4px 0px #000',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F5F5F5', borderBottom: '2px solid #000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: bgColor, borderRadius: '4px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...SG, fontSize: '15px', fontWeight: 700 }}>{item.author.name}</span>
              <span style={{ ...SM, fontSize: '10px', background: bgColor, color: bgColor === '#FFD600' ? '#000' : '#fff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em', border: '1px solid #000' }}>
                {typeLabel}
              </span>
            </div>
            <div style={{ ...IN, fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        {currentUserIsTeacher && onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            style={{ background: '#FF3D57', border: '2px solid #000', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Delete post"
          >
            <Trash2 size={16} color="#fff" />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 16px' }}>
        {item.title && <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>}
        {item.body && (
          <p style={{ ...IN, fontSize: '15px', color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {item.body}
          </p>
        )}
        
        {item.fileUrl && (
          <div style={{ marginTop: '16px' }}>
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#E6F4FF',
                border: '2px solid #000',
                borderRadius: '4px',
                padding: '8px 16px',
                color: '#000',
                textDecoration: 'none',
                ...IN,
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '2px 2px 0px #000',
                transition: 'all 0.1s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; e.currentTarget.style.background = '#CCEAFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px #000'; e.currentTarget.style.background = '#E6F4FF'; }}
            >
              <FileText size={16} />
              {item.fileName || 'Attached File'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
