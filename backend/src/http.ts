export const HttpErrorResponse = (message: string) => {
	return {
		message,
	};
};

export const HttpError = {
	SERVER_UNEXPECTED_ERROR_RESPONSE: HttpErrorResponse(
		"Unexpected error occurred",
	),
};
