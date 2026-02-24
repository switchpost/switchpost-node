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

import { describe, expect, it } from "vitest";
import { SwitchPost } from "../src/client.js";
import { resolveConfig } from "../src/config.js";
import {
	APIError,
	AuthenticationError,
	BadRequestError,
	ConnectionError,
	InternalServerError,
	NotFoundError,
	PermissionDeniedError,
	RateLimitError,
	SwitchPostError,
	UnprocessableEntityError,
	buildApiError,
} from "../src/errors.js";

describe("SwitchPost client", () => {
	describe("config", () => {
		it("throws if no auth is provided", () => {
			expect(() => new SwitchPost({ baseUrl: "https://example.com" })).toThrow(/No authentication provided/);
		});

		it("throws if no base URL is provided", () => {
			expect(() => new SwitchPost({ apiKey: "sp_test_123" })).toThrow(/No base URL provided/);
		});

		it("accepts apiKey auth", () => {
			const client = new SwitchPost({
				baseUrl: "https://example.com",
				apiKey: "sp_test_123",
			});
			expect(client).toBeDefined();
		});

		it("accepts accessToken auth", () => {
			const client = new SwitchPost({
				baseUrl: "https://example.com",
				accessToken: "jwt_token_here",
			});
			expect(client).toBeDefined();
		});

		it("strips trailing slashes from baseUrl", () => {
			const config = resolveConfig({
				baseUrl: "https://example.com///",
				apiKey: "sp_test_123",
			});
			expect(config.baseUrl).toBe("https://example.com");
		});
	});

	describe("resources", () => {
		it("exposes all resource accessors", () => {
			const client = new SwitchPost({
				baseUrl: "https://example.com",
				apiKey: "sp_test_123",
			});
			expect(client.tasks).toBeDefined();
			expect(client.triggers).toBeDefined();
			expect(client.runs).toBeDefined();
			expect(client.attempts).toBeDefined();
			expect(client.webhooks).toBeDefined();
			expect(client.principals).toBeDefined();
			expect(client.bindings).toBeDefined();
			expect(client.settings).toBeDefined();
			expect(client.admin).toBeDefined();
		});
	});
});

describe("Error hierarchy", () => {
	it("SwitchPostError is the base", () => {
		const err = new SwitchPostError("test");
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(SwitchPostError);
		expect(err.name).toBe("SwitchPostError");
		expect(err.message).toBe("test");
	});

	it("APIError extends SwitchPostError", () => {
		const err = new APIError(418, "about:blank", "I'm a teapot", "I'm a teapot", null);
		expect(err).toBeInstanceOf(SwitchPostError);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("APIError");
		expect(err.statusCode).toBe(418);
		expect(err.errorType).toBe("about:blank");
		expect(err.message).toBe("I'm a teapot");
		expect(err.details).toBeNull();
	});

	it("BadRequestError is a 400 APIError", () => {
		const err = new BadRequestError("about:blank", "Bad Request", "bad", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err).toBeInstanceOf(SwitchPostError);
		expect(err.name).toBe("BadRequestError");
		expect(err.statusCode).toBe(400);
	});

	it("AuthenticationError is a 401 APIError", () => {
		const err = new AuthenticationError("about:blank", "Unauthorized", "unauthorized", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("AuthenticationError");
		expect(err.statusCode).toBe(401);
	});

	it("PermissionDeniedError is a 403 APIError", () => {
		const err = new PermissionDeniedError("about:blank", "Forbidden", "forbidden", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("PermissionDeniedError");
		expect(err.statusCode).toBe(403);
	});

	it("NotFoundError is a 404 APIError", () => {
		const err = new NotFoundError("about:blank", "Not Found", "not found", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("NotFoundError");
		expect(err.statusCode).toBe(404);
	});

	it("UnprocessableEntityError is a 422 APIError", () => {
		const err = new UnprocessableEntityError("about:blank", "Unprocessable Entity", "invalid", [
			{ location: "body.name", message: "Name is required", value: null },
		]);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("UnprocessableEntityError");
		expect(err.statusCode).toBe(422);
		expect(err.details).toHaveLength(1);
		expect(err.details?.[0].location).toBe("body.name");
	});

	it("RateLimitError is a 429 APIError", () => {
		const err = new RateLimitError("about:blank", "Too Many Requests", "rate limited", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("RateLimitError");
		expect(err.statusCode).toBe(429);
	});

	it("InternalServerError is a 500 APIError", () => {
		const err = new InternalServerError("about:blank", "Internal Server Error", "server error", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err.name).toBe("InternalServerError");
		expect(err.statusCode).toBe(500);
	});

	it("ConnectionError extends SwitchPostError but not APIError", () => {
		const err = new ConnectionError("timeout");
		expect(err).toBeInstanceOf(SwitchPostError);
		expect(err).toBeInstanceOf(Error);
		expect(err).not.toBeInstanceOf(APIError);
		expect(err.name).toBe("ConnectionError");
	});

	it("ConnectionError preserves cause", () => {
		const cause = new TypeError("fetch failed");
		const err = new ConnectionError("network error", { cause });
		expect(err.cause).toBe(cause);
	});
});

describe("buildApiError", () => {
	it("returns BadRequestError for 400", () => {
		const err = buildApiError(400, "about:blank", "Bad Request", "bad", null);
		expect(err).toBeInstanceOf(BadRequestError);
	});

	it("returns AuthenticationError for 401", () => {
		const err = buildApiError(401, "about:blank", "Unauthorized", "unauthorized", null);
		expect(err).toBeInstanceOf(AuthenticationError);
	});

	it("returns PermissionDeniedError for 403", () => {
		const err = buildApiError(403, "about:blank", "Forbidden", "forbidden", null);
		expect(err).toBeInstanceOf(PermissionDeniedError);
	});

	it("returns NotFoundError for 404", () => {
		const err = buildApiError(404, "about:blank", "Not Found", "not found", null);
		expect(err).toBeInstanceOf(NotFoundError);
	});

	it("returns UnprocessableEntityError for 422", () => {
		const err = buildApiError(422, "about:blank", "Unprocessable Entity", "invalid", null);
		expect(err).toBeInstanceOf(UnprocessableEntityError);
	});

	it("returns RateLimitError for 429", () => {
		const err = buildApiError(429, "about:blank", "Too Many Requests", "rate limited", null);
		expect(err).toBeInstanceOf(RateLimitError);
	});

	it("returns InternalServerError for 500", () => {
		const err = buildApiError(500, "about:blank", "Internal Server Error", "server error", null);
		expect(err).toBeInstanceOf(InternalServerError);
	});

	it("returns generic APIError for unmapped status codes", () => {
		const err = buildApiError(503, "about:blank", "Service Unavailable", "unavailable", null);
		expect(err).toBeInstanceOf(APIError);
		expect(err).not.toBeInstanceOf(BadRequestError);
		expect(err.statusCode).toBe(503);
	});
});
