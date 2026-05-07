import React from "react";
import { Link, useLocation } from "react-router-dom";

const Logo = ({ className = "" }: { className?: string }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <img 
        src="/yilma.png" 
        alt="YILMA HOTEL" 
        className="h-12 w-auto object-contain"
      />
      <div className="flex flex-col leading-tight">
        <span className="font-serif text-2xl tracking-wide text-yellow-600">YILMA</span>
        <span className={`font-serif text-sm tracking-[0.2em] uppercase font-semibold ${
          scrolled || !isHome ? "text-foreground" : "text-white drop-shadow-lg"
        }`}>HOTEL</span>
      </div>
    </Link>
  );
};

export default Logo;