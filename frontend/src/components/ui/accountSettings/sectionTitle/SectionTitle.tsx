interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}

export default function SectionTitle({
    children,
    className,
}: Readonly<SectionTitleProps>) {
    return <h3 className={`font-semibold ${className ?? ""}`}>{children}</h3>;
}
