import { CircleAlert } from "lucide-react";

interface ZodErrorsProps {
    error: string[] | undefined;
}

export function ZodErrors({ error }: Readonly<ZodErrorsProps>) {
    if (!error) {
        return null;
    }

    return error.map((error: string, index: number) => (
        <div key={index} className="flex gap-1 py-1 text-sm text-red-500">
            <div>
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
            </div>
            <p>{error}</p>
        </div>
    ));
}
