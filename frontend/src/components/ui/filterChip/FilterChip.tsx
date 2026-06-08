import { XIcon } from "@phosphor-icons/react";

export default function FilterChip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-bright-blue px-2 py-1 text-xs font-semibold text-bright-blue">
            {label}
            <button onClick={onRemove} className="ml-0.5">
                <XIcon weight="duotone" className="size-3" />
            </button>
        </span>
    );
}
