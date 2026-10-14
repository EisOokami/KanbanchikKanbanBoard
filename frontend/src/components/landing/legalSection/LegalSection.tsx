import { ReactNode } from "react";

interface LegalSectionProps {
    id: string;
    title: string;
    children: ReactNode;
}

export default function LegalSection({
    id,
    title,
    children,
}: LegalSectionProps) {
    return (
        <section id={id} className="scroll-mt-20">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <div className="mt-3 space-y-4 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300">
                {children}
            </div>
        </section>
    );
}
