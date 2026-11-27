import type { ReactNode } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

const legalInfo = {
    termsVersion: process.env.TERMS_VERSION || "1.0",
    lastTermsUpdated:
        process.env.LEGAL_LAST_TERMS_UPDATED ||
        "[DO UZUPEŁNIENIA: data ostatniej aktualizacji Regulaminu]",
    effectiveTermsDate:
        process.env.LEGAL_EFFECTIVE_TERMS_DATE ||
        "[DO UZUPEŁNIENIA: data wejścia w życie Regulaminu]",
    privacyVersion: process.env.PRIVACY_VERSION || "1.0",
    lastPrivacyUpdated:
        process.env.LEGAL_LAST_PRIVACY_UPDATED ||
        "[DO UZUPEŁNIENIA: data ostatniej aktualizacji Polityki prywatności]",
    effectivePrivacyDate:
        process.env.LEGAL_EFFECTIVE_PRIVACY_DATE ||
        "[DO UZUPEŁNIENIA: data wejścia w życie Polityki prywatności]",
    operator:
        process.env.LEGAL_OPERATOR ||
        "[DO UZUPEŁNIENIA: pełna nazwa operatora serwisu]",
    contactEmail:
        process.env.LEGAL_CONTACT_EMAIL ||
        "[DO UZUPEŁNIENIA: adres e-mail do kontaktu w sprawach prawnych i ochrony danych osobowych]",
    siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ?? "[DO UZUPEŁNIENIA: domena serwisu]",
    serverProvider:
        process.env.LEGAL_SERVER_PROVIDER ||
        "[DO UZUPEŁNIENIA: dostawca serwera w UE i kraj]",
    backups:
        process.env.LEGAL_BACKUP_RETENTION ||
        "[DO UZUPEŁNIENIA: okres przechowywania kopii zapasowych, np. do 30 dni]",
    repositoryUrl:
        process.env.LEGAL_REPOSITORY_URL ||
        "https://github.com/EisOokami/KanbanchikKanbanBoard",
    licenseUrl:
        process.env.LEGAL_LICENSE_URL ||
        `${
            process.env.LEGAL_REPOSITORY_URL ||
            "https://github.com/EisOokami/KanbanchikKanbanBoard"
        }/blob/main/LICENSE`,
} as const;

function renderInline(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];

    let last = 0;

    for (const match of text.matchAll(
        /(\*\*[^*]+\*\*|`[^`]+`|\[DO UZUPEŁNIENIA:[^\]]*\]|https?:\/\/[^\s)|]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    )) {
        const index = match.index ?? 0;

        let token = match[0];
        let trailing = "";

        if (index > last) {
            nodes.push(text.slice(last, index));
        }

        if (token.startsWith("**")) {
            nodes.push(
                <strong key={index} className="font-semibold text-foreground">
                    {renderInline(token.slice(2, -2))}
                </strong>,
            );
        } else if (token.startsWith("`")) {
            nodes.push(
                <code
                    key={index}
                    className="rounded bg-control px-1 py-0.5 text-[0.85em]"
                >
                    {token.slice(1, -1)}
                </code>,
            );
        } else if (token.startsWith("[DO UZUPEŁNIENIA")) {
            nodes.push(
                <mark
                    key={index}
                    className="rounded bg-amber-200 px-1 text-amber-950"
                >
                    {token}
                </mark>,
            );
        } else if (token.startsWith("http")) {
            const punctuation = /[.,;:]+$/.exec(token);

            if (punctuation) {
                trailing = punctuation[0];
                token = token.slice(0, -trailing.length);
            }

            nodes.push(
                <a
                    key={index}
                    href={token}
                    className="break-words text-foreground underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {token}
                </a>,
            );
        } else {
            nodes.push(
                <a
                    key={index}
                    href={`mailto:${token}`}
                    className="break-words text-foreground underline underline-offset-4"
                >
                    {token}
                </a>,
            );
        }

        if (trailing) {
            nodes.push(trailing);
        }

        last = index + match[0].length;
    }

    if (last < text.length) {
        nodes.push(text.slice(last));
    }

    return nodes;
}

