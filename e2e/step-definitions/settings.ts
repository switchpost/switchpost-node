import assert from "node:assert/strict";
import { Then, When } from "@cucumber/cucumber";
import type { TenantSettings } from "../../src/types/settings.js";
import type { SwitchPostWorld } from "../support/world.js";
import { rowsHashToCamelParams, safeCall } from "./common.js";

// --- Get ---

When("I get the tenant settings", async function (this: SwitchPostWorld) {
	const settings = await safeCall(this, () => this.client.settings.get());
	if (settings) {
		this.settings = settings;
	}
});

// --- Save ---

Then("I save the current settings", function (this: SwitchPostWorld) {
	assert.ok(this.settings, "No settings available to save");
	this.savedSettings = { ...this.settings };
});

// --- Update ---

When(
	"I update the tenant settings with the following properties:",
	async function (this: SwitchPostWorld, dataTable: any) {
		const params = rowsHashToCamelParams(dataTable.rowsHash());

		// Merge with current settings since PUT replaces all fields
		assert.ok(this.settings, "No current settings available - fetch them first");
		const merged: TenantSettings = { ...this.settings, ...params };

		const settings = await safeCall(this, () => this.client.settings.update(merged));
		if (settings) {
			this.settings = settings;
		}
	},
);

When("I update the tenant settings with the saved settings", async function (this: SwitchPostWorld) {
	assert.ok(this.savedSettings, "No saved settings available");
	const saved = this.savedSettings;
	const settings = await safeCall(this, () => this.client.settings.update(saved));
	if (settings) {
		this.settings = settings;
	}
});

When("I restore the original tenant settings", async function (this: SwitchPostWorld) {
	assert.ok(this.savedSettings, "No saved settings to restore");
	const saved = this.savedSettings;
	const settings = await safeCall(this, () => this.client.settings.update(saved));
	if (settings) {
		this.settings = settings;
	}
});

// --- Settings assertions ---

Then("the settings should have a {string} integer", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	const value = (this.settings as any)[camelField];
	assert.ok(typeof value === "number", `Expected "${field}" to be a number, got ${typeof value}`);
});

Then("the settings should have an {string} integer", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	const value = (this.settings as any)[camelField];
	assert.ok(typeof value === "number", `Expected "${field}" to be a number, got ${typeof value}`);
});

Then("the settings should have a {string} value", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.ok((this.settings as any)[camelField] !== undefined, `Expected "${field}" to be present`);
});

Then("the settings should have an {string} boolean", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	const value = (this.settings as any)[camelField];
	assert.ok(typeof value === "boolean", `Expected "${field}" to be a boolean, got ${typeof value}`);
});

Then("the settings {string} should be {int}", function (this: SwitchPostWorld, field: string, expected: number) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.equal((this.settings as any)[camelField], expected);
});

Then("the settings {string} should be false", function (this: SwitchPostWorld, field: string) {
	assert.ok(this.settings, "No settings available");
	const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
	assert.equal((this.settings as any)[camelField], false);
});

Then(
	"the settings {string} should contain {string}",
	function (this: SwitchPostWorld, field: string, expected: string) {
		assert.ok(this.settings, "No settings available");
		const camelField = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
		const value = (this.settings as any)[camelField];
		assert.ok(Array.isArray(value), `Expected "${field}" to be an array`);
		assert.ok(value.includes(expected), `Expected "${field}" to contain "${expected}"`);
	},
);

Then("the settings should match the saved settings", function (this: SwitchPostWorld) {
	assert.ok(this.settings, "No settings available");
	assert.ok(this.savedSettings, "No saved settings available");
	assert.deepEqual(this.settings, this.savedSettings);
});
