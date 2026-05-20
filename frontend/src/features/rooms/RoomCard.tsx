import { useState } from "react";
import { Edit, Trash2, Eye, Star, Users, BedDouble, Maximize, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Room } from "@/types/database";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

export const RoomCard = ({ room, onEdit, onDelete, isDeleting }: RoomCardProps) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);

  return (
    <>
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <img 
            src={room.image} 
            alt={room.name}
            className="w-full md:w-48 h-48 md:h-32 object-cover rounded-md"
          />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-3">
              <div className="flex-1">
                <h3 className="font-serif text-xl md:text-2xl">{room.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground italic">{room.tagline}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => setIsViewOpen(true)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(room)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(room.id, room.name)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">{room.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-1 md:ml-2 font-semibold text-yellow-500 block md:inline">ETB {room.price.toLocaleString()}/night</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bed:</span>
                <span className="ml-1 md:ml-2 block md:inline">{room.bed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-1 md:ml-2 block md:inline">{room.size}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Available:</span>
                <span className="ml-1 md:ml-2 font-semibold block md:inline">{room.available} rooms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Guests:</span>
                <span className="ml-1 md:ml-2 block md:inline">Up to {room.guests}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rating:</span>
                <span className="ml-1 md:ml-2 block md:inline">⭐ {room.rating} ({room.reviews_count})</span>
              </div>
              <div>
                <span className="text-muted-foreground">View:</span>
                <span className="ml-1 md:ml-2 block md:inline">{room.view}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ID:</span>
                <span className="ml-1 md:ml-2 text-xs block md:inline">{room.room_id}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">Room Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Gallery */}
            <div>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                <img 
                  src={room.gallery[activeGalleryImage] || room.image} 
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {room.gallery.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {room.gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveGalleryImage(index)}
                      className={`aspect-video rounded overflow-hidden border-2 transition-all ${
                        activeGalleryImage === index 
                          ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <p className="text-xs uppercase tracking-widest text-yellow-600 mb-2">{room.view}</p>
              <h2 className="font-serif text-4xl mb-2">{room.name}</h2>
              <p className="text-xl text-muted-foreground italic mb-4">{room.tagline}</p>
              
              <div className="flex flex-wrap gap-6 text-sm mb-6 pb-6 border-b">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  {room.rating} ({room.reviews_count} reviews)
                </span>
                <span className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-yellow-600" />
                  {room.bed}
                </span>
                <span className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-yellow-600" />
                  {room.size}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-600" />
                  Up to {room.guests} guests
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-serif text-2xl mb-3">About this room</h3>
                <p className="text-foreground/80 leading-relaxed">{room.long_description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-serif text-2xl mb-3">What's included</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-yellow-600 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-card border border-border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price per night</p>
                  <p className="font-serif text-3xl text-yellow-600">ETB {room.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available rooms</p>
                  <p className="font-serif text-3xl">{room.available}</p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="pt-6 border-t">
              <h3 className="font-medium mb-3">Admin Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Room ID:</span>
                  <span className="ml-2 font-mono">{room.room_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{room.created_at ? new Date(room.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2">{room.updated_at ? new Date(room.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => { setIsViewOpen(false); onEdit(room); }}>
                <Edit className="w-4 h-4 mr-2" /> Edit Room
              </Button>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
