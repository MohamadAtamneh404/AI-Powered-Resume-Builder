import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CanvasSection from "./CanvasSection";
import AddSectionButton from "./AddSectionButton";

// Sortable Wrapper for each section
function SortableSection({
  id,
  block,
  blockIndex,
  totalBlocks,
  basics,
  onBasicsChange,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onGenerateBullets,
  onAiAssistSection,
  aiLoading = false,
  aiLoadingSection = null,
  template,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      <CanvasSection
        block={block}
        blockIndex={blockIndex}
        totalBlocks={totalBlocks}
        basics={basics}
        onBasicsChange={onBasicsChange}
        onUpdateBlock={onUpdateBlock}
        onMoveBlock={onMoveBlock}
        onDuplicateBlock={onDuplicateBlock}
        onRemoveBlock={onRemoveBlock}
        onGenerateBullets={onGenerateBullets}
        onAiAssistSection={onAiAssistSection}
        aiLoading={aiLoading}
        aiLoadingSection={aiLoadingSection}
        template={template}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function EditorCanvas({
  blocks = [],
  basics = {},
  onBasicsChange,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onAddBlock,
  onGenerateBullets,
  onAiAssistSection,
  aiLoading = false,
  aiLoadingSection = null,
  zoomLevel = 1,
  activeFont = "Inter",
  activeThemeColor = "#111827",
  template = null,
}) {
  // Setup drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px tolerance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.type === active.id);
      const newIndex = blocks.findIndex((b) => b.type === over.id);
      onMoveBlock(oldIndex, newIndex);
    }
  };

  const existingTypes = useMemo(() => blocks.map((b) => b.type), [blocks]);

  const layoutVariant = template?.layoutVariant || "classic";
  const layoutPadding =
    layoutVariant === "compact"
      ? "24px 32px"
      : layoutVariant === "executive"
        ? "40px 48px"
        : "36px 44px";

  const effectiveFont = activeFont || template?.fontFamily || "Inter";
  const primaryColor =
    activeThemeColor && activeThemeColor !== "#9fff00"
      ? activeThemeColor
      : template?.theme?.colors?.primary || "#111827";

  return (
    <div className="flex-1 overflow-auto bg-[#EDEEF5] dark:bg-[#121215] relative flex flex-col items-center py-12 px-4 sm:px-8 transition-colors">
      {/* Zoom scaling wrapper */}
      <div
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top center",
          transition: "transform 0.2s ease-in-out",
        }}
        className="w-full max-w-[210mm] shrink-0"
      >
        {/* A4 Paper Canvas - Kept white as physical printed paper */}
        <div
          className="bg-white shadow-xl dark:shadow-2xl dark:shadow-black/70 rounded-sm w-[210mm] min-h-[297mm] mx-auto relative text-left leading-normal text-gray-900 overflow-hidden transition-all"
          style={{
            fontFamily: `"${effectiveFont}", system-ui, -apple-system, sans-serif`,
            padding: layoutPadding,
            "--color-accent": primaryColor,
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.type)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {blocks.map((block, index) => (
                  <React.Fragment key={block.type}>
                    {/* Add Section Button between blocks */}
                    {index > 0 && (
                      <AddSectionButton
                        onAddBlock={(type) => {
                          onAddBlock(type, index);
                        }}
                        existingTypes={existingTypes}
                      />
                    )}

                    <SortableSection
                      id={block.type}
                      block={block}
                      blockIndex={index}
                      totalBlocks={blocks.length}
                      basics={basics}
                      onBasicsChange={onBasicsChange}
                      onUpdateBlock={onUpdateBlock}
                      onMoveBlock={onMoveBlock}
                      onDuplicateBlock={onDuplicateBlock}
                      onRemoveBlock={onRemoveBlock}
                      onGenerateBullets={onGenerateBullets}
                      onAiAssistSection={onAiAssistSection}
                      aiLoading={aiLoading}
                      aiLoadingSection={aiLoadingSection}
                      template={template}
                    />
                  </React.Fragment>
                ))}

                {/* Final Add Section Button at the bottom */}
                <div className="mt-8">
                  <AddSectionButton
                    onAddBlock={(type) => onAddBlock(type, blocks.length)}
                    existingTypes={existingTypes}
                  />
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
