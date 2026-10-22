"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

interface UploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export function GalleryUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Upload failed");
    }

    const data: UploadResponse = await res.json();
    return data;
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        const urls: string[] = [...value];
        for (const file of files) {
          const { url } = await uploadImage(file);
          urls.push(url);
        }
        onChange(urls);
      } catch (err: any) {
        console.error("[GALLERY_UPLOADER]", err);
        alert(err.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: uploading
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg p-6 text-center cursor-pointer ${
          uploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-2" size={32} />
        <p>{uploading ? "Uploading..." : "Drag & drop images or click to upload"}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {value.map((img, i) => (
          <motion.div key={img} layout className="relative">
            <img
              aria-label="gallery-image"
              src={img}
              className="rounded-md w-full h-24 object-cover"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            >
              <X size={14} />
            </Button>
          </motion.div>
        ))}

        {value.length === 0 && !uploading && (
          <p className="col-span-4 text-center text-muted-foreground">
            No images uploaded
          </p>
        )}
      </div>
    </div>
  );
}
