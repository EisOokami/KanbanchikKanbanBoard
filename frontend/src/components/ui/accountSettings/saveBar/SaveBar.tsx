import { CheckIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import { cn } from "@/libs/utils";

interface SaveBarProps {
    isChanged: boolean;
    isPending?: boolean;
    onDiscard?: () => void;
    onSave?: () => void;
}

export default function SaveBar({
    isChanged,
    isPending,
    onDiscard,
    onSave,
}: Readonly<SaveBarProps>) {
    if (!isChanged) {
        return null;
    }

    return (
        <div className="absolute bottom-0 -mx-6 mt-6 flex w-full items-center justify-end gap-3 border-t border-border bg-background-secondary px-6 py-3 transition-colors">
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onDiscard}
                    className="h-9 rounded-md bg-control px-4 text-sm text-control-text hover:bg-control-active"
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    onClick={onSave}
                    disabled={isPending || !isChanged}
                    className={cn(
                        "h-9 rounded-md bg-bright-blue text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40",
                        !isChanged && "cursor-not-allowed opacity-50",
                    )}
                >
                    <CheckIcon weight="duotone" size={14} />
                    Save changes
                </Button>
            </div>
        </div>
    );
}
