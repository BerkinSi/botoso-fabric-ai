"use client";

import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  description: string;
  image: string | null;
  onImageSelect: (base64: string | null) => void;
}

export default function ImageUploader({
  label,
  description,
  image,
  onImageSelect,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    onImageSelect(null);
  }, [onImageSelect]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500 mb-1">{description}</p>

      {image ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
          <img
            src={image}
            alt={label}
            className="w-full h-48 md:h-56 object-cover"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center
            h-48 md:h-56 rounded-lg border-2 border-dashed
            transition-colors cursor-pointer
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            {isDragging ? (
              <ImageIcon className="w-10 h-10 text-blue-500" />
            ) : (
              <Upload className="w-10 h-10 text-gray-400" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                {isDragging ? "Drop image here" : "Tap to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
