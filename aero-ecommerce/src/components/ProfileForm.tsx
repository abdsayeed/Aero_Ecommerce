"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/account";

export default function ProfileForm({ name, email }: { name: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if ("error" in result) { setError(result.error); }
      else { setSuccess(true); }
    });
  };

  const inputCls = "w-full h-11 px-4 border border-[var(--color-light-300)] text-[length:var(--text-body)] text-[var(--color-dark-900)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-1.5">
        <label className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">Full Name</label>
        <input name="name" type="text" defaultValue={name} required className={inputCls} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">Email</label>
        <input type="email" value={email} disabled className={`${inputCls} bg-[var(--color-light-200)] text-[var(--color-dark-500)] cursor-not-allowed`} />
        <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)]">Email cannot be changed.</p>
      </div>
      {error && <p className="text-[length:var(--text-footnote)] text-[var(--color-red)]">{error}</p>}
      {success && <p className="text-[length:var(--text-footnote)] text-[var(--color-green)]">Profile updated.</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start h-11 px-8 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
