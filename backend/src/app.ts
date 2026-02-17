import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import morgan from "morgan";
import type { Pool } from "mysql2/promise";
import { marketTvlByMarketIdHandler, marketTvlHandler } from "./handlers";
import { MarketService } from "./services";

export const createApp = (pool: Pool) => {
	const app: Express = express();

	// Middleware
	app.use(morgan("short"));
	app.use(cors());
	app.use(express.json());

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
	app.get("/tvl/:marketId", marketTvlByMarketIdHandler(marketService));

	return app;
};
