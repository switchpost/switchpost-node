import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "../support/world.js";
import { safeCall } from "./common.js";

// --- List attempts ---

When("I list attempts for the run", async function (this: SwitchPostWorld) {
	assert.ok(this.runId, "No run ID available");
	const page = await safeCall(this, () => this.client.attempts.list(this.runId).then((r) => r));
	if (page) {
		this.attemptList = page;
		// Store first attempt for later reference
		if (page.items.length > 0) {
			this.attempt = page.items[0];
			this.attemptId = page.items[0].id;
		}
	}
});

When("I list attempts for the run with limit {int}", async function (this: SwitchPostWorld, limit: number) {
	assert.ok(this.runId, "No run ID available");
	const page = await safeCall(this, () => this.client.attempts.list(this.runId, { limit }).then((r) => r));
	if (page) {
		this.attemptList = page;
		this.nextCursor = page.nextCursor || "";
		if (page.items.length > 0) {
			this.attempt = page.items[0];
			this.attemptId = page.items[0].id;
		}
	}
});

When("I list attempts for the run using the next cursor", async function (this: SwitchPostWorld) {
	assert.ok(this.runId, "No run ID available");
	assert.ok(this.nextCursor, "No next cursor available");
	const page = await safeCall(this, () =>
		this.client.attempts.list(this.runId, { after: this.nextCursor }).then((r) => r),
	);
	if (page) {
		this.attemptList = page;
		this.nextCursor = page.nextCursor || "";
	}
});

// --- Get attempt ---

When("I get the first attempt by its ID", async function (this: SwitchPostWorld) {
	assert.ok(this.attemptId, "No attempt ID available");
	assert.ok(this.runId, "No run ID available");
	const attempt = await safeCall(this, () => this.client.attempts.get(this.runId, this.attemptId));
	if (attempt) {
		this.attempt = attempt;
	}
});

When(
	"I get attempt {string} for run {string}",
	async function (this: SwitchPostWorld, attemptId: string, runId: string) {
		const attempt = await safeCall(this, () => this.client.attempts.get(runId, attemptId));
		if (attempt) {
			this.attempt = attempt;
		}
	},
);

// --- Delete pagination task ---

When("I delete the pagination task", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.tasks.delete(this.taskId), 204);
	this.createdTasks = this.createdTasks.filter((id) => id !== this.taskId);
});

// --- Attempt list assertions ---

Then("the attempt list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.attemptList, "No attempt list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.attemptList.items), "Expected items to be an array");
	}
});

Then("the attempt list should have a {string} boolean", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.attemptList, "No attempt list available");
	if (field === "has_more") {
		assert.ok(typeof this.attemptList.hasMore === "boolean", "Expected hasMore to be a boolean");
	}
});

Then(
	"the attempt list {string} should contain at least {int} attempt",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.attemptList, "No attempt list available");
		if (field === "items") {
			assert.ok(
				this.attemptList.items.length >= min,
				`Expected at least ${min} attempts, got ${this.attemptList.items.length}`,
			);
		}
	},
);

Then(
	"the attempt list {string} should contain at most {int} attempt",
	function (this: SwitchPostWorld, field: string, max: number) {
		assert.ok(this.attemptList, "No attempt list available");
		if (field === "items") {
			assert.ok(
				this.attemptList.items.length <= max,
				`Expected at most ${max} attempts, got ${this.attemptList.items.length}`,
			);
		}
	},
);

Then("the attempt list {string} should be true", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.attemptList, "No attempt list available");
	if (field === "has_more") {
		assert.equal(this.attemptList.hasMore, true);
	}
});

Then("the attempt list should have a {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.attemptList, "No attempt list available");
	if (field === "next_cursor") {
		assert.ok(this.attemptList.nextCursor, "Expected nextCursor to be present");
	}
});

// --- Attempt assertions ---

Then("the first attempt should have an {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(
		this.attempt.id.startsWith(prefix),
		`Expected attempt ID to start with "${prefix}", got "${this.attempt.id}"`,
	);
});

Then("the first attempt run_id should match the run ID", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.equal(this.attempt.runId, this.runId);
});

Then("the first attempt attempt_number should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.attempt, "No attempt available");
	assert.equal(this.attempt.attemptNumber, expected);
});

Then("the first attempt should have a status", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(typeof this.attempt.status === "string", "Expected status to be a string");
	assert.ok(this.attempt.status.length > 0, "Expected status to be non-empty");
});

Then("the first attempt should have a scheduled_at timestamp", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(this.attempt.scheduledAt, "Expected scheduledAt to be present");
});

Then("the first attempt should have a created_at timestamp", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(this.attempt.createdAt, "Expected createdAt to be present");
});

Then("the first attempt should have a created_by value", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(this.attempt.createdBy, "Expected createdBy to be present");
});

Then("the attempt ID should match the first attempt", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.equal(this.attempt.id, this.attemptId);
});

Then("the attempt run_id should match the run ID", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.equal(this.attempt.runId, this.runId);
});

Then("the attempt attempt_number should be {int}", function (this: SwitchPostWorld, expected: number) {
	assert.ok(this.attempt, "No attempt available");
	assert.equal(this.attempt.attemptNumber, expected);
});

Then("the attempt should have a started_at timestamp", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(this.attempt.startedAt, "Expected startedAt to be present");
});

Then("the attempt should have a completed_at timestamp", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(this.attempt.completedAt, "Expected completedAt to be present");
});

Then("the attempt response_status_code should be a valid HTTP status code", function (this: SwitchPostWorld) {
	assert.ok(this.attempt, "No attempt available");
	assert.ok(typeof this.attempt.responseStatusCode === "number", "Expected responseStatusCode to be a number");
	assert.ok(
		this.attempt.responseStatusCode >= 100 && this.attempt.responseStatusCode < 600,
		"Expected valid HTTP status code",
	);
});
