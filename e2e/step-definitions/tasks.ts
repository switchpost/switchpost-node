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
import type { SwitchPostWorld } from "../support/world.js";
import { parseValue, rowsHashToCamelParams, safeCall } from "./common.js";

// --- Create ---

When("I create a task with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	// If there's a pending task with retry policy or rate limit, merge
	if (this.pendingTaskParams) {
		Object.assign(params, this.pendingTaskParams);
		this.pendingTaskParams = null;
	}

	// Save first task ID before creating a potentially duplicate one
	if (this.task) {
		this.firstCreatedTaskId = this.task.id;
	}

	const task = await safeCall(this, () => this.client.tasks.create(params as any), 201);
	if (task) {
		this.task = task;
		this.taskId = task.id;
		this.createdTasks.push(task.id);
	}
});

When("the task has a retry policy:", async function (this: SwitchPostWorld, dataTable: any) {
	const retryParams = rowsHashToCamelParams(dataTable.rowsHash());

	// We need to re-create the task with the retry policy.
	// The feature files chain "create task" then "has a retry policy" as a single creation.
	// So we delete the just-created task and re-create with the retry policy.
	assert.ok(this.task, "No task to add retry policy to");

	const taskName = this.task.name;
	const taskEndpointUrl = this.task.endpointUrl;
	const taskTimeoutMs = this.task.timeoutMs;

	// Delete the task we just created
	await this.client.tasks.delete(this.taskId);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);

	// Re-create with retry policy
	const task = await safeCall(
		this,
		() =>
			this.client.tasks.create({
				name: taskName,
				endpointUrl: taskEndpointUrl,
				timeoutMs: taskTimeoutMs,
				retryPolicy: retryParams as any,
			}),
		201,
	);

	if (task) {
		this.task = task;
		this.taskId = task.id;
		this.createdTasks.push(task.id);
	}
});

When("the task has a rate limit:", async function (this: SwitchPostWorld, dataTable: any) {
	const rateLimitParams = rowsHashToCamelParams(dataTable.rowsHash());

	assert.ok(this.task, "No task to add rate limit to");

	const taskName = this.task.name;
	const taskEndpointUrl = this.task.endpointUrl;
	const taskTimeoutMs = this.task.timeoutMs;

	// Delete the task we just created
	await this.client.tasks.delete(this.taskId);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);

	// Re-create with rate limit
	const task = await safeCall(
		this,
		() =>
			this.client.tasks.create({
				name: taskName,
				endpointUrl: taskEndpointUrl,
				timeoutMs: taskTimeoutMs,
				rateLimit: rateLimitParams as any,
			}),
		201,
	);

	if (task) {
		this.task = task;
		this.taskId = task.id;
		this.createdTasks.push(task.id);
	}
});

// --- Read ---

When("I get the task by its ID", async function (this: SwitchPostWorld) {
	const task = await safeCall(this, () => this.client.tasks.get(this.taskId));
	if (task) {
		this.task = task;
	}
});

When("I get a task with ID {string}", async function (this: SwitchPostWorld, taskId: string) {
	const task = await safeCall(this, () => this.client.tasks.get(taskId));
	if (task) {
		this.task = task;
	}
});

// --- Update ---

When("I update the task with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const task = await safeCall(this, () => this.client.tasks.update(this.taskId, params as any));
	if (task) {
		this.task = task;
	}
});

// --- Delete ---

When("I delete the task", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

When("I delete a task with ID {string}", async function (this: SwitchPostWorld, taskId: string) {
	await safeCall(this, () => this.client.tasks.delete(taskId), 204);
});

When("I delete the first created task", async function (this: SwitchPostWorld) {
	assert.ok(this.firstCreatedTaskId, "No first created task ID saved");
	await safeCall(this, () => this.client.tasks.delete(this.firstCreatedTaskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.firstCreatedTaskId);
});

When("I delete the parent task", async function (this: SwitchPostWorld) {
	assert.ok(this.taskId, "No parent task ID");
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

When("I delete all tasks with name prefix {string}", async function (this: SwitchPostWorld, prefix: string) {
	const page = await this.client.tasks.list({ limit: 200 });
	for (const task of page.items) {
		if (task.name.startsWith(prefix)) {
			try {
				await this.client.tasks.delete(task.id);
				this.createdTasks = this.createdTasks.filter((id) => id !== task.id);
			} catch {
				// ignore cleanup errors
			}
		}
	}
	this.lastStatusCode = 200;
});

// --- List ---

When(
	"I list tasks with limit {int} and offset {int}",
	async function (this: SwitchPostWorld, limit: number, offset: number) {
		const page = await safeCall(this, () => this.client.tasks.list({ limit, offset }).then((r) => r));
		if (page) {
			this.taskList = page;
		}
	},
);

When("I list tasks", async function (this: SwitchPostWorld) {
	const page = await safeCall(this, () => this.client.tasks.list().then((r) => r));
	if (page) {
		this.taskList = page;
	}
});

When("I list tasks using the new client", async function (this: SwitchPostWorld) {
	assert.ok(this.alternateClient, "No alternate client available");
	const page = await safeCall(this, () => this.alternateClient?.tasks.list().then((r) => r));
	if (page) {
		this.taskList = page;
	}
});

// --- Submit run ---

When("I submit a run for the task with payload:", async function (this: SwitchPostWorld, dataTable: any) {
	const rows = dataTable.hashes();
	const payload: Record<string, any> = {};
	for (const row of rows) {
		payload[row.key] = parseValue(row.value);
	}

	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId, { payload }), 202);
	if (run) {
		this.run = run;
		this.runId = run.id;
		this.createdRuns.push(run.id);
	}
});

When("I submit a run for the task with:", async function (this: SwitchPostWorld, dataTable: any) {
	const hash = dataTable.rowsHash();
	const params: Record<string, any> = {};

	if (hash.payload) {
		params.payload = parseValue(hash.payload);
	}
	if (hash.webhook_url) {
		params.webhookUrl = hash.webhook_url;
	}

	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId, params as any), 202);
	if (run) {
		this.run = run;
		this.runId = run.id;
		this.createdRuns.push(run.id);
	}
});

