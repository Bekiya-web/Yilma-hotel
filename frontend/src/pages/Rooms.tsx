import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SiteLayout from "@/components/site/SiteLayout";
import BookingWidget from "@/components/site/BookingWidget";
import RoomCard from "@/components/site/RoomCard";
import { getRooms } from "@/lib/supabase";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const Rooms = () => {
  const [bedTypes, setBedTypes] = useState<Record<string, boolean>>({});
  const [minRating, setMinRating] = useState(4);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });

  // Calculate price range based on admin-inserted room prices
  const validPrices = rooms
    .map(r => r.price)
    .filter(price => typeof price === 'number' && !isNaN(price) && price > 0);
  
  const maxRoomPrice = validPrices.length > 0 ? Math.max(...validPrices) : 5000;
  const minRoomPrice = validPrices.length > 0 ? Math.min(...validPrices) : 100;

  // Initialize maxPrice to the highest room price
  const [maxPrice, setMaxPrice] = useState(maxRoomPrice);

  // Update maxPrice when rooms data loads or changes
  useEffect(() => {
    if (validPrices.length > 0) {
      setMaxPrice(maxRoomPrice);
    }
  }, [maxRoomPrice, validPrices.length]);

  // Reset all filters
  const resetFilters = () => {
    setMaxPrice(maxRoomPrice);
    setBedTypes({});
    setMinRating(4);
  };

  const filtered = useMemo(() => {
    const activeBeds = Object.entries(bedTypes).filter(([, v]) => v).map(([k]) => k);
    return rooms.filter((r) => {
      // Filter out rooms with invalid prices
      if (typeof r.price !== 'number' || isNaN(r.price) || r.price <= 0) return false;
      if (r.price > maxPrice) return false;
      if (r.rating < minRating) return false;
      if (activeBeds.length && !activeBeds.some((b) => r.bed.toLowerCase().includes(b))) return false;
      return true;
    });
  }, [rooms, maxPrice, bedTypes, minRating]);

  return (
    <SiteLayout>
      <section className="pt-32 pb-12 border-b border-border">
        <div className="container">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Stay with us</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Rooms & Suites</h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Real-time availability across our collection. Best price guaranteed.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid lg:grid-cols-[260px_1fr] gap-12">
          <aside className="space-y-8 lg:sticky lg:top-28 self-start">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Price per night</h3>
              <Slider
                value={[maxPrice]}
                onValueChange={(v) => setMaxPrice(v[0])}
                max={maxRoomPrice}
                min={minRoomPrice}
                step={Math.ceil((maxRoomPrice - minRoomPrice) / 20)}
              />
              <p className="text-sm text-muted-foreground mt-3">Up to <span className="text-foreground font-medium">ETB {maxPrice.toLocaleString()}</span></p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Bed type</h3>
              <div className="space-y-3">
                {["king", "sofa"].map((b) => (
                  <Label key={b} className="flex items-center gap-3 cursor-pointer text-sm capitalize">
                    <Checkbox
                      checked={!!bedTypes[b]}
                      onCheckedChange={(c) => setBedTypes((s) => ({ ...s, [b]: !!c }))}
                    />
                    {b === "king" ? "King bed" : "With sofa"}
                  </Label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Minimum rating</h3>
              <Slider value={[minRating]} onValueChange={(v) => setMinRating(v[0])} min={3} max={5} step={0.1} />
              <p className="text-sm text-muted-foreground mt-3">★ {minRating.toFixed(1)} & up</p>
            </div>

            <Button 
              onClick={resetFilters} 
              variant="outline" 
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </Button>
          </aside>

          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {isLoading ? 'Loading...' : `${filtered.length} rooms available`}
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              {filtered.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
            {!isLoading && filtered.length === 0 && (
              <p className="text-center py-20 text-muted-foreground">No rooms match your filters.</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Rooms;