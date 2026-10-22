"use client";

import { useState } from "react";
import slugify from "slugify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (newCategory: any) => void; // <-- allow receiving the created category
}


export function CreateCategoryModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

const submit = async () => {
  if (!name.trim()) return;

  setLoading(true);

  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      slug: slugify(name, { lower: true })
    })
  });

  setLoading(false);

  if (!res.ok) {
    alert("Failed to create category");
    return;
  }

  const newCategory = await res.json(); // <-- get the created category from backend

  setName("");
  onCreated?.(newCategory); // <-- pass it here
  onClose();
};


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Category name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
