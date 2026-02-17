import type { Request, Response } from "express";
import { z } from "zod";
import { convertZodErrToHttpResponse, HttpError } from "./http";
import type { IMarketService } from "./services";
import { chainIdSchema } from "./types";

export const marketTvlHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const params = tvlHandlerRequestQueryParamsSchema.safeParse(req.query);

		if (!params.success) {
			return res.status(400).json(convertZodErrToHttpResponse(params.error));
		}

		const handlerResponse = { marketTvl: "0" };

		try {
			const tvlResult = await marketService.getTvl(params.data);
			handlerResponse.marketTvl = tvlResult.tvl.toString();
		} catch (err) {
			console.error(err);
			return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
		}

		return res.status(200).json(handlerResponse);
	};

export const marketTvlByMarketIdHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const params = tvlByMarketIdHandlerRequestQueryParamsSchema.safeParse(
			req.params,
		);

		if (!params.success) {
			return res.status(400).json(convertZodErrToHttpResponse(params.error));
		}

		const handlerResponse = { marketTvl: "0" };

		try {
			const tvlResult = await marketService.getTvlByMarketId(
				params.data.marketId,
			);
			handlerResponse.marketTvl = tvlResult.tvl.toString();
		} catch (err) {
			console.error(err);
			return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
		}

		return res.status(200).json(handlerResponse);
	};

const tvlHandlerRequestQueryParamsSchema = z
	.object({
		chain_id: chainIdSchema.optional(),
	})
	.transform((raw) => ({
		chainId: raw.chain_id,
	}));

const tvlByMarketIdHandlerRequestQueryParamsSchema = z.object({
	marketId: z.coerce.number().int(),
});
