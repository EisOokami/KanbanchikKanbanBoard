interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}

export default function SectionTitle({
    children,
    className,
}: SectionTitleProps) {
    return (
        <h3
            className={`mb-4 pt-1 text-xs font-bold uppercase tracking-widest text-gray-400 ${className ?? ""}`}
        >
            {children}
        </h3>
    );
}
