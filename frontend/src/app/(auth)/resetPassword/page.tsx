import ResetPasswordForm from "@/components/ui/resetPasswordForm/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Suspense>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
