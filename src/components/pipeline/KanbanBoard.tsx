"use client";

import {
  DragDropContext,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { DealCard } from "@/components/pipeline/DealCard";
import {
  DEAL_STATUS_LABELS,
  KANBAN_COLUMNS,
  ARCHIVED_STATUSES,
  formatCurrency,
} from "@/lib/utils/deal";
import type { DealStatus, DealWithRelations } from "@/types";

interface KanbanBoardProps {
  deals: DealWithRelations[];
  showArchived: boolean;
  onStatusChange: (dealId: string, newStatus: DealStatus) => void;
}

export function KanbanBoard({
  deals,
  showArchived,
  onStatusChange,
}: KanbanBoardProps) {
  const columns = showArchived
    ? [...KANBAN_COLUMNS, ...ARCHIVED_STATUSES]
    : KANBAN_COLUMNS;

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as DealStatus;
    const deal = deals.find((d) => d.id === draggableId);
    if (!deal || deal.status === newStatus) return;

    onStatusChange(draggableId, newStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-6 lg:px-6">
        {columns.map((status) => {
          const columnDeals = deals.filter((d) => d.status === status);
          const columnValue = columnDeals.reduce(
            (sum, d) => sum + (d.deal_value || 0),
            0
          );
          return (
            <div key={status} className="flex-shrink-0 w-[280px]">
              {/* Column header */}
              <div className="mb-3 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    {DEAL_STATUS_LABELS[status]}
                  </h3>
                  <span className="text-xs font-medium bg-white rounded-full px-2 py-0.5 text-[#6B7280] border border-[#E5E7EB]">
                    {columnDeals.length}
                  </span>
                </div>
                {columnValue > 0 && (
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    {formatCurrency(columnValue)}
                  </p>
                )}
              </div>

              {/* Droppable column */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-lg p-2 space-y-2 transition-all duration-200 ${
                      snapshot.isDraggingOver
                        ? "bg-[#E87A2E]/5 ring-2 ring-[#E87A2E]/20 ring-dashed"
                        : "bg-[#F3F4F6]/50"
                    }`}
                  >
                    {columnDeals.map((deal, index) => (
                      <DealCard key={deal.id} deal={deal} index={index} />
                    ))}
                    {provided.placeholder}

                    {columnDeals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 text-xs text-[#9CA3AF]">
                        Nessun deal
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
