import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Create ---

When(
	"I create a webhook on the run with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		const webhook = await safeCall(this, () => this.client.webhooks.create(this.runId, params as any), 201);
		if (webhook) {
			this.webhook = webhook;
			this.webhookId = webhook.id;
			this.createdWebhooks.push({ runId: this.runId, webhookId: webhook.id });
		}
	},
);

// --- List ---

When("I list webhooks for the run", async function (this: SwitchPostWorld) {
	const webhooks = await safeCall(this, () => this.client.webhooks.list(this.runId));
	if (webhooks) {
		this.webhookList = webhooks;
	}
});

When("I list webhooks for the new run", async function (this: SwitchPostWorld) {
	assert.ok(this.secondRunId, "No secondary run ID available");
	const webhooks = await safeCall(this, () => this.client.webhooks.list(this.secondRunId));
	if (webhooks) {
		this.webhookList = webhooks;
	}
});

// --- Delete ---

When("I delete the webhook", async function (this: SwitchPostWorld) {
	await safeCall(this, () => this.client.webhooks.delete(this.runId, this.webhookId), 204);
	this.createdWebhooks = this.createdWebhooks.filter((w) => w.webhookId !== this.webhookId);
});

When("I delete a webhook with ID {string} on the run", async function (this: SwitchPostWorld, webhookId: string) {
	await safeCall(this, () => this.client.webhooks.delete(this.runId, webhookId), 204);
});

When("I delete all webhooks for the run", async function (this: SwitchPostWorld) {
	const webhooks = await this.client.webhooks.list(this.runId);
	for (const webhook of webhooks) {
		try {
			await this.client.webhooks.delete(this.runId, webhook.id);
			this.createdWebhooks = this.createdWebhooks.filter((w) => w.webhookId !== webhook.id);
		} catch {
			// ignore cleanup errors
		}
	}
	this.lastStatusCode = 204;
});

// --- Webhook assertions ---

Then("the webhook should have a {string} prefixed ID", function (this: SwitchPostWorld, prefix: string) {
	assert.ok(this.webhook, "No webhook available");
	assert.ok(
		this.webhook.id.startsWith(prefix),
		`Expected webhook ID to start with "${prefix}", got "${this.webhook.id}"`,
	);
});

Then("the webhook url should be {string}", function (this: SwitchPostWorld, expected: string) {
	assert.ok(this.webhook, "No webhook available");
	assert.equal(this.webhook.url, expected);
});

Then("the webhook run_id should match the run ID", function (this: SwitchPostWorld) {
	assert.ok(this.webhook, "No webhook available");
	assert.equal(this.webhook.runId, this.runId);
});

Then("the webhook should have created info with created_at and created_by", function (this: SwitchPostWorld) {
	assert.ok(this.webhook, "No webhook available");
	assert.ok(this.webhook.created, "No created info on webhook");
	assert.ok(this.webhook.created.createdAt, "Missing createdAt");
	assert.ok(this.webhook.created.createdBy, "Missing createdBy");
});

// --- Webhook list assertions ---

Then("the webhook list should have an {string} array", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.webhookList, "No webhook list available");
	if (field === "items") {
		assert.ok(Array.isArray(this.webhookList), "Expected webhooks to be an array");
	}
});

Then(
	"the webhook list {string} should contain at least {int} webhook",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.webhookList, "No webhook list available");
		if (field === "items") {
			assert.ok(this.webhookList.length >= min, `Expected at least ${min} webhooks, got ${this.webhookList.length}`);
		}
	},
);

Then(
	"the webhook list {string} should contain at least {int} webhooks",
	function (this: SwitchPostWorld, field: string, min: number) {
		assert.ok(this.webhookList, "No webhook list available");
		if (field === "items") {
			assert.ok(this.webhookList.length >= min, `Expected at least ${min} webhooks, got ${this.webhookList.length}`);
		}
	},
);

Then("the webhook list should contain the created webhook", function (this: SwitchPostWorld) {
	assert.ok(this.webhookList, "No webhook list available");
	assert.ok(this.webhookId, "No webhook ID to search for");
	const found = this.webhookList.some((w) => w.id === this.webhookId);
	assert.ok(found, `Expected webhook list to contain webhook ${this.webhookId}`);
});

Then(
	"the webhook list {string} should not contain the deleted webhook",
	function (this: SwitchPostWorld, field: string) {
		assert.ok(this.webhookList, "No webhook list available");
		assert.ok(this.webhookId, "No webhook ID to check");
		if (field === "items") {
			const found = this.webhookList.some((w) => w.id === this.webhookId);
			assert.ok(!found, `Expected webhook list to NOT contain webhook ${this.webhookId}`);
		}
	},
);

Then("the webhook list {string} should be empty", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.webhookList !== null && this.webhookList !== undefined, "No webhook list available");
	if (field === "items") {
		assert.equal(this.webhookList.length, 0, "Expected webhook list to be empty");
	}
});
