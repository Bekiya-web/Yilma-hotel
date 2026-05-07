// Cloudinary configuration and upload utilities

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hotel_uploads';

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn('Cloudinary cloud name not configured');
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  url: string;
}

/**
 * Upload an image to Cloudinary
 * @param file - The file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with the upload response
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'hotel-rooms'
): Promise<CloudinaryUploadResponse> => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of upload responses
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = 'hotel-rooms'
): Promise<CloudinaryUploadResponse[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with the deletion response
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: Deletion requires server-side implementation with API secret
  // This is a placeholder for future implementation
  console.warn('Image deletion should be implemented on the server side for security');
  throw new Error('Image deletion not implemented. Please delete manually from Cloudinary dashboard.');
};

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image
 * @param transformations - Optional transformations (width, height, crop, etc.)
 * @returns Optimized image URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  }
): string => {
  if (!CLOUDINARY_CLOUD_NAME) {
    return publicId; // Return as-is if Cloudinary not configured
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const transformParts: string[] = [];
  
  if (transformations) {
    if (transformations.width) transformParts.push(`w_${transformations.width}`);
    if (transformations.height) transformParts.push(`h_${transformations.height}`);
    if (transformations.crop) transformParts.push(`c_${transformations.crop}`);
    if (transformations.quality) transformParts.push(`q_${transformations.quality}`);
    if (transformations.format) transformParts.push(`f_${transformations.format}`);
  }

  const transformString = transformParts.length > 0 ? `${transformParts.join(',')}/` : '';
  
  return `${baseUrl}/${transformString}${publicId}`;
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID
 */
export const extractPublicId = (url: string): string => {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const parts = url.split('/upload/');
  if (parts.length < 2) return url;

  const pathParts = parts[1].split('/');
  // Remove transformation parameters
  const publicIdParts = pathParts.filter(part => !part.includes('_'));
  
  return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
};

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
};
