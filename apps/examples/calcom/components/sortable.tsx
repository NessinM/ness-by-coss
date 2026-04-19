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
import { CSS } from "@dnd-kit/utilities";
import {
  useVirtualizer,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import type * as React from "react";
import {
  type CSSProperties,
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   Scalar constants — no type dependencies
========================================================= */

/** Items below this count render normally. At or above → virtualized. */
const DEFAULT_VIRTUALIZE_THRESHOLD = 100;
/** Default estimated row height used by the virtualizer on first render. */
const DEFAULT_ESTIMATED_SIZE = 56;

/* =========================================================
   Types
========================================================= */

export interface SortableItemRenderProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  /** Attach to the DOM node that dnd-kit should track. */
  setNodeRef: (node: HTMLElement | null) => void;

  isDragging: boolean;
  isDraggingAny: boolean;
  hasDragged: boolean;

  style: CSSProperties;

  index?: number;
  disabled?: boolean;
}

interface SortableItemProps {
  id: UniqueIdentifier;
  index?: number;
  disabled?: boolean;
  children: (props: SortableItemRenderProps) => ReactNode;
}

/** Options forwarded to @tanstack/react-virtual */
export interface VirtualizeOptions
  extends Partial<
    Pick<
      VirtualizerOptions<HTMLDivElement, Element>,
      | "estimateSize"
      | "overscan"
      | "paddingStart"
      | "paddingEnd"
      | "scrollPaddingStart"
      | "scrollPaddingEnd"
    >
  > {
  /** Fixed height of the scrollable container in px. Default: 600. */
  containerHeight?: number;
  /**
   * Custom class applied to the scroll container div.
   * Use it to set max-height, border, etc.
   */
  containerClassName?: string;
}

export interface SortableListProps<T extends { id: UniqueIdentifier }> {
  items: T[];
  onReorder: (items: T[]) => void;

  // ── Render modes ──────────────────────────────────────────
  /** Simple mode: wrap each item yourself. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Advanced mode: full render-prop access. */
  children?: ReactNode;
  /** Rendered inside DragOverlay while dragging. */
  renderOverlay?: (activeItem: T) => ReactNode;

  // ── Virtualization ─────────────────────────────────────────
  /**
   * Enable virtualization explicitly.
   * When omitted it auto-activates above `virtualizeThreshold`.
   */
  virtualize?: boolean;
  /**
   * Item count above which virtualisation kicks in automatically.
   * Default: 100.
   */
  virtualizeThreshold?: number;
  /** Fine-grained control over the virtualizer. */
  virtualizeOptions?: VirtualizeOptions;

  // ── External drag control ──────────────────────────────────
  activeId?: UniqueIdentifier | null;
  onDragStateChange?: (state: {
    isDragging: boolean;
    activeId: UniqueIdentifier | null;
  }) => void;

  // ── DnD strategy ──────────────────────────────────────────
  strategy?: SortingStrategy;

  // ── Style overrides ────────────────────────────────────────
  getItemStyle?: (params: {
    transform: string | null;
    isDragging: boolean;
    defaultStyle: CSSProperties;
  }) => CSSProperties;
}

/* =========================================================
   Stable module-level constants
   Declared AFTER the interfaces they reference so TypeScript
   and all bundlers (including webpack/turbopack in "use client"
   files) can resolve the types at parse time.
========================================================= */

/**
 * Stable empty object used as the default value for `virtualizeOptions`
 * so that VirtualSortableList never sees a new reference when the caller
 * omits the prop, avoiding spurious re-renders.
 */
const EMPTY_VIRTUALIZE_OPTIONS: VirtualizeOptions = {};

/**
 * Sensor activation configs as module-level constants.
 *
 * `useSensor` is a Hook and must be called at the top level of the
 * component — it cannot be wrapped in `useMemo`. However, because
 * these option objects are defined once at module scope their references
 * are stable across renders, which achieves the same goal: `useSensors`
 * always receives identical descriptors and never triggers a re-render.
 */
const MOUSE_SENSOR_OPTIONS = {
  activationConstraint: { distance: 8 },
} as const;

const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 250, tolerance: 5 },
} as const;

// coordinateGetter is a function reference — already stable.
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates,
};

