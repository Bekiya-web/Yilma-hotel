import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  currentImages?: string[];
  folder?: string;
}

export const ImageUpload = ({ 
  onUploadComplete, 
  multiple = false, 
  maxFiles = 5,
  currentImages = [],
  folder = 'hotel-rooms'
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (multiple && files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => multiple ? [...prev, ...previewUrls] : previewUrls);

    setUploading(true);

    try {
      let uploadedUrls: string[];

      if (multiple) {
        const responses = await uploadMultipleToCloudinary(validFiles, folder);
        uploadedUrls = responses.map(r => r.secure_url);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      } else {
        const response = await uploadToCloudinary(validFiles[0], folder);
        uploadedUrls = [response.secure_url];
        toast.success('Image uploaded successfully!');
      }

      onUploadComplete(uploadedUrls);
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      
      // Remove failed previews
      setPreviews(prev => prev.filter(url => !previewUrls.includes(url)));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    const newUrls = previews.filter((_, i) => i !== index);
    onUploadComplete(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {multiple ? 'Upload Images' : 'Upload Image'}
            </>
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <span className="text-sm text-muted-foreground">
          {multiple ? `Max ${maxFiles} images, 10MB each` : 'Max 10MB'}
        </span>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {multiple ? 'No images uploaded yet' : 'No image uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
};
