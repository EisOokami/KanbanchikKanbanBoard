import { Fragment, ReactNode } from "react";

interface LegalListProps {
    items: ReactNode[];
    type?: "ordered" | "unordered";
}

function renderBold(text: string): ReactNode[] {
    return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
        index % 2 === 1 ? (
            <strong key={index} className="font-semibold text-foreground">
                {part}
            </strong>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        ),
    );
}

export default function LegalList({
    items,
    type = "unordered",
}: LegalListProps) {
    const isOrdered = type === "ordered";

    const listClasses = isOrdered
        ? "list-decimal space-y-2 pl-5 marker:text-muted-foreground/60"
        : "list-disc space-y-2 pl-5 marker:text-muted-foreground/60";

    return isOrdered ? (
        <ol className={listClasses}>
            {items.map((item, index) => (
                <li key={index}>
                    {typeof item === "string" ? renderBold(item) : item}
                </li>
            ))}
        </ol>
    ) : (
        <ul className={listClasses}>
            {items.map((item, index) => (
                <li key={index}>
                    {typeof item === "string" ? renderBold(item) : item}
                </li>
            ))}
        </ul>
    );
}
