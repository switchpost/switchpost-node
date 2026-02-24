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
import { parseValue, safeCall, waitForTerminalStatus } from "./common.js";

// --- Submit run (for runs feature, not tasks feature) ---

When("I submit a run for the retry task", async function (this: SwitchPostWorld) {
	// "retry task" is the most recently created task in the scenario (this.taskId)
	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId), 202);
	if (run) {
		this.run = run;
		this.runId = run.id;
		this.createdRuns.push(run.id);
	}
});

When("I submit a run for the result task with payload:", async function (this: SwitchPostWorld, dataTable: any) {
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

When("I submit a run for the pagination task", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId), 202);
	if (run) {
		this.run = run;
		this.runId = run.id;
		this.createdRuns.push(run.id);
	}
});

// --- Wait for terminal status ---

When("I wait for the run to reach a terminal status", async function (this: SwitchPostWorld) {
	assert.ok(this.runId, "No run ID to wait for");
	await waitForTerminalStatus(this, this.runId);
});

// --- Get run ---

When("I get the run by its ID", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.runs.get(this.runId));
	if (run) {
		this.run = run;
	}
});

When("I get a run with ID {string}", async function (this: SwitchPostWorld, runId: string) {
	const run = await safeCall(this, () => this.client.runs.get(runId));
	if (run) {
		this.run = run;
	}
});

// --- Cancel run ---

When("I cancel the run", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.runs.cancel(this.runId));
	if (run) {
		this.run = run;
	}
});

When("I cancel the run again", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.runs.cancel(this.runId));
	if (run) {
		this.run = run;
	}
});

// --- Retry run ---

When("I retry the run", async function (this: SwitchPostWorld) {
	const run = await safeCall(this, () => this.client.runs.retry(this.runId), 202);
	if (run) {
		this.retriedRun = run;
		this.createdRuns.push(run.id);
	}
});

// --- Get result ---

When("I get the result for the run", async function (this: SwitchPostWorld) {
	const result = await safeCall(this, () => this.client.runs.getResult(this.runId));
	if (result) {
		this.result = result;
	}
});

// --- List runs ---

When("I list runs for the task with limit {int}", async function (this: SwitchPostWorld, limit: number) {
	const page = await safeCall(this, () => this.client.runs.list(this.taskId, { limit }).then((r) => r));
	if (page) {
		this.runList = page;
		this.nextCursor = page.nextCursor || "";
	}
});

When("I list runs for the task using the next cursor", async function (this: SwitchPostWorld) {
	assert.ok(this.nextCursor, "No next cursor available");
	const page = await safeCall(this, () =>
		this.client.runs.list(this.taskId, { after: this.nextCursor }).then((r) => r),
	);
	if (page) {
		this.runList = page;
		this.nextCursor = page.nextCursor || "";
	}
});

When("I list runs for the task with status {string}", async function (this: SwitchPostWorld, status: string) {
	const page = await safeCall(this, () => this.client.runs.list(this.taskId, { status: status as any }).then((r) => r));
	if (page) {
		this.runList = page;
	}
});

When("I list runs for the task", async function (this: SwitchPostWorld) {
	const page = await safeCall(this, () => this.client.runs.list(this.taskId).then((r) => r));
	if (page) {
		this.runList = page;
	}
});

// --- Delete tasks used in runs scenarios ---

When("I delete the retry task", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

When("I delete the result task", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

// --- Run assertions ---

Then("the run should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.run, "No run available");
	assert.ok(this.run.id.startsWith(prefix), `Expected run ID to start with "${prefix}", got "${this.run.id}"`);
});

Then("the run status should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.run, "No run available");
	assert.equal(this.run.status, expected);
});

Then("the run task_id should match the task ID", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.equal(this.run.taskId, this.taskId);
});

Then("the run max_attempts should be a positive integer", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.ok(typeof this.run.maxAttempts === "number", "Expected maxAttempts to be a number");
	assert.ok(this.run.maxAttempts > 0, "Expected maxAttempts to be positive");
});

Then("the run endpoint_url should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.run, "No run available");
	assert.equal(this.run.endpointUrl, expected);
});

Then("the run priority should be a non-negative integer", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.ok(typeof this.run.priority === "number", "Expected priority to be a number");
	assert.ok(this.run.priority >= 0, "Expected priority to be non-negative");
});

