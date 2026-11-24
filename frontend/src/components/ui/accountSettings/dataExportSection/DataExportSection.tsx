import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

export default function DataExportSection() {
    return (
        <div className="mb-10 border-t border-border pt-5">
            <p className="mb-4 font-semibold">Your data</p>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
                <div>
                    <p className="text-sm font-semibold">Download your data</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        A JSON file with your profile, sessions, project
                        memberships, tasks, comments and uploaded files. Project
                        contents can be exported in each project&apos;s
                        settings.
                    </p>
                </div>
                <Button asChild size="sm" variant="outline">
                    <a href="/account/export" download>
                        <DownloadSimpleIcon
                            weight="duotone"
                            className="size-4"
                        />
                        Download
                    </a>
                </Button>
            </div>
        </div>
    );
}
