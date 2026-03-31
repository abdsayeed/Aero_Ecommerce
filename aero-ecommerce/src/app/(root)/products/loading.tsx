function Bone({ className }: { className?: string }) {
  return <div className={`bg-[var(--color-light-300)] animate-pulse rounded ${className ?? ""}`} aria-hidden="true" />;
}

export default function ProductsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <div className="h-16 border-b border-[var(--color-light-300)]" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Bone className="h-5 w-32" />
          <Bone className="h-8 w-28" />
        </div>
        <div className="flex gap-8 items-start">
          <div className="hidden lg:flex flex-col gap-4 w-48 shrink-0">
            {Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-8 w-full" />)}
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Bone className="aspect-square w-full" />
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
