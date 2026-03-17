import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ProximaNav } from '../components/ProximaNav';
import { FeedItem } from '../components/FeedItem';
import { SessionCard } from '../components/SessionCard';
import { JoinKeyDisplay } from '../components/JoinKeyDisplay';
import { FileUpload } from '../components/FileUpload';
import { classAPI, feedAPI, sessionAPI } from '../../api';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function ClassFeedPage() {
  const { classId } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPostType, setNewPostType] = useState('announcement');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostFileUrl, setNewPostFileUrl] = useState('');
  const [newPostFileName, setNewPostFileName] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (classId) {
      fetchClassData();
    }
  }, [user, classId]);

  const fetchClassData = async () => {
    try {
      const [clsRes, sessRes, feedRes] = await Promise.all([
        classAPI.getById(Number(classId)),
        sessionAPI.getAll(Number(classId)).catch(() => ({ data: [] })),
        feedAPI.getFeed(Number(classId)).catch(() => ({ data: { items: [] } }))
      ]);
      setClassData(clsRes.data.class || clsRes.data);
      setSessions(sessRes.data?.sessions || sessRes.data || []);
      setFeed(feedRes.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostBody.trim() && !newPostFileUrl) return;
    
    setIsPosting(true);
    try {
      await feedAPI.createPost(Number(classId), {
        type: newPostType,
        title: newPostTitle,
        body: newPostBody,
        fileUrl: newPostFileUrl,
        fileName: newPostFileName
      });
      // Reset form
      setNewPostTitle('');
      setNewPostBody('');
      setNewPostFileUrl('');
      setNewPostFileName('');
      // Refresh feed
      const feedRes = await feedAPI.getFeed(Number(classId));
      setFeed(feedRes.data?.items || []);
    } catch (err) {
      alert('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await feedAPI.deletePost(id);
      setFeed(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleCreateSession = async () => {
    const title = window.prompt('Session title:');
    if (title) {
      try {
        await sessionAPI.create(Number(classId), { title });
        const sessRes = await sessionAPI.getAll(Number(classId));
        setSessions(sessRes.data?.sessions || []);
      } catch (err) {
        alert('Failed to create session');
      }
    }
  };

  if (!user) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ ...SG, fontSize: '24px' }}>Loading...</div>;
  if (!classData) return <div className="min-h-screen flex items-center justify-center" style={{ ...SG, fontSize: '24px' }}>Class not found</div>;

  const isTeacher = user.role === 'teacher';

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FFFBE6' }}>
      <ProximaNav />

      <div className="flex justify-center" style={{ paddingTop: '80px', paddingBottom: '80px', flex: 1 }}>
        <div style={{ maxWidth: '1100px', width: '100%', padding: '0 24px', display: 'flex', gap: '32px', alignItems: 'flex-start', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          
          {/* Main Content (Feed) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header */}
            <div
              style={{
                background: '#FF6B35',
                border: '2px solid #000',
                borderRadius: '8px',
                padding: '40px 32px',
                boxShadow: '6px 6px 0px #000',
                color: '#000',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10">
                <h1 style={{ ...SG, fontSize: '48px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, marginBottom: '8px' }}>
                  {classData.name}
                </h1>
                <p style={{ ...IN, fontSize: '16px', fontWeight: 500, opacity: 0.9 }}>
                  {classData.description || 'Welcome to the class!'}
                </p>
              </div>
            </div>

            {/* Composer (Teacher Only) */}
            {isTeacher && (
              <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0px #000', padding: '24px' }}>
                <h3 style={{ ...SG, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Share something with your class</h3>
                <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <select
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value)}
                      style={{ ...IN, height: '40px', border: '2px solid #000', borderRadius: '4px', background: '#F5F5F5', padding: '0 12px', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                    >
                      <option value="announcement">Announcement</option>
                      <option value="material">Material</option>
                      <option value="assignment">Assignment</option>
                      <option value="discussion">Discussion</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      style={{ ...IN, flex: 1, height: '40px', border: '2px solid #000', borderRadius: '4px', padding: '0 12px', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <textarea
                    placeholder="Write your post here..."
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                    style={{ ...IN, minHeight: '100px', border: '2px solid #000', borderRadius: '4px', padding: '12px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                  />
                  <FileUpload onUploadSuccess={(url, name) => { setNewPostFileUrl(url); setNewPostFileName(name); }} />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isPosting || (!newPostBody.trim() && !newPostFileUrl)}
                      style={{
                        ...SG, height: '40px', padding: '0 24px', background: '#00C851', border: '2px solid #000',
                        borderRadius: '4px', fontSize: '14px', fontWeight: 700, color: '#000', boxShadow: '2px 2px 0px #000',
                        cursor: (!newPostBody.trim() && !newPostFileUrl) ? 'not-allowed' : 'pointer', opacity: (!newPostBody.trim() && !newPostFileUrl) ? 0.6 : 1, transition: 'all 0.1s'
                      }}
                    >
                      {isPosting ? 'Posting...' : 'Post to Feed'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Feed List */}
            <div className="flex flex-col gap-6 mt-4">
              {feed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', ...IN, color: '#666', fontSize: '15px' }}>
                  No posts yet in this class.
                </div>
              ) : (
                feed.map((item) => (
                  <FeedItem key={item.id} item={item} currentUserIsTeacher={isTeacher} onDelete={handleDeletePost} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: window.innerWidth < 768 ? '100%' : '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Join Key */}
            {isTeacher && classData.joinKey && (
              <JoinKeyDisplay joinKey={classData.joinKey} />
            )}

            {/* Sessions */}
            <div style={{ background: '#fff', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0px #000', padding: '24px' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ ...SG, fontSize: '20px', fontWeight: 700 }}>Live Sessions</h3>
                {isTeacher && (
                  <button onClick={handleCreateSession} style={{ ...SM, fontSize: '11px', fontWeight: 700, background: '#7B61FF', color: '#fff', border: '2px solid #000', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
                    + NEW
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-4">
                {sessions.length === 0 ? (
                  <p style={{ ...IN, fontSize: '13px', color: '#666' }}>No upcoming sessions.</p>
                ) : (
                  sessions.map(s => (
                    <SessionCard key={s.id} session={{ ...s, role: isTeacher ? 'teacher' : 'student' }} />
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
