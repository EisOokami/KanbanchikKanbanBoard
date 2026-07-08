"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import SectionTitle from "../sectionTitle/SectionTitle";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import { Button } from "../../shadcn/button";
import FieldRow from "../fieldRow/FieldRow";
import { Input } from "../../shadcn/input";
import SaveBar from "../saveBar/SaveBar";
import { CameraIcon, InfoIcon } from "@phosphor-icons/react";
import { BaseAction } from "@/types/actions";
import { deleteAvatarAction, updateProfileAction } from "@/data/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { User } from "@/types/types";
import { cn, getInitials } from "@/libs/utils";
import { DetailsErrors } from "../../detailsErrors/DetailsErrors";
import AvatarColorPicker from "./avatarColorPicker/AvatarColorPicker";
import { toast } from "sonner";

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
    const [avatarPreview, setAvatarPreview] = useState<string>(
        userData.avatar_url,
    );
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [avatarColor, setAvatarColor] = useState<string>(userData.color);
    const [nameValue, setNameValue] = useState(userData.name);
    const [surnameValue, setSurnameValue] = useState(userData.surname);
    const [emailValue, setEmailValue] = useState(userData.email);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formState, formAction, isPending] = useActionState(
        updateProfileAction,
        INITIAL_STATE,
    );

    useEffect(() => {
        if (formState && formState.status === "success") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChanged(false);
        }
    }, [formState]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setIsChanged(true);
        }
    };

    const handleRemoveAvatar = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setAvatarPreview(userData.avatar_url);
        setIsChanged(true);
    };

    const handleDeleteAvatar = async (avatar_url: string) => {
        const result = await deleteAvatarAction(avatar_url);

        if (!result || !result.ok) {
            toast.success("Error", {
                description: "Something went wrong",
            });
        }

        if (result && !result.ok) {
            toast.success("Error", {
                description: result.message,
            });
        }

        if (result && result.ok) {
            toast.success("Success", {
                description: `Avatar has been deleted`,
            });

            setAvatarPreview("");
        }
    };

    const handleChangeAvatarColor = (color: string) => {
        setAvatarColor(color);
        setIsChanged(true);
    };

    const handleDiscard = () => {
        setNameValue(userData.name);
        setSurnameValue(userData.surname);
        setEmailValue(userData.email);
        setAvatarColor(userData.color);
        setAvatarPreview(userData.avatar_url);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setIsChanged(false);
    };

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-800">Profile</h2>
                <p className="mt-0.5 text-sm text-gray-400">
                    Manage your public profile information
                </p>
            </div>
            <div className="space-y-2">
                <input
                    name="avatar"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    disabled={isPending}
                    onChange={handleFileChange}
                />
                <SectionTitle>Avatar</SectionTitle>
                <div className="flex items-center gap-5 rounded-md border bg-gray-50 p-4">
                    <div className="group relative">
                        <Avatar className="size-16 shadow-md ring-2 ring-white">
                            <AvatarImage src={avatarPreview} />
                            <AvatarFallback
                                className="text-xl font-bold text-white"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {getInitials(nameValue, surnameValue)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPending}
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
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPending}
                        >
                            Upload photo
                        </Button>
                        {avatarPreview !== userData.avatar_url && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-gray-400"
                                onClick={handleRemoveAvatar}
                                disabled={isPending}
                            >
                                Remove
                            </Button>
                        )}
                        {userData.avatar_url &&
                            avatarPreview === userData.avatar_url && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                        handleDeleteAvatar(userData.avatar_url)
                                    }
                                    disabled={isPending}
                                >
                                    Delete
                                </Button>
                            )}
                        {!userData.avatar_url && (
                            <>
                                <AvatarColorPicker
                                    value={avatarColor}
                                    onChange={handleChangeAvatarColor}
                                    isPending={isPending}
                                />
                                <input
                                    name="color"
                                    type="hidden"
                                    value={avatarColor}
                                />
                            </>
                        )}
                        <p className="mt-1.5 text-xs text-gray-400">
                            JPG, PNG or WebP. Max 2 MB.
                        </p>
                    </div>
                </div>
                <div>
                    <ZodErrors error={formState?.zodErrors?.avatar} />
                </div>
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
                                value={nameValue}
                                onChange={(e) => {
                                    setNameValue(e.target.value);

                                    if (e.target.value !== userData.name) {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className={cn(
                                    "h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.name
                                        ? "border-red-500"
                                        : "",
                                )}
                                disabled={isPending}
                            />
                            <Input
                                name="surname"
                                placeholder="Last"
                                value={surnameValue}
                                onChange={(e) => {
                                    setSurnameValue(e.target.value);

                                    if (e.target.value !== userData.name) {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className={cn(
                                    "h-8 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.surname
                                        ? "border-red-500"
                                        : "",
                                )}
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
                                value={emailValue}
                                onChange={(e) => {
                                    setEmailValue(e.target.value);

                                    if (e.target.value !== userData.name) {
                                        setIsChanged(true);
                                    } else {
                                        setIsChanged(false);
                                    }
                                }}
                                className={cn(
                                    "h-8 flex-1 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.email
                                        ? "border-red-500"
                                        : "",
                                )}
                                disabled={isPending}
                            />
                        </div>
                        <ZodErrors error={formState?.zodErrors?.email} />
                    </FieldRow>
                </div>
            </div>
            <div className="!mb-4">
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
                        <InfoIcon weight="duotone" className="size-4" />
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
            <SaveBar
                isChanged={isChanged}
                onDiscard={handleDiscard}
                isPending={isPending}
            />
        </form>
    );
}
