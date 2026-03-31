// ─── Shared skeleton primitives ───────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[var(--color-light-300)] animate-pulse rounded ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

// ─── Reviews skeleton ─────────────────────────────────────────────────────────

export function ReviewsSkeleton() {
  return (
    <div className="border-t border-[var(--color-light-300)] py-4">
      <Bone className="h-5 w-32 mb-4" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="py-4 border-b border-[var(--color-light-300)] last:border-0">
          <div className="flex justify-between mb-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-4 w-20" />
          </div>
          <Bone className="h-3 w-full mb-1" />
          <Bone className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ─── Also Like skeleton ───────────────────────────────────────────────────────

export function AlsoLikeSkeleton() {
  return (
    <div className="mt-16">
      <Bone className="h-5 w-40 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {Array.from({ length: 4 }, (_, i) => (
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
