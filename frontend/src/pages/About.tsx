import { MapPin, Plane, Train, Coffee } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";

const About = () => (
  <SiteLayout>
    <section className="relative pt-32 pb-20 overflow-hidden">
      <img src="/hero image .jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-background/85" />
      <div className="container relative z-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Our story</p>
        <h1 className="font-serif text-5xl md:text-6xl mb-6">A house built on warm hospitality.</h1>
        <p className="text-lg text-foreground/80 leading-relaxed">
          YILMA HOTEL welcomes you with authentic Ethiopian hospitality in the heart of Addis Ababa. Experience comfort, luxury, and the warmth of our service.
        </p>
      </div>
    </section>

    <section className="py-20 border-t border-border">
      <div className="container grid lg:grid-cols-2 gap-16">
        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <h2 className="font-serif text-4xl text-foreground">Where we are</h2>
          <p>Located in the vibrant heart of Addis Ababa, YILMA HOTEL offers easy access to the city's cultural landmarks, business districts, and entertainment venues.</p>
          <p>Whether your visit is for business or leisure, you'll find comfort and convenience at every turn.</p>

          <div className="grid sm:grid-cols-2 gap-5 pt-6">
            {[
              { icon: MapPin, label: "Addis Ababa, Ethiopia" },
              { icon: Plane, label: "Near Bole International Airport" },
              { icon: Train, label: "Easy access to city center" },
              { icon: Coffee, label: "Cultural district" },
            ].map((i) => (
              <div key={i.label} className="flex items-center gap-3 text-sm">
                <i.icon className="w-5 h-5 text-yellow-600 shrink-0" /> {i.label}
              </div>
            ))}
          </div>
        </div>

        <div className="aspect-square rounded-md overflow-hidden bg-card border border-border">
          <iframe
            title="YILMA HOTEL Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7!3d9.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMDAuMCJOIDM4wrA0MicwMC4wIkU!5e0!3m2!1sen!2set!4v1234567890"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default About;