import { describe, expect, it } from "@jest/globals";
import {
	buildLiquidityQuery,
	buildTvlQuery,
	LIQUIDITY_QUERY_BASE,
	TVL_QUERY_BASE,
} from "../../src/services";

describe("buildTvlQuery", () => {
	it("should resolve to base query without params", () => {
		const { query, paramsArr } = buildTvlQuery({});

		expect(query).toEqual(TVL_QUERY_BASE);
		expect(paramsArr).toEqual([]);
	});

	it("should resolve to query with chainId", () => {
		const { query, paramsArr } = buildTvlQuery({ chainId: "1" });

		expect(query).toEqual(`${TVL_QUERY_BASE} AND chain_id = ?`);
		expect(paramsArr).toEqual(["1"]);

		const { query: query2, paramsArr: paramsArr2 } = buildTvlQuery({
			chainId: "56",
		});

		expect(query2).toEqual(`${TVL_QUERY_BASE} AND chain_id = ?`);
		expect(paramsArr2).toEqual(["56"]);
	});
});

describe("buildLiquidityQuery", () => {
	it("should resolve to base query without params", () => {
		const { query, paramsArr } = buildLiquidityQuery({});

		expect(query).toEqual(LIQUIDITY_QUERY_BASE);
		expect(paramsArr).toEqual([]);
	});

	it("should resolve to query with chainId", () => {
		const { query, paramsArr } = buildLiquidityQuery({ chainId: "1" });

		expect(query).toEqual(`${LIQUIDITY_QUERY_BASE} AND chain_id = ?`);
		expect(paramsArr).toEqual(["1"]);

		const { query: query2, paramsArr: paramsArr2 } = buildLiquidityQuery({
			chainId: "56",
		});

		expect(query2).toEqual(`${LIQUIDITY_QUERY_BASE} AND chain_id = ?`);
		expect(paramsArr2).toEqual(["56"]);
	});
});
