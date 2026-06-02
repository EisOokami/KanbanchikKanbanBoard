"use client";

import {
    createContext,
    PropsWithChildren,
    useCallback,
    useMemo,
    useState,
} from "react";

export interface AccountSettingsContextState {
    showAccountSettings: boolean;
    handleShowAccountSettings: () => void;
}

export const AccountSettingsContext = createContext<
    AccountSettingsContextState | undefined
>(undefined);

export default function AccountSettingsProvider({
    children,
}: Readonly<PropsWithChildren>) {
    const [showAccountSettings, setShowAccountSettings] =
        useState<boolean>(false);

    const handleShowAccountSettings = useCallback(() => {
        setShowAccountSettings(!showAccountSettings);
    }, [showAccountSettings]);

    const contextState = useMemo(
        () => ({
            showAccountSettings,
            handleShowAccountSettings,
        }),
        [handleShowAccountSettings, showAccountSettings],
    );

    return (
        <AccountSettingsContext.Provider value={contextState}>
            {children}
        </AccountSettingsContext.Provider>
    );
}
