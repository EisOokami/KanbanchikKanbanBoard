export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative h-svh w-full overflow-y-auto bg-gray-50 dark:bg-black">
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.6)_25%,rgba(255,255,255,0)_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_20%,rgba(0,0,0,0)_60%)]" />
            {children}
        </div>
    );
}
