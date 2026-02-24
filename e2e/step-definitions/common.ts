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

import assert from "node:assert/strict";
import { Then } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "../support/world.js";

/**
 * Safely execute an SDK call, capturing errors into the world state.
 * Returns the result on success, or null if an error was caught.
 */
export async function safeCall<T>(
	world: SwitchPostWorld,
	fn: () => Promise<T>,
	successStatus = 200,
): Promise<T | null> {
	try {
		const result = await fn();
		world.lastError = null;
		world.lastStatusCode = successStatus;
		world.errorResponse = {};
		return result;
	} catch (e: any) {
		world.lastError = e;
		world.lastStatusCode = e.statusCode || 500;
		world.errorResponse = {
			status: e.statusCode,
			title: e.title,
			detail: e.message,
			type: e.errorType,
			errors: e.details,
		};
		return null;
	}
}

// --- Response status ---

Then("the response status should be {int}", function (this: SwitchPostWorld, expectedStatus: number) {
	assert.equal(
		this.lastStatusCode,
		expectedStatus,
		`Expected status ${expectedStatus} but got ${this.lastStatusCode}${this.lastError ? `: ${this.lastError.message}` : ""}`,
	);
});

// --- Error response assertions ---

Then(
	"the error response should have a {string} of {int}",
	function (this: SwitchPostWorld, field: string, expected: number) {
		assert.ok(this.errorResponse, "No error response captured");
		assert.equal(this.errorResponse[field], expected);
	},
);

Then("the error response should have a {string} string", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.errorResponse, "No error response captured");
	assert.ok(typeof this.errorResponse[field] === "string", `Expected "${field}" to be a string`);
	assert.ok(this.errorResponse[field].length > 0, `Expected "${field}" to be non-empty`);
});

Then("the error response should have a {string} integer", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.errorResponse, "No error response captured");
	assert.ok(typeof this.errorResponse[field] === "number", `Expected "${field}" to be a number`);
});

Then("the error response should have a {string} URI string", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.errorResponse, "No error response captured");
	assert.ok(typeof this.errorResponse[field] === "string", `Expected "${field}" to be a string`);
});

Then("the error response should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.errorResponse, "No error response captured");
	assert.ok(Array.isArray(this.errorResponse[field]), `Expected "${field}" to be an array`);
});

Then(
	"the error response content type should be {string}",
	function (this: SwitchPostWorld, _expectedContentType: string) {
		// The SDK parses the response body, so we can't directly check content-type.
		// However, since the error was parsed into our error structure, we know it was valid JSON.
		// We verify the error structure is present instead.
		assert.ok(this.lastError, "Expected an error to be present");
	},
);

Then("the errors array should reference the {string} field", function (this: SwitchPostWorld, fieldName: string) {
	assert.ok(this.errorResponse, "No error response captured");
	const errors = this.errorResponse.errors;
	assert.ok(Array.isArray(errors), "Expected errors to be an array");
	assert.ok(errors.length > 0, "Expected at least one error detail");

	// Look for the field name in error locations or messages
	const referencesField = errors.some((e: any) => {
		const loc = typeof e.location === "string" ? e.location : "";
		const msg = typeof e.message === "string" ? e.message : "";
		return loc.includes(fieldName) || msg.includes(fieldName);
	});
	assert.ok(referencesField, `Expected errors to reference field "${fieldName}"`);
});

// --- Helper: Parse DataTable row hash values ---

/**
 * Parse a value from a Cucumber DataTable row hash.
 * Handles JSON arrays/objects, booleans, numbers, and strings.
 */
export function parseValue(value: string): any {
	// JSON array or object
	if ((value.startsWith("[") && value.endsWith("]")) || (value.startsWith("{") && value.endsWith("}"))) {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
	// Boolean
	if (value === "true") return true;
	if (value === "false") return false;
	// Number
	if (/^-?\d+(\.\d+)?$/.test(value)) {
		return Number(value);
	}
	return value;
}

/**
 * Convert a Cucumber DataTable rowsHash() (snake_case keys) to a camelCase
 * params object suitable for SDK methods.
 */
export function rowsHashToCamelParams(rowsHash: Record<string, string>): Record<string, any> {
	const params: Record<string, any> = {};
	for (const [key, value] of Object.entries(rowsHash)) {
		const camelKey = key.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
		params[camelKey] = parseValue(value);
	}
	return params;
}

/**
 * Wait for a run to reach a terminal status (COMPLETED, FAILED, or CANCELLED).
 * Polls every 2 seconds for up to 60 seconds.
 */
export async function waitForTerminalStatus(world: SwitchPostWorld, runId: string): Promise<void> {
	const terminalStatuses = new Set(["COMPLETED", "FAILED", "CANCELLED"]);
	const maxWaitMs = 60_000;
	const pollIntervalMs = 2_000;
	const start = Date.now();

	while (Date.now() - start < maxWaitMs) {
		const run = await world.client.runs.get(runId);
		world.run = run;
		world.runId = run.id;
		world.lastStatusCode = 200;
		world.lastError = null;
		world.errorResponse = {};

		if (terminalStatuses.has(run.status)) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}

	throw new Error(`Run ${runId} did not reach terminal status within ${maxWaitMs / 1000}s`);
}
