import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type { Pool } from "mysql2/promise";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent";
import { createApp } from "../src/app";
import { createTestPool, seedMarketTable } from "./utils";

/**
 * This is effectively a test for services/ as well, given that
 * services involve db operations and thus are more suited to be
 * tested in integration.
 */
describe("integration test", () => {
	let pool: Pool;
	let testAgent: TestAgent;

	beforeAll(async () => {
		pool = createTestPool();
		const app = createApp(pool);
		testAgent = supertest(app);
		await seedMarketTable(pool);
	});

	afterAll(async () => {
		await pool.end();
	});

	describe("/tvl", () => {
		it("should return total tvl", async () => {
			const res = await testAgent.get("/tvl");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketTvl");
			expect(res.body.marketTvl).toEqual("4000");
		});

		it("should return tvl filtered by chain_id", async () => {
			const chainId = "56";

			const res = await testAgent.get(`/tvl?chain_id=${chainId}`);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketTvl");
			expect(res.body.marketTvl).toEqual("3000");
		});

		it("should return error when given bad filter params", async () => {
			const cases = ["/tvl?chain_id=not-a-number", "/tvl?chain_id=-1"];

			for (const url of cases) {
				const res = await testAgent.get(url);

				expect(res.status).toBe(400);
				expect(res.body).toHaveProperty("message");
				expect(res.body).toHaveProperty("details");
				expect(res.body.message).toEqual("Validation error");
			}
		});
	});

	describe("/tvl/:marketId", () => {
		it("should return total tvl of given marketId", async () => {
			const res = await testAgent.get("/tvl/2");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketTvl");
			expect(res.body.marketTvl).toEqual("2500");
		});

		it("should return error when given malformed marketId", async () => {
			const res = await testAgent.get("/tvl/abc");

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("details");
			expect(res.body.message).toEqual("Validation error");
		});
	});

	describe("/liquidity", () => {
		it("should return total liquidity", async () => {
			const res = await testAgent.get("/liquidity");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketLiquidity");
			expect(res.body.marketLiquidity).toEqual("2300");
		});

		it("should return liquidity filtered by chain_id", async () => {
			const chainId = "56";

			const res = await testAgent.get(`/liquidity?chain_id=${chainId}`);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketLiquidity");
			expect(res.body.marketLiquidity).toEqual("1600");
		});

		it("should return error when given bad filter params", async () => {
			const cases = [
				"/liquidity?chain_id=not-a-number",
				"/liquidity?chain_id=-1",
			];

			for (const url of cases) {
				const res = await testAgent.get(url);

				expect(res.status).toBe(400);
				expect(res.body).toHaveProperty("message");
				expect(res.body).toHaveProperty("details");
				expect(res.body.message).toEqual("Validation error");
			}
		});
	});

	describe("/liquidity/:marketId", () => {
		it("should return total liquidity of given marketId", async () => {
			const res = await testAgent.get("/liquidity/2");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("marketLiquidity");
			expect(res.body.marketLiquidity).toEqual("1300");
		});

		it("should return error when given malformed marketId", async () => {
			const res = await testAgent.get("/liquidity/abc");

			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("details");
			expect(res.body.message).toEqual("Validation error");
		});
	});
});
