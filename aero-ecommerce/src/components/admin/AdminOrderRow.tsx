"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

interface Props {
  order: {
    id: string;
    status: string;
    totalAmount: string;
    createdAt: Date;
    userId: string | null;
    guestEmail: string | null;
  };
}

export default function AdminOrderRow({ order }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setStatus(next);
    startTransition(async () => {
      await updateOrderStatus(order.id, next);
    });
  };

  const customer = order.guestEmail ?? (order.userId ? `User ${order.userId.slice(0, 6)}` : "—");

  return (
    <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] last:border-0 items-center transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <span className="text-[length:var(--text-caption)] font-mono text-[var(--color-dark-900)]">#{order.id.slice(0, 8).toUpperCase()}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)] max-w-[140px] truncate">{customer}</span>
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
        {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </span>
      <span className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">${parseFloat(order.totalAmount).toFixed(2)}</span>
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className="text-[length:var(--text-footnote)] border border-[var(--color-light-300)] px-2 py-1 bg-white text-[var(--color-dark-900)] focus:outline-none focus:border-[var(--color-dark-900)] capitalize"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
