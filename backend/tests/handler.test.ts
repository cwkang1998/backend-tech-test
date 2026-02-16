import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import type { Request, Response } from "express";
import { marketTvlHandler } from "../src/handlers";
import {
	type IMarketService,
	UnexpectedSchemaShapeError,
} from "../src/services";

const createMockService = (): jest.Mocked<IMarketService> => {
	return {
		getTvl: jest.fn(),
		getLiquidity: jest.fn(),
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
		const req = {} as Request;
		const res = createResponseMock();

		await marketTvlHandler(service)(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ marketTvl: "4000" });
	});

	it("should return 500 when unexpected schema is returned from query", async () => {
		const service = createMockService();
		jest
			.spyOn(service, "getTvl")
			.mockRejectedValue(
				new UnexpectedSchemaShapeError("Mock unexpected schema"),
			);

		const req = {} as Request;
		const res = createResponseMock();

		await marketTvlHandler(service)(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: "Unexpected error occurred",
		});
	});

	it("should return 500 when unexpected error occured", async () => {
		const service = createMockService();
		jest
			.spyOn(service, "getTvl")
			.mockRejectedValue(new Error("Possibly db error"));

		const req = {} as Request;
		const res = createResponseMock();

		await marketTvlHandler(service)(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: "Unexpected error occurred",
		});
	});
});
