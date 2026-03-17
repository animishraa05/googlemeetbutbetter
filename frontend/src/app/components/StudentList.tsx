import { MoreVertical, Mail, Trash2 } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };

interface StudentListProps {
  students: {
    id: number;
    name: string;
    email: string;
    joinedAt: string;
    engagementScore?: number;
  }[];
  isTeacher: boolean;
  onRemoveStudent?: (id: number) => void;
}

export function StudentList({ students, isTeacher, onRemoveStudent }: StudentListProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        boxShadow: '4px 4px 0px #000',
      }}
    >
      <div style={{ padding: '20px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>Class Roster</h3>
        <span style={{ ...IN, fontSize: '14px', background: '#F5F5F5', padding: '4px 12px', borderRadius: '16px', border: '1px solid #CCC', fontWeight: 600 }}>
          {students.length} Students
        </span>
      </div>
      
      {students.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', ...IN, color: '#666' }}>
          No students enrolled yet.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {students.map((student, i) => (
            <li
              key={student.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: i === students.length - 1 ? 'none' : '1px solid #EEE',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: ['#FF6B35', '#7B61FF', '#00C851', '#0085FF'][i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', ...SG, color: '#fff', fontWeight: 700, fontSize: '18px', border: '2px solid #000' }}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ ...IN, fontSize: '15px', fontWeight: 600, color: '#000' }}>{student.name}</div>
                  <div style={{ ...IN, fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} />
                    {student.email}
                  </div>
                </div>
              </div>

              {isTeacher && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {student.engagementScore !== undefined && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ ...IN, fontSize: '12px', color: '#666' }}>Avg Engagement</span>
                      <span style={{ ...IN, fontSize: '15px', fontWeight: 700, color: student.engagementScore > 70 ? '#00C851' : student.engagementScore > 40 ? '#FF9900' : '#FF3D57' }}>
                        {student.engagementScore}%
                      </span>
                    </div>
                  )}
                  {onRemoveStudent && (
                    <button
                      onClick={() => onRemoveStudent(student.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}
                      title="Remove Student"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FF3D57'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
