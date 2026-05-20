import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, Phone, X, LogOut, User } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { getHotelInfo, type HotelInfo } from "@/api/settings.api";
import { getBookingsByEmail } from "@/api/bookings.api";
import { toast } from "sonner";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Stay", to: "/rooms" },
  { label: "Gallery", to: "/gallery" },
  { label: "Reviews", to: "/reviews" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const email = localStorage.getItem("customerEmail");
    setCustomerEmail(email);
  }, [location.pathname]); // Re-check on route change

  // Fetch user's bookings to check if they have any
  const { data: bookings = [] } = useQuery({
    queryKey: ['customer-bookings-count', customerEmail],
    queryFn: () => getBookingsByEmail(customerEmail!),
    enabled: !!customerEmail,
  });

  const hasBookings = bookings.length > 0;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("customerEmail");
    setCustomerEmail(null);
    toast.success("You have been logged out successfully");
    navigate("/");
  };

  // Handle booking button click
  const handleBookNow = () => {
    if (customerEmail && !hasBookings) {
      // User is logged in but has no bookings, redirect to rooms
      navigate("/rooms");
    } else if (customerEmail && hasBookings) {
      // User has bookings, redirect to rooms
      navigate("/rooms");
    } else {
      // User not logged in, redirect to sign in
      navigate("/my-bookings", { state: { returnTo: "/rooms" } });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  // Load hotel info
  useEffect(() => {
    const loadHotelInfo = async () => {
      const info = await getHotelInfo();
      if (info) setHotelInfo(info);
    };
    loadHotelInfo();
  }, []);

  const isHome = location.pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled || !isHome
          ? "bg-background/95 backdrop-blur-md border-b border-border/60"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-20">
        <Logo />

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm uppercase tracking-widest transition-smooth ${
                scrolled || !isHome
                  ? "text-foreground/80 hover:text-yellow-500"
                  : "text-white/90 hover:text-yellow-400 drop-shadow-lg"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className={scrolled || !isHome ? "" : "text-white drop-shadow-lg"}>
            <ThemeToggle />
          </div>
          <a
            href={`tel:${hotelInfo?.phone || '+251911234567'}`}
            className={`hidden md:flex items-center gap-2 text-sm transition-smooth ${
              scrolled || !isHome
                ? "text-foreground/80 hover:text-yellow-500"
                : "text-white/90 hover:text-yellow-400 drop-shadow-lg"
            }`}
          >
            <Phone className="w-4 h-4" />
            {hotelInfo?.phone || '+251 911 234 567'}
          </a>
          
          {customerEmail ? (
            // User is logged in
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link to="/my-bookings">
                  My Bookings
                </Link>
              </Button>
              <Button onClick={handleBookNow} variant="hero" size="sm" className="hidden md:inline-flex">
                Book Now
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="hidden md:inline-flex text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            // User not logged in
            <Button onClick={handleBookNow} variant="hero" size="sm" className="hidden md:inline-flex">
              Book Now
            </Button>
          )}
          
          <button
            className={`lg:hidden p-2 ${scrolled || !isHome ? "text-foreground" : "text-white drop-shadow-lg"}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="container py-6 flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm uppercase tracking-widest text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
            {customerEmail && (
              <Button asChild variant="outline" className="mt-2">
                <Link to="/my-bookings">
                  My Bookings
                </Link>
              </Button>
            )}
            {customerEmail ? (
              <>
                <Button onClick={handleBookNow} variant="hero">
                  Book Now
                </Button>
                <div className="text-xs text-muted-foreground px-2">
                  Logged in as: {customerEmail}
                </div>
                <Button onClick={handleLogout} variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleBookNow} variant="hero">
                Book Now
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;