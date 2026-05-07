import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { getGalleryImages, type GalleryImage } from "@/api/gallery.api";

// Gallery categories
const categories = [
  { id: "all", label: "All" },
  { id: "rooms", label: "Rooms & Suites" },
  { id: "facilities", label: "Facilities" },
  { id: "dining", label: "Dining" },
  { id: "events", label: "Events" },
];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  // Fetch gallery images from database
  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ['gallery', selectedCategory],
    queryFn: () => getGalleryImages(selectedCategory),
  });

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 border-b border-border">
        <div className="container max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-600 mb-4">Visual Tour</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4">Gallery</h1>
          <p className="text-muted-foreground">
            Explore our beautiful spaces, luxurious rooms, and world-class facilities
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "hero" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-md cursor-pointer bg-card border border-border hover:border-yellow-500 transition-all"
                  onClick={() => setLightboxImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-medium mb-1">{image.title}</h3>
                      {image.description && (
                        <p className="text-xs text-white/80">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No images found in this category. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-yellow-400 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-md"
            />
            <div className="text-center mt-4 text-white">
              <h3 className="text-2xl font-serif mb-2">{lightboxImage.title}</h3>
              {lightboxImage.description && (
                <p className="text-white/80">{lightboxImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
};

export default Gallery;
