import LegalDocument from "@/components/landing/legalDocument/LegalDocument";
import { termsOfService } from "@/content/legal/termsOfService";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Regulamin",
    description: "Regulamin serwisu Kanbanchik.",
    alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
    return <LegalDocument source={termsOfService} />;
}
