import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";                   // ⬅️ NEW
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "../store";
import { shallow } from "zustand/shallow";

function Card({ card }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-md p-3 mb-2 shadow cursor-grab select-none"
    >
      <h3 className="font-semibold">{card.title}</h3>
      {card.description && <p className="text-sm mt-1">{card.description}</p>}
    </div>
  );
}

export default function Boards({ type }) {
  const boardData = useBoardStore((s) => s.data, shallow);
  const cards = useMemo(() => boardData.filter((b) => b.type === type), [boardData, type]);
  const ids   = useMemo(() => cards.map((c) => c.id), [cards]);

  const { setNodeRef, isOver } = useDroppable({ id: type });

  return (
    <section
      ref={setNodeRef}
      className="flex flex-col bg-slate-100 rounded-lg p-4 min-h-[200px]" // min‑height로 빈 컬럼도 영역 확보
      style={{ backgroundColor: isOver ? "#e0e7ff" : undefined }}        // 드롭 프리뷰
    >
      <h2 className="text-center font-bold capitalize mb-3">
        {type === "todo" ? "To Do" : type === "inprogress" ? "In Progress" : "Done"}
      </h2>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </SortableContext>
    </section>
  );
}