When("I submit a run for the task", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId), 202);
	if (run) {
		this.run = run;
		this.runId = run.id;
		this.createdRuns.push(run.id);
	}
});

// --- Task assertions ---

Then("the task should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.id.startsWith(prefix), `Expected task ID to start with "${prefix}", got "${this.task.id}"`);
});

Then("the task name should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.name, expected);
});

Then("the task endpoint_url should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.endpointUrl, expected);
});

Then("the task timeout_ms should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.timeoutMs, expected);
});

Then("the task max_concurrency should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.maxConcurrency, expected);
});

Then("the task store_response should be true", function (this: SwitchPostWorld) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.storeResponse, true);
});

Then("the task result_ttl_seconds should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.equal(this.task.resultTtlSeconds, expected);
});

Then("the task success_codes should contain {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.successCodes, "No success codes on task");
	assert.ok(this.task.successCodes.includes(expected), `Expected success_codes to contain ${expected}`);
});

Then("the task permanent_failure_codes should contain {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.permanentFailureCodes, "No permanent failure codes on task");
	assert.ok(
		this.task.permanentFailureCodes.includes(expected),
		`Expected permanent_failure_codes to contain ${expected}`,
	);
});

Then("the task should have audit timestamps", function (this: SwitchPostWorld) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.audit, "No audit info on task");
	assert.ok(this.task.audit.createdAt, "Missing createdAt");
	assert.ok(this.task.audit.createdBy, "Missing createdBy");
	assert.ok(this.task.audit.updatedAt, "Missing updatedAt");
	assert.ok(this.task.audit.updatedBy, "Missing updatedBy");
});

Then("the task retry_policy max_attempts should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.retryPolicy, "No retry policy on task");
	assert.equal(this.task.retryPolicy.maxAttempts, expected);
});

Then("the task retry_policy initial_delay_ms should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.retryPolicy, "No retry policy on task");
	assert.equal(this.task.retryPolicy.initialDelayMs, expected);
});

Then("the task retry_policy multiplier should be {float}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.retryPolicy, "No retry policy on task");
	assert.equal(this.task.retryPolicy.multiplier, expected);
});

Then("the task retry_policy max_delay_ms should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.retryPolicy, "No retry policy on task");
	assert.equal(this.task.retryPolicy.maxDelayMs, expected);
});

Then("the task rate_limit max_per_second should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.task, "No task available");
	assert.ok(this.task.rateLimit, "No rate limit on task");
	assert.equal(this.task.rateLimit.maxPerSecond, expected);
});

// --- Task list assertions ---

Then("the task list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.taskList, "No task list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.taskList.items), "Expected items to be an array");
	}
});

Then(
	"the task list should have a {string} count of at least {int}",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.taskList, "No task list available");
		if (field === "total") {
			assert.ok(this.taskList.total >= min, `Expected total >= ${min}, got ${this.taskList.total}`);
		}
	},
);

Then("the task list should have a {string} count", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.taskList, "No task list available");
	if (field === "total") {
		assert.ok(typeof this.taskList.total === "number", "Expected total to be a number");
	}
});

Then("the task list should have an {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.taskList, "No task list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.ok((this.taskList as any)[camelField] !== undefined, `Expected "${field}" to be present`);
});

Then("the task list should have a {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.taskList, "No task list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.ok((this.taskList as any)[camelField] !== undefined, `Expected "${field}" to be present`);
});

Then("the task list {string} should be {int}", function (this: SwitchPostWorld, field: string, expected: number) {
	assert.ok(this.taskList, "No task list available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.equal((this.taskList as any)[camelField], expected);
});

Then(
	"the task list {string} should contain at most {int} tasks",
	function (this: SwitchPostWorld, field: string, max: number) {
		assert.ok(this.taskList, "No task list available");
		if (field === "items") {
			assert.ok(this.taskList.items.length <= max, `Expected at most ${max} items, got ${this.taskList.items.length}`);
		}
	},
);

Then(
	"the task list {string} should contain at least {int} task",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.taskList, "No task list available");
		if (field === "items") {
			assert.ok(this.taskList.items.length >= min, `Expected at least ${min} items, got ${this.taskList.items.length}`);
		}
	},
);
