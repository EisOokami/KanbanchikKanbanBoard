import LegalDocument from "@/components/landing/legalDocument/LegalDocument";
import { privacyPolicy } from "@/content/legal/privacyPolicy";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Polityka prywatności",
    description: "Jak Kanbanchik przetwarza dane osobowe (art. 13 i 14 RODO).",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
    return <LegalDocument source={privacyPolicy} />;
}
