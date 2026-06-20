import { TriangleAlert } from "lucide-react";
import { DetailsError } from "@/types/actions";

interface DetailsErrorsProps {
    error: DetailsError | null | undefined;
}

export function DetailsErrors({ error }: Readonly<DetailsErrorsProps>) {
    if (!error) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 py-1 text-sm text-red-500">
            <TriangleAlert className="text-lg" />
            <p>{error.message}</p>
        </div>
    );
}
