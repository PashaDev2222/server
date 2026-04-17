import { formatDistanceToNow } from 'date-fns';

export default function MessageItem({ message, isOwn }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <div className={isOwn ? 'message-bubble-sent' : 'message-bubble-received'}>
        <p className="text-sm">{message.text}</p>
      </div>
      <span className="text-xs shrink-0 mb-1" style={{ color: 'var(--text-muted)' }}>
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}
