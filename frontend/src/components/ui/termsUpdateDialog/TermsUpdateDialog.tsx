"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";
import LegalConsentText from "@/components/ui/legalConsent/LegalConsentText";
import { acceptTermsAction, logoutAction } from "@/data/actions";

export default function TermsUpdateDialog() {
    const [open, setOpen] = useState<boolean>(true);
    const [accepted, setAccepted] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAccept = () => {
        startTransition(async () => {
            const result = await acceptTermsAction();

            if (!result.ok) {
                toast.error("Error", { description: result.message });

                return;
            }

            setOpen(false);

            router.refresh();
        });
    };

    return (
        <Dialog open={open}>
            <DialogContent
                className="max-w-md [&>button:last-child]:hidden"
                onEscapeKeyDown={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
            >
                <DialogTitle>Updated Terms and Privacy Policy</DialogTitle>
                <DialogDescription>
                    We have published new versions of the Terms of Service and
                    the Privacy Policy. Please review them and accept to
                    continue using Kanbanchik.
                </DialogDescription>
                <div className="flex items-start gap-2">
                    <Checkbox
                        id="acceptUpdatedTerms"
                        checked={accepted}
                        onCheckedChange={(checked) =>
                            setAccepted(checked === true)
                        }
                        className="mt-0.5"
                        disabled={isPending}
                    />
                    <Label
                        htmlFor="acceptUpdatedTerms"
                        className="text-sm font-normal leading-snug text-muted-foreground"
                    >
                        <LegalConsentText updated />
                    </Label>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoutAction()}
                        disabled={isPending}
                    >
                        Sign out
                    </Button>
                    <Button
                        type="button"
                        className="bg-bright-blue text-white hover:bg-blue-600"
                        onClick={handleAccept}
                        disabled={!accepted || isPending}
                    >
                        {isPending && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Accept and continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
