// Copyright 2026 SwitchPost Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** Base error for all SDK errors. */
export class SwitchPostError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "SwitchPostError";
	}
}

/** Error detail from validation failures. */
export interface ErrorDetail {
	location: string | null;
	message: string;
	value: unknown;
}

/**
 * Error returned by the SwitchPost API. All HTTP errors with a parseable
 * JSON body become an `APIError` (or a more specific subclass).
 */
export class APIError extends SwitchPostError {
	/** HTTP status code. */
	readonly statusCode: number;
	/** Machine-readable error type (URI reference). */
	readonly errorType: string;
	/** Short, human-readable summary. */
	readonly title: string;
	/** Granular sub-errors from validation failures. */
	readonly details: ErrorDetail[] | null;

	constructor(statusCode: number, errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(message);
		this.name = "APIError";
		this.statusCode = statusCode;
		this.errorType = errorType;
		this.title = title;
		this.details = details;
	}
}

/** 400 Bad Request. */
export class BadRequestError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(400, errorType, title, message, details);
		this.name = "BadRequestError";
	}
}

/** 401 Unauthorized -- missing or invalid credentials. */
export class AuthenticationError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(401, errorType, title, message, details);
		this.name = "AuthenticationError";
	}
}

/** 403 Forbidden -- insufficient permissions. */
export class PermissionDeniedError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(403, errorType, title, message, details);
		this.name = "PermissionDeniedError";
	}
}

/** 404 Not Found. */
export class NotFoundError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(404, errorType, title, message, details);
		this.name = "NotFoundError";
	}
}

/** 409 Conflict. */
export class ConflictError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(409, errorType, title, message, details);
		this.name = "ConflictError";
	}
}

/** 422 Unprocessable Entity -- validation failure. */
export class UnprocessableEntityError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(422, errorType, title, message, details);
		this.name = "UnprocessableEntityError";
	}
}

/** 429 Too Many Requests -- rate limit exceeded. */
export class RateLimitError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(429, errorType, title, message, details);
		this.name = "RateLimitError";
	}
}

/** 500 Internal Server Error. */
export class InternalServerError extends APIError {
	constructor(errorType: string, title: string, message: string, details: ErrorDetail[] | null) {
		super(500, errorType, title, message, details);
		this.name = "InternalServerError";
	}
}

/** Network-level error (DNS failure, timeout, connection refused). */
export class ConnectionError extends SwitchPostError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "ConnectionError";
	}
}

/**
 * Map an HTTP status code to the appropriate APIError subclass.
 * Falls back to the generic `APIError` for unmapped codes.
 */
export function buildApiError(
	statusCode: number,
	errorType: string,
	title: string,
	message: string,
	details: ErrorDetail[] | null,
): APIError {
	switch (statusCode) {
		case 400:
			return new BadRequestError(errorType, title, message, details);
		case 401:
			return new AuthenticationError(errorType, title, message, details);
		case 403:
			return new PermissionDeniedError(errorType, title, message, details);
		case 404:
			return new NotFoundError(errorType, title, message, details);
		case 409:
			return new ConflictError(errorType, title, message, details);
		case 422:
			return new UnprocessableEntityError(errorType, title, message, details);
		case 429:
			return new RateLimitError(errorType, title, message, details);
		case 500:
			return new InternalServerError(errorType, title, message, details);
		default:
			return new APIError(statusCode, errorType, title, message, details);
	}
}
