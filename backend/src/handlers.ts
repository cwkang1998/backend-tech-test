import type { Request, Response } from "express";
import { z } from "zod";
import { convertZodErrToHttpResponse, HttpError } from "./http";
import type { IMarketService } from "./services";
import { chainIdSchema } from "./types";

export const marketTvlHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const params = metricsHandlerRequestQueryParamsSchema.safeParse(req.query);

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
		const params = metricsByMarketIdHandlerRequestQueryParamsSchema.safeParse(
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

export const marketLiquidityHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const params = metricsHandlerRequestQueryParamsSchema.safeParse(req.query);

		if (!params.success) {
			return res.status(400).json(convertZodErrToHttpResponse(params.error));
		}

		const handlerResponse = { marketLiquidity: "0" };

		try {
			const tvlResult = await marketService.getLiquidity(params.data);
			handlerResponse.marketLiquidity = tvlResult.liquidity.toString();
		} catch (err) {
			console.error(err);
			return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
		}

		return res.status(200).json(handlerResponse);
	};

export const marketLiquidityByMarketIdHandler =
	(marketService: IMarketService) => async (req: Request, res: Response) => {
		const params = metricsByMarketIdHandlerRequestQueryParamsSchema.safeParse(
			req.params,
		);

		if (!params.success) {
			return res.status(400).json(convertZodErrToHttpResponse(params.error));
		}

		const handlerResponse = { marketLiquidity: "0" };

		try {
			const tvlResult = await marketService.getLiquidityByMarketId(
				params.data.marketId,
			);
			handlerResponse.marketLiquidity = tvlResult.liquidity.toString();
		} catch (err) {
			console.error(err);
			return res.status(500).json(HttpError.SERVER_UNEXPECTED_ERROR_RESPONSE);
		}

		return res.status(200).json(handlerResponse);
	};

const metricsHandlerRequestQueryParamsSchema = z
	.object({
		chain_id: chainIdSchema.optional(),
	})
	.transform((raw) => ({
		chainId: raw.chain_id,
	}));

const metricsByMarketIdHandlerRequestQueryParamsSchema = z.object({
	marketId: z.coerce.number().int().positive(),
});
