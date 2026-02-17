import cors from "cors";
import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import type { Pool } from "mysql2/promise";
import {
	marketLiquidityByMarketIdHandler,
	marketLiquidityHandler,
	marketTvlByMarketIdHandler,
	marketTvlHandler,
} from "./handlers";
import { HttpError } from "./http";
import { MarketService } from "./services";

export const createApp = (pool: Pool) => {
	const app: Express = express();

	// Middleware
	app.use(morgan("short"));
	app.use(cors());
	app.use(express.json());

	const testDbConnection = async (): Promise<boolean> => {
		try {
			const connection = await pool.getConnection();
			connection.release();
		} catch (error) {
			console.error(`Error connecting to database: ${error}`);
			return false;
		}
		return true;
	};

	// Services
	const marketService = new MarketService(pool);

	// Healthcheck api
	app.get("/", async (_req: Request, res: Response) => {
		const isDbOk = await testDbConnection();
		let statusCodeToReturn = 200;

		if (!isDbOk) {
			statusCodeToReturn = 503;
		}

		res.status(statusCodeToReturn).json({ db_alive: isDbOk });
	});

	app.get("/tvl", marketTvlHandler(marketService));
	app.get("/tvl/:marketId", marketTvlByMarketIdHandler(marketService));
	app.get("/liquidity", marketLiquidityHandler(marketService));
	app.get(
		"/liquidity/:marketId",
		marketLiquidityByMarketIdHandler(marketService),
	);

	// Catch all middleware
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		console.error(err);
		return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
	});

	return app;
};
