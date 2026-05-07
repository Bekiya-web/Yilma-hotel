import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Check, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  maxSelection?: number;
  selectedUrls?: string[];
}

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
}

export const MediaLibrary = ({
  open,
  onClose,
  onSelect,
  multiple = false,
  maxSelection = 5,
  selectedUrls = []
}: MediaLibraryProps) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedUrls);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  useEffect(() => {
    if (open) {
      loadImages();
      setSelected(selectedUrls);
    }
  }, [open, selectedUrls]);

  const loadImages = async () => {
    setLoading(true);
    try {
      // Note: This requires a server-side endpoint to list images
      // For now, we'll show a message to use Cloudinary dashboard
      // In production, implement a backend endpoint that calls Cloudinary Admin API
      
      // Placeholder: Show message
      toast.info('Image library loading...', {
        description: 'Upload new images or use the upload tab'
      });
      
      // TODO: Implement server-side endpoint to fetch images
      // const response = await fetch('/api/cloudinary/images');
      // const data = await response.json();
      // setImages(data.resources);
      
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load image library');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    if (multiple) {
      if (selected.includes(url)) {
        setSelected(selected.filter(u => u !== url));
      } else {
        if (selected.length >= maxSelection) {
          toast.error(`Maximum ${maxSelection} images allowed`);
          return;
        }
        setSelected([...selected, url]);
      }
    } else {
      setSelected([url]);
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const responses = await uploadMultipleToCloudinary(validFiles, 'hotel-rooms');
      const urls = responses.map(r => r.secure_url);
      
      toast.success(`${urls.length} image(s) uploaded!`);
      
      // Add to selection
      if (multiple) {
        setSelected([...selected, ...urls].slice(0, maxSelection));
      } else {
        setSelected([urls[0]]);
      }
      
      // Reload library
      loadImages();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredImages = images.filter(img =>
    img.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {multiple ? 'Select Images' : 'Select Image'}
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selected.length} selected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload New
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Image Grid */}
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No images in library</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload images using the "Upload New" tab or directly from Cloudinary dashboard
                  </p>
                  <Button onClick={() => setActiveTab('upload')} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.public_id}
                      onClick={() => handleSelect(image.secure_url)}
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selected.includes(image.secure_url)
                          ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                          : 'border-transparent hover:border-yellow-500/50'
                      }`}
                    >
                      <img
                        src={image.secure_url}
                        alt={image.public_id}
                        className="w-full h-full object-cover"
                      />
                      {selected.includes(image.secure_url) && (
                        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {image.public_id.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {multiple 
                  ? `Select up to ${maxSelection} images to upload`
                  : 'Select an image to upload'}
              </p>
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button asChild disabled={uploading}>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Max 10MB per image • JPG, PNG, WebP
              </p>
            </div>

            {selected.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {selected.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded overflow-hidden border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelected(selected.filter(u => u !== url))}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {multiple 
              ? `${selected.length} of ${maxSelection} selected`
              : selected.length > 0 ? '1 image selected' : 'No image selected'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={selected.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
