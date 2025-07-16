import React from "react";
import Boards from "./components/Boards";
import Controller from "./components/Controller";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useBoardStore } from "./store";

const COLUMNS = ["todo", "inprogress", "done"];

export default function App() {
  const boards = useBoardStore((s) => s.data);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;                                      

    const activeCard = boards.find((b) => b.id === active.id);
    if (!activeCard) return;
    if (COLUMNS.includes(over.id)) {
      const targetCol = over.id;
      const withoutActive = boards.filter((b) => b.id !== active.id);
      const updatedCard   = { ...activeCard, type: targetCol };

      const insertPos = withoutActive.reduce(
        (idx, b, i) => (b.type === targetCol ? i + 1 : idx),
        0
      );
      const next = [...withoutActive];
      next.splice(insertPos, 0, updatedCard);
      useBoardStore.setState({ data: next });
      return;
    }

    const overCard  = boards.find((b) => b.id === over.id);
    if (!overCard) return;

    const activeCol = activeCard.type;
    const overCol   = overCard.type;

    if (activeCol !== overCol) {
      const next = boards
        .filter((b) => b.id !== active.id)
        .reduce((arr, b) => {
          if (b.id === over.id) arr.push({ ...activeCard, type: overCol });
          arr.push(b);
          return arr;
        }, []);
      useBoardStore.setState({ data: next });
      return;
    }

    const sameColumnIds = boards.filter((b) => b.type === activeCol).map((b) => b.id);
    const oldIndex = sameColumnIds.indexOf(active.id);
    const newIndex = sameColumnIds.indexOf(over.id);
    const reorderedIds = arrayMove(sameColumnIds, oldIndex, newIndex);

    const next = [
      ...boards.filter((b) => b.type !== activeCol),
      ...reorderedIds.map((id) =>
        id === active.id ? activeCard : boards.find((b) => b.id === id)
      ),
    ];
    useBoardStore.setState({ data: next });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen">
        {/* header ----------------------------------------------------- */}
        <header className="w-full h-[80px] bg-slate-800 flex flex-col items-center justify-center text-stone-100">
          <p className="text-lg font-semibold">Kanban Board Project</p>
          <p>Chapter 2. Zustand</p>
        </header>

        {/* main ------------------------------------------------------- */}
        <main className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-4 p-4 w-full">
            <Boards type="todo" />
            <Boards type="inprogress" />
            <Boards type="done" />
          </div>
          <Controller />
        </main>

        {/* footer ----------------------------------------------------- */}
        <footer className="w-full h-[60px] bg-slate-800 flex items-center text-stone-100 justify-center">
          <p>&copy; OZ‑CodingSchool</p>
        </footer>
      </div>
    </DndContext>
  );
}