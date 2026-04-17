export default function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3.5 w-32 rounded-lg" />
          <div className="skeleton h-3 w-20 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full rounded-lg" />
        <div className="skeleton h-3.5 w-4/5 rounded-lg" />
        <div className="skeleton h-3.5 w-3/5 rounded-lg" />
      </div>
      <div className="skeleton h-48 w-full rounded-xl" />
      <div className="flex gap-2">
        <div className="skeleton h-9 w-20 rounded-xl" />
        <div className="skeleton h-9 w-24 rounded-xl" />
        <div className="skeleton h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}
