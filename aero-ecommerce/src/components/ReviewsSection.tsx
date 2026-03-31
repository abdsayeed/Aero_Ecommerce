import { Star } from "lucide-react";
import { getProductReviews } from "@/lib/actions/products";
import type { ProductReview } from "@/lib/actions/products";
import CollapsibleSection from "./CollapsibleSection";

// ─── Star row ─────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          fill={i < rating ? "currentColor" : "none"}
          strokeWidth={1.5}
          style={{ color: "var(--color-dark-900)" }}
        />
      ))}
    </div>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ProductReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="py-4 border-b border-[var(--color-light-300)] last:border-0">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <div>
          <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)]">
            {review.author}
          </p>
          <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)]">{date}</p>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.content && (
        <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
          {review.content}
        </p>
      )}
    </div>
  );
}

// ─── Average stars (for collapsible aside) ────────────────────────────────────

function AverageStars({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-1.5">
      <Stars rating={Math.round(avg)} />
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
        ({reviews.length})
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default async function ReviewsSection({ productId }: { productId: string }) {
  const reviewList = await getProductReviews(productId);

  return (
    <CollapsibleSection
      title={`Reviews (${reviewList.length})`}
      aside={<AverageStars reviews={reviewList} />}
    >
      {reviewList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <Star className="w-8 h-8 text-[var(--color-light-300)]" />
          <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)]">
            No reviews yet. Be the first to review this product.
          </p>
        </div>
      ) : (
        <div>
          {reviewList.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
