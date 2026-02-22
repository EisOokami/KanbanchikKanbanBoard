import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const corsUrls = process.env.CORS_URLS?.split(",");

app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
