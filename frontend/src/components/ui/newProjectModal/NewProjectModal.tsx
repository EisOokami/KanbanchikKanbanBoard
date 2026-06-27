"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { NewProjectFormData } from "@/types/types";
import { COLUMNS_CONFIG } from "@/constants/constants";
import { cn } from "@/libs/utils";
import { InfoIcon, PlusIcon } from "@phosphor-icons/react";
import { BaseAction } from "@/types/actions";
import { createProjectAction } from "@/data/actions";
import { Loader2 } from "lucide-react";
import { DetailsErrors } from "../detailsErrors/DetailsErrors";
import IconSection from "./iconSection/IconSection";
import NameSection from "./nameSection/NameSection";
import DescriptionSection from "./descriptionSection/DescriptionSection";
import StatusSection from "./statusSection/StatusSection";
import MemberSection from "./memberSection/MemberSection";
import ColumnsSection from "./columnsSection/ColumnsSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import LabelsSection from "./labelsSection/LabelsSection";
import PrioritySection from "./prioritySection/PrioritySection";

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function NewProjectModal({
    open,
    onClose,
}: Readonly<NewProjectModalProps>) {
    const [formData, setFormData] = useState<NewProjectFormData>({
        members: [],
        categories: [],
        columns: Object.values(COLUMNS_CONFIG),
        labels: [],
    });
    const [formState, formAction, isPending] = useActionState(
        createProjectAction.bind(null, formData),
        INITIAL_STATE,
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        if (formState && formState.status === "success") {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    useEffect(() => {
        if (!open) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            members: [],
            categories: [],
            columns: Object.values(COLUMNS_CONFIG),
            labels: [],
        });
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[92svh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border/70 p-0 shadow-2xl">
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogHeader className="flex-shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5 font-semibold">
                                New Project
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Configure your project settings
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
                        <IconSection
                            formState={formState}
                            isPending={isPending}
                        />
                        <NameSection
                            formState={formState}
                            isPending={isPending}
                        />
                        <DescriptionSection
                            formState={formState}
                            isPending={isPending}
                        />
                        <StatusSection
                            formState={formState}
                            isPending={isPending}
                        />
                        <MemberSection
                            formData={formData}
                            formState={formState}
                            isPending={isPending}
                            onFormDataChange={setFormData}
                        />
                        <ColumnsSection
                            formData={formData}
                            formState={formState}
                            isPending={isPending}
                            onFormDataChange={setFormData}
                        />
                        <PrioritySection
                            formState={formState}
                            isPending={isPending}
                        />
                        <CategoriesSection
                            formData={formData}
                            formState={formState}
                            isPending={isPending}
                            onFormDataChange={setFormData}
                        />
                        <LabelsSection
                            formData={formData}
                            formState={formState}
                            isPending={isPending}
                            onFormDataChange={setFormData}
                        />
                    </div>
                    <DialogFooter className="flex flex-shrink-0 items-center !justify-between gap-3 border-t border-border/60 px-6 py-4">
                        <div>
                            {formState?.message && (
                                <div
                                    className={cn(
                                        "flex items-center gap-2 rounded-md text-sm",
                                        formState?.status === "error"
                                            ? "text-red-500"
                                            : formState?.status === "success"
                                              ? "text-green-500"
                                              : "text-yellow-300",
                                    )}
                                >
                                    <InfoIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                    <p>{formState?.message}</p>
                                </div>
                            )}
                            {formState?.details &&
                                formState?.details?.length &&
                                formState.details.map((error) => (
                                    <DetailsErrors
                                        key={error.message + error.field}
                                        error={error}
                                    />
                                ))}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                                className="h-9"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Save changes...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Create Project
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
