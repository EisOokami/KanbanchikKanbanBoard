import { Check, CircleAlert } from "lucide-react";
import { Button } from "../../shadcn/button";

interface SaveBarProps {
    dirty: boolean;
    onSave: () => void;
    onDiscard: () => void;
}

export default function SaveBar({ dirty, onSave, onDiscard }: SaveBarProps) {
    if (!dirty) return null;

    return (
        <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between gap-3 border-t bg-white/95 px-6 py-3 backdrop-blur">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <WarningIcon
                    weight="duotone"
                    className="size-4 text-amber-500"
                />
                You have unsaved changes
            </p>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDiscard}
                    className="h-7 text-xs"
                >
                    Discard
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    className="h-7 gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                >
                    <CheckIcon weight="duotone" className="size-4" /> Save
                    changes
                </Button>
            </div>
        </div>
    );
}
