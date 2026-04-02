import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema/auditLogs";
import { desc } from "drizzle-orm";

export default async function AuditLogsPage() {
  if (!db) return <p className="text-[var(--color-red)]">Database unavailable.</p>;

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Audit Logs</h1>
      <div className="bg-white border border-[var(--color-light-300)]">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] text-[length:var(--text-footnote)] font-semibold text-[var(--color-dark-500)] uppercase tracking-wide">
          <span>Time</span>
          <span>Action</span>
          <span>Resource</span>
          <span>Resource ID</span>
          <span>Actor</span>
        </div>
        {logs.length === 0 && (
          <p className="px-4 py-6 text-[length:var(--text-caption)] text-[var(--color-dark-500)]">No audit logs yet.</p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] last:border-0 items-center"
          >
            <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] whitespace-nowrap">
              {new Date(log.createdAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] font-mono">{log.action}</span>
            <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">{log.resourceType}</span>
            <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] font-mono">#{log.resourceId.slice(0, 8)}</span>
            <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] font-mono">
              {log.actorId === "guest" ? "guest" : `#${log.actorId.slice(0, 6)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
