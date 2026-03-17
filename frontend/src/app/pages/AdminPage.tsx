import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ProximaNav } from '../components/ProximaNav';
import { Building2, Users, FileBarChart, Settings } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function AdminPage() {
  const { user, tokens } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalTeachers: 0, totalStudents: 0, activeClasses: 0 });
  const [recentClasses, setRecentClasses] = useState<{name: string, teacher: string, students: number}[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/admin/stats', {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentClasses(data.recentClasses);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setTeacherError('');

    try {
      const res = await fetch('http://localhost:3001/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
        body: JSON.stringify(newTeacher)
      });
      const data = await res.json();
      if (!res.ok) {
        setTeacherError(data.error || 'Failed to add teacher');
      } else {
        setShowAddTeacher(false);
        setNewTeacher({ name: '', email: '', password: '' });
        fetchStats(); // refresh stats right away
      }
    } catch (err) {
      setTeacherError('Network error');
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'institution_admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/admin/stats', {
          headers: {
            'Authorization': `Bearer ${tokens?.accessToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentClasses(data.recentClasses);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate, tokens]);

  if (!user || loading) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FFFBE6' }}>
      <ProximaNav />

      <div className="flex flex-col items-center" style={{ paddingTop: '80px', paddingBottom: '80px', flex: 1 }}>
        <div style={{ maxWidth: '1000px', width: '100%', padding: '0 24px' }}>
          <div className="flex items-center gap-4 mb-8">
            <div style={{ background: '#00C851', padding: '12px', borderRadius: '8px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}>
              <Building2 size={32} />
            </div>
            <div>
              <h1 style={{ ...SG, fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1 }}>
                Institution Admin
              </h1>
              <p style={{ ...IN, fontSize: '16px', color: '#555', marginTop: '6px' }}>
                Manage {user.name}'s deployment and view analytics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: '#FF6B35' },
              { label: 'Total Students', value: stats.totalStudents, icon: Users, color: '#7B61FF' },
              { label: 'Active Classes', value: stats.activeClasses, icon: FileBarChart, color: '#0085FF' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#fff',
                  border: '2px solid #000',
                  borderRadius: '6px',
                  padding: '24px',
                  boxShadow: '4px 4px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ background: stat.color, padding: '12px', borderRadius: '50%', border: '2px solid #000' }}>
                  <stat.icon size={24} color={['#0085FF', '#7B61FF'].includes(stat.color) ? '#fff' : '#000'} />
                </div>
                <div>
                  <div style={{ ...SG, fontSize: '28px', fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ ...SM, fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              style={{
                background: '#fff',
                border: '2px solid #000',
                borderRadius: '6px',
                boxShadow: '6px 6px 0px #000',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: '#FFD600', padding: '16px 20px', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>Recent Classes</h3>
                <button style={{ ...SM, fontSize: '12px', fontWeight: 700, padding: '4px 12px', background: '#fff', border: '2px solid #000', borderRadius: '4px', cursor: 'pointer' }}>View All</button>
              </div>
              <div style={{ padding: '0 20px' }}>
                {recentClasses.length === 0 ? (
                  <p style={{ ...IN, padding: '20px 0', textAlign: 'center', color: '#666' }}>No active classes found.</p>
                ) : (
                  recentClasses.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4" style={{ borderBottom: i === recentClasses.length - 1 ? 'none' : '1px solid #EEE' }}>
                      <div>
                        <p style={{ ...SG, fontWeight: 700, fontSize: '16px' }}>{item.name}</p>
                        <p style={{ ...IN, fontSize: '13px', color: '#666' }}>{item.teacher}</p>
                      </div>
                      <div style={{ ...SM, fontSize: '13px', color: '#000', background: '#F5F5F5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #CCC' }}>
                        {item.students} students
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                border: '2px solid #000',
                borderRadius: '6px',
                boxShadow: '6px 6px 0px #000',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
              }}
            >
              <div style={{ background: '#E6E6E6', padding: '24px', borderRadius: '50%', border: '2px solid #000' }}>
                <Users size={48} color="#000" />
              </div>
              <h3 style={{ ...SG, fontSize: '24px', fontWeight: 700 }}>Teacher Management</h3>
              <p style={{ ...IN, fontSize: '15px', color: '#555', maxWidth: '300px' }}>
                Create new teacher accounts and send them their login credentials.
              </p>
              <button
                onClick={() => setShowAddTeacher(true)}
                style={{
                  ...IN, width: '100%', marginTop: '16px', height: '48px', background: '#000', color: '#fff',
                  border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                + Add Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddTeacher && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#fff', padding: '32px', border: '2px solid #000', borderRadius: '8px',
            boxShadow: '8px 8px 0px #000', width: '100%', maxWidth: '400px'
          }}>
            <h2 style={{ ...SG, fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Add New Teacher</h2>
            {teacherError && <p style={{ color: 'red', marginBottom: '16px', ...IN }}>{teacherError}</p>}
            <form onSubmit={handleAddTeacher} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newTeacher.name}
                onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                required
                style={{ ...IN, height: '40px', padding: '0 12px', border: '2px solid #000', borderRadius: '4px' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newTeacher.email}
                onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                required
                style={{ ...IN, height: '40px', padding: '0 12px', border: '2px solid #000', borderRadius: '4px' }}
              />
              <input
                type="password"
                placeholder="Temporary Password"
                value={newTeacher.password}
                onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                required
                style={{ ...IN, height: '40px', padding: '0 12px', border: '2px solid #000', borderRadius: '4px' }}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddTeacher(false)} style={{ ...IN, padding: '8px 16px', border: '2px solid #000', borderRadius: '4px', background: '#eee' }}>Cancel</button>
                <button type="submit" disabled={isAdding} style={{ ...IN, padding: '8px 16px', border: '2px solid #000', borderRadius: '4px', background: '#00C851', color: '#000', fontWeight: 'bold' }}>
                  {isAdding ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
