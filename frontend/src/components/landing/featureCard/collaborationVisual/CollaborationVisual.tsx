import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { PaperclipIcon } from "@phosphor-icons/react/dist/ssr";

export default function CollaborationVisual() {
    return (
        <div className="flex h-full flex-col justify-center gap-3 rounded-md border bg-background-secondary p-3">
            <div className="flex items-start gap-2.5">
                <Avatar className="size-7">
                    <AvatarFallback className="text-xs font-semibold text-white">
                        AL
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 rounded-md bg-secondary px-2.5 py-1.5 text-[13px] leading-snug">
                    <span className="font-medium">Alina</span> Updated the
                    mockups, ready for review.
                </div>
            </div>
            <div className="flex items-center gap-2 pl-[2.375rem] text-xs text-muted-foreground">
                <PaperclipIcon weight="duotone" className="size-3.5 shrink-0" />
                <span className="truncate">dashboard-v3.fig</span>
            </div>
            <div className="flex items-start gap-2.5">
                <Avatar className="size-7">
                    <AvatarFallback className="text-xs font-semibold text-white">
                        DP
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 rounded-md bg-secondary px-2.5 py-1.5 text-[13px] leading-snug">
                    <span className="font-medium">Diego</span> Looks good.
                    Moving it to Review.
                </div>
            </div>
        </div>
    );
}
