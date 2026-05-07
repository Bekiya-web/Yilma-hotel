import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => (
  <SiteLayout>
    <section className="pt-32 pb-12 border-b border-border">
      <div className="container max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Get in touch</p>
        <h1 className="font-serif text-5xl md:text-6xl mb-4">We're listening.</h1>
        <p className="text-muted-foreground">Reservations, special arrangements, press — our concierge replies within the hour.</p>
      </div>
    </section>

    <section className="py-20">
      <div className="container grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {[
            { icon: Phone, label: "Call us", value: "+251 911 234 567", href: "tel:+251911234567" },
            { icon: MessageCircle, label: "WhatsApp", value: "Chat with concierge", href: "https://wa.me/251911234567" },
            { icon: Mail, label: "Email", value: "yilmahotel@gmail.com", href: "mailto:yilmahotel@gmail.com" },
            { icon: MapPin, label: "Visit", value: "Addis Ababa, Ethiopia", href: "https://maps.app.goo.gl/MWyTvtywKv54ciRK7" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.label === "Visit" ? "_blank" : undefined}
              rel={c.label === "Visit" ? "noopener noreferrer" : undefined}
              className="flex items-center gap-5 bg-card border border-border rounded-md p-6 hover:border-yellow-500 transition-smooth"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-yellow-600 mb-1">{c.label}</p>
                <p className="text-foreground">{c.value}</p>
              </div>
            </a>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Message sent", { description: "We'll be in touch shortly." }); }}
          className="bg-card border border-border rounded-md p-8 space-y-5"
        >
          <h2 className="font-serif text-3xl mb-2">Send us a note</h2>
          <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" required /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" required /></div>
          <div className="space-y-2"><Label>Message</Label><Textarea placeholder="How can we help?" rows={5} required /></div>
          <Button type="submit" variant="hero" size="lg" className="w-full">Send message</Button>
        </form>
      </div>
    </section>
  </SiteLayout>
);

export default Contact;