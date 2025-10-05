import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({ id, title, startHour, endHour }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
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
      className="bg-blue-500 text-white text-sm font-bold rounded-lg px-2 py-1 mb-1 shadow cursor-grab"
    >
      {title} ({startHour}:00 - {endHour}:00)
    </div>
  );
};
