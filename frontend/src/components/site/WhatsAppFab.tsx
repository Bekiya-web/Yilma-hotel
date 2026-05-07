import { MessageCircle } from "lucide-react";

const WhatsAppFab = () => (
  <a
    href="https://wa.me/15551234567"
    target="_blank"
    rel="noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-yellow-500 shadow-lg flex items-center justify-center text-white hover:scale-110 transition-smooth"
  >
    <MessageCircle className="w-6 h-6" />
    <span className="absolute inset-0 rounded-full animate-ping bg-yellow-500/30" />
  </a>
);

export default WhatsAppFab;