import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import type { Request, Response } from "express";
import {
	marketLiquidityByMarketIdHandler,
	marketLiquidityHandler,
	marketTvlByMarketIdHandler,
	marketTvlHandler,
} from "../src/handlers";
import {
	type IMarketService,
	UnexpectedSchemaShapeError,
} from "../src/services";

const createMockService = (): jest.Mocked<IMarketService> => {
	return {
		getTvl: jest.fn(),
		getTvlByMarketId: jest.fn(),
		getLiquidity: jest.fn(),
		getLiquidityByMarketId: jest.fn(),
	} as jest.Mocked<IMarketService>;
};

const createResponseMock = (): Response => {
	const response = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	};

	return response as unknown as Response;
};

describe("test handlers", () => {
	describe("marketTvlHandler", () => {
		beforeEach(() => {
			// Empty out logs to reduce std out clutter.
			jest.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("should return 200 when tvl calculated from service", async () => {
			const service = createMockService();
			jest.spyOn(service, "getTvl").mockResolvedValue({ tvl: BigInt(4000) });
			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketTvlHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketTvl: "4000" });
		});

		it("should return 200 when provided query params validation pass", async () => {
			const service = createMockService();
			jest.spyOn(service, "getTvl").mockResolvedValue({ tvl: BigInt(4000) });
			const req = {
				query: { chain_id: "1" },
			} as unknown as Request;
			const res = createResponseMock();

			await marketTvlHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketTvl: "4000" });
		});

		it("should return 400 when provided query params validation failed", async () => {
			const service = createMockService();
			jest.spyOn(service, "getTvl").mockResolvedValue({ tvl: BigInt(4000) });
			// Chain id is an enum and should be string
			const req = {
				query: { chain_id: 1 },
			} as unknown as Request;
			const res = createResponseMock();

			await marketTvlHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				details: {
					fieldErrors: {
						chain_id: ['Invalid option: expected one of "1"|"56"'],
					},
					formErrors: [],
				},
				message: "Validation error",
			});
		});

		it("should return 500 when unexpected schema is returned from query", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvl")
				.mockRejectedValue(
					new UnexpectedSchemaShapeError("Mock unexpected schema"),
				);

			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketTvlHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});

		it("should return 500 when unexpected error occurred", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvl")
				.mockRejectedValue(new Error("Possibly db error"));

			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketTvlHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});
	});

	describe("marketTvlByMarketIdHandler", () => {
		beforeEach(() => {
			// Empty out logs to reduce std out clutter.
			jest.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("should return 200 when tvl calculated from service", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvlByMarketId")
				.mockImplementation((marketId: number) => {
					if (marketId === 1) {
						return Promise.resolve({ tvl: BigInt(1200) });
					}
					return Promise.resolve({ tvl: BigInt(0) });
				});

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketTvlByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketTvl: "1200" });
		});

		it("should return 400 when provided query params validation failed", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvlByMarketId")
				.mockResolvedValue({ tvl: BigInt(4000) });
			// Chain id is an enum and should be string
			const req = {
				params: { marketId: "abc" },
			} as unknown as Request;
			const res = createResponseMock();

			await marketTvlByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				details: {
					fieldErrors: {
						marketId: ["Invalid input: expected number, received NaN"],
					},
					formErrors: [],
				},
				message: "Validation error",
			});
		});

		it("should return 500 when unexpected schema is returned from query", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvlByMarketId")
				.mockRejectedValue(
					new UnexpectedSchemaShapeError("Mock unexpected schema"),
				);

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketTvlByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});

		it("should return 500 when unexpected error occurred", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getTvlByMarketId")
				.mockRejectedValue(new Error("Possibly db error"));

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketTvlByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});
	});

	describe("marketLiquidityHandler", () => {
		beforeEach(() => {
			// Empty out logs to reduce std out clutter.
			jest.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("should return 200 when tvl calculated from service", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidity")
				.mockResolvedValue({ liquidity: BigInt(2000) });
			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketLiquidityHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketLiquidity: "2000" });
		});

		it("should return 200 when provided query params validation pass", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidity")
				.mockResolvedValue({ liquidity: BigInt(1000) });
			const req = {
				query: { chain_id: "1" },
			} as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketLiquidity: "1000" });
		});

		it("should return 400 when provided query params validation failed", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidity")
				.mockResolvedValue({ liquidity: BigInt(1000) });
			// Chain id is an enum and should be string
			const req = {
				query: { chain_id: 1 },
			} as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				details: {
					fieldErrors: {
						chain_id: ['Invalid option: expected one of "1"|"56"'],
					},
					formErrors: [],
				},
				message: "Validation error",
			});
		});

		it("should return 500 when unexpected schema is returned from query", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidity")
				.mockRejectedValue(
					new UnexpectedSchemaShapeError("Mock unexpected schema"),
				);

			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketLiquidityHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});

		it("should return 500 when unexpected error occurred", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidity")
				.mockRejectedValue(new Error("Possibly db error"));

			const req = { query: {} } as Request;
			const res = createResponseMock();

			await marketLiquidityHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});
	});

	describe("marketLiquidityByMarketIdHandler", () => {
		beforeEach(() => {
			// Empty out logs to reduce std out clutter.
			jest.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("should return 200 when tvl calculated from service", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidityByMarketId")
				.mockImplementation((marketId: number) => {
					if (marketId === 1) {
						return Promise.resolve({ liquidity: BigInt(1200) });
					}
					return Promise.resolve({ liquidity: BigInt(0) });
				});

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ marketLiquidity: "1200" });
		});

		it("should return 400 when provided query params validation failed", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidityByMarketId")
				.mockResolvedValue({ liquidity: BigInt(4000) });
			// Chain id is an enum and should be string
			const req = {
				params: { marketId: "abc" },
			} as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				details: {
					fieldErrors: {
						marketId: ["Invalid input: expected number, received NaN"],
					},
					formErrors: [],
				},
				message: "Validation error",
			});
		});

		it("should return 500 when unexpected schema is returned from query", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidityByMarketId")
				.mockRejectedValue(
					new UnexpectedSchemaShapeError("Mock unexpected schema"),
				);

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});

		it("should return 500 when unexpected error occurred", async () => {
			const service = createMockService();
			jest
				.spyOn(service, "getLiquidityByMarketId")
				.mockRejectedValue(new Error("Possibly db error"));

			const req = { params: { marketId: 1 } } as unknown as Request;
			const res = createResponseMock();

			await marketLiquidityByMarketIdHandler(service)(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Unexpected error occurred",
			});
		});
	});
});
