import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { xss } from "express-xss-sanitizer";
import hostValidation from "host-validation";
import path from "path";
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

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
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

app.set("trust proxy", 1);

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

app.use(
    "/files",
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin",
    }),
    express.static(path.join(process.cwd(), "uploads")),
);

app.use((req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Not found" });
});

app.use(errorMiddleware);

app.listen(port, () => {
    logger.info({ event: "app.started", port }, "Server listening");
});
