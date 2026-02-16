import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import morgan from "morgan";
import { createPool } from "mysql2/promise";
import { marketTvlHandler } from "./handlers";
import { MarketService } from "./services";

export const createApp = () => {
	const app: Express = express();

	// Middleware
	app.use(morgan("short"));
	app.use(cors());
	app.use(express.json());

	const pool = createPool({
		host: process.env.DB_HOST || "db",
		user: process.env.DB_USER || "app_user",
		password: process.env.DB_PASSWORD || "app_password",
		database: process.env.DB_NAME || "app_db",
		port: parseInt(process.env.DB_PORT || "3306"),
	});

	const testDbConnection = async () => {
		try {
			const connection = await pool.getConnection();

			connection.release();
			return "Database connection established successfully";
		} catch (error) {
			return `Error connecting to database: ${error}`;
		}
	};

	// Services
	const marketService = new MarketService(pool);

	app.get("/", async (req: Request, res: Response) => {
		const response = await testDbConnection();
		res.json({ response });
	});

	app.get("/tvl", marketTvlHandler(marketService));

	return app;
};
