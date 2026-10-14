import { Fragment, type ReactNode } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

interface LegalLayoutProps {
    title: string;
    updated: string;
    intro?: ReactNode[];
    children: ReactNode;
}

function renderBold(text: string): ReactNode[] {
    return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
        index % 2 === 1 ? (
            <strong key={index} className="font-semibold text-foreground">
                {part}
            </strong>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        ),
    );
}

export default function LegalLayout({
    title,
    updated,
    intro,
    children,
}: LegalLayoutProps) {
    return (
        <div className="grid h-svh overflow-y-auto">
            <Navbar />
            <main id="main" className="flex-1">
                <section className="py-16 pb-12 pt-12 md:py-24 md:pb-16 md:pt-16 lg:py-32">
                    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                            {title}
                        </h1>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Last updated: {updated}
                        </p>
                        {intro
                            ? intro.map((paragraph, i) => (
                                  <p
                                      key={i}
                                      className="mt-6 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300"
                                  >
                                      {typeof paragraph === "string"
                                          ? renderBold(paragraph)
                                          : paragraph}
                                  </p>
                              ))
                            : null}
                        <div className="mt-10 space-y-10 border-t pt-10">
                            {children}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
