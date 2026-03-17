import { UserCheck, UserMinus, Clock } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

interface AttendanceReportProps {
  report: {
    totalStudents: number;
    presentStudents: number;
    records: {
      studentId: number;
      studentName: string;
      status: 'present' | 'absent' | 'left_early';
      joinTime?: string;
      leaveTime?: string;
      durationMinutes?: number;
    }[];
  };
}

export function AttendanceReport({ report }: AttendanceReportProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        boxShadow: '4px 4px 0px #000',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px', borderBottom: '2px solid #000', background: '#E6F4FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>Attendance Report</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="#00C851" />
            <span style={{ ...IN, fontSize: '15px', fontWeight: 600 }}>{report.presentStudents} Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserMinus size={18} color="#FF3D57" />
            <span style={{ ...IN, fontSize: '15px', fontWeight: 600 }}>{report.totalStudents - report.presentStudents} Absent</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...IN, fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F5F5F5', borderBottom: '2px solid #000' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600 }}>Student Name</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {report.records.map((record, i) => (
              <tr key={record.studentId} style={{ borderBottom: i === report.records.length - 1 ? 'none' : '1px solid #EEE' }}>
                <td style={{ padding: '12px 20px', fontWeight: 500 }}>{record.studentName}</td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <span
                    style={{
                      ...SM, fontSize: '11px', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700,
                      background: record.status === 'present' ? '#E6FFF0' : record.status === 'absent' ? '#FFE6E6' : '#FFF0E6',
                      color: record.status === 'present' ? '#00A040' : record.status === 'absent' ? '#CC0000' : '#CC6600',
                      border: `1px solid ${record.status === 'present' ? '#00C851' : record.status === 'absent' ? '#FF3D57' : '#FF9900'}`
                    }}
                  >
                    {record.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', color: '#666' }}>
                  {record.durationMinutes ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <Clock size={14} />
                      {record.durationMinutes} min
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
