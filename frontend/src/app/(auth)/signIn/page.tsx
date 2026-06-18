import LoginForm from "@/components/ui/loginForm/LoginForm";

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string }>;
}) {
    const { redirect } = await searchParams;

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <LoginForm redirect={redirect} />
        </div>
    );
}