function renderBlocks(source: string): ReactNode[] {
    const lines = source
        .replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
            key in legalInfo
                ? String(legalInfo[key as keyof typeof legalInfo])
                : match,
        )
        .trim()
        .split("\n");
    const blocks: ReactNode[] = [];

    let i = 0;

    const collect = (test: (line: string) => boolean) => {
        const items: string[] = [];

        while (i < lines.length && test(lines[i])) {
            items.push(lines[i]);

            i++;
        }

        return items;
    };

    while (i < lines.length) {
        const line = lines[i];
        const key = blocks.length;

        if (!line.trim()) {
            i++;

            continue;
        }

        const headingMatch = /^(#{1,3}) (.*)$/.exec(line);

        if (headingMatch) {
            const level = headingMatch[1].length;
            const anchor = /\s*\{#([a-z0-9-]+)\}\s*$/.exec(headingMatch[2]);
            const id = anchor?.[1];
            const text = anchor
                ? headingMatch[2].slice(0, anchor.index)
                : headingMatch[2];
            const className =
                level === 1
                    ? "text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
                    : level === 2
                      ? "mt-6 scroll-mt-20 text-xl font-semibold tracking-tight"
                      : "mt-2 scroll-mt-20 text-lg font-medium text-foreground";
            const Tag = `h${level}` as "h1" | "h2" | "h3";

            blocks.push(
                <Tag key={key} id={id} className={className}>
                    {renderInline(text)}
                </Tag>,
            );

            i++;

            continue;
        }

        if (/^---\s*$/.test(line)) {
            blocks.push(<hr key={key} className="my-2 border-border" />);

            i++;

            continue;
        }

        if (line.startsWith("> ")) {
            const quote = collect((current) => current.startsWith("> "));

            blocks.push(
                <blockquote
                    key={key}
                    className="rounded-r-md border-l-4 border-bright-blue bg-control p-4"
                >
                    {renderInline(
                        quote.map((current) => current.slice(2)).join(" "),
                    )}
                </blockquote>,
            );

            continue;
        }

        if (line.startsWith("|")) {
            const rows = collect((current) => current.startsWith("|"))
                .filter((row) => !/^\|[\s:|-]+\|?\s*$/.test(row))
                .map((line) =>
                    line
                        .trim()
                        .replace(/^\|/, "")
                        .replace(/\|$/, "")
                        .split("|")
                        .map((cell) => cell.trim()),
                );
            const [head = [], ...body] = rows;

            blocks.push(
                <div key={key} className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr>
                                {head.map((cell, index) => (
                                    <th
                                        key={index}
                                        className="border border-border bg-control p-2.5 font-semibold text-foreground"
                                    >
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {body.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, index) => (
                                        <td
                                            key={index}
                                            className="border border-border p-2.5 align-top"
                                        >
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>,
            );

            continue;
        }

        if (/^\d+\. /.test(line)) {
            const items: { text: string; children: string[] }[] = [];

            while (i < lines.length) {
                const current = lines[i];

                if (/^\d+\. /.test(current)) {
                    items.push({
                        text: current.replace(/^\d+\. /, ""),
                        children: [],
                    });
                } else if (/^\s+\d+\. /.test(current) && items.length) {
                    items[items.length - 1].children.push(
                        current.replace(/^\s+\d+\. /, ""),
                    );
                } else {
                    break;
                }

                i++;
            }

            blocks.push(
                <ol
                    key={key}
                    className="list-decimal space-y-2 pl-5 marker:text-muted-foreground"
                >
                    {items.map((item, index) => (
                        <li key={index}>
                            {renderInline(item.text)}
                            {item.children.length > 0 && (
                                <ol className="mt-2 list-[lower-alpha] space-y-1 pl-5 marker:text-muted-foreground">
                                    {item.children.map((child, childIndex) => (
                                        <li key={childIndex}>
                                            {renderInline(child)}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </li>
                    ))}
                </ol>,
            );

            continue;
        }

        if (line.startsWith("- ")) {
            const items = collect((current) => current.startsWith("- "));

            blocks.push(
                <ul
                    key={key}
                    className="list-disc space-y-2 pl-5 marker:text-muted-foreground"
                >
                    {items.map((item, index) => (
                        <li key={index}>{renderInline(item.slice(2))}</li>
                    ))}
                </ul>,
            );

            continue;
        }

        const paragraph = [line];

        i++;

        while (
            i < lines.length &&
            lines[i].trim() &&
            !/^(#{1,3} |> |\||- |\d+\. |\s+\d+\. |---\s*$)/.test(lines[i])
        ) {
            paragraph.push(lines[i]);

            i++;
        }

        blocks.push(
            <p key={key} className="text-pretty">
                {paragraph.flatMap((part, index) =>
                    index === 0
                        ? renderInline(part)
                        : [<br key={`br-${index}`} />, ...renderInline(part)],
                )}
            </p>,
        );
    }

    return blocks;
}

interface LegalDocumentProps {
    source: string;
}

export default function LegalDocument({
    source,
}: Readonly<LegalDocumentProps>) {
    return (
        <div className="grid h-svh overflow-y-auto">
            <Navbar />
            <main id="main" className="flex-1">
                <section className="py-12 md:py-16 lg:py-24">
                    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
                        <article
                            lang="pl"
                            className="space-y-4 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300"
                        >
                            {renderBlocks(source)}
                        </article>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
