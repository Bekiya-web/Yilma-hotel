import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MapPin, Mail, Phone, Wifi, Car, Coffee, Clock, Heart, Star, ChevronRight, Send } from "lucide-react";
import Logo from "./Logo";
import { getHotelInfo, type HotelInfo } from "@/api/settings.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const loadHotelInfo = async () => {
      const info = await getHotelInfo();
      if (info) setHotelInfo(info);
    };
    loadHotelInfo();
  }, []);

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send this to your backend
      console.log("Newsletter subscription:", email);
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-card/60">
      <div className="container py-16 grid gap-12 lg:grid-cols-5 md:grid-cols-3">
        {/* Hotel Info */}
        <div className="lg:col-span-2 space-y-6">
          <Logo />
          <p className="text-muted-foreground leading-relaxed">
            {hotelInfo?.description || "Experience luxury and comfort at YILMA HOTEL. Your perfect stay awaits in the heart of Addis Ababa."}
          </p>
          
          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-yellow-600" />
              <span>Free WiFi</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-yellow-600" />
              <span>Free Parking</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Coffee className="w-4 h-4 text-yellow-600" />
              <span>Breakfast</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>24/7 Service</span>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium">Follow Us</h5>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com/yilmahotel" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com/yilmahotel" },
                { icon: Twitter, label: "Twitter", href: "https://twitter.com/yilmahotel" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/rooms" className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth group">
                <span>Rooms & Suites</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link to="/about" className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth group">
                <span>About Us</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth group">
                <span>Guest Reviews</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link to="/contact" className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth group">
                <span>Contact</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link to="/my-bookings" className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth group">
                <span>My Bookings</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Services</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth cursor-pointer">
              <Star className="w-4 h-4 text-yellow-600" />
              <span>Spa & Wellness</span>
            </li>
            <li className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth cursor-pointer">
              <Coffee className="w-4 h-4 text-yellow-600" />
              <span>Restaurant & Bar</span>
            </li>
            <li className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth cursor-pointer">
              <Car className="w-4 h-4 text-yellow-600" />
              <span>Airport Transfer</span>
            </li>
            <li className="flex items-center gap-2 text-foreground/80 hover:text-yellow-600 transition-smooth cursor-pointer">
              <Heart className="w-4 h-4 text-yellow-600" />
              <span>Wedding & Events</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-yellow-600 mb-4">Stay Connected</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get exclusive offers and travel inspiration delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                disabled={isSubscribed}
              >
                {isSubscribed ? <Heart className="w-3 h-3" /> : <Send className="w-3 h-3" />}
              </Button>
            </div>
            {isSubscribed && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Thank you for subscribing!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/20">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} {hotelInfo?.name || "YILMA HOTEL"}. All rights reserved.</p>
              <div className="flex items-center gap-3">
                <Link to="/privacy" className="hover:text-yellow-600 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-yellow-600 transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                Made with love in Ethiopia
              </p>
              <span className="hidden sm:inline">·</span>
              <Link to="/admin/login" className="text-yellow-600 hover:text-yellow-700 transition-colors font-medium">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;