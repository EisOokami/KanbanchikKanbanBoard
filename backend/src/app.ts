import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { xss } from "express-xss-sanitizer";
import hostValidation from "host-validation";
import path from "path";
import { issueCsrfCookie } from "./middlewares/csrf.middleware";
import projectsRoutes from "./routes/projects.routes";
import tasksRoutes from "./routes/tasks.routes";
import usersRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import uploadsRoutes from "./routes/uploads.routes";
import inviteRoutes from "./routes/invites.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const hosts = process.env.HOSTS?.split(",");
const corsUrls = process.env.CORS_URLS?.split(",");

app.disable("x-powered-by");
app.use(hostValidation({ hosts: hosts }));
app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
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

app.use("/files", express.static(path.join(process.cwd(), "uploads")));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
