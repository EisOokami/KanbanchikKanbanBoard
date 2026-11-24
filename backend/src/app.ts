import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { xss } from "express-xss-sanitizer";
import hostValidation from "host-validation";
import path from "path";
import { mkdirSync } from "node:fs";
import { issueCsrfCookie } from "./middlewares/csrf.middleware.js";
import projectsRoutes from "./routes/projects.route.js";
import tasksRoutes from "./routes/tasks.route.js";
import usersRoutes from "./routes/users.route.js";
import authRoutes from "./routes/auth.route.js";
import uploadsRoutes from "./routes/uploads.route.js";
import inviteRoutes from "./routes/invites.route.js";
import mfaRoutes from "./routes/mfa.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { pinoHttp } from "pino-http";
import { logger, requestRoute, httpLoggingOptions } from "./utils/logger.js";
import { securityAudit } from "./middlewares/securityAudit.middleware.js";
import { userOrIpKey } from "./utils/rateLimitKeys.js";
import { legalVersions } from "./utils/legal.js";
import { startRetentionCleanup } from "./jobs/retentionCleanup.js";
import { verifyFileRequest } from "./utils/files.js";

dotenv.config({ quiet: true });

legalVersions();
mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: (req, res) => {
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

        res.status(429).json({
            status: "error",
            message: "Too many requests. Please try again in 15 minutes.",
        });
    },
});

const hosts = process.env.HOSTS?.split(",");
const corsUrls = process.env.CORS_URLS?.split(",");

const trustProxySetting = process.env.TRUST_PROXY?.trim().toLowerCase();

if (trustProxySetting && trustProxySetting !== "false") {
    if (trustProxySetting === "true") {
        logger.warn(
            { event: "app.trust_proxy_hops" },
            "TRUST_PROXY=true is treated as one proxy hop; set the proxy address instead",
        );

        app.set("trust proxy", 1);
    } else if (/^\d+$/.test(trustProxySetting)) {
        app.set("trust proxy", Number(trustProxySetting));
    } else {
        app.set(
            "trust proxy",
            trustProxySetting
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
        );
    }
}

app.disable("x-powered-by");
app.use(pinoHttp(httpLoggingOptions));
app.use(hostValidation({ hosts: hosts }));
app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(securityAudit());
app.use(hpp());
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(limiter);
app.use(xss());
app.use(cookieParser());
app.use(issueCsrfCookie);

app.use("/projects", projectsRoutes);
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/uploads", uploadsRoutes);
app.use("/invites", inviteRoutes);
app.use("/auth/mfa", mfaRoutes);

const inlineFileTypes: Readonly<Record<string, string>> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mpeg": "video/mpeg",
    ".pdf": "application/pdf",
};

const downloadFileTypes: Readonly<Record<string, string>> = {
    ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const fileTypeFor = (
    types: Readonly<Record<string, string>>,
    extension: string,
): string | undefined =>
    Object.hasOwn(types, extension) ? types[extension] : undefined;

const requireSignedFileUrl = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const name = req.path.startsWith("/") ? req.path.slice(1) : req.path;

    if (!verifyFileRequest(name, req.query.exp, req.query.sig)) {
        res.status(404).json({ status: "error", message: "Not found" });

        return;
    }

    next();
};

app.use(
    "/files",
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin",
    }),
    requireSignedFileUrl,
    express.static(path.join(process.cwd(), "uploads"), {
        index: false,
        dotfiles: "deny",
        cacheControl: false,
        setHeaders: (res, filePath) => {
            const extension = path.extname(filePath).toLowerCase();
            const inlineType = fileTypeFor(inlineFileTypes, extension);

            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Cache-Control", "private, max-age=3600");

            if (inlineType) {
                res.setHeader("Content-Type", inlineType);
                res.setHeader("Content-Disposition", "inline");

                if (inlineType !== "application/pdf") {
                    res.setHeader("Content-Security-Policy", "sandbox");
                }

                return;
            }

            res.setHeader(
                "Content-Type",
                fileTypeFor(downloadFileTypes, extension) ??
                    "application/octet-stream",
            );
            res.setHeader("Content-Disposition", "attachment");
            res.setHeader(
                "Content-Security-Policy",
                "default-src 'none'; sandbox",
            );
        },
    }),
);

app.use((req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Not found" });
});

app.use(errorMiddleware);

app.listen(port, () => {
    logger.info({ event: "app.started", port }, "Server listening");

    startRetentionCleanup();
});
