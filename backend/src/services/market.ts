import type { Pool, RowDataPacket } from "mysql2/promise";
import { z } from "zod";

export interface IMarketService {
	getTvl(): Promise<MarketTvl>;
}

/**
 * Concrete implementations used with actual db.
 * Tests should use implementation of the associated interface.
 */
export class MarketService implements IMarketService {
	constructor(private pool: Pool) {}

	async getTvl(): Promise<MarketTvl> {
		const [rows] = await this.pool.query<RowDataPacket[]>(
			"SELECT COALESCE(SUM(total_supply_cents), 0) AS tvl FROM market;",
		);

		// We only get the first element, which should also be the
		// ONLY element from the query.
		const firstRow = rows[0];
		const parsedResult = marketTvlSchema.safeParse(firstRow);

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

export class UnexpectedSchemaShapeError extends Error {}