/* =========================================================
   Contexts

   Split into two separate contexts so that components that only
   care about `hasDragged` (a one-time flip) are NOT re-rendered
   on every drag-move event that updates `isDraggingAny`/`activeId`.
========================================================= */

interface DragActiveContextValue {
  isDraggingAny: boolean;
  activeId: UniqueIdentifier | null;
}

interface DragHistoryContextValue {
  hasDragged: boolean;
}

const DragActiveContext = createContext<DragActiveContextValue>({
  activeId: null,
  isDraggingAny: false,
});

const DragHistoryContext = createContext<DragHistoryContextValue>({
  hasDragged: false,
});

/* =========================================================
   SortableItem

   Wrapped in memo so the render-prop children() call is skipped
   when id/index/disabled haven't changed. During a drag only the
   actively-dragged item and its immediate neighbour need to update.
========================================================= */

export const SortableItem = memo(function SortableItem({
  id,
  index,
  disabled,
  children,
}: SortableItemProps): ReactNode {
  // Read from the two split contexts independently.
  const { isDraggingAny } = useContext(DragActiveContext);
  const { hasDragged } = useContext(DragHistoryContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition ?? "transform 200ms ease"),
    opacity: isDragging ? 0.5 : 1,
    // Prevent layout shift issues inside the virtual scroller
    willChange: isDraggingAny ? "transform" : undefined,
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
});

/* =========================================================
   Internal: VirtualSortableList
   (rendered when virtualization is active)
========================================================= */

