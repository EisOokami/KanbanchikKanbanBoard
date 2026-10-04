import dotenv from "dotenv";
import type { PoolOptions } from "mysql2";

dotenv.config({ quiet: true });

const config: PoolOptions = {
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "mydb",
    port: Number(process.env.DB_PORT ?? 3306),
    connectionLimit: 10,
    waitForConnections: true,
};

export default config;
