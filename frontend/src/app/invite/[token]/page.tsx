import { InviteMember } from "@/components/layout/inviteMember/InviteMember";
import { getUserData } from "@/data/loaders";
import { redirect } from "next/navigation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const userData = await getUserData();

    if (userData.status === "error" || !userData.data) {
        redirect(`/signIn?redirect=/invite/${token}`);
    }

    return <InviteMember token={token} />;
}
