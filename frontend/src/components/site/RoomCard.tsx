import { Link } from "react-router-dom";
import { Star, Users, BedDouble, Maximize, Wifi, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/database";

const RoomCard = ({ room }: { room: Room }) => {
  return (
    <article className="group bg-card border border-border rounded-md overflow-hidden hover:shadow-elegant transition-smooth flex flex-col">
      <Link to={`/rooms/${room.room_id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={room.image}
          alt={`${room.name} — ${room.tagline}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
        {room.available <= 3 && (
          <Badge className="absolute top-4 left-4 bg-destructive/90 text-destructive-foreground border-0 animate-shimmer">
            Only {room.available} left
          </Badge>
        )}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full text-xs">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="font-medium">{room.rating}</span>
          <span className="text-muted-foreground">({room.reviews_count})</span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-600 mb-2">{room.view}</p>
        <h3 className="font-serif text-2xl mb-1">{room.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{room.description}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-foreground/70 mb-5">
          <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-yellow-600" /> {room.bed}</span>
          <span className="flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5 text-yellow-600" /> {room.size}</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-yellow-600" /> Up to {room.guests}</span>
          <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-yellow-600" /> WiFi</span>
          <span className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-yellow-600" /> Breakfast</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-serif text-3xl text-yellow-600 leading-none">
              ETB {room.price.toLocaleString()}
              <span className="text-sm text-muted-foreground font-sans"> / night</span>
            </p>
          </div>
          <Button asChild variant="gold">
            <Link to={`/rooms/${room.room_id}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;