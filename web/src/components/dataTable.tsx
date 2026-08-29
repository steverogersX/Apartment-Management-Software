"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Check,
  ChevronRight,
  GripVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { staggeredRise } from "@/lib/stagger";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/dataTablePagination";

export type DataTableFilterConfig<TData> =
  | {
      id: string;
      label: string;
      type: "search";
      placeholder?: string;
      predicate: (row: TData, query: string) => boolean;
    }
  | {
      id: string;
      label: string;
      type: "select";
      options: { label: string; value: string }[];
      predicate: (row: TData, value: string) => boolean;
    }
  | {
      id: string;
      label: string;
      type: "groupBy";
      options: { label: string; value: string }[];
      groupBy: (row: TData, value: string) => string;
    };

function SortableHeaderCell({
  id,
  draggable,
  width,
  children,
}: {
  id: string;
  draggable: boolean;
  width?: number;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !draggable,
  });

  const widthStyle = width !== undefined ? { width, minWidth: width, maxWidth: width } : undefined;

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        ...widthStyle,
      }}
      className={cn(
        "h-10 bg-muted/40 px-4 text-sm first:pl-4 last:pr-4",
        isDragging && "opacity-70",
      )}
    >
      <div className="flex items-center gap-1">
        {draggable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="-ml-1 cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        )}
        {children}
      </div>
    </TableHead>
  );
}

function SortableFilterChip({
  id,
  draggable,
  onRemove,
  children,
}: {
  id: string;
  draggable: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={cn(
        "flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1",
        isDragging && "opacity-70",
      )}
    >
      {draggable && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </button>
      )}
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground/50 transition-colors hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

type DataTableBaseProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  title?: string;
  toolbarActions?: React.ReactNode;
  filters?: DataTableFilterConfig<TData>[];
  enableColumnReorder?: boolean;
  enableColumnVisibility?: boolean;
  enableFilterCustomization?: boolean;
  enableRowSelection?: boolean;
  showPageSize?: boolean;
  pageSize?: number;
  itemLabel?: string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  initialSorting?: SortingState;
  onBulkDelete?: (rows: TData[]) => void;
};

type DataTableExpandableProps<TData> =
  | {
      renderSubRow?: undefined;
      getRowId?: (row: TData) => string;
    }
  | {
      renderSubRow: (row: TData) => React.ReactNode;
      getRowId: (row: TData) => string;
    };

