import { Star, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SiteLayout from "@/components/site/SiteLayout";
import { getReviews } from "@/lib/supabase";

const Reviews = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews
  });

  const avg = reviews.length > 0 
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <SiteLayout>
      <section className="pt-32 pb-12 border-b border-border">
        <div className="container max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Verified guest stories</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Reviews & testimonials</h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />)}
          </div>
          <p className="text-2xl font-serif">
            <span className="text-yellow-600">{avg}</span> / 5 from {reviews.length} verified stays
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="bg-card border border-border rounded-md p-8 hover:shadow-card transition-smooth">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-serif text-xl flex items-center gap-2">
                      {r.guest_name}
                      {r.verified && <BadgeCheck className="w-4 h-4 text-yellow-600" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.country} · {new Date(r.review_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {r.room_type}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                  </div>
                </div>
                <p className="text-foreground/85 leading-relaxed">"{r.text}"</p>
              </article>
            ))
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Reviews;