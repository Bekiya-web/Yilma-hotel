import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Image as ImageIcon, Eye, EyeOff, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  type GalleryImage,
} from "@/api/gallery.api";
import ImageUpload from "@/components/ImageUpload";

const GalleryAdmin = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "rooms" as "rooms" | "facilities" | "dining" | "events",
    display_order: 0,
    is_active: true,
  });

  // Fetch gallery images
  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ["admin-gallery", selectedCategory],
    queryFn: () => getGalleryImages(selectedCategory),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Image added successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to add image");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GalleryImage> }) =>
      updateGalleryImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Image updated successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update image");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Image deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateGalleryImage(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("Status updated");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "rooms",
      display_order: 0,
      is_active: true,
    });
    setEditingImage(null);
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      description: image.description || "",
      image_url: image.image_url,
      category: image.category,
      display_order: image.display_order,
      is_active: image.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingImage) {
      updateMutation.mutate({
        id: editingImage.id,
        updates: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "rooms", label: "Rooms & Suites" },
    { value: "facilities", label: "Facilities" },
    { value: "dining", label: "Dining" },
    { value: "events", label: "Events" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">
            Manage hotel images and organize them by category
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Image" : "Add New Image"}
              </DialogTitle>
              <DialogDescription>
                {editingImage
                  ? "Update the image details below"
                  : "Add a new image to the gallery"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Deluxe Room View"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rooms">Rooms & Suites</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>

              <div className="space-y-2">
                <Label>Image *</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('gallery-image-input')?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {formData.image_url ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input
                      id="gallery-image-input"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!file.type.startsWith('image/')) {
                          toast.error('Please select an image file');
                          return;
                        }

                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('Image size must be less than 10MB');
                          return;
                        }

                        try {
                          const { uploadToCloudinary } = await import('@/lib/cloudinary');
                          toast.info('Uploading image...');
                          const response = await uploadToCloudinary(file, 'gallery');
                          setFormData({ ...formData, image_url: response.secure_url });
                          toast.success('Image uploaded successfully');
                        } catch (error) {
                          console.error('Upload error:', error);
                          toast.error('Failed to upload image');
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-sm text-muted-foreground">Max 10MB</span>
                  </div>

                  {formData.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border max-w-md">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {!formData.image_url && (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center max-w-md">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No image uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active (visible to public)
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="hero"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingImage ? "Update Image" : "Add Image"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "hero" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      ) : galleryImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(image)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: image.id,
                        is_active: !image.is_active,
                      })
                    }
                  >
                    {image.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {!image.is_active && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Hidden
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 truncate">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground capitalize">
                    {image.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Order: {image.display_order}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-serif text-xl mb-2">No Images Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start building your gallery by adding images
          </p>
          <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Image
          </Button>
        </Card>
      )}
    </div>
    </AdminLayout>
  );
};

export default GalleryAdmin;
