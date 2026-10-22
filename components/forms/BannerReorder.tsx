"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Banner } from "@/types/banner";

function SortableItem({ banner }: { banner: Banner }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: banner._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white border rounded cursor-grab"
    >
      {banner.title}
    </div>
  );
}

export default function BannerReorder({
  banners,
  onReorder,
}: {
  banners: Banner[];
  onReorder: (items: Banner[]) => void | Promise<void>;
}) {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex(b => b._id === active.id);
    const newIndex = banners.findIndex(b => b._id === over.id);

    const reordered = arrayMove(banners, oldIndex, newIndex);

    onReorder(reordered);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={banners.map(b => b._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {banners.map(banner => (
            <SortableItem
              key={banner._id}
              banner={banner}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
