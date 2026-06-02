import { useContext } from "react";
import { AccountSettingsContext } from "@/context/AccountSettingsProvider";

export function useAccountSettingsContext() {
    const context = useContext(AccountSettingsContext);

    if (!context) {
        throw new Error(
            "AccountSettingsContext must be called from within a AccountSettingsProvider!",
        );
    }

    return context;
}
