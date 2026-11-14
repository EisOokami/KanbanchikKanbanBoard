import "server-only";

function isIpAddress(value: string) {
    if (
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(
            value,
        )
    ) {
        return true;
    }

    if (!value.includes(":") || !/^[0-9a-fA-F:.]+$/.test(value)) {
        return false;
    }

    try {
        return new URL("http://[" + value + "]").hostname.length > 0;
    } catch {
        return false;
    }
}

export function forwardedClientIp(
    incoming: Pick<Headers, "get">,
): Record<string, string> {
    const header = process.env.CLIENT_IP_HEADER;

    if (!header) {
        return {};
    }

    const clientIp = incoming.get(header)?.split(",").pop()?.trim();

    if (!clientIp || !isIpAddress(clientIp)) {
        return {};
    }

    return {
        "X-Forwarded-For": clientIp,
    };
}
