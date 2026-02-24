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
import { Then, When } from "@cucumber/cucumber";
import { SwitchPost } from "../../src/client.js";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Create ---

When("I create a principal with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const response = await safeCall(this, () => this.client.principals.create(params as any), 201);
	if (response) {
		this.principal = response.principal;
		this.principalId = response.principal.id;
		this.returnedApiKey = response.apiKey || "";
		this.createdPrincipals.push(response.principal.id);
	}
});

// --- Read ---

When("I get the principal by its ID", async function (this: SwitchPostWorld) {
	const principal = await safeCall(this, () => this.client.principals.get(this.principalId));
	if (principal) {
		this.principal = principal;
	}
});

When("I get a principal with ID {string}", async function (this: SwitchPostWorld, principalId: string) {
	const principal = await safeCall(this, () => this.client.principals.get(principalId));
	if (principal) {
		this.principal = principal;
	}
});

// --- Delete ---

When("I delete the principal", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.principals.delete(this.principalId), 204);
	this.createdPrincipals = this.createdPrincipals.filter((id) => id !== this.principalId);
});

When("I delete a principal with ID {string}", async function (this: SwitchPostWorld, principalId: string) {
	await safeCall(this, () => this.client.principals.delete(principalId), 204);
});

When("I delete the principal using the original client", async function (this: SwitchPostWorld) {
	// Use the original client (this.client) which has the original admin credentials
	await safeCall(this, () => this.client.principals.delete(this.principalId), 204);
	this.createdPrincipals = this.createdPrincipals.filter((id) => id !== this.principalId);
});

When("I delete all principals with name prefix {string}", async function (this: SwitchPostWorld, prefix: string) {
	const page = await this.client.principals.list({ limit: 200 });
	for (const principal of page.items) {
		if (principal.name.startsWith(prefix)) {
			try {
				await this.client.principals.delete(principal.id);
				this.createdPrincipals = this.createdPrincipals.filter((id) => id !== principal.id);
			} catch {
				// ignore cleanup errors
			}
		}
	}
	this.lastStatusCode = 200;
});

When("I delete the new principal", async function (this: SwitchPostWorld) {
	assert.ok(this.secondPrincipalId, "No secondary principal ID");
	await safeCall(this, () => this.client.principals.delete(this.secondPrincipalId), 204);
	this.createdPrincipals = this.createdPrincipals.filter((id) => id !== this.secondPrincipalId);
});

// --- List ---

When(
	"I list principals with limit {int} and offset {int}",
	async function (this: SwitchPostWorld, limit: number, offset: number) {
		const page = await safeCall(this, () => this.client.principals.list({ limit, offset }).then((r) => r));
		if (page) {
			this.principalList = page;
		}
	},
);

When("I list principals", async function (this: SwitchPostWorld) {
	const page = await safeCall(this, () => this.client.principals.list().then((r) => r));
	if (page) {
		this.principalList = page;
	}
});

// --- Auth test steps ---

When("I create a new client using the returned API key", function (this: SwitchPostWorld) {
	assert.ok(this.returnedApiKey, "No API key returned from principal creation");
	const baseUrl = process.env.SWITCHPOST_API_URL || "http://localhost:8080";
	this.alternateClient = new SwitchPost({ baseUrl, apiKey: this.returnedApiKey });
});

// --- Principal assertions ---

Then("the response should include a {string} object", function (this: SwitchPostWorld, field: string) {
	if (field === "principal") {
		assert.ok(this.principal, "Expected principal to be present in response");
	}
});

Then("the principal should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.principal, "No principal available");
	assert.ok(
		this.principal.id.startsWith(prefix),
		`Expected principal ID to start with "${prefix}", got "${this.principal.id}"`,
	);
});

Then("the principal name should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.principal, "No principal available");
	assert.equal(this.principal.name, expected);
});

Then("the principal type should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.principal, "No principal available");
	assert.equal(this.principal.type, expected);
});

Then("the principal should have audit timestamps", function (this: SwitchPostWorld) {
	assert.ok(this.principal, "No principal available");
	assert.ok(this.principal.audit, "No audit info on principal");
	assert.ok(this.principal.audit.createdAt, "Missing createdAt");
	assert.ok(this.principal.audit.createdBy, "Missing createdBy");
	assert.ok(this.principal.audit.updatedAt, "Missing updatedAt");
	assert.ok(this.principal.audit.updatedBy, "Missing updatedBy");
});

Then("the response should include an {string} string", function (this: SwitchPostWorld, field: string) {
	if (field === "api_key") {
		assert.ok(typeof this.returnedApiKey === "string", "Expected api_key to be a string");
		assert.ok(this.returnedApiKey.length > 0, "Expected api_key to be non-empty");
	}
});

Then("the principal should have a key_prefix", function (this: SwitchPostWorld) {
	assert.ok(this.principal, "No principal available");
	assert.ok(this.principal.keyPrefix, "Expected keyPrefix to be present");
});

Then("the principal expires_at should be present", function (this: SwitchPostWorld) {
	assert.ok(this.principal, "No principal available");
	assert.ok(this.principal.expiresAt, "Expected expiresAt to be present");
});

Then("the principal email should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.principal, "No principal available");
	assert.equal(this.principal.email, expected);
});

// --- Principal list assertions ---

Then("the principal list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.principalList, "No principal list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.principalList.items), "Expected items to be an array");
	}
});

Then(
	"the principal list should have a {string} count of at least {int}",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.principalList, "No principal list available");
		if (field === "total") {
			assert.ok(this.principalList.total >= min, `Expected total >= ${min}, got ${this.principalList.total}`);
		}
	},
);

Then("the principal list should have a {string} count", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.principalList, "No principal list available");
	if (field === "total") {
		assert.ok(typeof this.principalList.total === "number", "Expected total to be a number");
	}
});

Then("the principal list should have an {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.principalList, "No principal list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.ok((this.principalList as any)[camelField] !== undefined, `Expected "${field}" to be present`);
});

Then("the principal list should have a {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.principalList, "No principal list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.ok((this.principalList as any)[camelField] !== undefined, `Expected "${field}" to be present`);
});

Then("the principal list {string} should be {int}", function (this: SwitchPostWorld, field: string, expected: number) {
	assert.ok(this.principalList, "No principal list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.equal((this.principalList as any)[camelField], expected);
});

Then(
	"the principal list {string} should contain at most {int} principals",
	function (this: SwitchPostWorld, field: string, max: number) {
		assert.ok(this.principalList, "No principal list available");
		if (field === "items") {
			assert.ok(
				this.principalList.items.length <= max,
				`Expected at most ${max} principals, got ${this.principalList.items.length}`,
			);
		}
	},
);

Then(
	"the principal list {string} should contain at least {int} principal",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.principalList, "No principal list available");
		if (field === "items") {
			assert.ok(
				this.principalList.items.length >= min,
				`Expected at least ${min} principals, got ${this.principalList.items.length}`,
			);
		}
	},
);
