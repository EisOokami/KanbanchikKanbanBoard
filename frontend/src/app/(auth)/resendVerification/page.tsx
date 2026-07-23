import ResendVerificationForm from "@/components/ui/resendVerificationForm/ResendVerificationForm";

interface ResendVerificationPageProps {
    searchParams: Promise<{ email?: string }>;
}

export default async function ResendVerificationPage({
    searchParams,
}: Readonly<ResendVerificationPageProps>) {
    const { email } = await searchParams;

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <ResendVerificationForm defaultEmail={email} />
        </div>
    );
}
