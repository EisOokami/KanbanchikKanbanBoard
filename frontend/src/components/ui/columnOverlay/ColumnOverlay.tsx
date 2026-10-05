import OverlayTask from "@/components/ui/overlayTask/OverlayTask";
import { Column } from "@/types/types";

interface ColumnOverlayProps {
    column: Column;
    showPriorityEmoji: boolean;
}

export default function ColumnOverlay({
    column,
    showPriorityEmoji,
}: Readonly<ColumnOverlayProps>) {
    return (
        <div className="flex max-h-[70vh] w-[320px] rotate-2 flex-col overflow-hidden rounded-xl bg-column p-2 shadow-xl">
            <div className="mb-3 flex items-center gap-1.5 rounded-md border border-border bg-background-secondary px-3 py-2">
                <span className="text-sm font-medium">{column.name}</span>
                <span className="text-xs">({column.tasks.length})</span>
            </div>
            <div className="flex min-h-[40px] flex-col gap-2 overflow-hidden">
                {column.tasks.map((task) => (
                    <OverlayTask
                        key={task.id}
                        task={task}
                        showPriorityEmoji={showPriorityEmoji}
                    />
                ))}
            </div>
        </div>
    );
}
