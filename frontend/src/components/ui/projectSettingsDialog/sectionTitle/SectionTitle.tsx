"use client";

export default function SectionTitle({
    children,
}: {
    children: React.ReactNode;
}) {
    return <h3 className="mb-4 text-sm font-semibold">{children}</h3>;
}
