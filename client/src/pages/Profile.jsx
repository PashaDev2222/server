import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, postsAPI } from '../services/api';
import Avatar from './Avatar';  
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

// Fix import
import AvatarComp from '../components/Avatar';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUserLocal } = useAuth();
  const navigate = useNavigate();
  const isOwn = user?._id === id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([usersAPI.getById(id), postsAPI.getUserPosts(id)])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setForm({
          username: profileRes.data.username,
          bio: profileRes.data.bio || '',
          avatar: profileRes.data.avatar || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await usersAPI.update(id, form);
      setProfile(data);
      updateUserLocal(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-32 rounded-lg" />
            <div className="skeleton h-3.5 w-48 rounded-lg" />
            <div className="skeleton h-3.5 w-24 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🙈</div>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>User not found</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <AvatarComp src={profile.avatar} username={profile.username} size={80} />
            <div>
              {editing ? (
                <div className="space-y-2">
                  <input
                    className="input-field text-sm py-2 w-48"
                    value={form.username}
                    onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="Username"
                    maxLength={30}
                  />
                  <input
                    className="input-field text-sm py-2 w-48"
                    value={form.avatar}
                    onChange={(e) => setForm(f => ({ ...f, avatar: e.target.value }))}
                    placeholder="Avatar URL"
                  />
                  <textarea
                    className="input-field text-sm py-2 w-48 resize-none"
                    rows={2}
                    value={form.bio}
                    onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Bio"
                    maxLength={200}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    @{profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-sm mt-1 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                      {profile.bio}
                    </p>
                  )}
                  <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </p>
                </>
              )}
            </div>
          </div>

          {isOwn && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          )}
          {!isOwn && (
            <button
              onClick={() => navigate(`/messages/${profile._id}`)}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Message
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-lg font-semibold px-1" style={{ color: 'var(--text-primary)' }}>Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  );
}
