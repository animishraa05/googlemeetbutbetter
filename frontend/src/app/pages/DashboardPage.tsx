import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ProximaNav } from '../components/ProximaNav';
import { Plus, Users, BookOpen, Clock } from 'lucide-react';
import { classAPI } from '../../api';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function DashboardPage() {
  const { user, createRoom } = useApp();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchClasses();
  }, [user, navigate]);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewClass = () => {
    // Navigate to a create class flow or open a modal
    // For now, let's just trigger a prompt
    const name = window.prompt('Enter new class name:');
    if (name) {
      classAPI.create({ name, description: 'Newly created class' })
        .then(() => fetchClasses())
        .catch(e => alert('Failed to create class: ' + (e.response?.data?.error || e.message)));
    }
  };

  const handleJoinClass = () => {
    navigate('/join');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FFFBE6' }}>
      <ProximaNav />

      <div className="flex flex-col items-center" style={{ paddingTop: '80px', paddingBottom: '80px', flex: 1 }}>
        <div style={{ maxWidth: '1000px', width: '100%', padding: '0 24px' }}>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 style={{ ...SG, fontSize: '40px', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1 }}>
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p style={{ ...IN, fontSize: '16px', color: '#555', marginTop: '8px' }}>
                Here's what's happening in your classes.
              </p>
            </div>
            <div className="flex gap-3">
              {user.role === 'teacher' ? (
                <button
                  onClick={handleCreateNewClass}
                  style={{
                    ...SG, height: '44px', padding: '0 20px', background: '#FF6B35', border: '2px solid #000',
                    borderRadius: '4px', fontSize: '15px', fontWeight: 700, color: '#000', boxShadow: '4px 4px 0px #000',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.1s'
                  }}
                  onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translate(2px,2px)'; b.style.boxShadow = '2px 2px 0px #000'; }}
                  onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = '4px 4px 0px #000'; }}
                >
                  <Plus size={18} /> New Class
                </button>
              ) : (
                <button
                  onClick={handleJoinClass}
                  style={{
                    ...SG, height: '44px', padding: '0 20px', background: '#7B61FF', border: '2px solid #000',
                    borderRadius: '4px', fontSize: '15px', fontWeight: 700, color: '#fff', boxShadow: '4px 4px 0px #000',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.1s'
                  }}
                  onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translate(2px,2px)'; b.style.boxShadow = '2px 2px 0px #000'; }}
                  onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = '4px 4px 0px #000'; }}
                >
                  <Users size={18} /> Join Class
                </button>
              )}
            </div>
          </div>

          {/* Classes Grid */}
          <div>
            <h2 style={{ ...SG, fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Your Classes</h2>
            {loading ? (
              <p style={{ ...IN, fontSize: '15px', color: '#666' }}>Loading classes...</p>
            ) : classes.length === 0 ? (
              <div
                style={{
                  background: '#fff', border: '2px dashed #000', borderRadius: '6px', padding: '48px',
                  textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                }}
              >
                <div style={{ background: '#E6E6E6', padding: '16px', borderRadius: '50%', border: '2px solid #000' }}>
                  <BookOpen size={32} />
                </div>
                <div>
                  <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>No classes yet</h3>
                  <p style={{ ...IN, fontSize: '15px', color: '#666', marginTop: '4px' }}>
                    {user.role === 'teacher' ? 'Create a new class to get started.' : 'Join a class using a join key.'}
                  </p>
                </div>
                <button
                  onClick={user.role === 'teacher' ? handleCreateNewClass : handleJoinClass}
                  style={{
                    ...IN, marginTop: '8px', padding: '8px 16px', background: '#fff', border: '2px solid #000',
                    borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '2px 2px 0px #000'
                  }}
                >
                  {user.role === 'teacher' ? 'Create Class' : 'Enter Join Key'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls, idx) => (
                  <div
                    key={cls.id}
                    onClick={() => navigate(`/class/${cls.id}`)}
                    style={{
                      background: '#fff',
                      border: '2px solid #000',
                      boxShadow: '6px 6px 0px #000',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0px #000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0px #000'; }}
                  >
                    <div style={{ height: '80px', background: ['#FF6B35', '#7B61FF', '#00C851', '#0085FF'][idx % 4], borderBottom: '2px solid #000', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                      <h3 style={{ ...SG, fontSize: '22px', fontWeight: 700, color: ['#FF6B35', '#00C851'].includes(['#FF6B35', '#7B61FF', '#00C851', '#0085FF'][idx%4]) ? '#000' : '#fff', lineHeight: 1.1 }}>
                        {cls.name}
                      </h3>
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ ...IN, fontSize: '14px', color: '#555', marginBottom: '16px', flex: 1 }}>
                        {cls.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex justify-between items-center" style={{ paddingTop: '16px', borderTop: '2px solid #EEE' }}>
                        <span style={{ ...SM, fontSize: '12px', background: '#EEE', padding: '4px 8px', borderRadius: '4px', border: '1px solid #CCC', color: '#333' }}>
                          {cls.joinKey ? `Code: ${cls.joinKey}` : 'Active'}
                        </span>
                        <div className="flex items-center gap-1" style={{ color: '#666' }}>
                          <Users size={14} />
                          <span style={{ ...IN, fontSize: '13px', fontWeight: 600 }}>12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
