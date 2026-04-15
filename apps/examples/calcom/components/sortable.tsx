"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  type SortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type * as React from "react";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

/* =========================================================
   Context
========================================================= */

interface SortableContextState {
  isDraggingAny: boolean;
  activeId: UniqueIdentifier | null;
  hasDragged: boolean;
}

const SortableStateContext = createContext<SortableContextState>({
  activeId: null,
  hasDragged: false,
  isDraggingAny: false,
});

/* =========================================================
   Types
========================================================= */

export interface SortableItemRenderProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  setNodeRef: (node: HTMLElement | null) => void;

  isDragging: boolean;
  isDraggingAny: boolean;
  hasDragged: boolean;

  style: CSSProperties;

  // 🔥 extensibilidad
  index?: number;
  disabled?: boolean;
}

interface SortableItemProps {
  id: UniqueIdentifier;
  index?: number;
  disabled?: boolean;
  children: (props: SortableItemRenderProps) => ReactNode;
}

interface SortableListProps<T extends { id: UniqueIdentifier }> {
  items: T[];
  onReorder: (items: T[]) => void;

  /** 🔥 modo simple (DX) */
  renderItem?: (item: T, index: number) => ReactNode;

  /** 🔥 modo avanzado */
  children?: ReactNode;

  renderOverlay?: (activeItem: T) => ReactNode;

  /** 🔥 control externo */
  activeId?: UniqueIdentifier | null;
  onDragStateChange?: (state: {
    isDragging: boolean;
    activeId: UniqueIdentifier | null;
  }) => void;

  /** 🔥 estrategia dinámica */
  strategy?: SortingStrategy;

  /** 🔥 override estilos */
  getItemStyle?: (params: {
    transform: any;
    isDragging: boolean;
  }) => CSSProperties;
}

/* =========================================================
   Item
========================================================= */

export function SortableItem({
  id,
  index,
  disabled,
  children,
}: SortableItemProps): ReactNode {
  const { isDraggingAny, hasDragged } = useContext(SortableStateContext);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id,
      disabled,
    });

  const style: CSSProperties = {
    transform: `translateY(${transform?.y ?? 0}px)`,
    transition: isDragging ? "none" : "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
  };

  return children({
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    isDraggingAny,
    hasDragged,
    style,
    index,
    disabled,
  });
}

/* =========================================================
   List
========================================================= */

export function SortableList<T extends { id: UniqueIdentifier }>({
  items,
  onReorder,
  children,
  renderItem,
  renderOverlay,
  activeId: activeIdProp,
  onDragStateChange,
  strategy,
  getItemStyle,
}: SortableListProps<T>): React.ReactElement {
  const id = useId();

  const [internalActiveId, setInternalActiveId] =
    useState<UniqueIdentifier | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const isControlled = activeIdProp !== undefined;
  const activeId = isControlled ? activeIdProp : internalActiveId;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  /* ================= Drag handlers ================= */

  const handleDragStart = (event: DragStartEvent): void => {
    setIsDraggingAny(true);

    if (!isControlled) setInternalActiveId(event.active.id);

    if (!hasDragged) setHasDragged(true);

    onDragStateChange?.({
      isDragging: true,
      activeId: event.active.id,
    });
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    setIsDraggingAny(false);

    if (!isControlled) setInternalActiveId(null);

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }

    onDragStateChange?.({
      isDragging: false,
      activeId: null,
    });
  };

  const handleDragCancel = (_event: DragCancelEvent): void => {
    setIsDraggingAny(false);

    if (!isControlled) setInternalActiveId(null);

    onDragStateChange?.({
      isDragging: false,
      activeId: null,
    });
  };

  const activeItem =
    activeId !== null ? items.find((item) => item.id === activeId) : undefined;

  /* ================= Context memo ================= */

  const contextValue = useMemo(
    () => ({
      activeId,
      hasDragged,
      isDraggingAny,
    }),
    [activeId, hasDragged, isDraggingAny],
  );

  /* ================= Render ================= */

  return (
    <SortableStateContext.Provider value={contextValue}>
      <DndContext
        id={id}
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={ids}
          strategy={strategy ?? verticalListSortingStrategy}
        >
          {/* 🔥 DX simple */}
          {renderItem
            ? items.map((item, index) => (
                <SortableItem key={item.id} id={item.id} index={index}>
                  {(props) => (
                    <div
                      ref={props.setNodeRef}
                      style={
                        getItemStyle
                          ? getItemStyle({
                              transform: props.style,
                              isDragging: props.isDragging,
                            })
                          : props.style
                      }
                      {...props.attributes}
                      {...props.listeners}
                    >
                      {renderItem(item, index)}
                    </div>
                  )}
                </SortableItem>
              ))
            : children}
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {activeItem && renderOverlay ? renderOverlay(activeItem) : null}
        </DragOverlay>
      </DndContext>
    </SortableStateContext.Provider>
  );
}

export { arrayMove };
