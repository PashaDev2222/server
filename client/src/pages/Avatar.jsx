export default function Avatar({ src, username = '?', size = 40, className = '' }) {
  const initials = username ? username[0].toUpperCase() : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        style={{ width: size, height: size, minWidth: size }}
        className={`avatar ${className}`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.4 }}
      className={`avatar flex items-center justify-center text-white font-bold bg-gradient-to-br from-primary to-secondary ${className}`}
    >
      {initials}
    </div>
  );
}
