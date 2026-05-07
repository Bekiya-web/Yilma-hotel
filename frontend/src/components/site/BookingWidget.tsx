import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = { variant?: "hero" | "inline" };

const BookingWidget = ({ variant = "hero" }: Props) => {
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(); dayAfter.setDate(today.getDate() + 3);

  const [checkIn, setCheckIn] = useState<Date | undefined>(tomorrow);
  const [checkOut, setCheckOut] = useState<Date | undefined>(dayAfter);
  const [guests, setGuests] = useState("2");
  const [roomType, setRoomType] = useState("any");
  const navigate = useNavigate();

  const onSearch = () => {
    navigate("/rooms");
  };

  const Field = ({
    label,
    children,
  }: { label: string; children: React.ReactNode }) => (
    <div className="flex-1 min-w-0 px-5 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-300 mb-1 font-semibold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' }}>{label}</p>
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        "w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-elegant rounded-md",
        variant === "hero" ? "" : "bg-card/50"
      )}
      style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-white/20">
        <Field label="Check in">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full text-left flex items-center gap-2 text-base font-medium",
                  !checkIn && "opacity-70"
                )}
                style={{ 
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)'
                }}
              >
                <CalendarIcon className="w-4 h-4" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                {checkIn ? format(checkIn, "EEE, MMM d") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(d) => d < today}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Check out">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full text-left flex items-center gap-2 text-base font-medium",
                  !checkOut && "opacity-70"
                )}
                style={{ 
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)'
                }}
              >
                <CalendarIcon className="w-4 h-4" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                {checkOut ? format(checkOut, "EEE, MMM d") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(d) => d <= (checkIn ?? today)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Guests">
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-base font-medium focus:ring-0 shadow-none" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' }}>
              <Users className="w-4 h-4 mr-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Guest" : "Guests"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Room type">
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-base font-medium focus:ring-0 shadow-none" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any room</SelectItem>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="p-3 lg:w-56 flex">
          <Button onClick={onSearch} variant="hero" size="xl" className="w-full gap-2">
            <Search className="w-4 h-4" />
            Check Availability
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;