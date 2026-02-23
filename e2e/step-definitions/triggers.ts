import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Create ---

When(
	"I create a trigger on the task with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		// Replace <source_task_id> placeholder with actual secondary task ID
		if (params.sourceTaskId === "<source_task_id>") {
			assert.ok(this.secondTaskId, "No source task ID available");
			params.sourceTaskId = this.secondTaskId;
		}

		const trigger = await safeCall(this, () => this.client.triggers.create(this.taskId, params as any), 201);
		if (trigger) {
			this.trigger = trigger;
			this.triggerId = trigger.id;
			this.createdTriggers.push({ taskId: this.taskId, triggerId: trigger.id });
		}
	},
);

When(
	"I create a trigger on the first task with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		// Replace <source_task_id> placeholder with actual secondary task ID
		if (params.sourceTaskId === "<source_task_id>") {
			assert.ok(this.secondTaskId, "No source task ID available");
			params.sourceTaskId = this.secondTaskId;
		}

		const trigger = await safeCall(this, () => this.client.triggers.create(this.taskId, params as any), 201);
		if (trigger) {
			this.trigger = trigger;
			this.triggerId = trigger.id;
			this.createdTriggers.push({ taskId: this.taskId, triggerId: trigger.id });
		}
	},
);

// --- Read ---

When("I get the trigger by its ID", async function (this: SwitchPostWorld) {
	const trigger = await safeCall(this, () => this.client.triggers.get(this.taskId, this.triggerId));
	if (trigger) {
		this.trigger = trigger;
	}
});

When(
	"I get trigger {string} on task {string}",
	async function (this: SwitchPostWorld, triggerId: string, taskId: string) {
		const trigger = await safeCall(this, () => this.client.triggers.get(taskId, triggerId));
		if (trigger) {
			this.trigger = trigger;
		}
	},
);

// --- Update ---

When("I update the trigger with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const trigger = await safeCall(this, () => this.client.triggers.update(this.taskId, this.triggerId, params as any));
	if (trigger) {
		this.trigger = trigger;
	}
});

// --- Delete ---

When("I delete the trigger", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.triggers.delete(this.taskId, this.triggerId), 204);
	this.createdTriggers = this.createdTriggers.filter((t) => t.triggerId !== this.triggerId);
});

When("I delete the source task", async function (this: SwitchPostWorld) {
	assert.ok(this.secondTaskId, "No source task ID");
	await safeCall(this, () => this.client.tasks.delete(this.secondTaskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.secondTaskId);
});

When("I delete all triggers with name prefix {string}", async function (this: SwitchPostWorld, prefix: string) {
	const triggers = await this.client.triggers.list(this.taskId);
	for (const trigger of triggers) {
		if (trigger.name.startsWith(prefix)) {
			try {
				await this.client.triggers.delete(this.taskId, trigger.id);
				this.createdTriggers = this.createdTriggers.filter((t) => t.triggerId !== trigger.id);
			} catch {
				// ignore cleanup errors
			}
		}
	}
	this.lastStatusCode = 200;
});

// --- List ---

When("I list triggers for the task", async function (this: SwitchPostWorld) {
	const triggers = await safeCall(this, () => this.client.triggers.list(this.taskId));
	if (triggers) {
		this.triggerList = triggers;
	}
});

When("I list triggers for the newly created task", async function (this: SwitchPostWorld) {
	// Uses the most recently created task from a "Given a task exists" step
	// that set a new task (the second one in the scenario).
	const triggers = await safeCall(this, () => this.client.triggers.list(this.taskId));
	if (triggers) {
		this.triggerList = triggers;
	}
});

When("I delete the newly created task", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

// --- Trigger assertions ---

Then("the trigger should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.ok(
		this.trigger.id.startsWith(prefix),
		`Expected trigger ID to start with "${prefix}", got "${this.trigger.id}"`,
	);
});

Then("the trigger name should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.name, expected);
});

Then("the trigger type should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.type, expected);
});

Then("the trigger schedule should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.schedule, expected);
});

Then("the trigger timezone should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.timezone, expected);
});

Then("the trigger enabled should be true", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.enabled, true);
});

Then("the trigger enabled should be false", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.enabled, false);
});

Then("the trigger task_id should match the parent task ID", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.taskId, this.taskId);
});

Then("the trigger source_task_id should match the source task ID", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.sourceTaskId, this.secondTaskId);
});

Then("the trigger on_status should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.onStatus, expected);
});

Then("the trigger forward_result should be true", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.equal(this.trigger.forwardResult, true);
});

Then("the trigger default_payload should contain {string}", function (this: SwitchPostWorld, key: string) {
	assert.ok(this.trigger, "No trigger available");
	assert.ok(this.trigger.defaultPayload, "No default payload on trigger");
	const payload = this.trigger.defaultPayload as Record<string, any>;
	assert.ok(key in payload, `Expected default_payload to contain key "${key}"`);
});

Then("the trigger should have audit timestamps", function (this: SwitchPostWorld) {
	assert.ok(this.trigger, "No trigger available");
	assert.ok(this.trigger.audit, "No audit info on trigger");
	assert.ok(this.trigger.audit.createdAt, "Missing createdAt");
	assert.ok(this.trigger.audit.createdBy, "Missing createdBy");
	assert.ok(this.trigger.audit.updatedAt, "Missing updatedAt");
	assert.ok(this.trigger.audit.updatedBy, "Missing updatedBy");
});

// --- Trigger list assertions ---

Then("the trigger list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.triggerList, "No trigger list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.triggerList), "Expected triggers to be an array");
	}
});

Then(
	"the trigger list {string} should contain at least {int} triggers",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.triggerList, "No trigger list available");
		if (field === "items") {
			assert.ok(this.triggerList.length >= min, `Expected at least ${min} triggers, got ${this.triggerList.length}`);
		}
	},
);

Then("the trigger list {string} should be empty", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.triggerList !== null && this.triggerList !== undefined, "No trigger list available");
	if (field === "items") {
		assert.equal(this.triggerList.length, 0, "Expected trigger list to be empty");
	}
});
