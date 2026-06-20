import { CheckIcon, WarningIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

interface SaveBarProps {
    isChanged: boolean;
    onDiscard?: () => void;
    isPending: boolean;
}

export default function SaveBar({
    isChanged,
    onDiscard,
    isPending,
}: Readonly<SaveBarProps>) {
    if (!isChanged) {
        return null;
    }

    return (
        <div className="absolute bottom-0 -mx-6 mt-6 flex w-full items-center justify-between gap-3 border-t bg-white/95 px-6 py-3 backdrop-blur">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <WarningIcon
                    weight="duotone"
                    className="size-4 text-amber-500"
                />
                You have unsaved changes
            </p>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDiscard}
                    className="h-7 text-xs"
                    disabled={isPending}
                >
                    Discard
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    className="h-7 gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                    disabled={isPending}
                >
                    <CheckIcon weight="duotone" className="size-4" /> Save
                    changes
                </Button>
            </div>
        </div>
    );
}
