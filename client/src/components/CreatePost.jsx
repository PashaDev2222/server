import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

export default function CreatePost({ onPost }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await postsAPI.create({ text, image });
      onPost(data);
      setText('');
      setImage('');
      setShowImageInput(false);
      toast.success('Posted! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 mb-5">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} username={user?.username} size={44} />
        <div className="flex-1">
          <textarea
            className="input-field resize-none text-sm"
            rows={3}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            disabled={loading}
          />

          {showImageInput && (
            <input
              className="input-field text-sm mt-2"
              placeholder="Image URL (optional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`btn-ghost text-sm flex items-center gap-1.5 ${showImageInput ? 'text-primary' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Photo
              </button>
              {text.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {text.length}/2000
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className="btn-primary text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting...
                </span>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
