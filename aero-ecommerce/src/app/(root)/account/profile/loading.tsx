function Bone({ className }: { className?: string }) {
  return <div className={`bg-[var(--color-light-300)] animate-pulse rounded ${className ?? ""}`} aria-hidden="true" />;
}

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-5 max-w-md">
      <Bone className="h-7 w-24 mb-1" />
      <div className="flex flex-col gap-1.5">
        <Bone className="h-4 w-20" />
        <Bone className="h-11 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Bone className="h-4 w-16" />
        <Bone className="h-11 w-full" />
      </div>
      <Bone className="h-11 w-32" />
    </div>
  );
}
