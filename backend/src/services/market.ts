import type { Pool, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import type { ChainId } from "../types";

export interface IMarketService {
	getTvl(params: GetMetricParams): Promise<MarketTvl>;
	getTvlByMarketId(marketId: number): Promise<MarketTvl>;
	getLiquidity(params: GetMetricParams): Promise<MarketLiquidity>;
	getLiquidityByMarketId(marketId: number): Promise<MarketLiquidity>;
}

/**
 * Concrete implementations used with actual db.
 * Tests should use implementation of the associated interface.
 */
export class MarketService implements IMarketService {
	constructor(private pool: Pool) {}

	async getTvl(params: GetMetricParams): Promise<MarketTvl> {
		const { query, paramsArr } = buildTvlQuery(params);

		const [rows] = await this.pool.query<RowDataPacket[]>(query, paramsArr);

		// We only get the first element, which should also be the
		// ONLY element from the query.
		const firstRow = rows[0];
		const parsedResult = marketTvlSchema.safeParse(firstRow);

		if (!parsedResult.success) {
			throw new UnexpectedSchemaShapeError(parsedResult.error.message);
		}

		return parsedResult.data;
	}

	async getTvlByMarketId(marketId: number): Promise<MarketTvl> {
		const [rows] = await this.pool.query<RowDataPacket[]>(
			TVL_BY_MARKET_ID_QUERY,
			[marketId],
		);

		const firstRow = rows[0];
		const parsedResult = marketTvlSchema.safeParse(firstRow);

		if (!parsedResult.success) {
			throw new UnexpectedSchemaShapeError(parsedResult.error.message);
		}

		return parsedResult.data;
	}

	async getLiquidity(params: GetMetricParams): Promise<MarketLiquidity> {
		const { query, paramsArr } = buildLiquidityQuery(params);

		const [rows] = await this.pool.query<RowDataPacket[]>(query, paramsArr);

		// We only get the first element, which should also be the
		// ONLY element from the query.
		const firstRow = rows[0];
		const parsedResult = marketLiquiditySchema.safeParse(firstRow);

		if (!parsedResult.success) {
			throw new UnexpectedSchemaShapeError(parsedResult.error.message);
		}

		return parsedResult.data;
	}

	async getLiquidityByMarketId(marketId: number): Promise<MarketLiquidity> {
		const [rows] = await this.pool.query<RowDataPacket[]>(
			LIQUIDITY_BY_MARKET_ID_QUERY,
			[marketId],
		);

		const firstRow = rows[0];
		const parsedResult = marketLiquiditySchema.safeParse(firstRow);

		if (!parsedResult.success) {
			throw new UnexpectedSchemaShapeError(parsedResult.error.message);
		}

		return parsedResult.data;
	}
}

/**
 * Zod schemas for the validation of db query results.
 * This is here to validate shape of query result and ensure
 * that query changes affecting result shape will be caught.
 */

const marketTvlSchema = z.object({
	tvl: z.coerce.bigint(),
});

export type MarketTvl = z.infer<typeof marketTvlSchema>;

const marketLiquiditySchema = z.object({
	liquidity: z.coerce.bigint(),
});

export type MarketLiquidity = z.infer<typeof marketLiquiditySchema>;

export type GetMetricParams = {
	chainId?: ChainId;
};

/**
 * Errors
 */
export class UnexpectedSchemaShapeError extends Error {}

/**
 * Db query and helpers
 */
export const TVL_QUERY_BASE = `
	SELECT COALESCE(SUM(total_supply_cents), 0) AS tvl FROM market
	WHERE 1=1
`;

const TVL_BY_MARKET_ID_QUERY = `
	SELECT COALESCE(total_supply_cents, 0) AS tvl FROM market
	WHERE id = ?
`;

export const buildTvlQuery = (params: GetMetricParams) => {
	let additionalQuery = "";
	const paramsArr = [];

	if (params.chainId) {
		additionalQuery = " AND chain_id = ?";
		paramsArr.push(params.chainId);
	}

	return { query: `${TVL_QUERY_BASE}${additionalQuery}`, paramsArr };
};

export const LIQUIDITY_QUERY_BASE = `
	SELECT COALESCE(SUM(total_supply_cents - total_borrow_cents), 0) AS liquidity FROM market
	WHERE 1=1
`;

export const buildLiquidityQuery = (params: GetMetricParams) => {
	let additionalQuery = "";
	const paramsArr = [];

	if (params.chainId) {
		additionalQuery = " AND chain_id = ?";
		paramsArr.push(params.chainId);
	}

	return { query: `${LIQUIDITY_QUERY_BASE}${additionalQuery}`, paramsArr };
};

const LIQUIDITY_BY_MARKET_ID_QUERY = `
	SELECT COALESCE(total_supply_cents - total_borrow_cents, 0) AS liquidity FROM market
	WHERE id = ?
`;
