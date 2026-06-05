"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/shadcn/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { LogOut, ChevronRight } from "lucide-react";
import { SectionId } from "@/types/accountSettings";
import ProfileSection from "./profileSection/ProfileSection";
import DangerZone from "./dangerZone/DangerZone";
import SecuritySection from "./securitySection/SecuritySection";
import NotificationsSection from "./notificationsSection/NotificationsSection";
import AppearanceSection from "./appearanceSection/AppearanceSection";
import { GROUPS, NAV } from "@/constants/accountSettings";

interface AccountSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function renderSection(id: SectionId): React.ReactNode {
    switch (id) {
        case "profile":
            return (
                <>
                    <ProfileSection />
                    <DangerZone />
                </>
            );
        case "security":
            return <SecuritySection />;
        case "notifications":
            return <NotificationsSection />;
        case "appearance":
            return <AppearanceSection />;
    }
}

export default function AccountSettingsModal({
    open,
    onOpenChange,
}: AccountSettingsModalProps) {
    const [activeSection, setActiveSection] = useState<SectionId>("profile");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full max-w-[860px] flex-col gap-0 overflow-hidden rounded-md p-0 shadow-2xl">
                <div className="flex min-h-0 flex-1">
                    <aside className="flex w-52 flex-shrink-0 flex-col border-r bg-gray-50">
                        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                            {GROUPS.map((group) => (
                                <div key={group} className="mb-4">
                                    <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        {group}
                                    </p>
                                    <div className="space-y-1">
                                        {NAV.filter(
                                            (n) => n.group === group,
                                        ).map((item) => {
                                            const Icon = item.icon;
                                            const active =
                                                activeSection === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() =>
                                                        setActiveSection(
                                                            item.id,
                                                        )
                                                    }
                                                    className={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-all
                                                    ${
                                                        active
                                                            ? "bg-white font-semibold text-bright-blue shadow-sm"
                                                            : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`size-3.5 flex-shrink-0 ${active ? "text-bright-blue" : "text-gray-400"}`}
                                                    />
                                                    {item.label}
                                                    {active && (
                                                        <ChevronRight className="ml-auto size-3 text-bright-blue" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div className="border-t p-3">
                            <div className="mb-2 flex items-center gap-2 px-1">
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-blue-500 text-[10px] font-bold text-white">
                                        AK
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-gray-700">
                                        Alex Kovalenko
                                    </p>
                                    <p className="truncate text-[10px] text-gray-400">
                                        alex@acme.com
                                    </p>
                                </div>
                            </div>
                            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500">
                                <LogOut className="size-3.5" /> Sign out
                            </button>
                        </div>
                    </aside>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <ScrollArea className="flex-1">
                            <div className="px-7 py-6">
                                {renderSection(activeSection)}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
