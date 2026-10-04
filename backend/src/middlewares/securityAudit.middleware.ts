import type { RateLimitExceededEventHandler } from "express-rate-limit";
import { requestRoute } from "../utils/logger.js";
import type { NextFunction, Response } from "express";
import type { AuditReason, RequestWithAuditFlag } from "../types/types.js";

const SUSPICIOUS_PATTERNS: readonly RegExp[] = [
    /(%27)|(')|(--)|(%23)|(#)/i,
    /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/i,
    /\bunion\b.+\bselect\b/i,
    /\$where|\$ne|\$gt|\$regex/i,
    /\.\.\//,
    /<script[\s>]/i,
    /\/etc\/passwd|\/proc\/self/i,
];

const SUSPICIOUS_UA: readonly RegExp[] = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /^$/,
];

function scanValue(value: unknown): boolean {
    if (typeof value !== "string") {
        return false;
    }

    return SUSPICIOUS_PATTERNS.some((regExp) => regExp.test(value));
}

function scanObject(object: unknown): boolean {
    if (!object || typeof object !== "object") {
        return false;
    }

    return Object.values(object as Record<string, unknown>).some((value) =>
        typeof value === "object" ? scanObject(value) : scanValue(value),
    );
}

export function securityAudit() {
    return function auditMiddleware(
        req: RequestWithAuditFlag,
        res: Response,
        next: NextFunction,
    ): void {
        const reasons: AuditReason[] = [];

        if (scanObject(req.query)) {
            reasons.push("suspicious_query");
        }

        if (req.body && scanObject(req.body)) {
            reasons.push("suspicious_body");
        }

        if (scanValue(req.path)) {
            reasons.push("suspicious_path");
        }

        const ua = req.get("user-agent") ?? "";

        if (SUSPICIOUS_UA.some((re) => re.test(ua))) {
            reasons.push("suspicious_user_agent");
        }

        if (reasons.length > 0) {
            req.log.warn(
                {
                    audit: true,
                    event: "security.suspicious_request",
                    reasons,
                    ip: req.ip,
                    method: req.method,
                },
                "Suspicious request detected",
            );

            req.flaggedSuspicious = true;
        }

        next();
    };
}

export const rateLimitHandler: RateLimitExceededEventHandler = (
    req,
    res,
    _next,
    options,
) => {
    req.log.warn(
        {
            audit: true,
            event: "security.rate_limit_exceeded",
            reasons: ["rate_limit_exceeded"],
            ip: req.ip,
            route: requestRoute(req),
        },
        "Rate limit exceeded",
    );

    res.status(options.statusCode).send(options.message);
};
