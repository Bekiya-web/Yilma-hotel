import { useState } from "react";
import { Image as ImageIcon, Save, X, Star, Users, BedDouble, Maximize, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaLibrary } from "@/features/media/MediaLibrary";
import type { Room } from "@/types/database";

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const RoomForm = ({ room, onSubmit, onCancel, isSubmitting }: RoomFormProps) => {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaLibraryMode, setMediaLibraryMode] = useState<'main' | 'gallery'>('main');
  const [formData, setFormData] = useState({
    room_id: room?.room_id || '',
    name: room?.name || '',
    tagline: room?.tagline || '',
    description: room?.description || '',
    long_description: room?.long_description || '',
    price: room?.price || 0,
    image: room?.image || '',
    gallery: room?.gallery?.join(', ') || '',
    bed: room?.bed || '',
    size: room?.size || '',
    guests: room?.guests || 2,
    rating: room?.rating || 4.5,
    reviews_count: room?.reviews_count || 0,
    amenities: room?.amenities?.join(', ') || '',
    available: room?.available || 0,
    view: room?.view || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData = {
      room_id: formData.room_id,
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      long_description: formData.long_description,
      price: Number(formData.price),
      image: formData.image,
      gallery: formData.gallery.split(',').map(s => s.trim()).filter(Boolean),
      bed: formData.bed,
      size: formData.size,
      guests: Number(formData.guests),
      rating: Number(formData.rating),
      reviews_count: Number(formData.reviews_count),
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      available: Number(formData.available),
      view: formData.view
    };

    onSubmit(roomData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room ID *</Label>
                <Input
                  required
                  // placeholder="classic-king"
                  value={formData.room_id}
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  disabled={!!room}
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  required
                  // placeholder="Classic King"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tagline *</Label>
              <Input
                required
                placeholder="Timeless comfort"
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Short Description *</Label>
              <Textarea
                required
                placeholder="A serene retreat with bed..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Long Description *</Label>
              <Textarea
                required
                placeholder="Our rooms balance..."
                value={formData.long_description}
                onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    // placeholder="189"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      setFormData({...formData, price: value});
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                  />
                  {formData.price > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setFormData({...formData, price: 0})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Guests *</Label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    // placeholder="2"
                    value={formData.guests || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      setFormData({...formData, guests: value});
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                  />
                  {formData.guests > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setFormData({...formData, guests: 0})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Available *</Label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    // placeholder="5"
                    value={formData.available || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      setFormData({...formData, available: value});
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                  />
                  {formData.available > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setFormData({...formData, available: 0})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bed Type *</Label>
                <Input
                  required
                  placeholder="King bed"
                  value={formData.bed}
                  onChange={(e) => setFormData({...formData, bed: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Size *</Label>
                <Input
                  required
                  placeholder="38 m²"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>View *</Label>
                <Input
                  required
                  placeholder="City view"
                  value={formData.view}
                  onChange={(e) => setFormData({...formData, view: e.target.value})}
                />
              </div>
            </div> */}

            <div className="space-y-2">
              <Label>Amenities (comma-separated) *</Label>
              <Textarea
                required
                placeholder="Free WiFi, Air conditioning, Breakfast, Smart TV"
                value={formData.amenities}
                onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating (0-5)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    // placeholder="4.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                  />
                  {formData.rating > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setFormData({...formData, rating: 0})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reviews Count</Label>
                <div className="relative">
                  <Input
                    type="number"
                    // placeholder="0"
                    value={formData.reviews_count}
                    onChange={(e) => setFormData({...formData, reviews_count: Number(e.target.value)})}
                  />
                  {formData.reviews_count > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setFormData({...formData, reviews_count: 0})}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Main Image</Label>
              
              {formData.image && (
                <div className="relative aspect-video rounded-lg overflow-hidden border mb-2">
                  <img src={formData.image} alt="Main" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMediaLibraryMode('main');
                    setIsMediaLibraryOpen(true);
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">Or enter URL manually:</p>
              <Input
                // placeholder="https://res.cloudinary.com/..."
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              
              {formData.gallery && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {formData.gallery.split(',').map((url, index) => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return null;
                    return (
                      <div key={index} className="relative aspect-video rounded overflow-hidden border">
                        <img src={trimmedUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const urls = formData.gallery.split(',').map(s => s.trim()).filter(Boolean);
                            urls.splice(index, 1);
                            setFormData({...formData, gallery: urls.join(', ')});
                          }}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMediaLibraryMode('gallery');
                    setIsMediaLibraryOpen(true);
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">Or enter URLs manually (comma-separated):</p>
              <Textarea
                // placeholder="https://res.cloudinary.com/image1.jpg, https://res.cloudinary.com/image2.jpg"
                value={formData.gallery}
                onChange={(e) => setFormData({...formData, gallery: e.target.value})}
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>Preview how this room will appear to guests</span>
            </div>

            {/* Room Card Preview */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                {formData.image ? (
                  <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {formData.available <= 3 && formData.available > 0 && (
                  <Badge className="absolute top-3 right-3 bg-destructive/90 border-0 text-destructive-foreground">
                    Only {formData.available} left
                  </Badge>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-yellow-600 mb-1">
                      {formData.view || 'View'}
                    </p>
                    <h3 className="font-serif text-2xl mb-1">
                      {formData.name || 'Room Name'}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {formData.tagline || 'Tagline'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-3xl text-yellow-600">
                      ${formData.price || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">per night</p>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                  {formData.description || 'Short description will appear here'}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-yellow-600" />
                    {formData.bed || 'Bed type'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize className="w-4 h-4 text-yellow-600" />
                    {formData.size || 'Size'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-yellow-600" />
                    Up to {formData.guests || 2} guests
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {formData.rating || 0} ({formData.reviews_count || 0})
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities ? (
                      formData.amenities.split(',').map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity.trim()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No amenities added</span>
                    )}
                  </div>
                </div>

                <Button className="w-full" variant="hero">
                  View Details
                </Button>
              </div>
            </Card>

            {/* Gallery Preview */}
            {formData.gallery && formData.gallery.trim() && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Gallery Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {formData.gallery.split(',').map((url, index) => {
                    const trimmedUrl = url.trim();
                    if (!trimmedUrl) return null;
                    return (
                      <div key={index} className="aspect-video rounded overflow-hidden border">
                        <img src={trimmedUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Long Description Preview */}
            {formData.long_description && (
              <Card className="p-6">
                <h3 className="font-serif text-xl mb-3">About this room</h3>
                <p className="text-foreground/80 leading-relaxed">
                  {formData.long_description}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {room ? 'Update Room' : 'Create Room'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        </div>
      </form>

      <MediaLibrary
        open={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={(urls) => {
          if (mediaLibraryMode === 'main') {
            setFormData({...formData, image: urls[0] || ''});
          } else {
            const existingUrls = formData.gallery ? formData.gallery.split(',').map(s => s.trim()).filter(Boolean) : [];
            const allUrls = [...existingUrls, ...urls];
            setFormData({...formData, gallery: allUrls.join(', ')});
          }
        }}
        multiple={mediaLibraryMode === 'gallery'}
        maxSelection={5}
        selectedUrls={
          mediaLibraryMode === 'main' 
            ? (formData.image ? [formData.image] : [])
            : (formData.gallery ? formData.gallery.split(',').map(s => s.trim()).filter(Boolean) : [])
        }
      />
    </>
  );
};
