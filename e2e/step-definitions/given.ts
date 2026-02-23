import assert from "node:assert/strict";
import { Given } from "@cucumber/cucumber";
import { SwitchPost } from "../../src/client.js";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Client setup ---

Given("a SwitchPost client with valid credentials", function (this: SwitchPostWorld) {
	// Client is already created in the World constructor.
	assert.ok(this.client, "Client should be initialized");
});

Given("a SwitchPost client with no credentials", function (this: SwitchPostWorld) {
	const baseUrl = process.env.SWITCHPOST_API_URL || "http://localhost:8080";
	// The SDK constructor requires at least one credential, so we use a
	// single-space API key to bypass validation. The server will reject
	// this as unauthorized (401).
	this.client = new SwitchPost({ baseUrl, apiKey: " " });
});

Given("a SwitchPost client with API key {string}", function (this: SwitchPostWorld, apiKey: string) {
	const baseUrl = process.env.SWITCHPOST_API_URL || "http://localhost:8080";
	this.client = new SwitchPost({ baseUrl, apiKey });
});

// --- Task setup (Background steps) ---

Given("a task exists with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const task = await safeCall(this, () => this.client.tasks.create(params as any), 201);
	assert.ok(task, "Failed to create background task");

	this.task = task;
	this.taskId = task.id;
	this.lastStatusCode = 201;
	this.createdTasks.push(task.id);
});

Given("another task exists with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const task = await safeCall(this, () => this.client.tasks.create(params as any), 201);
	assert.ok(task, "Failed to create secondary task");

	this.secondTask = task;
	this.secondTaskId = task.id;
	this.createdTasks.push(task.id);
});

// --- Principal setup (Background steps) ---

Given("a principal exists with the following properties:", async function (this: SwitchPostWorld, dataTable: any) {
	const params = rowsHashToCamelParams(dataTable.rowsHash());

	const response = await safeCall(this, () => this.client.principals.create(params as any), 201);
	assert.ok(response, "Failed to create background principal");

	this.principal = response.principal;
	this.principalId = response.principal.id;
	this.returnedApiKey = response.apiKey || "";
	this.lastStatusCode = 201;
	this.createdPrincipals.push(response.principal.id);
});

Given(
	"another principal exists with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		const response = await safeCall(this, () => this.client.principals.create(params as any), 201);
		assert.ok(response, "Failed to create secondary principal");

		this.secondPrincipal = response.principal;
		this.secondPrincipalId = response.principal.id;
		this.createdPrincipals.push(response.principal.id);
	},
);

// --- Run setup (Background steps) ---

Given("a run has been submitted for the task", async function (this: SwitchPostWorld) {
	assert.ok(this.taskId, "No task ID available to submit a run");

	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId), 202);
	assert.ok(run, "Failed to submit background run");

	this.run = run;
	this.runId = run.id;
	this.lastStatusCode = 202;
	this.createdRuns.push(run.id);
});

Given("another run has been submitted for the task", async function (this: SwitchPostWorld) {
	assert.ok(this.taskId, "No task ID available to submit a run");

	const run = await safeCall(this, () => this.client.tasks.submitRun(this.taskId), 202);
	assert.ok(run, "Failed to submit secondary run");

	this.secondRun = run;
	this.secondRunId = run.id;
	this.createdRuns.push(run.id);
});
