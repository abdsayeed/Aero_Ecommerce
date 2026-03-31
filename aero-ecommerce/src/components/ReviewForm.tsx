"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/actions/reviews";

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setError(null);
    startTransition(async () => {
      const result = await submitReview(productId, rating, comment);
      if ("error" in result) { setError(result.error); }
      else { setDone(true); }
    });
  };

  if (done) {
    return (
      <div className="py-4 text-[length:var(--text-caption)] text-[var(--color-green)]">
        ✓ Thank you for your review!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 border-t border-[var(--color-light-300)]">
      <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">Write a Review</p>

      {/* Star picker */}
      <div className="flex items-center gap-1" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            className="focus:outline-none"
          >
            <Star
              className="w-5 h-5 transition-colors"
              fill={(hover || rating) >= n ? "currentColor" : "none"}
              strokeWidth={1.5}
              style={{ color: (hover || rating) >= n ? "var(--color-dark-900)" : "var(--color-light-400)" }}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts (optional, max 500 chars)"
        maxLength={500}
        rows={3}
        className="w-full px-4 py-3 border border-[var(--color-light-300)] text-[length:var(--text-caption)] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors resize-none"
      />

      {error && <p className="text-[length:var(--text-footnote)] text-[var(--color-red)]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start h-10 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-caption)] font-medium hover:bg-[var(--color-dark-700)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
