"use client";

import { useActionState, useState } from "react";
import SectionTitle from "../sectionTitle/SectionTitle";
import { Avatar, AvatarFallback } from "../../shadcn/avatar";
import { Button } from "../../shadcn/button";
import FieldRow from "../fieldRow/FieldRow";
import { Input } from "../../shadcn/input";
import SaveBar from "../saveBar/SaveBar";
import { CameraIcon } from "@phosphor-icons/react";
import { BaseAction } from "@/types/actions";
import { updateProfileAction } from "@/data/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { User } from "@/types/types";
import { getInitials } from "@/libs/utils";

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface ProfileSectionProps {
    userData: User;
}

export default function ProfileSection({
    userData,
}: Readonly<ProfileSectionProps>) {
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        updateProfileAction,
        INITIAL_STATE,
    );

    return (
        <form
            action={formAction}
            onSubmit={() => setIsChanged(false)}
            className="space-y-5"
        >
            <div>
                <h2 className="text-lg font-bold text-gray-800">Profile</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your public profile information
                </p>
            </div>
            <div className="space-y-2">
                <SectionTitle>Avatar</SectionTitle>
                <div className="flex items-center gap-5 rounded-md border bg-gray-50 p-4">
                    <div className="group relative">
                        <Avatar className="size-16 shadow-md ring-2 ring-white">
                            <AvatarFallback
                                className="text-xl font-bold text-white"
                                style={{ backgroundColor: userData.color }}
                            >
                                {getInitials(userData.name, userData.surname)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <CameraIcon
                                weight="duotone"
                                className="size-4 text-white"
                            />
                        </button>
                    </div>
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mr-2 h-7 text-xs"
                        >
                            Upload photo
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-400"
                        >
                            Remove
                        </Button>
                        <p className="mt-1.5 text-xs text-gray-400">
                            JPG, PNG or WebP. Max 2 MB.
                        </p>
                    </div>
                </div>
                <ZodErrors error={formState?.zodErrors?.avatar} />
            </div>
            <div className="space-y-2">
                <SectionTitle>Personal info</SectionTitle>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-md border px-5">
                    <FieldRow
                        label="Full name"
                        hint="Your display name across the workspace"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                name="name"
                                placeholder="First"
                                defaultValue={
                                    formState?.formData
                                        ?.get("name")
                                        ?.toString() ?? userData.name
                                }
                                onChange={(e) =>
                                    e.target.value !== userData.name
                                        ? setIsChanged(true)
                                        : setIsChanged(false)
                                }
                                className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                            <Input
                                name="surname"
                                placeholder="Last"
                                defaultValue={
                                    formState?.formData
                                        ?.get("surname")
                                        ?.toString() ?? userData.surname
                                }
                                onChange={(e) =>
                                    e.target.value !== userData.surname
                                        ? setIsChanged(true)
                                        : setIsChanged(false)
                                }
                                className="h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                        </div>
                        <ZodErrors error={formState?.zodErrors?.name} />
                        <ZodErrors error={formState?.zodErrors?.surname} />
                    </FieldRow>
                    <FieldRow
                        label="Email address"
                        hint="Used for notifications and sign-in"
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                type="email"
                                name="email"
                                defaultValue={
                                    formState?.formData
                                        ?.get("email")
                                        ?.toString() ?? userData.email
                                }
                                onChange={(e) =>
                                    e.target.value !== userData.email
                                        ? setIsChanged(true)
                                        : setIsChanged(false)
                                }
                                className="h-8 flex-1 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                disabled={isPending}
                            />
                        </div>
                        <ZodErrors error={formState?.zodErrors?.email} />
                    </FieldRow>
                </div>
            </div>
            <SaveBar
                isChanged={isChanged}
                onDiscard={() => setIsChanged(false)}
                isPending={isPending}
            />
            {/* {isChanged && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircleIcon weight="duotone" className="size-4" />{" "}
                    Changes saved!
                </div>
            )} */}
        </form>
    );
}
