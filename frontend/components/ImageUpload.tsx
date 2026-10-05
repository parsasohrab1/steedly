'use client';

import { useState, useRef } from 'react';
import { uploadAPI } from '@/lib/api';
import { FaCamera, FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  maxSize?: number; // in MB
}

export default function ImageUpload({
  onUploadComplete,
  currentImageUrl,
  label = 'Upload image',
  maxSize = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must not exceed ${maxSize} MB`);
      return;
    }

    setError('');
    setUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.data.success) {
        onUploadComplete(response.data.data.url);
        setError('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading the image');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-white text-2xl" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <FaCamera className="text-gray-400 text-2xl" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
              uploading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 border-gray-300'
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FaCamera />
                {preview ? 'Change image' : 'Choose image'}
              </>
            )}
          </label>
          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="mr-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <FaTimes className="inline ml-1" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Success Message */}
      {preview && !uploading && !error && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
          <FaCheckCircle />
          Image uploaded successfully
        </div>
      )}

      <p className="text-xs text-gray-500">
        Allowed formats: JPEG, PNG, GIF, WebP (maximum {maxSize} MB)
      </p>
    </div>
  );
}