Then("the run should have created info with created_at and created_by", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.ok(this.run.created, "No created info on run");
	assert.ok(this.run.created.createdAt, "Missing createdAt");
	assert.ok(this.run.created.createdBy, "Missing createdBy");
});

Then("the run ID should match the submitted run", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.equal(this.run.id, this.runId);
});

Then("the run cancelled_at should be present", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.ok(this.run.cancelledAt, "Expected cancelledAt to be present");
});

Then("the run cancelled_by should be present", function (this: SwitchPostWorld) {
	assert.ok(this.run, "No run available");
	assert.ok(this.run.cancelledBy, "Expected cancelledBy to be present");
});

Then("the retried run should have a new {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.retriedRun, "No retried run available");
	assert.ok(
		this.retriedRun.id.startsWith(prefix),
		`Expected retried run ID to start with "${prefix}", got "${this.retriedRun.id}"`,
	);
});

Then("the retried run ID should differ from the original run", function (this: SwitchPostWorld) {
	assert.ok(this.retriedRun, "No retried run available");
	assert.notEqual(this.retriedRun.id, this.runId, "Expected retried run ID to differ from original");
});

// --- Run list assertions ---

Then("the run list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.runList, "No run list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.runList.items), "Expected items to be an array");
	}
});

Then("the run list should have a {string} boolean", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.runList, "No run list available");
	if (field === "has_more") {
		assert.ok(typeof this.runList.hasMore === "boolean", "Expected hasMore to be a boolean");
	}
});

Then(
	"the run list {string} should contain at most {int} runs",
	function (this: SwitchPostWorld, field: string, max: number) {
		assert.ok(this.runList, "No run list available");
		if (field === "items") {
			assert.ok(this.runList.items.length <= max, `Expected at most ${max} runs, got ${this.runList.items.length}`);
		}
	},
);

Then(
	"the run list {string} should contain at least {int} run",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.runList, "No run list available");
		if (field === "items") {
			assert.ok(this.runList.items.length >= min, `Expected at least ${min} runs, got ${this.runList.items.length}`);
		}
	},
);

Then("if has_more is true then next_cursor should be present", function (this: SwitchPostWorld) {
	assert.ok(this.runList, "No run list available");
	if (this.runList.hasMore) {
		assert.ok(this.runList.nextCursor, "Expected nextCursor to be present when hasMore is true");
	}
});

Then("every run in the list should have status {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.runList, "No run list available");
	for (const run of this.runList.items) {
		assert.equal(run.status, expected, `Expected all runs to have status "${expected}"`);
	}
});

// --- Result assertions ---

Then("the result should have an {string} string", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.result, "No result available");
	if (field === "id") {
		assert.ok(typeof this.result.id === "string", "Expected result id to be a string");
		assert.ok(this.result.id.length > 0, "Expected result id to be non-empty");
	}
});

Then("the result attempt_id should have an {string} prefix", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.result, "No result available");
	assert.ok(
		this.result.attemptId.startsWith(prefix),
		`Expected attempt_id to start with "${prefix}", got "${this.result.attemptId}"`,
	);
});

Then("the result run_id should match the run ID", function (this: SwitchPostWorld) {
	assert.ok(this.result, "No result available");
	assert.equal(this.result.runId, this.runId);
});

Then("the result status_code should be a valid HTTP status code", function (this: SwitchPostWorld) {
	assert.ok(this.result, "No result available");
	assert.ok(typeof this.result.statusCode === "number", "Expected statusCode to be a number");
	assert.ok(this.result.statusCode >= 100 && this.result.statusCode < 600, "Expected valid HTTP status code");
});

Then("the result blob_url should be a URL string", function (this: SwitchPostWorld) {
	assert.ok(this.result, "No result available");
	assert.ok(typeof this.result.blobUrl === "string", "Expected blobUrl to be a string");
	assert.ok(this.result.blobUrl.length > 0, "Expected blobUrl to be non-empty");
});

Then("the result stored_at should be a timestamp", function (this: SwitchPostWorld) {
	assert.ok(this.result, "No result available");
	assert.ok(typeof this.result.storedAt === "string", "Expected storedAt to be a string");
	assert.ok(!Number.isNaN(Date.parse(this.result.storedAt)), "Expected storedAt to be a valid timestamp");
});
