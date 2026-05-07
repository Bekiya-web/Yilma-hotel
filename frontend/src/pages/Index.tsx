import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Award, Sparkles, ShieldCheck, Clock, Star, ArrowRight, Utensils, Waves, Dumbbell, Wifi, Smartphone, CreditCard, Globe, Headphones, Shield, Zap } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import BookingWidget from "@/components/site/BookingWidget";
import RoomCard from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import { getRooms } from "@/lib/supabase";
import { getReviews } from "@/api";
import { getHotelInfo, type HotelInfo } from "@/api/settings.api";
import dining from "@/assets/amenity-dining.jpg";
import spa from "@/assets/amenity-spa.jpg";

const trustItems = [
  { icon: ShieldCheck, label: "Best price guaranteed" },
  { icon: Clock, label: "Free cancellation" },
  { icon: Sparkles, label: "Instant confirmation" },
  { icon: Award, label: "Five-star service" },
];

const experiences = [
  { icon: Utensils, title: "Fine dining", text: "A candlelit grand dining room led by a Michelin-trained chef." },
  { icon: Waves, title: "Spa & sanctuary", text: "Hammam, mineral pools, and signature treatments by appointment." },
  { icon: Dumbbell, title: "Wellness club", text: "24/7 atelier gym, daily yoga, personal training on request." },
  { icon: Wifi, title: "Smart suites", text: "Voice-controlled lighting, climate, and curtains in every room." },
];

const modernFeatures = [
  { icon: Smartphone, title: "Mobile Check-in", text: "Skip the desk. Check in from your phone and go straight to your room." },
  { icon: CreditCard, title: "Contactless Payment", text: "Apple Pay, Google Pay, and all major digital wallets accepted." },
  { icon: Globe, title: "Multi-language Support", text: "Staff fluent in 12+ languages. Real-time translation available." },
  { icon: Headphones, title: "24/7 Concierge", text: "WhatsApp, chat, or call. We're here whenever you need us." },
  { icon: Shield, title: "Enhanced Sanitization", text: "Hospital-grade cleaning protocols. Your safety is our priority." },
  { icon: Zap, title: "Fast WiFi & Charging", text: "Gigabit internet and wireless charging stations in every room." },
];

const Index = () => {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews
  });

  useEffect(() => {
    const loadHotelInfo = async () => {
      const info = await getHotelInfo();
      if (info) setHotelInfo(info);
    };
    loadHotelInfo();
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[100vh] flex items-end pb-20 pt-32 overflow-hidden">
        <img
          src="/good.avif"
          alt="Auréa Grand luxury hotel exterior at dusk"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:block hidden" />

        <div className="container relative z-10">
          <div className="max-w-3xl mb-12 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-400 mb-5 drop-shadow-lg">Five-star sanctuary</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6 text-white drop-shadow-2xl">
              Find & book your <em className="text-yellow-400 not-italic">perfect stay</em> in seconds.
            </h1>
            <p className="text-lg text-white/90 max-w-xl leading-relaxed drop-shadow-lg">
              {hotelInfo?.description || "Experience luxury and comfort at YILMA HOTEL. Your perfect stay awaits in the heart of Addis Ababa. Real-time availability, instant confirmation, best price guaranteed."}
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <BookingWidget />
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-5 text-xs text-white/80">
              {trustItems.map((t) => (
                <span key={t.label} className="flex items-center gap-2 drop-shadow-md">
                  <t.icon className="w-4 h-4 text-yellow-400" /> {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS PREVIEW */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Rooms & Suites</p>
              <h2 className="font-serif text-4xl md:text-5xl mb-4">
                Spaces designed to slow time down.
              </h2>
              <p className="text-muted-foreground">
                Every room is a private sanctuary — handcrafted finishes, deep silence, and views worth the journey.
              </p>
            </div>
            <Button asChild variant="goldOutline" size="lg">
              <Link to="/rooms">View all rooms <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p className="text-center col-span-full text-muted-foreground">Loading rooms...</p>
            ) : (
              rooms.slice(0, 3).map((r) => (
                <RoomCard key={r.id} room={r} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* MODERN FEATURES */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Modern Hospitality</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Timeless elegance meets cutting-edge convenience.
            </h2>
            <p className="text-muted-foreground text-lg">
              We blend traditional service with modern technology to make your stay seamless and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modernFeatures.map((feature) => (
              <div 
                key={feature.title} 
                className="group bg-card border border-border rounded-lg p-8 hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-5 group-hover:bg-yellow-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-serif text-xl mb-2 group-hover:text-yellow-600 transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 bg-card border border-border rounded-full px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Real-time availability</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Secure booking</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Instant confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section id="experiences" className="py-24 md:py-32 bg-card/30 border-y border-border">
        <div className="container grid lg:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img src={dining} alt="Grand dining room" loading="lazy" width={1280} height={896} className="w-full h-80 object-cover rounded-md hover:shadow-card transition-smooth" />
            <img src={spa} alt="Candlelit spa pool" loading="lazy" width={1280} height={896} className="w-full h-80 object-cover rounded-md hover:shadow-card transition-smooth mt-12" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">The Auréa Experience</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">More than a stay. A series of small ceremonies.</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              From the first welcome at the door to the last morning espresso, every moment is designed with intention.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {experiences.map((e) => (
                <div key={e.title} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <e.icon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-1">{e.title}</h3>
                    <p className="text-sm text-muted-foreground">{e.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">
              Guests · {reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0'} / 5
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Loved by travellers worldwide.</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">From {reviews.length} verified stays</p>
          </div>

          {reviewsLoading ? (
            <p className="text-center text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review) => (
                <figure key={review.id} className="bg-card border border-border rounded-md p-8 hover:shadow-card transition-smooth">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <blockquote className="font-serif text-lg leading-relaxed mb-6">"{review.text}"</blockquote>
                  <figcaption className="text-sm">
                    <p className="text-foreground font-medium">{review.guest_name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{review.country}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img src="/hero image .jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="container relative z-10 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Reserve your suite</p>
          <h2 className="font-serif text-4xl md:text-6xl mb-6">Your story at Auréa begins tonight.</h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Best rate, instant confirmation, free cancellation up to 48 hours.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/rooms">Check Availability <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
