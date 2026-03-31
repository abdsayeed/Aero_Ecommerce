function Bone({ className }: { className?: string }) {
  return <div className={`bg-[var(--color-light-300)] animate-pulse rounded ${className ?? ""}`} aria-hidden="true" />;
}

export default function WishlistLoading() {
  return (
    <div>
      <Bone className="h-7 w-40 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Bone className="aspect-square w-full" />
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
