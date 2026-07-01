"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { SectionId } from "@/types/accountSettings";
import ProfileSection from "./profileSection/ProfileSection";
import DangerZone from "./dangerZone/DangerZone";
import SecuritySection from "./securitySection/SecuritySection";
import { NAV } from "@/constants/accountSettings";
import { cn, getInitials } from "@/libs/utils";
import { CaretRightIcon, SignOutIcon } from "@phosphor-icons/react";
import { User, UserData } from "@/types/types";
import { logoutAction } from "@/data/actions";

interface AccountSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userData: UserData;
}

function renderSection(id: SectionId, userData: User): React.ReactNode {
    switch (id) {
        case "profile":
            return (
                <>
                    <ProfileSection userData={userData} />
                    <DangerZone userData={userData} />
                </>
            );
        case "security":
            return <SecuritySection />;
        // case "appearance":
        //     return <AppearanceSection />;
    }
}

export default function AccountSettingsModal({
    open,
    onOpenChange,
    userData,
}: Readonly<AccountSettingsModalProps>) {
    const [activeSection, setActiveSection] = useState<SectionId>("profile");

    const isLoggedIn =
        userData && userData.status === "success" && userData.data;

    const user = userData.data;

    if (!isLoggedIn || !user) {
        return null;
    }

    const handleSignOut = async () => {
        await logoutAction();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex h-[88vh] max-h-[680px] w-[95vw] max-w-[860px] flex-col gap-0 overflow-hidden rounded-md border bg-white p-0 shadow-xl [&>button:last-child]:hidden"
                aria-describedby={undefined}
            >
                <DialogTitle className="hidden"></DialogTitle>
                <div className="flex flex-1 overflow-hidden">
                    <nav className="flex w-48 shrink-0 flex-col border-r">
                        <div className="flex-1 space-y-0 overflow-y-auto px-2 py-3">
                            <div className="space-y-0.5">
                                {NAV.map((item) => {
                                    const Icon = item.icon;
                                    const active = activeSection === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                setActiveSection(item.id)
                                            }
                                            className={cn(
                                                "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm font-medium transition-all",
                                                active
                                                    ? "bg-white text-bright-blue shadow-sm"
                                                    : "border-transparent text-gray-500 hover:bg-white/80",
                                            )}
                                        >
                                            <span
                                                className={
                                                    active
                                                        ? "text-bright-blue"
                                                        : "text-gray-500"
                                                }
                                            >
                                                <Icon
                                                    weight="duotone"
                                                    size={16}
                                                />
                                            </span>
                                            {item.label}
                                            {active && (
                                                <CaretRightIcon
                                                    weight="duotone"
                                                    size={12}
                                                    className="ml-auto text-bright-blue"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="border-t p-3">
                            <div className="mb-2 flex items-center gap-2 px-1">
                                <Avatar className="size-7">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback
                                        className="text-[10px] font-medium text-white"
                                        style={{
                                            backgroundColor: user.color,
                                        }}
                                    >
                                        {getInitials(user.name, user.surname)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-gray-700">
                                        {user.name} {user.surname}
                                    </p>
                                    <p className="truncate text-[10px] text-gray-400">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                            >
                                <SignOutIcon
                                    weight="duotone"
                                    className="size-4"
                                />{" "}
                                Sign out
                            </button>
                        </div>
                    </nav>
                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            {renderSection(activeSection, user)}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
