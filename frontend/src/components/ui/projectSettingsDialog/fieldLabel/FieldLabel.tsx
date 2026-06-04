export default function FieldLabel({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            {children}
        </label>
    );
}
