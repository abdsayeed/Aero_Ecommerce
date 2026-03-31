function Bone({ className }: { className?: string }) {
  return <div className={`bg-[var(--color-light-300)] animate-pulse rounded ${className ?? ""}`} aria-hidden="true" />;
}

export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-3">
      <Bone className="h-7 w-40 mb-3" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-[var(--color-light-300)]">
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-3 w-36" />
          </div>
          <div className="flex items-center gap-4">
            <Bone className="h-5 w-16" />
            <Bone className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
