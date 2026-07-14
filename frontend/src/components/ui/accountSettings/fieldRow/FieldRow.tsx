interface FieldRowProps {
    label: string;
    hint?: string;
    children: React.ReactNode;
}

export default function FieldRow({
    label,
    hint,
    children,
}: Readonly<FieldRowProps>) {
    return (
        <div className="grid grid-cols-[1fr_1.6fr] items-start gap-6 border-b border-border py-5 last:border-0">
            <div>
                <p className="text-sm font-semibold">{label}</p>
                {hint && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}