function VirtualSortableList<T extends { id: UniqueIdentifier }>({
  items,
  renderItem,
  activeId,
  virtualizeOptions,
  getItemStyle,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  activeId: UniqueIdentifier | null;
  virtualizeOptions: VirtualizeOptions;
  getItemStyle?: SortableListProps<T>["getItemStyle"];
}) {
  const {
    containerHeight = 600,
    containerClassName,
    estimateSize,
    overscan = 5,
    paddingStart,
    paddingEnd,
    scrollPaddingStart,
    scrollPaddingEnd,
  } = virtualizeOptions;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize ?? (() => DEFAULT_ESTIMATED_SIZE),
    overscan,
    paddingStart,
    paddingEnd,
    scrollPaddingStart,
    scrollPaddingEnd,
    // measureElement lets rows self-report variable heights after mount
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={containerClassName}
      style={{
        height: containerHeight,
        overflow: "auto",
        // containment so the browser only paints visible rows
        contain: "strict",
      }}
    >
      {/* Total spacer — virtualizer needs a real-height inner to allow scrolling */}
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;

          return (
            <SortableItem key={item.id} id={item.id} index={virtualRow.index}>
              {(props) => (
                <div
                  ref={(node) => {
                    props.setNodeRef(node);
                    // Let the virtualizer measure variable heights
                    if (node) rowVirtualizer.measureElement(node);
                  }}
                  data-index={virtualRow.index}
                  style={
                    getItemStyle
                      ? getItemStyle({
                          transform: props.style.transform ?? null,
                          isDragging: props.isDragging,
                          defaultStyle: {
                            ...props.style,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                          },
                        })
                      : {
                          ...props.style,
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          // Compose dnd-kit's transform on top of the virtual offset
                          transform: props.style.transform
                            ? `translateY(${virtualRow.start}px) ${props.style.transform}`
                            : `translateY(${virtualRow.start}px)`,
                        }
                  }
                  {...props.attributes}
                  {...props.listeners}
                >
                  {renderItem(item, virtualRow.index)}
                </div>
              )}
            </SortableItem>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SortableList (main export)
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
  virtualize,
  virtualizeThreshold = DEFAULT_VIRTUALIZE_THRESHOLD,
  // Use the stable constant so VirtualSortableList never sees a new reference
  // when the caller omits this prop (avoids spurious re-renders).
  virtualizeOptions = EMPTY_VIRTUALIZE_OPTIONS,
}: SortableListProps<T>): React.ReactElement {
  const id = useId();

  const [internalActiveId, setInternalActiveId] =
    useState<UniqueIdentifier | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const isControlled = activeIdProp !== undefined;
  const activeId = isControlled ? activeIdProp : internalActiveId;

  // ── Stable refs ─────────────────────────────────────────────
  // Keep mutable refs that always point to the latest values so
  // drag callbacks can be defined with an empty dependency array.
  // This prevents handleDragEnd from being recreated on every render
  // when items/onReorder change (e.g. right after each reorder call).
  const itemsRef = useRef(items);
  const reorderRef = useRef(onReorder);
  const onDragStateChangeRef = useRef(onDragStateChange);
  const isControlledRef = useRef(isControlled);

  useLayoutEffect(() => {
    itemsRef.current = items;
    reorderRef.current = onReorder;
    onDragStateChangeRef.current = onDragStateChange;
    isControlledRef.current = isControlled;
  });

  // ── Sensors ─────────────────────────────────────────────────
  // useSensor must be called at the top level of the component —
  // it cannot be nested inside useMemo. Stability comes from the
  // module-level *_SENSOR_OPTIONS constants above, whose object
  // references never change between renders.
  const mouseSensor = useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS);
  const touchSensor = useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS);
  const keyboardSensor = useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // Auto-detect virtualization need
  const shouldVirtualize =
    virtualize !== undefined ? virtualize : items.length >= virtualizeThreshold;

  // Disable virtualization entirely while dragging so dnd-kit can read every
  // item's DOM position accurately (prevents "drop target disappeared" bugs).
  const useVirtualRendering = shouldVirtualize && !isDraggingAny;

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  /* ── Drag handlers ──────────────────────────────────────── */

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    setIsDraggingAny(true);
    if (!isControlledRef.current) setInternalActiveId(event.active.id);
    // hasDragged is a one-time flip — only call setState when needed
    setHasDragged((prev) => prev || true);
    onDragStateChangeRef.current?.({
      isDragging: true,
      activeId: event.active.id,
    });
  }, []); // stable — all mutable values read via refs

  const handleDragEnd = useCallback((event: DragEndEvent): void => {
    setIsDraggingAny(false);
    if (!isControlledRef.current) setInternalActiveId(null);

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentItems = itemsRef.current;
      const oldIndex = currentItems.findIndex((i) => i.id === active.id);
      const newIndex = currentItems.findIndex((i) => i.id === over.id);
      reorderRef.current(arrayMove(currentItems, oldIndex, newIndex));
    }

    onDragStateChangeRef.current?.({ isDragging: false, activeId: null });
  }, []); // stable — all mutable values read via refs

  const handleDragCancel = useCallback((_event: DragCancelEvent): void => {
    setIsDraggingAny(false);
    if (!isControlledRef.current) setInternalActiveId(null);
    onDragStateChangeRef.current?.({ isDragging: false, activeId: null });
  }, []); // stable — all mutable values read via refs

  // Memoized so items.find() isn't re-run on every render
  const activeItem = useMemo(
    () =>
      activeId !== null
        ? items.find((item) => item.id === activeId)
        : undefined,
    [activeId, items],
  );

  /* ── Context values (split to minimise consumer re-renders) ── */

  const dragActiveValue = useMemo(
    () => ({ isDraggingAny, activeId }),
    [isDraggingAny, activeId],
  );

  const dragHistoryValue = useMemo(() => ({ hasDragged }), [hasDragged]);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    // DragHistoryContext is outermost: hasDragged only ever flips once,
    // so its consumers re-render at most once per session.
    <DragHistoryContext.Provider value={dragHistoryValue}>
      <DragActiveContext.Provider value={dragActiveValue}>
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
            {/* ── Simple mode ── */}
            {renderItem ? (
              useVirtualRendering ? (
                /* Virtualized path */
                <VirtualSortableList
                  items={items}
                  renderItem={renderItem}
                  activeId={activeId}
                  virtualizeOptions={virtualizeOptions}
                  getItemStyle={getItemStyle}
                />
              ) : (
                /* Normal path (small lists or while dragging) */
                items.map((item, index) => (
                  <SortableItem key={item.id} id={item.id} index={index}>
                    {(props) => (
                      <div
                        ref={props.setNodeRef}
                        style={
                          getItemStyle
                            ? getItemStyle({
                                transform: props.style.transform as
                                  | string
                                  | null,
                                isDragging: props.isDragging,
                                defaultStyle: props.style,
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
              )
            ) : (
              /* Advanced mode: caller provides <SortableItem> nodes */
              children
            )}
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
      </DragActiveContext.Provider>
    </DragHistoryContext.Provider>
  );
}

/* =========================================================
   Re-exports for convenience
========================================================= */

export { arrayMove };
export type { UniqueIdentifier };
