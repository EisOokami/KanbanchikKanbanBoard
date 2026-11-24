import Link from "next/link";

interface LegalConsentTextProps {
    updated?: boolean;
}

export default function LegalConsentText({
    updated = false,
}: Readonly<LegalConsentTextProps>) {
    return (
        <>
            I accept the {updated && "updated "}
            <Link
                href="/terms"
                target="_blank"
                className="text-primary underline"
            >
                Terms of Service (Regulamin)
            </Link>
            . I have read the {updated && "updated "}
            <Link
                href="/privacy"
                target="_blank"
                className="text-primary underline"
            >
                Privacy Policy (Polityka prywatności)
            </Link>
            .{!updated && " I am at least 18 years old."}
        </>
    );
}
