"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/shadcn/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    ArrowCounterClockwiseIcon,
    CheckIcon,
    FunnelIcon,
    XIcon,
} from "@phosphor-icons/react";
import { Category, Project, User } from "@/types/types";
import { FilterSortOptions, SortField } from "@/types/projectsOverview";
import SortBySection from "./sortBySection/SortBySection";
import StatusSection from "./statusSection/StatusSection";
import MembersSection from "./membersSection/MembersSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";

interface FilterSortSheetProps {
    open: boolean;
    onClose: () => void;
    projects: Project[];
    options: FilterSortOptions;
    onChange: (options: FilterSortOptions) => void;
    onReset: () => void;
}

export default function ProjectFilterSheet({
    open,
    onClose,
    projects,
    options,
    onChange,
    onReset,
}: Readonly<FilterSortSheetProps>) {
    const members = Array.from(
        new Map(
            projects
                .flatMap((project) => project.members)
                .map((member) => [member.id, member]),
        ).values(),
    ) as Omit<User, "email">[];

    const categories = Array.from(
        new Map(
            projects
                .flatMap((project) => project.categories)
                .map((category) => [category.id, category]),
        ).values(),
    ) as Category[];

    const toggle = <T,>(array: T[], value: T): T[] =>
        array.includes(value)
            ? array.filter((x) => x !== value)
            : [...array, value];

    const setSort = (field: SortField) => {
        if (options.sortField === field) {
            onChange({
                ...options,
                sortDirection: options.sortDirection === "asc" ? "desc" : "asc",
            });
        } else {
            onChange({ ...options, sortField: field, sortDirection: "asc" });
        }
    };

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 border-border bg-background-secondary p-0 [&>button:first-of-type]:hidden">
                <SheetHeader className="border-b border-border px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                                <FunnelIcon
                                    weight="duotone"
                                    className="size-5"
                                />
                                Filter & Sort
                            </SheetTitle>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onClose()}
                            className="size-7 text-control-text transition-colors hover:bg-control-active [&_svg]:size-4"
                        >
                            <XIcon weight="duotone" />
                        </Button>
                    </div>
                </SheetHeader>
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                    <SortBySection options={options} onSort={setSort} />
                    <Separator />
                    <StatusSection
                        options={options}
                        onChange={onChange}
                        onToggle={toggle}
                    />
                    <Separator />
                    {members.length > 0 && (
                        <>
                            <MembersSection
                                members={members}
                                options={options}
                                onChange={onChange}
                                onToggle={toggle}
                            />
                            <Separator />
                        </>
                    )}
                    {categories.length > 0 && (
                        <CategoriesSection
                            categories={categories}
                            options={options}
                            onChange={onChange}
                            onToggle={toggle}
                        />
                    )}
                </div>
                <SheetFooter className="border-t border-border px-5 py-3">
                    <Button
                        variant="outline"
                        className="bg-control text-control-text hover:bg-control-active [&_svg]:size-4"
                        onClick={onReset}
                    >
                        <ArrowCounterClockwiseIcon weight="duotone" />
                        Reset all
                    </Button>
                    <Button
                        className="bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                        onClick={onClose}
                    >
                        <CheckIcon weight="duotone" />
                        Apply
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
