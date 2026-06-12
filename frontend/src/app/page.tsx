import Link from "next/link";

export default function Home() {
    return (
        <div className="grid h-screen place-content-center gap-3">
            <Link href="/overview" className="hover:bg-gray-100">
                Overview
            </Link>
            <Link href="/signIn" className="hover:bg-gray-100">
                Sign in
            </Link>
            <Link href="/signUp" className="hover:bg-gray-100">
                Sing up
            </Link>
        </div>
    );
}
