'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

interface PhotoUploadProps {
  photoUrl: string | null;
  onChange: (url: string | null) => void;
}

// Client-side image resize helper to compress large phone photos before network transport
async function compressImageOnClient(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not an image or SVG, skip canvas compression
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({ photoUrl, onChange }: PhotoUploadProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (15MB raw max before client compression)
    if (file.size > 15 * 1024 * 1024) {
      toastError('Image size must be less than 15MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Compress in browser for instant transfer
      let uploadBlob: Blob = file;
      try {
        uploadBlob = await compressImageOnClient(file);
      } catch (compErr) {
        console.warn('Client compression fallback:', compErr);
      }

      const formData = new FormData();
      formData.append('photo', uploadBlob, file.name || 'workout_proof.jpg');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError(data.error || 'Failed to process image upload.');
      } else {
        onChange(data.url);
        toastSuccess('Proof photo attached.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toastError(err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Workout Proof / Photo (Optional)
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
      />

      {photoUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-border group max-w-xs">
          <img
            src={photoUrl}
            alt="Workout proof"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-card/90 hover:bg-card text-foreground rounded-full text-xs font-medium shadow-md transition-all flex items-center gap-1"
              title="Replace photo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full text-xs font-medium shadow-md transition-all flex items-center gap-1"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-cync-green/50 hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground text-xs"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cync-green" />
              <span>Optimizing and uploading proof...</span>
            </div>
          ) : (
            <>
              <div className="p-2 rounded-full bg-muted/60 text-muted-foreground">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Attach proof photo or screenshot</span>
              <span className="text-[10px] text-muted-foreground/75">PNG, JPG, WebP up to 15MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
