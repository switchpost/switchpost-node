import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Create ---

When(
	"I create a binding for the principal with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		// Replace <task_id> placeholder with actual task ID
		if (params.resourceId === "<task_id>") {
			assert.ok(this.taskId, "No task ID available");
			params.resourceId = this.taskId;
		}

		const binding = await safeCall(this, () => this.client.bindings.create(this.principalId, params as any), 201);
		if (binding) {
			this.binding = binding;
			this.bindingId = binding.id;
			this.createdBindings.push(binding.id);
		}
	},
);

// --- List ---

When("I list bindings for the principal", async function (this: SwitchPostWorld) {
	const bindings = await safeCall(this, () => this.client.bindings.list(this.principalId));
	if (bindings) {
		this.bindingList = bindings;
	}
});

When("I list bindings for the new principal", async function (this: SwitchPostWorld) {
	assert.ok(this.secondPrincipalId, "No secondary principal ID");
	const bindings = await safeCall(this, () => this.client.bindings.list(this.secondPrincipalId));
	if (bindings) {
		this.bindingList = bindings;
	}
});

// --- Delete ---

When("I delete the binding by its ID", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.bindings.delete(this.bindingId), 204);
	this.createdBindings = this.createdBindings.filter((id) => id !== this.bindingId);
});

When("I delete a binding with ID {string}", async function (this: SwitchPostWorld, bindingId: string) {
	await safeCall(this, () => this.client.bindings.delete(bindingId), 204);
});

When("I delete all bindings for the principal", async function (this: SwitchPostWorld) {
	const bindings = await this.client.bindings.list(this.principalId);
	for (const binding of bindings) {
		try {
			await this.client.bindings.delete(binding.id);
			this.createdBindings = this.createdBindings.filter((id) => id !== binding.id);
		} catch {
			// ignore cleanup errors
		}
	}
	this.lastStatusCode = 204;
});

// --- Binding assertions ---

Then("the binding should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.binding, "No binding available");
	assert.ok(
		this.binding.id.startsWith(prefix),
		`Expected binding ID to start with "${prefix}", got "${this.binding.id}"`,
	);
});

Then("the binding role should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.binding, "No binding available");
	assert.equal(this.binding.role, expected);
});

Then("the binding resource_type should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.binding, "No binding available");
	assert.equal(this.binding.resourceType, expected);
});

Then("the binding resource_id should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.binding, "No binding available");
	assert.equal(this.binding.resourceId, expected);
});

Then("the binding resource_id should match the task ID", function (this: SwitchPostWorld) {
	assert.ok(this.binding, "No binding available");
	assert.equal(this.binding.resourceId, this.taskId);
});

Then("the binding principal_id should match the principal ID", function (this: SwitchPostWorld) {
	assert.ok(this.binding, "No binding available");
	assert.equal(this.binding.principalId, this.principalId);
});

Then("the binding should have created info with created_at and created_by", function (this: SwitchPostWorld) {
	assert.ok(this.binding, "No binding available");
	assert.ok(this.binding.created, "No created info on binding");
	assert.ok(this.binding.created.createdAt, "Missing createdAt");
	assert.ok(this.binding.created.createdBy, "Missing createdBy");
});

// --- Binding list assertions ---

Then("the binding list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.bindingList, "No binding list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.bindingList), "Expected bindings to be an array");
	}
});

Then(
	"the binding list {string} should contain at least {int} binding",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.bindingList, "No binding list available");
		if (field === "items") {
			assert.ok(this.bindingList.length >= min, `Expected at least ${min} bindings, got ${this.bindingList.length}`);
		}
	},
);

Then(
	"the binding list {string} should contain at least {int} bindings",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.bindingList, "No binding list available");
		if (field === "items") {
			assert.ok(this.bindingList.length >= min, `Expected at least ${min} bindings, got ${this.bindingList.length}`);
		}
	},
);

Then("the binding list should contain the created binding", function (this: SwitchPostWorld) {
	assert.ok(this.bindingList, "No binding list available");
	assert.ok(this.bindingId, "No binding ID to search for");
	const found = this.bindingList.some((b) => b.id === this.bindingId);
	assert.ok(found, `Expected binding list to contain binding ${this.bindingId}`);
});

Then(
	"the binding list {string} should not contain the deleted binding",
	function (this: SwitchPostWorld, field: string) {
		assert.ok(this.bindingList, "No binding list available");
		assert.ok(this.bindingId, "No binding ID to check");
		if (field === "items") {
			const found = this.bindingList.some((b) => b.id === this.bindingId);
			assert.ok(!found, `Expected binding list to NOT contain binding ${this.bindingId}`);
		}
	},
);

Then("the binding list {string} should be empty", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.bindingList !== null && this.bindingList !== undefined, "No binding list available");
	if (field === "items") {
		assert.equal(this.bindingList.length, 0, "Expected binding list to be empty");
	}
});
