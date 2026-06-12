import { CircleAlert } from "lucide-react";

interface ZodErrorsProps {
    error: string[] | undefined;
}

export function ZodErrors({ error }: Readonly<ZodErrorsProps>) {
    if (!error) {
        return null;
    }

    return error.map((err: string, index: number) => (
        <div key={index} className="flex gap-1 py-1 text-sm text-red-500">
            <div>
                <CircleAlert className="w-4 h-4 mt-0.5" />
            </div>
            <p>{err}</p>
        </div>
    ));
}
