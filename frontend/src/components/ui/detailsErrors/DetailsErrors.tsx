import { TriangleAlert } from "lucide-react";
import { IDetailsError } from "@/interfaces/actions";

interface DetailsErrorsProps {
    error: IDetailsError | null | undefined;
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
