import { flattenError, type ZodError } from "zod";

export const HttpErrorResponse = (
	message: string,
	details?: Record<string, unknown>,
) => {
	return {
		message,
		details,
	};
};

export const HttpError = {
	SERVER_UNEXPECTED_ERROR_RESPONSE: HttpErrorResponse(
		"Unexpected error occurred",
	),
};

export const convertZodErrToHttpResponse = (zodErr: ZodError) => {
	const details = flattenError(zodErr);
	return HttpErrorResponse("Validation error", details);
};
