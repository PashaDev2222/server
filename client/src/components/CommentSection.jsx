import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function CommentSection({ postId, comments, onComment }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await postsAPI.comment(postId, { text });
      onComment(data);
      setText('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 animate-fade-in">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <Avatar src={user?.avatar} username={user?.username} size={32} />
        <div className="flex-1 flex gap-2">
          <input
            className="input-field text-sm py-2"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            ) : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2.5 animate-slide-up">
            <Avatar src={c.author?.avatar} username={c.author?.username} size={30} />
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl rounded-tl-sm px-3 py-2" style={{ background: 'var(--bg-hover)' }}>
                <span className="text-xs font-semibold mr-2" style={{ color: 'var(--text-primary)' }}>
                  {c.author?.username}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.text}</span>
              </div>
              <p className="text-xs mt-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
