export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative w-full min-h-screen bg-gray-50 dark:bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.6)_25%,rgba(255,255,255,0)_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_20%,rgba(0,0,0,0)_60%)] pointer-events-none z-10" />
            {children}
        </div>
    );
}
