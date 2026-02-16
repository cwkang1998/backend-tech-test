import type { Request, Response } from "express";
import { HttpError } from "./http";
import type { IMarketService } from "./services";

export const marketTvlHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const handlerResponse = { marketTvl: "0" };

		try {
			const tvlResult = await marketService.getTvl();
			handlerResponse.marketTvl = tvlResult.tvl.toString();
		} catch (err) {
			console.error(err);
			return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
		}

		return res.status(200).json(handlerResponse);
	};
