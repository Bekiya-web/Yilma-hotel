import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Users, BedDouble, Maximize, Check, ArrowLeft, Eye, Clock, LogIn } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRoom } from "@/api";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const email = localStorage.getItem("customerEmail");
    setIsLoggedIn(!!email);
  }, []);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoom(id || ''),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container py-40 text-center">
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!room) {
    return (
      <SiteLayout>
        <div className="container py-40 text-center">
          <h1 className="font-serif text-4xl mb-4">Room not found</h1>
          <Button asChild variant="gold"><Link to="/rooms">Browse rooms</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-28 pb-12">
        <div className="container">
          <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-600 mb-6 transition-smooth">
            <ArrowLeft className="w-4 h-4" /> Back to rooms
          </Link>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            {/* MAIN CONTENT */}
            <div>
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="col-span-4 aspect-[16/10] rounded-md overflow-hidden bg-card">
                  <img src={room.gallery[activeImg]} alt={room.name} className="w-full h-full object-cover" />
                </div>
                {room.gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-[4/3] rounded-md overflow-hidden border-2 transition-smooth ${
                      activeImg === i ? "border-yellow-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-3">{room.view}</p>
              <h1 className="font-serif text-5xl mb-3">{room.name}</h1>
              <p className="text-xl text-muted-foreground italic mb-6">{room.tagline}</p>

              <div className="flex flex-wrap gap-6 pb-8 border-b border-border mb-8">
                <span className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {room.rating} ({room.reviews_count} reviews)</span>
                <span className="flex items-center gap-2 text-sm"><BedDouble className="w-4 h-4 text-yellow-600" /> {room.bed}</span>
                <span className="flex items-center gap-2 text-sm"><Maximize className="w-4 h-4 text-yellow-600" /> {room.size}</span>
                <span className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-yellow-600" /> Up to {room.guests} guests</span>
              </div>

              <div className="prose prose-invert max-w-none mb-10">
                <h2 className="font-serif text-3xl mb-4">About this room</h2>
                <p className="text-foreground/80 leading-relaxed text-lg">{room.long_description}</p>
              </div>

              <div className="mb-10">
                <h2 className="font-serif text-3xl mb-6">What's included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {room.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-yellow-600 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-md p-6">
                <h3 className="font-serif text-xl mb-2">Cancellation policy</h3>
                <p className="text-sm text-muted-foreground">Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable. No hidden fees, ever.</p>
              </div>
            </div>

            {/* STICKY BOOKING SIDEBAR */}
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-card border border-border rounded-md shadow-elegant p-6">
                {room.available <= 3 && (
                  <Badge className="mb-4 bg-destructive/90 border-0 text-destructive-foreground">
                    Only {room.available} rooms left
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-serif text-4xl text-yellow-600 mb-1">ETB {room.price.toLocaleString()}<span className="text-base text-muted-foreground font-sans"> / night</span></p>
                <p className="text-xs text-muted-foreground mb-6">Taxes included · No hidden fees</p>

                <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between"><span className="text-muted-foreground">2 nights</span><span>ETB {(room.price * 2).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-success">Included</span></div>
                  <div className="flex justify-between font-medium pt-2 text-base"><span>Total</span><span className="text-yellow-600">ETB {(room.price * 2).toLocaleString()}</span></div>
                </div>

                <Button onClick={() => navigate(`/checkout/${room.room_id}`)} variant="hero" size="xl" className="w-full mb-3">
                  Book this room
                </Button>
                <p className="text-xs text-center text-muted-foreground">Free cancellation · Instant confirmation</p>

                <div className="mt-6 pt-6 border-t border-border space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Eye className="w-3 h-3 text-yellow-600" /> 12 people viewing this room</p>
                  <p className="flex items-center gap-2"><Clock className="w-3 h-3 text-yellow-600" /> Last booking 8 minutes ago</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default RoomDetail;