export function DataTable<TData>({
  columns: columnsProp,
  data,
  title,
  toolbarActions,
  filters = [],
  enableColumnReorder = false,
  enableColumnVisibility = false,
  enableFilterCustomization = false,
  enableRowSelection = false,
  showPageSize = false,
  pageSize = 10,
  itemLabel = "item",
  emptyMessage = "No results.",
  onRowClick,
  initialSorting,
  onBulkDelete,
  renderSubRow,
  getRowId,
}: DataTableBaseProps<TData> & DataTableExpandableProps<TData>) {
  const isExpandable = !!renderSubRow;
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [...columnsProp];

    if (isExpandable) {
      const expanderColumn: ColumnDef<TData> = {
        id: "_expand",
        enableHiding: false,
        enableSorting: false,
        size: 32,
        header: () => null,
        cell: ({ row }) => {
          const expanded = expandedRowId === row.id;
          return (
            <span className="flex items-center justify-center">
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform",
                  expanded && "rotate-90",
                )}
              />
            </span>
          );
        },
      };
      cols.unshift(expanderColumn);
    }

    if (enableRowSelection) {
      const selectColumn: ColumnDef<TData> = {
        id: "_select",
        enableHiding: false,
        enableSorting: false,
        size: 36,
        header: ({ table }) => (
          <span className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)}
              aria-label="Select all"
            />
          </span>
        ),
        cell: ({ row }) => (
          <span className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Select row"
            />
          </span>
        ),
      };
      // chevron left of checkbox, so checkbox after expander — final order: [_expand, _select, ...]
      // To keep checkbox alongside chevron, insert select after expander
      if (isExpandable) {
        cols.splice(1, 0, selectColumn);
      } else {
        cols.unshift(selectColumn);
      }
    }

    return cols;
  }, [columnsProp, isExpandable, enableRowSelection, expandedRowId]);

  const [sorting, setSorting] = React.useState<SortingState>(initialSorting ?? []);
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    columns.map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey ?? ""),
  );
  React.useEffect(() => {
    setColumnOrder((prev) => {
      const ids = columns.map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey ?? "");
      if (ids.length === prev.length && ids.every((id, i) => id === prev[i])) return prev;
      return ids;
    });
  }, [columns]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [activeFilterIds, setActiveFilterIds] = React.useState<string[]>(filters.map((f) => f.id));
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeFilters = React.useMemo(
    () =>
      activeFilterIds
        .map((id) => filters.find((f) => f.id === id))
        .filter((f): f is DataTableFilterConfig<TData> => !!f),
    [activeFilterIds, filters],
  );

  const groupFilter = activeFilters.find((f) => f.type === "groupBy");
  const groupValue = groupFilter ? (filterValues[groupFilter.id] ?? "none") : "none";
  const isGrouped = !!groupFilter && groupValue !== "none";

  const filteredData = React.useMemo(() => {
    return activeFilters.reduce((rows, filter) => {
      if (filter.type === "groupBy") return rows;
      const value = filterValues[filter.id];
      if (!value || value === "all") return rows;
      return rows.filter((row) => filter.predicate(row, value));
    }, data);
  }, [activeFilters, data, filterValues]);

  const displayData = React.useMemo(() => {
    if (!isGrouped || !groupFilter || groupFilter.type !== "groupBy") return filteredData;
    return [...filteredData].sort((a, b) =>
      groupFilter.groupBy(a, groupValue).localeCompare(groupFilter.groupBy(b, groupValue)),
    );
  }, [filteredData, isGrouped, groupFilter, groupValue]);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });
  React.useEffect(() => {
    setPagination((p) => ({
      pageIndex: 0,
      pageSize: isGrouped ? Math.max(displayData.length, 1) : pageSize,
    }));
  }, [isGrouped, pageSize, displayData.length]);

  const table = useReactTable({
    data: displayData,
    columns,
    ...(getRowId ? { getRowId } : {}),
    state: { sorting, columnVisibility, columnOrder, pagination, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    enableSorting: !isGrouped,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const leafColumns = table.getAllLeafColumns();
  const orderedColumnIds = table.getVisibleLeafColumns().map((c) => c.id);
  const inactiveFilters = filters.filter((f) => !activeFilterIds.includes(f.id));

  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumnOrder((order) => {
      const ids = order.length ? order : columnOrder;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return order;
      return arrayMove(ids, oldIndex, newIndex);
    });
  }

  function handleFilterDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setActiveFilterIds((ids) => {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return ids;
      return arrayMove(ids, oldIndex, newIndex);
    });
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-2.5 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {enableRowSelection && selectedCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{selectedCount} selected</span>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  const rows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
                  onBulkDelete?.(rows);
                  if (onBulkDelete) setRowSelection({});
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          ) : (
            title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          <div className="flex items-center gap-1.5">
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" className="gap-1.5" />}
                >
                  <SlidersHorizontal className="size-3.5" />
                  Columns
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {leafColumns
                      .filter((c) => c.getCanHide())
                      .map((c) => (
                        <DropdownMenuCheckboxItem
                          key={c.id}
                          checked={c.getIsVisible()}
                          onCheckedChange={(v) => c.toggleVisibility(!!v)}
                        >
                          {String(
                            c.columnDef.meta && (c.columnDef.meta as { label?: string }).label
                              ? (c.columnDef.meta as { label?: string }).label
                              : c.id,
                          )}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {toolbarActions}
          </div>
        </div>

        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFilterDragEnd}
            >
              <SortableContext items={activeFilterIds} strategy={horizontalListSortingStrategy}>
                {activeFilters.map((filter) => (
                  <SortableFilterChip
                    key={filter.id}
                    id={filter.id}
                    draggable={enableFilterCustomization}
                    onRemove={() => {
                      setActiveFilterIds((ids) => ids.filter((id) => id !== filter.id));
                      setFilterValues((v) => ({ ...v, [filter.id]: "" }));
                    }}
                  >
                    {filter.type === "search" ? (
                      <div className="flex items-center gap-1.5 px-0.5">
                        <Search className="size-3.5 text-muted-foreground" />
                        <input
                          value={filterValues[filter.id] ?? ""}
                          onChange={(e) =>
                            setFilterValues((v) => ({ ...v, [filter.id]: e.target.value }))
                          }
                          placeholder={filter.placeholder ?? filter.label}
                          className="h-6 w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button type="button" className="px-0.5 text-sm text-foreground" />
                          }
                        >
                          {filter.label}:{" "}
                          {filter.type === "groupBy"
                            ? (filter.options.find(
                                (o) => o.value === (filterValues[filter.id] ?? "none"),
                              )?.label ?? "None")
                            : (filter.options.find((o) => o.value === filterValues[filter.id])
                                ?.label ?? "All")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          {(filter.type === "groupBy"
                            ? filter.options
                            : [
                                { label: `All ${filter.label.toLowerCase()}`, value: "all" },
                                ...filter.options,
                              ]
                          ).map((opt) => {
                            const current =
                              filterValues[filter.id] ||
                              (filter.type === "groupBy" ? "none" : "all");
                            const isSelected = current === opt.value;
                            return (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() =>
                                  setFilterValues((v) => ({ ...v, [filter.id]: opt.value }))
                                }
                                className="justify-between"
                              >
                                {opt.label}
                                {isSelected && <Check className="size-4 shrink-0" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </SortableFilterChip>
                ))}
              </SortableContext>
            </DndContext>

            {enableFilterCustomization && inactiveFilters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" />
                  }
                >
                  <Plus className="size-3.5" />
                  Filter
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {inactiveFilters.map((f) => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => setActiveFilterIds((ids) => [...ids, f.id])}
                    >
                      {f.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleColumnDragEnd}
                accessibility={{
                  container: typeof document !== "undefined" ? document.body : undefined,
                }}
              >
                <SortableContext items={orderedColumnIds} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => {
                    const width =
                      header.column.columnDef.size !== undefined ? header.getSize() : undefined;
                    return (
                      <SortableHeaderCell
                        key={header.id}
                        id={header.column.id}
                        draggable={
                          enableColumnReorder &&
                          header.id !== "_select" &&
                          header.id !== "_expand" &&
                          header.id !== "actions"
                        }
                        width={width}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </SortableHeaderCell>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            (() => {
              let lastGroupKey: string | undefined;
              return table.getRowModel().rows.map((row, rowIndex) => {
                const rows: React.ReactNode[] = [];
                if (isGrouped && groupFilter && groupFilter.type === "groupBy") {
                  const key = groupFilter.groupBy(row.original, groupValue);
                  if (key !== lastGroupKey) {
                    lastGroupKey = key;
                    rows.push(
                      <TableRow key={`group-${key}`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell
                          colSpan={row.getVisibleCells().length}
                          className="px-4 py-1.5 text-xs font-semibold text-muted-foreground"
                        >
                          {key}
                        </TableCell>
                      </TableRow>,
                    );
                  }
                }
                const isExpanded = isExpandable && expandedRowId === row.id;
                const handleRowClick = () => {
                  if (isExpandable) {
                    setExpandedRowId((prev) => (prev === row.id ? null : row.id));
                  } else if (onRowClick) {
                    onRowClick(row.original);
                  }
                };
                const rise = staggeredRise(rowIndex);
                rows.push(
                  <TableRow
                    key={row.id}
                    aria-expanded={isExpandable ? isExpanded : undefined}
                    onClick={isExpandable || onRowClick ? handleRowClick : undefined}
                    className={cn(
                      "border-border hover:bg-muted/50",
                      (isExpandable || onRowClick) && "cursor-pointer",
                      rise.className,
                    )}
                    style={rise.style}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const width =
                        cell.column.columnDef.size !== undefined
                          ? cell.column.getSize()
                          : undefined;
                      const widthStyle =
                        width !== undefined
                          ? { width, minWidth: width, maxWidth: width }
                          : undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          style={widthStyle}
                          className="px-4 py-2 align-middle text-sm"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>,
                );
                if (isExpanded && renderSubRow) {
                  rows.push(
                    <TableRow
                      key={`${row.id}-expanded`}
                      className="border-border bg-transparent hover:bg-transparent"
                    >
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        <div>{renderSubRow(row.original)}</div>
                      </TableCell>
                    </TableRow>,
                  );
                }
                return rows;
              });
            })()
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!isGrouped && (
        <DataTablePagination table={table} itemLabel={itemLabel} showPageSize={showPageSize} />
      )}
    </div>
  );
}
