import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { messagesAPI, usersAPI } from '../services/api';
import Avatar from '../components/Avatar';
import MessageItem from '../components/MessageItem';
import toast from 'react-hot-toast';

let socket = null;

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Socket setup
  useEffect(() => {
    socket = io('/', { auth: { token: localStorage.getItem('token') } });
    socket.emit('user:online', user._id);

    socket.on('message:receive', (msg) => {
      if (msg.sender._id === activeUser?._id || msg.sender === activeUser?._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      // Update conversations
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === (msg.sender._id || msg.sender));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], lastMessage: msg };
          return updated;
        }
        return prev;
      });
    });

    socket.on('typing:start', ({ senderId }) => {
      if (senderId === activeUser?._id) setIsTyping(true);
    });
    socket.on('typing:stop', ({ senderId }) => {
      if (senderId === activeUser?._id) setIsTyping(false);
    });

    return () => { socket?.disconnect(); socket = null; };
  }, [user._id]);

  // Update typing listener when activeUser changes
  useEffect(() => {
    if (!socket) return;
    socket.off('typing:start');
    socket.off('typing:stop');
    socket.on('typing:start', ({ senderId }) => {
      if (senderId === activeUser?._id) setIsTyping(true);
    });
    socket.on('typing:stop', ({ senderId }) => {
      if (senderId === activeUser?._id) setIsTyping(false);
    });
  }, [activeUser]);

  // Load conversations
  useEffect(() => {
    messagesAPI.getConversations()
      .then((res) => setConversations(res.data))
      .catch(() => {});
  }, []);

  // Load messages when userId param changes
  useEffect(() => {
    if (userId) {
      usersAPI.getById(userId).then((res) => {
        setActiveUser(res.data);
        loadMessages(userId);
      }).catch(() => toast.error('User not found'));
    }
  }, [userId]);

  const loadMessages = async (uid) => {
    setLoading(true);
    try {
      const { data } = await messagesAPI.getMessages(uid);
      setMessages(data);
      setTimeout(scrollToBottom, 50);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (convUser) => {
    setActiveUser(convUser);
    setIsTyping(false);
    navigate(`/messages/${convUser._id}`);
    loadMessages(convUser._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await (await import('../services/api')).usersAPI.search(q);
      setSearchResults(data);
    } catch {} finally {
      setSearching(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!activeUser || !socket) return;
    socket.emit('typing:start', { senderId: user._id, receiverId: activeUser._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => {
      socket?.emit('typing:stop', { senderId: user._id, receiverId: activeUser._id });
    }, 1500));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser || sending) return;
    setSending(true);
    socket?.emit('typing:stop', { senderId: user._id, receiverId: activeUser._id });

    const tempMsg = {
      _id: Date.now().toString(),
      sender: user,
      receiver: activeUser,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText('');
    setTimeout(scrollToBottom, 50);

    try {
      const { data } = await messagesAPI.send({ receiverId: activeUser._id, text: tempMsg.text });
      socket?.emit('message:send', data);
      setMessages((prev) => prev.map((m) => m._id === tempMsg._id ? data : m));
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === activeUser._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], lastMessage: data };
          return updated;
        }
        return [{ user: activeUser, lastMessage: data }, ...prev];
      });
    } catch {
      toast.error('Failed to send');
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] lg:h-[calc(100vh-3rem)] rounded-2xl overflow-hidden card">
      {/* Sidebar */}
      <div className={`${activeUser ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r`}
           style={{ borderColor: 'var(--border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <input
            className="input-field text-sm"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Search results */}
          {searchQuery && (
            <div className="border-b" style={{ borderColor: 'var(--border)' }}>
              {searching ? (
                <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</div>
              ) : searchResults.map((u) => (
                <button key={u._id} onClick={() => { setSearchQuery(''); setSearchResults([]); openConversation(u); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors text-left">
                  <Avatar src={u.avatar} username={u.username} size={40} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>@{u.username}</p>
                    {u.bio && <p className="text-xs truncate w-40" style={{ color: 'var(--text-muted)' }}>{u.bio}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conversations */}
          {conversations.length === 0 && !searchQuery && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
            </div>
          )}
          {conversations.map(({ user: convUser, lastMessage }) => (
            <button
              key={convUser._id}
              onClick={() => openConversation(convUser)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors
                ${activeUser?._id === convUser._id ? 'bg-primary/10' : 'hover:bg-[var(--bg-hover)]'}`}
            >
              <Avatar src={convUser.avatar} username={convUser.username} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  @{convUser.username}
                </p>
                {lastMessage && (
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {lastMessage.sender?._id === user._id ? 'You: ' : ''}{lastMessage.text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${activeUser ? 'flex' : 'hidden sm:flex'} flex-1 flex-col`}>
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="text-6xl">💬</div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Select a conversation
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Search for a user to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => { setActiveUser(null); navigate('/messages'); }}
                className="sm:hidden btn-ghost p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Avatar src={activeUser.avatar} username={activeUser.username} size={40} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  @{activeUser.username}
                </p>
                {isTyping && (
                  <p className="text-xs text-primary animate-pulse-soft">typing...</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="text-4xl">👋</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Say hi to @{activeUser.username}!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageItem
                    key={msg._id}
                    message={msg}
                    isOwn={(msg.sender?._id || msg.sender) === user._id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
              <input
                className="input-field text-sm flex-1"
                placeholder="Type a message..."
                value={text}
                onChange={handleTextChange}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="btn-primary px-4 py-2.5 disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
