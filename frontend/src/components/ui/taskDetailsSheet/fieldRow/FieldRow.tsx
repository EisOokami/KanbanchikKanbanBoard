"use client";

export default function FieldRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="group/row flex items-center gap-3 py-2.5">
            <div className="flex w-32 shrink-0 items-center gap-1.5 pt-0.5">
                <span className="mb-0.5 text-gray-500">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                </span>
            </div>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
