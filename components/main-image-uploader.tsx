"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
}

interface UploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export function MainImageUploader({
  value,
  onChange,
  label = "Main Image"
}: Props) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(errorData.error);
    }

    return res.json();
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files[0]) return;

      setUploading(true);
      try {
        const { url } = await uploadImage(files[0]);
        onChange(url);
      } catch (err: any) {
        console.error("[MAIN_IMAGE_UPLOAD]", err);
        alert(err.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {!value ? (
        <div
          {...getRootProps()}
          className={`border border-dashed rounded-lg p-6 text-center cursor-pointer ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-2" size={32} />
          <p>
            {uploading
              ? "Uploading..."
              : "Drag & drop image or click to upload"}
          </p>
        </div>
      ) : (
        <motion.div layout className="relative w-full max-w-sm">
          <img
            src={value}
            alt="Main product image"
            className="rounded-lg w-full h-48 object-cover border"
          />

          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onChange(null)}
            >
              <X size={14} />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
