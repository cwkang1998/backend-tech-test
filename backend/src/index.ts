import dotenv from "dotenv";
import { createPool } from "mysql2/promise";
import { createApp } from "./app";

dotenv.config();

const port = process.env.PORT || 8181;

const pool = createPool({
	host: process.env.DB_HOST || "db",
	user: process.env.DB_USER || "app_user",
	password: process.env.DB_PASSWORD || "app_password",
	database: process.env.DB_NAME || "app_db",
	port: parseInt(process.env.DB_PORT || "3306", 10),
});

const app = createApp(pool);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
