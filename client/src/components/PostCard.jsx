import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function PostCard({ post: initialPost }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isLiked = post.likes?.some((id) =>
    (id._id || id).toString() === user?._id?.toString()
  );

  const handleLike = useCallback(async () => {
    if (liking) return;
    setLiking(true);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);

    // Optimistic update
    setPost((prev) => ({
      ...prev,
      likes: isLiked
        ? prev.likes.filter((id) => (id._id || id).toString() !== user._id.toString())
        : [...prev.likes, user._id],
    }));

    try {
      await postsAPI.like(post._id);
    } catch {
      // Revert
      setPost(initialPost);
      toast.error('Failed to like post');
    } finally {
      setLiking(false);
    }
  }, [liking, isLiked, post._id, user._id, initialPost]);

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/posts/${post._id}`)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast('Share: ' + post.text.slice(0, 40)));
  };

  const handleComment = (newComment) => {
    setPost((prev) => ({ ...prev, comments: [...prev.comments, newComment] }));
  };

  return (
    <article className="card p-5 post-item animate-slide-up hover:shadow-card transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.avatar} username={post.author?.username} size={44} />
          <div>
            <p className="text-sm font-semibold group-hover:text-primary transition-colors"
               style={{ color: 'var(--text-primary)' }}>
              @{post.author?.username}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      </div>

      {/* Text */}
      <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {post.text}
      </p>

      {/* Image */}
      {post.image && (
        <div className="mb-3 rounded-xl overflow-hidden bg-[var(--bg-hover)]">
          {!imgLoaded && <div className="skeleton h-64 w-full" />}
          <img
            src={post.image}
            alt="Post"
            className={`w-full object-cover max-h-96 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Like */}
        <button
          onClick={handleLike}
          className={`like-btn ${isLiked ? 'liked' : ''} ${heartAnim ? 'heart-pop' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4.5 h-4.5"
            viewBox="0 0 24 24"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likes?.length || 0}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`comment-btn ${showComments ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="share-btn ml-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments}
          onComment={handleComment}
        />
      )}
    </article>
  );
}
