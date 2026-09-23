'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, RefreshCw, UploadCloud } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

interface PhotoUploadProps {
  photoUrl: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoUpload({ photoUrl, onChange }: PhotoUploadProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size must be less than 5MB.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError(data.error || 'Failed to upload photo.');
      } else {
        onChange(data.url);
        toastSuccess('Proof photo uploaded.');
      }
    } catch {
      toastError('Failed to upload photo.');
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
        accept="image/jpeg,image/png,image/webp"
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
              <span>Uploading proof...</span>
            </div>
          ) : (
            <>
              <div className="p-2 rounded-full bg-muted/60 text-muted-foreground">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Attach proof photo or screenshot</span>
              <span className="text-[10px] text-muted-foreground/75">PNG, JPG, WebP up to 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
